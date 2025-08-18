/**Custom command for obtaining all browser console browserLogs - it creates a separate logObject for every test
 * This logObject will have information about test that was running and console errors and warnings that were in
 * console during that run. They are filtered not to contain 'unauthorized error' as it is displayed after any entry
 * to login page.
 * All small log objects are filtered not to be empty and added in file that stores browser logs for all tests
 * @param {function} done - asynchronous callback for working with forEach function
 */
const fs = require('fs');
const unauthorizedError = `Failed to load resource: the server responded with a status of 401 (Unauthorized)`;

exports.command = function(done) {
  return this
    .getLog('browser', function(logEntriesArray) {
      const logObject = {
        title: `Test "${this.currentTest.name}" in module "${this.currentTest.module}" has following console messages: `,
        logs: []
      };

     logEntriesArray.forEach(function (log) {
       if(log.message.includes(unauthorizedError) === false) {
         logObject.logs.push(`[${log.level}] ${log.timestamp} : ${log.message}`);
       }
      });

     function removeObjectsWithEmptyLogs(logObject){
       if(logObject.logs.length > 0){
         return (JSON.stringify(logObject) + '\n');
       } else {
         return '';
       }
     }

      fs.appendFile('logfile.txt', removeObjectsWithEmptyLogs(logObject), function (err) {if (err) throw err;});

      done();
    })
};