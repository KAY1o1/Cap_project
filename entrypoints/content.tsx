import { createRoot } from "react-dom/client";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";

export default defineContentScript({
  matches: ["*://*.youtube.com/*"],

  async main() {
    console.log("YouNote loaded!");

    // If Google redirected back here with a code, finish login and clean the URL.
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.toString());
    }

    const container = document.createElement("div");

    container.id = "younote-root";

    container.style.position = "fixed";
    container.style.top = "80px";
    container.style.right = "20px";
    container.style.zIndex = "999999";

    document.body.appendChild(container);

    createRoot(container).render(<Sidebar />);
  },
});