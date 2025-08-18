/* Custom command
 * defines which dnd version (dnd 2.0. or dnd 3.0.) will be used for the current test,
 * and in term of the result creates a new app for a test using appropriate app template
 * @param {appName} name for a new application
 */
const fs = require('fs');
const applicationTemplates = require('../utils/constants/applicationTemplates');
const globals = require('../globals_path');
const apiUrl = `${globals.apiUri}/v1/data-sources/${globals.dndDataSourceId}/data`;
const HEADERS_PATH = 'dndDataSourceHeaders.json';
let dndValue = "3";
let headers;

exports.command = function (appName) {
  const browser = this;

  //getting headers including token for api get request
  browser.perform(function () {
    try {
      headers = JSON.parse(fs.readFileSync(HEADERS_PATH));
    } catch (err) {
      browser.logTestInfo(err)
    }
  });

  //sending api get request to receive dnd value fot test run
  browser.perform(function () {
    browser.apiGet(apiUrl, headers, function (response) {
      try {
        dndValue = JSON.parse(response.body).entries[0].data.dnd;
        browser.assert.equal(response.statusCode, 200,
          `Response code status is 200 OK. The dnd value for the current run has been got and it is ${dndValue}.`);
      } catch (err) {
        browser.logTestInfo(`${err}. The dnd value for the run is default and equals ${dndValue}.`);
      }
    });
  });

  //defining what a template to use for app creating depending on the received dnd value
  browser.perform(function () {
    if (dndValue === "3") {
      browser.createAppUsingTemplate(appName, applicationTemplates.BLANK);
    } else {
      browser.createAppUsingTemplate(appName, applicationTemplates.CLIENT_SUPPORT);
    }
  });
};