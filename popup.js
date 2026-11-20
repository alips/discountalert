// popup.js

document.addEventListener("DOMContentLoaded", async () => {
  const { activeMatch } = await browser.storage.session.get("activeMatch");
  const el = document.getElementById("content");
  el.innerHTML = "";

  if (activeMatch) {
    const p = document.createElement("p");
    p.textContent = activeMatch.label || activeMatch.domain;
    el.appendChild(p);

    const code = document.createElement("div");
    code.className = "code";
    code.title = "Click to copy";
    code.textContent = activeMatch.code;
    code.addEventListener("click", () => {
      navigator.clipboard.writeText(activeMatch.code);
    });
    el.appendChild(code);

    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Click code to copy";
    el.appendChild(hint);
  } else {
    const p = document.createElement("p");
    p.className = "none";
    p.textContent = "No discount code for this site.";
    el.appendChild(p);
  }

  document.getElementById("manage").addEventListener("click", (e) => {
    e.preventDefault();
    browser.runtime.openOptionsPage();
  });
});