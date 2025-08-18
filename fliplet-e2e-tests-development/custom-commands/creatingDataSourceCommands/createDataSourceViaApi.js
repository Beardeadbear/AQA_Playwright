/* Custom command
 * gets application id for the data source creation from url if appId parameter is undefined,
 * creates a new data source via api request,
 * checks that data source has been successfully created,
 * fills in the created data source with test data,
 * checks that entries has been successfully added to the data source
 * @param {String} dataSourceName - data source name
 * @param {Number} appId - application id for endpoint
 * @param {Array} [entries] - array with data source entries to fill in
 */
const headers = {
  "auth-token": "",
  "Content-Type": "application/json"
};
let dataSourceId;
let appIdForRequest;

exports.command = function (dataSourceName, entries, appId) {
  const browser = this;

  //get application id for the data source creation from url if appId parameter is undefined
  browser.perform(function () {
    if (appId === undefined) {
      browser.url(function (result, err) {
        if (err) throw err;
        appIdForRequest = result.value.match(/apps\/(\d*)/)[1];
      })
    } else appIdForRequest = appId;
  });

  //get token from session cookies
  browser.perform(function () {
    browser.getCookie('_auth_token', function (result, err) {
      if (err) throw err;
      headers["auth-token"] = result.value;
    });
  });

  //create a new data source using the current test application id as endpoint and get the created data source id
  browser.perform(function () {
    const apiUrl = `${this.api.globals.apiUri}/v1/data-sources?appId=${appIdForRequest}`;
    const postBody = {
      "name": dataSourceName,
    };

    browser.apiPost(apiUrl, postBody, headers, function (response) {
      browser.assert.equal(response.statusCode, 201, "Data source is created 201");
      dataSourceId = JSON.parse(response.body.dataSource.id);
    });
  });

  //fill in the created data source with test data and check that entries has been added to the data source
  browser.perform(function () {
    const apiUrl = `${this.api.globals.apiUri}/v1/data-sources/${dataSourceId}/data`;
    const postBody = {
      "append": true,
      "entries": entries
    };

    browser.apiPost(apiUrl, postBody, headers, function (response) {
      browser.assert.equal(response.statusCode, 200, "Data source entries are updated 200");
    });
  });
};