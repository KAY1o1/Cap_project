export default defineContentScript({
  matches: ["*://*.youtube.com/watch*"],

  main() {
    const injectInput = () => {

      if (document.getElementById("yt-reflection-input")) return;

      const sidebar = document.querySelector("#secondary-inner");
      if (!sidebar) return;

      // container
      const container = document.createElement("div");
      container.id = "yt-reflection-input";

      container.style.background = "#0f0f0f";
      container.style.padding = "12px";
      container.style.marginBottom = "16px";
      container.style.border = "1px solid #303030";
      container.style.borderRadius = "8px";
      container.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";

      // title
      const title = document.createElement("h3");
      title.textContent = "YouNote";
      title.style.margin = "0 0 8px";
      title.style.color = "#fff";
      title.style.fontSize = "15px";

      // input
      const input = document.createElement("textarea");
      input.placeholder = "Write some notes...";
      input.style.background = "#0f0f0f";
      input.style.color = "#fff"
      input.style.width = "100%";
      input.style.minHeight = "100px";
      input.style.resize = "vertical";
      input.style.padding = "8px";
      input.style.boxSizing = "border-box";

      // submit button
      const submitButton = document.createElement("button");
      submitButton.textContent = "Submit";
      submitButton.style.marginTop = "8px";
      submitButton.style.padding = "8px 12px";
      submitButton.style.background = "#272727";
      submitButton.style.color = "#fff";
      submitButton.style.border = "none";
      submitButton.style.borderRadius = "10px";
      submitButton.style.cursor = "pointer";
      submitButton.style.textDecoration = "Bold"
      // right align
      submitButton.style.display = "block";
      submitButton.style.marginTop = "8px";
      submitButton.style.marginLeft = "auto";

      submitButton.addEventListener("click", () => {
        console.log("Reflection:", input.value);
        // Do something with input.value
      });

      container.appendChild(title);
      container.appendChild(input);
      container.appendChild(submitButton);

      // above rec vids
      sidebar.prepend(container);
    };

    // finish rendering
    const observer = new MutationObserver(() => injectInput());

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    injectInput();
  },
});