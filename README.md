# xbox-cloud-force-ipv6

A browser extension to force the usage of IPv6 on Xbox Cloud.

# Installation

1. Download / clone this repository
2. Open your browsers extensions (`edge://extensions/` / `chrome://extensions/`)
3. Enable `Developer mode` (in the left sidebar in Edge, at the top right in Chrome)
4. Click `Load Unpacked` and select the `src` directory of this repository

This is unfortunately needed, because this extension isn't on the Edge Add-ons / Chrome Web Store (yet).

# Confirming functionality

Install this plugin as explained above, then start a capture in [Wireshark](https://www.wireshark.org/) and start a game on [xbox.com/play](https://www.xbox.com/play). You see lots of UDP packets via IPv6 instead of IPv4.

# How it works

This extension overwrites the [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) method to intercept requests to the Xbox servers. Right after the Xbox logo and sound appear when starting a game, the ICE candidates are requested from `https://[region].core.gssv-play-prod.xboxlive.com/v5/sessions/cloud/[uuid]/ice`.
The response looks like this

```json
{
  "exchangeResponse": "[{\"candidate\":\"a=candidate:1 1 UDP 100 13.104.106.140 1071 typ host \",\"messageType\":\"iceCandidate\",\"sdpMLineIndex\":\"0\",\"sdpMid\":\"0\"},{\"candidate\":\"a=candidate:2 1 UDP 1 2603:1020:703:66::ADB:1931 9002 typ host \",\"messageType\":\"iceCandidate\",\"sdpMLineIndex\":\"0\",\"sdpMid\":\"0\"},{\"candidate\":\"a=end-of-candidates\",\"messageType\":\"iceCandidate\",\"sdpMLineIndex\":\"0\",\"sdpMid\":\"0\"}]",
  "errorDetails": null
}
```

It contains two candidates, one for IPv4 (with a priority of 100) and one for IPv6 (with a priority of 1). The IPv4 candidate is then dropped so that the session can only be established via IPv6.
