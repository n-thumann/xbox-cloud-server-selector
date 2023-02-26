// eslint-disable-next-line no-undef
const pattern = new URLPattern(
  "https://*.core.gssv-play-prod.xboxlive.com/v5/sessions/cloud/*/ice"
);

const { fetch: originalFetch } = window;
window.fetch = async (...args) => {
  const [resource, config] = args;
  const response = await originalFetch(resource, config);

  const needInterception =
    resource instanceof Request &&
    resource.method == "GET" &&
    pattern.test(resource.url);

  if (!needInterception) {
    return response;
  }

  console.debug("Intercepted call to", resource.url);
  const content = await response.json();

  const iceCandidates = JSON.parse(content.exchangeResponse);
  console.debug("Found ICE candidates:", iceCandidates);

  const newIceCandidates = iceCandidates.filter(
    (iceCandidate) => !iceCandidate.candidate.match(/(?:\d{1,3}\.){3}\d{1,3}/)
  );
  console.debug("New ICE candidates:", newIceCandidates);

  const newContent = Object.assign({}, content, {
    exchangeResponse: JSON.stringify(newIceCandidates),
  });

  const clone = new Response(JSON.stringify(newContent), response);
  return clone;
};

console.log("xbox-cloud-force-ipv6 loaded!");
