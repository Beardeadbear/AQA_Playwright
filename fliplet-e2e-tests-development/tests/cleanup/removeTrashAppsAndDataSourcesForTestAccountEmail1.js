/** Names of all data sources and apps which were not removed before cleaners are stored in namesFileEmail1.txt
 * for the email1 test account
 * Cleaners read file, create array with names for removing and perform removing of apps and data sources for each name in array
 * When cleaners end the process, namesFileEmail1.txt is being removed
 */

const fs = require('fs');
const namesArrayForUser1 = [];

module.exports = {

  after: function (browser) {
    browser.end();
  },

  'Get data sources and applications names to remove from the file for email1': function (browser) {
    browser
      .perform(function () {
        fs.readFile('namesFileEmail1.txt', 'utf8', function (err, data) {
          if (err) throw err;
          const sliced = data.split(',');
          for (let i = 0; i < sliced.length - 1; i++) {
            namesArrayForUser1.push(sliced[i]);
          }
          return namesArrayForUser1;
        });
      })
      .pause(1000);
  },

  'Delete trash data sources and apps for email1 test account': function (browser) {
    browser
      .login()
      .perform(function () {
        namesArrayForUser1.forEach(function (element) {
          browser
            .deleteApplicationsMatchingParticularName(element)
            .deleteDataSourcesMatchingParticularName(element);
        })
      });
  },

  'Remove the file with trash data sources and applications name from email1 file': function (browser) {
    browser.perform(() => {
      fs.unlink('namesFileEmail1.txt', function (err) {
        if (err) throw err;
      });
    })
  }
};