/** First all logs stored in 'logfile.txt' during test runs are converted back to objects and added to array with logs
 * Then this array is printed, displayed title of test with console errors and logs of different severity with different colours
 * After all logs are printed the file is deleted
 */

const colors = require('colors');
const fs = require('fs');

module.exports = {
  'Printing browser console logs captured during test runs': function(browser){
    const logsArray = [];

    fs.readFile('logfile.txt', 'utf8', function(err, data) {
      if (err) throw err;
      const sliced = data.split('\n');
      for (let i = 0; i < sliced.length - 1; i++){
        logsArray.push(JSON.parse(sliced[i]));
      }
      return logsArray;
    });

    browser.perform(()=> {
     logsArray.forEach(function(object) {
        console.log(object.title);

        object.logs.forEach(function (logLine) {
          if(logLine.includes('SEVERE')){
            console.log(logLine.red);
          } else if (logLine.includes('WARNING')){
            console.log(logLine.cyan)
          } else {
            console.log(logLine);
          }
        });

        console.log('\n');
      });
    })
      .perform(()=>{
        fs.unlink('logfile.txt', function (err) {
          if (err) throw err;
        });
      })
      .end();
  }
};
