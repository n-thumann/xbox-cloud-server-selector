import { IpVersionInterceptor } from "./interceptors/ipVersioninterceptor";
import { RegionInterceptor } from "./interceptors/regionInterceptor";
import { Settings } from "./settings";
import { log } from "../logger";

// We cannot use chrome.runtime.onMessage here, because it doesn't exist in this scope
window.addEventListener("message", (event) => {
  if (event.data.from != "xbox-cloud-server-selector") return;
  load(event.data.settings);
});

log("Settings listener alive");

function load(settings: Settings) {
  log("Received settings:", settings);

  const { fetch: originalFetch } = window;
  window.fetch = async (...args) => {
    const [resource, config] = args;
    const response = await originalFetch(resource, config);

    const requestUrl =
      resource instanceof Request ? resource.url : String(resource);
    const requestMethod = resource instanceof Request
      ? resource.method
      : String(config?.method ?? "GET").toUpperCase();

    const interceptors = [new RegionInterceptor(), new IpVersionInterceptor()];

    for (const interceptor of interceptors) {
      const needInterception =
        requestMethod === interceptor.requestPattern.method &&
        interceptor.requestPattern.urlPattern.test(requestUrl);

      if (!needInterception) continue;

      log(`Intercepted call to ${requestUrl}`);
      return await interceptor.intercept(settings, response);
    }

    return response;
  };
}
