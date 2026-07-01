import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Sidebar() {
  const [email, setEmail] = useState<string | null>(null);
  const loggedIn = email !== null;

  // Restore an existing session, and react when login completes in another tab.
  useEffect(() => {
    const refresh = () =>
      supabase.auth
        .getSession()
        .then(({ data }) => setEmail(data.session?.user.email ?? null));

    refresh();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    // Google login completes in the separate tab we open for it, so the session
    // is written there — not in this tab. onAuthStateChange doesn't reliably
    // fire across tabs in a content script, so when the user switches back to
    // this tab we re-read the session from storage to reflect that login.
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  async function login() {
    // Open Google in a real browser tab — it blocks login inside the extension popup.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://www.youtube.com/", skipBrowserRedirect: true },
    });
    if (error || !data?.url) {
      console.error("Login failed:", error?.message);
      return;
    }
    window.open(data.url, "_blank");
  }

  return (
    <div
      style={{
        width: "280px",
        background: "white",
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>YouNote</h2>

      {!loggedIn ? (
        <>
          <p>Sign in to save notes.</p>

          <button
            onClick={login}
            style={{
              width: "100%",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: "12px", color: "#555" }}>Signed in as {email}</p>

          <textarea
            placeholder="Write a note..."
            style={{
              width: "100%",
              height: "120px",
            }}
          />

          <button
            style={{
              width: "100%",
              marginTop: "10px",
            }}
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}