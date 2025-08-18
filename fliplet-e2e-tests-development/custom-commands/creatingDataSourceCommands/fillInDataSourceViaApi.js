/* Custom command
 * fills in a data source,
 * @param {Number} dataSourceId - data source ID
 * @param {Array} [entries] - array with data source entries to fill in
 */
const headers = {
  "auth-token": "",
  "Content-Type": "application/json"
};

exports.command = function (dataSourceId, entries) {
  const browser = this;

  //get token from session cookies
  browser.perform(function () {
    browser.getCookie('_auth_token', function (result, err) {
      if (err) throw err;
      headers["auth-token"] = result.value;
    });
  });

  //fill in the data source with test data
  browser.perform(function () {
    const apiUrl = `${this.api.globals.apiUri}/v1/data-sources/${dataSourceId}/data`;
    const postBody = {
      "append": true,
      "entries": entries
    };

    browser.apiPost(apiUrl, postBody, headers, function (response) {
      browser.assert.equal(response.statusCode, 200, "Data source entries are updated. Response is 200.");
    });
  });
};