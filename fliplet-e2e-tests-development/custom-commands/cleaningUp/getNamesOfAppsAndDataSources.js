/* Custom command for obtaining all names of apps and data sources created during test run. All obtained data is saved to txt file.
 * @param {function} done - asynchronous callback for working with forEach function
 * @param {Array} names - manually passed array of app and data source names from the test
 * @param {String} userEmail - user email that is used for the current test
 */
const fs = require('fs');

exports.command = function(names, done, userEmail){
  return this.perform(function(){
    if(typeof userEmail === 'undefined'){
      names.forEach(function(element){
        fs.appendFile('namesFileEmail1.txt', element + ",", function(err){
          if(err) throw err;
        });
        done();
      })
    } else{
      names.forEach(function(element){
        fs.appendFile('namesFileEmail3.txt', element + ",", function(err){
          if(err) throw err;
        });
        done();
      })
    }
  })
};
