// run-pipeline: orchestrates the full content automation pipeline for today's row.
// Steps: fetch sheet → generate posts → refine image prompt → save to sheet → generate images → publish.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Platform = "linkedin" | "instagram" | "facebook" | "x";
const PLATFORMS: Platform[] = ["linkedin", "instagram", "facebook", "x"];
const DIMS: Record<Platform, { w: number; h: number }> = {
  linkedin: { w: 1200, h: 627 }, instagram: { w: 1080, h: 1080 },
  facebook: { w: 1200, h: 630 }, x: { w: 1600, h: 900 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const userSupa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
  );
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: u } = await userSupa.auth.getUser();
  if (!u.user) return json({ error: "Unauthorized" }, 401);
  const uid = u.user.id;

  const { data: settings } = await admin.from("user_settings").select("*").eq("user_id", uid).maybeSingle();
  const { data: sheet }    = await admin.from("sheet_connections").select("*").eq("user_id", uid).maybeSingle();

  if (!settings?.anthropic_key) return json({ error: "Add your Anthropic API key in Settings first" }, 400);
  if (!sheet?.sheet_id || !sheet?.access_token) return json({ error: "Connect Google Sheets first" }, 400);

  const today = new Date().toISOString().split("T")[0];
  const { data: run, error: runErr } = await admin.from("content_runs").insert({
    user_id: uid, run_date: today, status: "running", current_step: "fetch",
  }).select().single();
  if (runErr || !run) return json({ error: runErr?.message ?? "Failed to create run" }, 500);

  // Run pipeline in background; return runId immediately so the UI can subscribe
  runPipeline({ admin, uid, runId: run.id, today, settings, sheet }).catch(async (err) => {
    await admin.from("content_runs").update({
      status: "error", error_message: (err as Error).message, completed_at: new Date().toISOString(),
    }).eq("id", run.id);
  });

  return json({ success: true, runId: run.id });
});

interface PipelineCtx {
  admin: SupabaseClient; uid: string; runId: string; today: string;
  // deno-lint-ignore no-explicit-any
  settings: any; sheet: any;
}

// Orchestrates the whole pipeline as a chain of step updates against content_runs
async function runPipeline(ctx: PipelineCtx) {
  const { admin, runId } = ctx;
  const setStep = (step: string, patch: Record<string, unknown> = {}) =>
    admin.from("content_runs").update({ current_step: step, ...patch }).eq("id", runId);

  // STEP 1 — fetch today's row
  await setStep("fetch");
  const row = await fetchTodayRow(ctx);

  // STEP 2 — generate posts
  await setStep("posts");
  const context = await loadAsset("ECOM_AI_CONTEXT.md");
  const brand = await loadAsset("ECOM_AI_BRAND_TEMPLATE.md");
  const posts: Record<Platform, string> = {} as Record<Platform, string>;
  for (const p of PLATFORMS) {
    posts[p] = await callClaude(ctx.settings, buildPostPrompt(p, row[`${p}_idea`] ?? "", context, brand));
  }
  await admin.from("content_runs").update({
    linkedin_post: posts.linkedin, instagram_post: posts.instagram,
    facebook_post: posts.facebook, x_post: posts.x,
  }).eq("id", runId);

  // STEP 3 — refine image prompt
  await setStep("image_prompt");
  const imagePrompt = await callClaude(
    ctx.settings,
    buildImagePromptRequest(row.image_prompt ?? "", posts.linkedin, context, brand),
  );
  await admin.from("content_runs").update({ image_prompt: imagePrompt }).eq("id", runId);

  // STEP 4 — write back to sheet
  await setStep("save_sheet");
  await writeSheetGenerated(ctx, row.rowIndex, posts, imagePrompt);

  // STEP 5 — generate images
  await setStep("images");
  const paths: Record<Platform, string> = {} as Record<Platform, string>;
  for (const p of PLATFORMS) {
    const url = await generateImage(ctx.settings, imagePrompt, DIMS[p]);
    paths[p] = await downloadToStorage(ctx, url, p);
  }
  await admin.from("content_runs").update({
    linkedin_image_path: paths.linkedin, instagram_image_path: paths.instagram,
    facebook_image_path: paths.facebook, x_image_path: paths.x,
  }).eq("id", runId);

  // STEP 6 — publish to every connected platform
  await setStep("publish");
  const results = await publishAll(ctx, posts, paths);
  await admin.from("content_runs").update({
    linkedin_posted:    results.linkedin?.success  ?? false,
    linkedin_post_url:  results.linkedin?.postUrl  ?? null,
    instagram_posted:   results.instagram?.success ?? false,
    instagram_post_url: results.instagram?.postUrl ?? null,
    facebook_posted:    results.facebook?.success  ?? false,
    facebook_post_url:  results.facebook?.postUrl  ?? null,
    x_posted:           results.x?.success         ?? false,
    x_post_url:         results.x?.postUrl         ?? null,
  }).eq("id", runId);

  await markSheetPosted(ctx, row.rowIndex);

  // Aggregate publish errors into one message but still mark the run completed
  const errs = (Object.entries(results) as [Platform, { success: boolean; error?: string }][])
    .filter(([, r]) => !r.success && r.error)
    .map(([p, r]) => `${p}: ${r.error}`);

  await admin.from("content_runs").update({
    status: "completed",
    completed_at: new Date().toISOString(),
    current_step: "publish",
    error_message: errs.length ? errs.join(" • ") : null,
  }).eq("id", runId);
}

