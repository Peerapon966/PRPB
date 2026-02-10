async function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Check whether the "/api/" is in the URI.
  if (uri.includes("/api/")) {
    request.uri = request.uri.replace(/^\/api\//, "/");
  }

  return request;
}
