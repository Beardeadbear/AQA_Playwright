/**
 * This command is used for waiting for the element to be not present without throwing errors, command return true of false value
 * Returns "true" if element is not present before timeout
 * Takes three parameters:
 * @param {String} selector - element which is expected as not present
 * @param {Number} timeout - amount of time for waiting till element not present
 * @param {Array} resultPresenting - empty array for pushing result value
 */

exports.command = function (selector, timeout, resultPresenting){
  this.executeAsync(function(selector, timeout, resultPresenting, done){
      let intervalId;
      var p1 = new Promise(function(resolve, reject){
        intervalId = setInterval(function(){
          let itemArray = document.querySelectorAll(selector);
          if(itemArray.length < 1){
            clearInterval(intervalId);
            resolve(true); //element disappeared
          }
        }, 100);
      });
      var p2 = new Promise(function(resolve, reject){
        setTimeout(reject, timeout, false); //timeout reached
      });
      return Promise.race([p1, p2]).then(function(result){
        done(result);
      }, function (reason) {
        done(reason);
      });
    },
    [selector, timeout, resultPresenting],
    function(result){
      resultPresenting.length = 0;
      return resultPresenting.push(result.value);
    });
};