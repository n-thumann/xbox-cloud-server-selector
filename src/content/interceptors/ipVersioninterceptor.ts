import { Interceptor } from "./interceptor";
import { Settings } from "../settings";
import { log } from "../../logger";

class IpVersionInterceptor implements Interceptor {
  public readonly requestPattern = {
    method: "GET",
    // @ts-ignore: URLPattern is not known to Typescript yet
    urlPattern: new URLPattern(
      "https://*.core.gssv-play-prod.xboxlive.com/v5/sessions/cloud/*/ice"
    ),
  };

  private getIpVersion(address: string): "ipv4" | "ipv6" {
    // The address may also be an FQDN according to
    // https://w3c.github.io/webrtc-pc/#dom-rtcicecandidate-address,
    // but Xbox currently only uses IPv4 and IPv6 addresses.

    // A very basic check, but good enough to distinguish between IPv4 and IPv6
    return /(\d+\.){3}\d+/.test(address) ? "ipv4" : "ipv6";
  }

  public async intercept(
    settings: Settings,
    response: Response
  ): Promise<Response> {
    if (!settings.ipVersion || settings.ipVersion.value == "default")
      return response;

    const content = await response.json();

    const iceCandidates = JSON.parse(content.exchangeResponse);
    log("Found ICE candidates:", iceCandidates);

    const newIceCandidates = iceCandidates.filter(
      (iceCandidate: RTCIceCandidateInit) => {
        const rtcIceCandidate = new RTCIceCandidate(iceCandidate);

        // "a=end-of-candidates" has no address and can be always kept
        if (!rtcIceCandidate.address) return true;

        return (
          this.getIpVersion(rtcIceCandidate.address) == settings.ipVersion.value
        );
      }
    );

    log("New ICE candidates:", newIceCandidates);

    content.exchangeResponse = JSON.stringify(newIceCandidates);
    return new Response(JSON.stringify(content), response);
  }
}

export { IpVersionInterceptor };
