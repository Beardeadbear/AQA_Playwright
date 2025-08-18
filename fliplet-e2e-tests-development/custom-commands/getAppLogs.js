/**
 * This command retrieves current app id and opens logs of app using api request
 * @param {String} uri - link to server for api request
 */
exports.command = function(uri) {
  return this
    .pause(1500)
    .url(function (result) {
      const firstEdge = result.value.indexOf("apps/");
      const secondEdge = result.value.indexOf("/publish");
      const appId = result.value.substring(firstEdge + 5, secondEdge);

      this.url(`${uri}/v1/apps/${appId}/logs`);
    })
};