# xbox-cloud-server-selector

A browser extension to select the server region and IP version for Xbox Cloud Gaming

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/46975855/228374614-ccbb02b8-251f-4007-8c40-3afe82c6c3c9.png">
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/46975855/228374604-1714b12c-4d71-43de-9700-ff3a4f0432c9.png">
  <img alt="Demo of xbox-cloud-server-selector" src="https://user-images.githubusercontent.com/46975855/228374604-1714b12c-4d71-43de-9700-ff3a4f0432c9.png">
</picture>

## Installation

### Installing from store

The easiest way to install is downloading it from either [Microsoft Edge-Add-Ons](https://microsoftedge.microsoft.com/addons/detail/xbox-cloud-server-selector/looadgdipbgeafcccmoagnbbgnjgeefp) or the [Chrome Web Store](https://chrome.google.com/webstore/detail/xbox-cloud-server-selector/lanknfgmjkocejapddeibabjpdenkpnn).

### Installing via Developer mode

1. Download / clone this repository
2. Run `npm install` and `npm run build`
3. Open your browsers extensions (`edge://extensions/` / `chrome://extensions/`)
4. Enable `Developer mode` (in the left sidebar in Edge, at the top right in Chrome)
5. Click `Load Unpacked` and select the `dist` directory of this repository

Note that Edge / Chrome version 111 or higher is required due to [this feature](https://chromium-review.googlesource.com/c/chromium/src/+/4119014) being used.

## Usage

Select the region and IP version as desired, then quit any active Xbox Cloud Gaming session and reload Xbox Cloud Gaming to apply the changes.

## Confirming functionality

Install this extension, select e.g. IPv6 as IP version. Then start a capture in [Wireshark](https://www.wireshark.org/) and a game on [xbox.com/play](https://www.xbox.com/play). You'll see lots of UDP packets via IPv6 instead of IPv4.
You can also select a different region - preferably far away from your actual location for testing - and start a Traceroute to the IP you see in the Wireshark capture. You'll see the packets being routed towards the selected region.

## How it works

This extension overwrites the [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) method to intercept requests to the Xbox servers.
When loading [xbox.com/play](https://www.xbox.com/play), a POST request is made to `https://xgpuweb.gssv-play-prod.xboxlive.com/v2/login/user`.
The response contains a list of all regions with one of them marked as the default region (shortened):

```json
{
  "offeringSettings": {
    "regions": [
      {
        "name": "WestEurope",
        "baseUri": "https://weu.core.gssv-play-prod.xboxlive.com",
        "networkTestHostname": "weu.gssv-fastlane-prod.xboxlive.com",
        "isDefault": true,
        "systemUpdateGroups": null,
        "fallbackPriority": -1
      }
    ]
  }
}
```

It can be manipulated to force only a specific region to be available to the client.

After starting starting a game, a session will be created. Right after the Xbox logo and sound appear, the ICE candidates are requested from `https://[region].core.gssv-play-prod.xboxlive.com/v5/sessions/cloud/[session UUID]/ice`.
The response contains two candidates, one for IPv4 (with a higher priority of 100) and one for IPv6 (with a lower priority of 1).

```json
{
  "exchangeResponse": "[{\"candidate\":\"a=candidate:1 1 UDP 100 13.104.106.140 1071 typ host \",\"messageType\":\"iceCandidate\",\"sdpMLineIndex\":\"0\",\"sdpMid\":\"0\"},{\"candidate\":\"a=candidate:2 1 UDP 1 2603:1020:703:66::ADB:1931 9002 typ host \",\"messageType\":\"iceCandidate\",\"sdpMLineIndex\":\"0\",\"sdpMid\":\"0\"},{\"candidate\":\"a=end-of-candidates\",\"messageType\":\"iceCandidate\",\"sdpMLineIndex\":\"0\",\"sdpMid\":\"0\"}]",
  "errorDetails": null
}
```

It can be manipulated so that e.g. the IPv4 candidate is dropped and the session can only be established via the remaining IPv6 candidate.
