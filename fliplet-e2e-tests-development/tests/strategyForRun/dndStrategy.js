const fs = require('fs');
const globals = require('../../globals_path');
const apiUrl = `${globals.apiUri}/v1/data-sources/${globals.dndDataSourceId}/data`;
const HEADERS_PATH = 'dndDataSourceHeaders.json';
let storedValue;
let newValue;
let headers;

module.exports = {
  after: function (browser) {
    browser.end();
  },

  'Get headers for the requests': function (browser) {
    browser.perform(function () {
      headers = JSON.parse(fs.readFileSync(HEADERS_PATH, (err) => {
        if (err) throw err;
      }))
    }).logTestInfo(`The file with headers for api get request was successfully read.`);
  },

  'Get the dnd value for the current test run by sending get request': function (browser) {
    browser.apiGet(apiUrl, headers, function (response) {
      storedValue = JSON.parse(response.body).entries[0].data.dnd;
      browser.assert.equal(response.statusCode, 200,
        `Response code status is 200 OK. The dnd value for the current run has been got and it is ${storedValue}.`);
    });
  },

  'Define dnd value for the next test run': function (browser) {
    browser.perform(function () {
      newValue = storedValue === "3" ? "2" : "3";
    })
      .logTestInfo(`The dnd value for the next run has been defined.`);
  },

  'Change the value of dnd for the next test run by sending post request': function (browser) {
    const postBody = {
      "append": false,
      "entries": [
        {"dnd": newValue}
      ]
    };

    browser.apiPost(apiUrl, postBody, headers, function (response) {
      browser.assert.equal(response.statusCode, 200,
        `The dnd for the next run has been successfully changed. Response code status is 200 OK.`);
      browser.assert.notEqual(postBody.entries[0].dnd, storedValue,
        `The new dnd value is different from the previous one and it is ${newValue}.`);
    });
  },

  'Check that the value of dnd for the next test run is correct': function (browser) {
    browser.apiGet(apiUrl, headers, function (response) {
      const dndValue = JSON.parse(response.body).entries[0].data.dnd;
      browser.assert.equal(response.statusCode, 200, `Response code status is 200 OK.`);
      browser.assert.equal(dndValue, newValue, `The dnd value for the next run is correct and it is ${dndValue}.`);
    });
  }
};