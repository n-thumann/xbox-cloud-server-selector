import { Interceptor } from "./interceptor";
import { Settings } from "../settings";
import { log } from "../../logger";

class RegionInterceptor implements Interceptor {
  public readonly requestPattern = {
    method: "POST",
    // @ts-ignore: URLPattern is not known to Typescript yet
    urlPattern: new URLPattern(
      "https://xgpuweb.gssv-play-prod.xboxlive.com/v2/login/user",
    ),
  };

  public async intercept(
    settings: Settings,
    response: Response,
  ): Promise<Response> {
    if (!settings.region || settings.region.value == "default") return response;

    const content = await response.json();
    log("Found regions:", content.offeringSettings.regions);

    const newRegions = [
      {
        name: settings.region.text,
        baseUri: `https://${settings.region.value}.core.gssv-play-prod.xboxlive.com`,
        networkTestHostname: `https://${settings.region.value}.gssv-fastlane-prod.xboxlive.com`,
        isDefault: true,
        systemUpdateGroups: null as [],
        fallbackPriority: -1,
      },
    ];

    log("New regions:", newRegions);

    content.offeringSettings.regions = newRegions;
    return new Response(JSON.stringify(content), response);
  }
}

export { RegionInterceptor };