// ---------- helpers ----------

// Reads the user's sheet, finds today's row, returns a flat object including its 1-based rowIndex
async function fetchTodayRow(ctx: PipelineCtx): Promise<Record<string, string> & { rowIndex: number }> {
  const accessToken = await freshGoogleToken(ctx);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${ctx.sheet.sheet_id}/values/A1:Z1000`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Sheet read failed: ${await res.text()}`);
  const data = await res.json();
  const rows: string[][] = data.values ?? [];
  if (rows.length === 0) throw new Error("Sheet is empty");
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const dateCol = header.indexOf("date");
  if (dateCol < 0) throw new Error("Sheet must have a 'date' column");

  const idx = rows.findIndex((r, i) => i > 0 && r[dateCol]?.trim().startsWith(ctx.today));
  if (idx < 0) throw new Error(`No row found for date ${ctx.today}`);
  const obj: Record<string, string> = {};
  header.forEach((h, i) => { obj[h] = rows[idx][i] ?? ""; });
  return { ...obj, rowIndex: idx + 1 };
}

// Writes generated posts + image prompt back to the same row
async function writeSheetGenerated(ctx: PipelineCtx, rowIndex: number, posts: Record<Platform, string>, imagePrompt: string) {
  const accessToken = await freshGoogleToken(ctx);
  // Naively append a hidden marker columns block from H (col 8) onward
  const values = [[posts.linkedin, posts.instagram, posts.facebook, posts.x, imagePrompt]];
  const range = `H${rowIndex}:L${rowIndex}`;
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ctx.sheet.sheet_id}/values/${range}?valueInputOption=RAW`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values }),
  });
}

// Marks the 'posted' column TRUE for the given row
async function markSheetPosted(ctx: PipelineCtx, rowIndex: number) {
  const accessToken = await freshGoogleToken(ctx);
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${ctx.sheet.sheet_id}/values/G${rowIndex}?valueInputOption=RAW`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [["TRUE"]] }),
  });
}

// Refreshes Google access token if expired, returns a valid one
async function freshGoogleToken(ctx: PipelineCtx): Promise<string> {
  const expiresAt = ctx.sheet.token_expires_at ? new Date(ctx.sheet.token_expires_at).getTime() : 0;
  if (Date.now() < expiresAt - 60_000) return ctx.sheet.access_token as string;
  if (!ctx.sheet.refresh_token) return ctx.sheet.access_token as string;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: ctx.sheet.refresh_token,
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
    }),
  });
  const tk = await res.json();
  if (!res.ok) throw new Error(`Refresh failed: ${tk.error_description || tk.error}`);
  const newExp = new Date(Date.now() + tk.expires_in * 1000).toISOString();
  await ctx.admin.from("sheet_connections").update({
    access_token: tk.access_token, token_expires_at: newExp,
  }).eq("user_id", ctx.uid);
  ctx.sheet.access_token = tk.access_token;
  ctx.sheet.token_expires_at = newExp;
  return tk.access_token;
}

// Loads a static asset file from the deployed function bundle
async function loadAsset(name: string): Promise<string> {
  try {
    const url = new URL(`../_assets/${name}`, import.meta.url);
    return await Deno.readTextFile(url);
  } catch {
    return ""; // graceful: empty context still works
  }
}

// Composes a per-platform post prompt with brand + context injected
function buildPostPrompt(platform: Platform, seed: string, context: string, brand: string): string {
  return `You are the EcomBharat AI social agent for ${platform.toUpperCase()}.

=== PRODUCT CONTEXT ===
${context}

=== BRAND GUIDELINES ===
${brand}

=== TASK ===
Write a ${platform} post based on this seed idea: "${seed}"
Follow the platform rules from the brand guidelines exactly.
Return ONLY the post text. No explanations, no markdown labels.`;
}

