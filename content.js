// content.js
console.log("[NaggyOutlook] content script loaded");

(function injectPageHook() {
  const src = chrome.runtime.getURL("page_hook.js");
  const s = document.createElement("script");
  s.src = src;
  s.onload = () => {
    console.log("[NaggyOutlook] page_hook.js injected");
    s.remove();
  };
  (document.documentElement || document.head || document.body).appendChild(s);
})();

// Listen for messages coming from page_hook.js
window.addEventListener("message", function onMessage(event) {
  if (event.source !== window) return;
  const msg = event.data;
  if (!msg || msg.type !== "OUTLOOK_GET_REMINDERS") return;

  console.log("[NaggyOutlook] content script received OUTLOOK_GET_REMINDERS");

  if (!chrome.runtime?.id) {
    console.log("[NaggyOutlook] Extension context invalidated (runtime.id missing). Removing listener.");
    window.removeEventListener("message", onMessage);
    return;
  }

  try {
    chrome.runtime.sendMessage({
      type: "REMINDERS_FROM_OUTLOOK",
      payload: msg.data
    });
  } catch (e) {
    console.log("[NaggyOutlook] Extension context invalidated (sendMessage failed). Removing listener.");
    window.removeEventListener("message", onMessage);
  }
});
