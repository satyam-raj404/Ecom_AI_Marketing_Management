// oauth-callback: receives the platform redirect, exchanges code for tokens,
// stores them in the right table, then closes the popup via postMessage.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getOAuthConfig, redirectUri } from "../_shared/oauth.ts";

// Renders a tiny HTML page that posts a message and closes the popup
function popupResponse(platform: string, success: boolean, error?: string): Response {
  const payload = JSON.stringify({ type: "oauth-complete", platform, success, error: error ?? null });
  const html = `<!doctype html><html><body style="font-family:system-ui;padding:24px;text-align:center;background:#FDF8F0;color:#0F3B2E">
    <h2>${success ? "Connected ✓" : "Connection failed"}</h2>
    <p style="color:#666;font-size:14px">${error ?? "You can close this window."}</p>
    <script>
      try { window.opener && window.opener.postMessage(${payload}, "*"); } catch(e) {}
      setTimeout(function(){ window.close(); }, 800);
    </script></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") ?? "";
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  const errParam = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (errParam) return popupResponse(platform, false, errParam);
  if (!code || !stateRaw) return popupResponse(platform, false, "Missing code or state");

  try {
    const state = JSON.parse(atob(stateRaw)) as { uid: string; platform: string; v?: string };
    if (state.platform !== platform) throw new Error("Platform mismatch");

    const cfg = getOAuthConfig(platform);
    if (!cfg) throw new Error("Unsupported platform");
    const clientId = Deno.env.get(cfg.clientIdEnv)!;
    const clientSecret = Deno.env.get(cfg.clientSecretEnv)!;

    // Build the token exchange request
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(platform),
    });
    if (cfg.pkce && state.v) body.set("code_verifier", state.v);
    // X requires client_id in body even with Basic auth; everyone else also accepts it.
    body.set("client_id", clientId);
    if (!cfg.pkce) body.set("client_secret", clientSecret);

    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
    if (cfg.pkce) {
      // X confidential clients use HTTP Basic for client auth in addition to PKCE
      headers["Authorization"] = "Basic " + btoa(`${clientId}:${clientSecret}`);
    }

    const tokenRes = await fetch(cfg.tokenUrl, { method: "POST", headers, body });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokens.error_description || tokens.error || "Token exchange failed");

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + Number(tokens.expires_in) * 1000).toISOString()
      : null;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (platform === "google") {
      await admin.from("sheet_connections").upsert({
        user_id: state.uid,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_expires_at: expiresAt,
      }, { onConflict: "user_id" });
      return popupResponse(platform, true);
    }

    // Fetch identity + per-platform extras
    let username: string | null = null;
    let platformUserId: string | null = null;
    let accessToken: string = tokens.access_token;
    let refreshToken: string | null = tokens.refresh_token ?? null;
    // deno-lint-ignore no-explicit-any
    const metadata: Record<string, any> = {};

    if (platform === "linkedin") {
      const me = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (me.ok) {
        const m = await me.json();
        username = m.name ?? m.email ?? null;
        platformUserId = m.sub ?? null;
      }
    } else if (platform === "facebook" || platform === "instagram") {
      // Exchange short-lived user token for a long-lived (~60d) one
      const longUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
      longUrl.searchParams.set("grant_type", "fb_exchange_token");
      longUrl.searchParams.set("client_id", clientId);
      longUrl.searchParams.set("client_secret", clientSecret);
      longUrl.searchParams.set("fb_exchange_token", accessToken);
      const longRes = await fetch(longUrl);
      const longTk = await longRes.json();
      if (longRes.ok && longTk.access_token) {
        accessToken = longTk.access_token;
      }

      // Fetch user profile
      const me = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${accessToken}`);
      if (me.ok) {
        const m = await me.json();
        username = m.name ?? null;
        platformUserId = m.id ?? null;
      }

      // Find a managed Page (and its IG Business Account if needed)
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`,
      );
      const pages = await pagesRes.json();
      const pageList: Array<{
        id: string;
        name: string;
        access_token: string;
        instagram_business_account?: { id: string };
      }> = pages.data ?? [];

      const page = platform === "instagram"
        ? pageList.find((p) => p.instagram_business_account?.id)
        : pageList[0];

      if (!page) {
        throw new Error(
          platform === "instagram"
            ? "No Facebook Page with a connected Instagram Business account was found. Convert your IG account to Business and link it to a Page first."
            : "No Facebook Page found for this user. Create a Page first.",
        );
      }

      metadata.page_id = page.id;
      metadata.page_name = page.name;
      metadata.page_access_token = page.access_token; // long-lived page token never expires
      if (platform === "instagram" && page.instagram_business_account) {
        metadata.ig_business_account_id = page.instagram_business_account.id;
        username = `${page.name} (IG)`;
      } else if (platform === "facebook") {
        username = page.name;
      }
    } else if (platform === "x") {
      const me = await fetch("https://api.x.com/2/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (me.ok) {
        const m = await me.json();
        username = m.data?.username ? `@${m.data.username}` : null;
        platformUserId = m.data?.id ?? null;
      }
    }

    await admin.from("platform_connections").upsert({
      user_id: state.uid,
      platform,
      status: "connected",
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt,
      platform_user_id: platformUserId,
      platform_username: username,
      metadata,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,platform" });

    return popupResponse(platform, true);
  } catch (err) {
    return popupResponse(platform, false, (err as Error).message);
  }
});