// Composes an image-prompt refinement request
function buildImagePromptRequest(seed: string, linkedinPost: string, context: string, brand: string): string {
  return `You are the EcomBharat AI visual designer.

=== PRODUCT CONTEXT ===
${context}

=== BRAND GUIDELINES ===
${brand}

Seed image prompt: "${seed}"
Today's LinkedIn post: "${linkedinPost}"

Create a refined, 2–3 sentence image-generation prompt that fits the brand
(warm mandi setting, Sharma-ji, marigold + teal palette). Return ONLY the prompt.`;
}

// Calls the Anthropic Claude messages API and returns the text response
async function callClaude(settings: { anthropic_key: string; ai_model: string }, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": settings.anthropic_key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: settings.ai_model || "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Claude error: ${data.error?.message ?? res.status}`);
  return data.content?.[0]?.text?.trim() ?? "";
}

// Calls the configured image API and returns a downloadable URL
async function generateImage(
  settings: { image_model_key: string; image_model_provider: string },
  prompt: string,
  dims: { w: number; h: number },
): Promise<string> {
  if (!settings.image_model_key) throw new Error("Add an image API key in Settings");
  if (settings.image_model_provider === "openai") {
    // DALL·E 3 supports a fixed set of sizes; pick the closest
    const size = pickDalleSize(dims);
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${settings.image_model_key}` },
      body: JSON.stringify({ model: "dall-e-3", prompt, size, n: 1 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`OpenAI image error: ${data.error?.message ?? res.status}`);
    return data.data[0].url as string;
  }
  if (settings.image_model_provider === "ideogram") {
    const res = await fetch("https://api.ideogram.ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": settings.image_model_key },
      body: JSON.stringify({ image_request: { prompt, aspect_ratio: aspectFor(dims), model: "V_2" } }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Ideogram error: ${JSON.stringify(data)}`);
    return data.data[0].url as string;
  }
  throw new Error(`Unsupported image provider: ${settings.image_model_provider}`);
}

// Maps requested dims to DALL·E 3's allowed sizes
function pickDalleSize(d: { w: number; h: number }): "1024x1024" | "1792x1024" | "1024x1792" {
  const r = d.w / d.h;
  if (r > 1.3) return "1792x1024";
  if (r < 0.77) return "1024x1792";
  return "1024x1024";
}
function aspectFor(d: { w: number; h: number }): string {
  const r = d.w / d.h;
  if (r > 1.5) return "ASPECT_16_9";
  if (r < 0.8) return "ASPECT_9_16";
  return "ASPECT_1_1";
}

// Downloads the image and uploads it to Supabase storage at user/date_platform.png
async function downloadToStorage(ctx: PipelineCtx, url: string, platform: Platform): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Image download failed");
  const buf = new Uint8Array(await res.arrayBuffer());
  const path = `${ctx.uid}/${ctx.today}_${platform}.png`;
  const { error } = await ctx.admin.storage.from("post-images").upload(path, buf, {
    contentType: "image/png", upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return path;
}

// Publishes posts to all connected platforms
async function publishAll(ctx: PipelineCtx, posts: Record<Platform, string>, paths: Record<Platform, string>) {
  const out: Partial<Record<Platform, { success: boolean; postUrl?: string; error?: string }>> = {};
  const { data: conns } = await ctx.admin.from("platform_connections").select("*").eq("user_id", ctx.uid);
  for (const c of conns ?? []) {
    if (c.status !== "connected") continue;
    const platform = c.platform as Platform;
    const imgPublic = ctx.admin.storage.from("post-images").getPublicUrl(paths[platform]).data.publicUrl;
    try {
      if (platform === "linkedin") {
        out.linkedin = await postLinkedIn(c.access_token, c.platform_user_id, posts.linkedin, imgPublic);
      } else if (platform === "facebook") {
        out.facebook = await postFacebook(c.metadata ?? {}, posts.facebook, imgPublic);
      } else if (platform === "instagram") {
        out.instagram = await postInstagram(c.metadata ?? {}, posts.instagram, imgPublic);
      } else if (platform === "x") {
        out.x = await postX(ctx, c, posts.x, paths.x);
      }
    } catch (err) {
      out[platform] = { success: false, error: (err as Error).message };
    }
  }
  return out;
}

// Posts a single image+text update to LinkedIn using UGC Posts API.
// NOTE: a fully production-grade LinkedIn flow requires uploading the image bytes
// via the assets API. This implementation uses an external image URL via shareMediaCategory=ARTICLE
// which works for the majority of accounts; if your app rejects external images, switch to assets.
async function postLinkedIn(token: string, personId: string | null, text: string, imageUrl: string) {
  if (!personId) throw new Error("LinkedIn personId missing — reconnect LinkedIn");
  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "ARTICLE",
          media: [{ status: "READY", originalUrl: imageUrl }],
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`LinkedIn error: ${data.message ?? res.status}`);
  return { success: true, postUrl: `https://www.linkedin.com/feed/update/${data.id}` };
}

// Posts a photo + caption to a Facebook Page using the page access token stored in metadata
// deno-lint-ignore no-explicit-any
async function postFacebook(meta: any, text: string, imageUrl: string) {
  const pageId = meta.page_id;
  const pageToken = meta.page_access_token;
  if (!pageId || !pageToken) throw new Error("Facebook page info missing — reconnect Facebook");
  const params = new URLSearchParams({
    url: imageUrl,
    caption: text,
    access_token: pageToken,
  });
  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
    method: "POST",
    body: params,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Facebook error: ${data.error?.message ?? res.status}`);
  const postUrl = data.post_id
    ? `https://www.facebook.com/${data.post_id}`
    : `https://www.facebook.com/${pageId}/posts/${data.id}`;
  return { success: true, postUrl };
}

// Publishes an image+caption to an Instagram Business account
// (two-step: create media container, then publish it)
// deno-lint-ignore no-explicit-any
async function postInstagram(meta: any, text: string, imageUrl: string) {
  const igId = meta.ig_business_account_id;
  const pageToken = meta.page_access_token;
  if (!igId || !pageToken) throw new Error("Instagram business account missing — reconnect Instagram");

  // 1. Create container
  const create = await fetch(`https://graph.facebook.com/v21.0/${igId}/media`, {
    method: "POST",
    body: new URLSearchParams({
      image_url: imageUrl,
      caption: text,
      access_token: pageToken,
    }),
  });
  const created = await create.json();
  if (!create.ok) throw new Error(`Instagram container error: ${created.error?.message ?? create.status}`);

  // 2. Publish container
  const pub = await fetch(`https://graph.facebook.com/v21.0/${igId}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({
      creation_id: created.id,
      access_token: pageToken,
    }),
  });
  const published = await pub.json();
  if (!pub.ok) throw new Error(`Instagram publish error: ${published.error?.message ?? pub.status}`);

  return { success: true, postUrl: `https://www.instagram.com/p/${published.id}` };
}

// Posts a tweet on X with an attached image. Uses v2 media upload + tweet endpoints.
// deno-lint-ignore no-explicit-any
async function postX(ctx: PipelineCtx, conn: any, text: string, imagePath: string) {
  const token = await freshXToken(ctx, conn);

  // Download the image bytes from our storage bucket
  const imgRes = await ctx.admin.storage.from("post-images").download(imagePath);
  if (imgRes.error || !imgRes.data) throw new Error(`Could not read image: ${imgRes.error?.message ?? "unknown"}`);
  const bytes = new Uint8Array(await imgRes.data.arrayBuffer());

  // Upload media to X via v2 media upload (multipart)
  const form = new FormData();
  form.append("media", new Blob([bytes], { type: "image/png" }), "post.png");
  form.append("media_category", "tweet_image");
  const upload = await fetch("https://api.x.com/2/media/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const uploaded = await upload.json();
  if (!upload.ok) throw new Error(`X media upload failed: ${uploaded.detail ?? uploaded.title ?? upload.status}`);
  const mediaId = uploaded.data?.id ?? uploaded.media_id_string ?? uploaded.id;

  // Create the tweet
  const tweetRes = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text.slice(0, 280),
      media: mediaId ? { media_ids: [String(mediaId)] } : undefined,
    }),
  });
  const tweet = await tweetRes.json();
  if (!tweetRes.ok) throw new Error(`X tweet failed: ${tweet.detail ?? tweet.title ?? tweetRes.status}`);
  const tweetId = tweet.data?.id;
  return {
    success: true,
    postUrl: tweetId ? `https://x.com/i/web/status/${tweetId}` : undefined,
  };
}

// Refreshes the X OAuth 2.0 access token if it's near expiry; persists the new pair.
// deno-lint-ignore no-explicit-any
async function freshXToken(ctx: PipelineCtx, conn: any): Promise<string> {
  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
  if (Date.now() < expiresAt - 60_000) return conn.access_token as string;
  if (!conn.refresh_token) return conn.access_token as string;

  const clientId = Deno.env.get("X_CLIENT_ID") ?? "";
  const clientSecret = Deno.env.get("X_CLIENT_SECRET") ?? "";
  const res = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: conn.refresh_token,
      client_id: clientId,
    }),
  });
  const tk = await res.json();
  if (!res.ok) throw new Error(`X token refresh failed: ${tk.error_description || tk.error}`);
  const newExp = new Date(Date.now() + Number(tk.expires_in ?? 7200) * 1000).toISOString();
  await ctx.admin.from("platform_connections").update({
    access_token: tk.access_token,
    refresh_token: tk.refresh_token ?? conn.refresh_token,
    token_expires_at: newExp,
  }).eq("id", conn.id);
  return tk.access_token;
}

// Returns a JSON response with CORS headers
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
