import { Settings } from "../content/settings";
import { log } from "../logger";

log("Bridge alive");

chrome.storage.local.get((items) => {
  if (chrome.runtime.lastError) {
    log("Failed to load settings:", chrome.runtime.lastError.message);
    return;
  }

  window.postMessage(
    {
      from: "xbox-cloud-server-selector",
      settings: items as Settings,
    },
    "*",
  );
});
