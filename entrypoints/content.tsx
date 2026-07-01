import { createRoot } from "react-dom/client";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";

export default defineContentScript({
  matches: ["*://*.youtube.com/*"],
  // RACE CONDITION FIX: YouTube is a single-page app whose router strips query
  // params (like our `?code=`) off the URL almost immediately on load. Our old
  // default (`document_idle`) ran too late — sometimes YouTube had already wiped
  // `?code=` before we read it, so login worked or failed at random depending on
  // which script won the load race. Running at `document_start` guarantees we
  // read the URL before YouTube's JS executes, so the exchange is deterministic.
  runAt: "document_start",

  async main() {
    // Read the code SYNCHRONOUSLY, before the first `await` yields control back
    // to the page and lets YouTube's router rewrite the URL out from under us.
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) console.error("[YouNote] code exchange failed:", error.message);
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.toString());
    }

    // At document_start the <body> may not exist yet — wait for it before mounting.
    const mount = () => {
      const container = document.createElement("div");
      container.id = "younote-root";
      container.style.position = "fixed";
      container.style.top = "80px";
      container.style.right = "20px";
      container.style.zIndex = "999999";
      document.body.appendChild(container);
      createRoot(container).render(<Sidebar />);
    };

    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount, { once: true });
  },
});