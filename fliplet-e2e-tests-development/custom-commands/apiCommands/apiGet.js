const util = require('util');
const events = require('events');

function apiGet () {}
util.inherits(apiGet, events.EventEmitter);

apiGet.prototype.command = function(apiUrl, headers, success) {
  const request = require("request");

  var options = {
    uri: apiUrl,
    method: "GET",
  };

  if (headers !== undefined) {
    options.headers = headers;
  }

  request(options, function (error, response) {
    if (error) {
      console.log(error);
      return;
    }

    success(response);
    this.emit('complete');
  }.bind(this));
};

module.exports = apiGet;

