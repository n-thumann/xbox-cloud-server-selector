import { Settings } from "../content/settings";
import { log } from "../logger";

log("Bridge alive");

chrome.storage.local.get().then((settings: Settings) => {
  window.postMessage({
    from: "xbox-cloud-server-selector",
    settings: settings,
  });
});
