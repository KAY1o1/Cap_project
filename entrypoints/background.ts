import { supabase } from "../lib/supabase";

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // identity only exists here in the background — not in content scripts.
  browser.runtime.onMessage.addListener((message) => {
    if (message?.type === "GOOGLE_LOGIN") {
      // Returning a promise sends its resolved value back to the sender.
      return handleGoogleLogin().catch((e) => ({ error: String(e) }));
    }
  });
});

async function handleGoogleLogin() {
  const redirectTo = browser.identity.getRedirectURL();

  // Ask Supabase for the Google OAuth URL, but don't redirect — we drive it ourselves.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data?.url) return { error: error?.message ?? "could not build auth url" };

  // Open the Google sign-in popup and wait for the redirect back to the extension.
  const responseUrl = await browser.identity.launchWebAuthFlow({
    url: data.url,
    interactive: true,
  });
  if (!responseUrl) return { error: "login was cancelled" };

  // PKCE returns `?code=` in the query string (the hash would be stripped).
  const code = new URL(responseUrl).searchParams.get("code");
  if (!code) return { error: "no code in redirect" };

  // Exchange here in the background — the PKCE code verifier lives in this client.
  const { data: session, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError || !session?.session) {
    return { error: exchangeError?.message ?? "code exchange failed" };
  }

  return {
    access_token: session.session.access_token,
    refresh_token: session.session.refresh_token,
  };
}
