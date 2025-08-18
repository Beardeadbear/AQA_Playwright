/**
 * Command retrieves all issue form Sentry using "get" request
 * @param {string} [uri] - full request link to Sentry
 * @param {string} [bearer] - bearer token for authorization
 * @param {array} [returnBody] - empty array for filling with response body
 */
const request = require('request');
let errorID = '';

exports.command = function(uri, bearer, returnBody, errorMessage) {
  return this
    .perform(function fetchErrors() {
      request(uri, {
          'auth': {
            'bearer': bearer
          }},
        function (error, response, body) {
          errorID = body.toString().split(`"Error: ${errorMessage}"`)[1].split('"id"')[1].split('"assignedTo"')[0].slice(3, -3);
          returnBody.push(body);
        });
    })
    .pause(1000)

    // clear errors after fetching

    .perform(function clearErrors() {
      request.delete(`https://sentry.io/api/0/issues/${errorID}/`, {
        'auth': {
          'bearer': bearer
        }
      })
    })
};