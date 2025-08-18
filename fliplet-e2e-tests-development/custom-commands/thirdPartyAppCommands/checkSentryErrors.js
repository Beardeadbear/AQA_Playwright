/**
 * Command gets response body from Sentry body and expected error message,
 * and makes assertion that error is present in response body
 * @param {array} [responseBody] - array with response body
 * @param {string} [errorMessage] - expected error message
 */
exports.command = function(responseBody, errorMessage) {
  const stringBody = responseBody.toString();

  return this
    .execute(function(stringBody, errorMessage){
      return stringBody.includes(`"type": "Error", "value": "${errorMessage}"`);
    }, [stringBody, errorMessage], function(resultError){
     this.assert.ok(resultError.value, `Checking error: "${errorMessage}" in Sentry logs`);
    })
};