import { createRoot } from "react-dom/client";
import Sidebar from "../components/Sidebar";

export default defineContentScript({
  matches: ["*://*.youtube.com/*"],

  main() {
    console.log("YouNote loaded!");

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