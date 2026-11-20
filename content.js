// content.js

async function init() {
  console.log("Discount Alert: script is running on", window.location.hostname);

  const { codes } = await browser.storage.local.get("codes");
  if (!codes || codes.length === 0) {
    console.log("Discount Alert: no codes stored");
    return;
  }

  const hostname = window.location.hostname;
  const match = codes.find(
    (entry) =>
      hostname === entry.domain ||
      hostname.endsWith("." + entry.domain)
  );

  if (!match) {
    console.log("Discount Alert: no match for", hostname);
    return;
  }

  console.log("Discount Alert: MATCH found:", match);
  showBadge(match);
}


function showBadge(entry) {
  const badge = document.createElement("div");
  badge.id = "discount-alert-badge";
  badge.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 2147483647;
    background: #0d7377;
    color: #fff;
    padding: 10px 14px;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,.3);
    max-width: 280px;
    cursor: pointer;
    transition: opacity .3s;
  `;

  const strong = document.createElement("strong");
  strong.textContent = "🏷️ Discount available";
  badge.appendChild(strong);

  const label = document.createElement("span");
  label.style.cssText = "font-size:13px; opacity:.85;";
  label.textContent = entry.label || entry.domain;
  badge.appendChild(document.createElement("br"));
  badge.appendChild(label);

  const code = document.createElement("code");
  code.style.cssText = "background:rgba(255,255,255,.15); padding:2px 6px; border-radius:4px; font-size:15px; user-select:all;";
  code.textContent = entry.code;
  badge.appendChild(document.createElement("br"));
  badge.appendChild(code);

  if (entry.notes) {
    const notes = document.createElement("span");
    notes.style.cssText = "font-size:12px; opacity:.7;";
    notes.textContent = entry.notes;
    badge.appendChild(document.createElement("br"));
    badge.appendChild(notes);
  }

  badge.addEventListener("click", () => {
    navigator.clipboard.writeText(entry.code).then(() => {
      badge.style.opacity = "0.5";
      setTimeout(() => (badge.style.opacity = "1"), 800);
    });
  });

  document.documentElement.appendChild(badge);
}

init();