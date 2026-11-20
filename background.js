// background.js

const BADGE_COLOR = "#e67e22";

async function checkTab(tabId, url) {
  if (!url || !url.startsWith("http")) return;

  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return;
  }

  const { codes } = await browser.storage.local.get("codes");
  if (!codes) return;

  const match = codes.find(
    (entry) =>
      hostname === entry.domain ||
      hostname.endsWith("." + entry.domain)
  );

  if (match) {
    browser.action.setBadgeText({ tabId, text: "✓" });
    browser.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR });
    // Store the active match so the popup can read it quickly
    await browser.storage.session.set({ activeMatch: match });
  } else {
    browser.action.setBadgeText({ tabId, text: "" });
    browser.storage.session.remove("activeMatch");
  }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    checkTab(tabId, tab.url);
  }
});

// Also check on install / on startup
browser.runtime.onInstalled.addListener(async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) checkTab(tab.id, tab.url);
});