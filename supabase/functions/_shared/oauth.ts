// Shared OAuth platform configuration used by edge functions

export interface PlatformOAuth {
  authUrl: string;
  tokenUrl: string;
  scope: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  pkce?: boolean;
  // Some providers (e.g. Facebook) want scopes joined by comma, not space
  scopeSeparator?: " " | ",";
}

// Returns the OAuth config for a given platform name
export function getOAuthConfig(platform: string): PlatformOAuth | null {
  switch (platform) {
    case "linkedin":
      return {
        authUrl: "https://www.linkedin.com/oauth/v2/authorization",
        tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
        scope: "openid profile email w_member_social",
        clientIdEnv: "LINKEDIN_CLIENT_ID",
        clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
      };
    case "google":
      return {
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scope: "https://www.googleapis.com/auth/spreadsheets openid email profile",
        clientIdEnv: "GOOGLE_CLIENT_ID",
        clientSecretEnv: "GOOGLE_CLIENT_SECRET",
      };
    case "facebook":
      // Facebook Login — used to publish to a Page
      return {
        authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
        scope: "pages_show_list,pages_read_engagement,pages_manage_posts,public_profile",
        clientIdEnv: "INSTAGRAM_APP_ID",
        clientSecretEnv: "INSTAGRAM_APP_SECRET",
        scopeSeparator: ",",
      };
    case "instagram":
      // Instagram Graph API also runs on Facebook Login + a connected IG Business account
      return {
        authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
        scope: "pages_show_list,pages_read_engagement,instagram_basic,instagram_content_publish,business_management",
        clientIdEnv: "INSTAGRAM_APP_ID",
        clientSecretEnv: "INSTAGRAM_APP_SECRET",
        scopeSeparator: ",",
      };
    case "x":
      // X (Twitter) OAuth 2.0 with PKCE
      return {
        authUrl: "https://twitter.com/i/oauth2/authorize",
        tokenUrl: "https://api.x.com/2/oauth2/token",
        scope: "tweet.read tweet.write users.read offline.access media.write",
        clientIdEnv: "X_CLIENT_ID",
        clientSecretEnv: "X_CLIENT_SECRET",
        pkce: true,
      };
    default:
      return null;
  }
}

// Builds the redirect URI for a given platform (single callback fans out via ?platform=)
export function redirectUri(platform: string): string {
  const base = Deno.env.get("APP_URL") ?? "";
  return `${base.replace(/\/$/, "")}/functions/v1/oauth-callback?platform=${platform}`;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------- PKCE helpers (for X) ----------

// base64url without padding
function b64url(bytes: Uint8Array): string {
  let s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return b64url(arr);
}

export async function codeChallengeFor(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return b64url(new Uint8Array(digest));
}
