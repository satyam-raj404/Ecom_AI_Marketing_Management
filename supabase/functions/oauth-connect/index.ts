// oauth-connect: builds the authorization URL for a given platform.
// The frontend opens this URL in a popup window.
import { getOAuthConfig, redirectUri, corsHeaders, generateCodeVerifier, codeChallengeFor } from "../_shared/oauth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { platform } = await req.json();
    const cfg = getOAuthConfig(platform);
    if (!cfg) throw new Error(`Unsupported platform: ${platform}`);

    const clientId = Deno.env.get(cfg.clientIdEnv);
    if (!clientId) throw new Error(`Missing env var ${cfg.clientIdEnv}`);

    // Authenticate the caller so we can pack their user id into the OAuth state
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );
    const { data: u } = await supa.auth.getUser();
    if (!u.user) throw new Error("Not authenticated");

    // Build state payload — packs uid, platform, nonce, and (for PKCE) the code_verifier
    // so the callback (which runs without auth) can complete the flow.
    // deno-lint-ignore no-explicit-any
    const statePayload: any = { uid: u.user.id, platform, nonce: crypto.randomUUID() };
    let codeChallenge: string | null = null;
    if (cfg.pkce) {
      const verifier = generateCodeVerifier();
      codeChallenge = await codeChallengeFor(verifier);
      statePayload.v = verifier;
    }
    const state = btoa(JSON.stringify(statePayload));

    const sep = cfg.scopeSeparator ?? " ";
    const authUrl = new URL(cfg.authUrl);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri(platform));
    authUrl.searchParams.set("scope", cfg.scope.split(/[ ,]+/).join(sep));
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);
    if (platform === "google") {
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
    }
    if (cfg.pkce && codeChallenge) {
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
    }

    return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
