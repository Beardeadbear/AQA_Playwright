/** Names of all data sources and apps which were not removed before cleaners are stored in namesFileEmail3.txt
 * for the email3 test account
 * Cleaners read file, create array with names for removing and perform removing of apps and data sources for each name in array
 * When cleaners end the process, namesFileEmail3.txt is being removed
 */

const fs = require('fs');
const namesArrayForUser3 = [];

module.exports = {

  after: function (browser) {
    browser.end();
  },

  'Get data sources and applications names to remove from the file for email3': function (browser) {
    browser
      .perform(function () {
        fs.readFile('namesFileEmail3.txt', 'utf8', function (err, data) {
          if (err) throw err;
          const sliced = data.split(',');
          for (let i = 0; i < sliced.length - 1; i++) {
            namesArrayForUser3.push(sliced[i]);
          }
          return namesArrayForUser3;
        });
      })
      .pause(1000);
  },

  'Delete trash data sources and apps for the email3 test account': function (browser) {
    browser
      .login(browser.globals.emailForOrganizationTests)
      .perform(function () {
        namesArrayForUser3.forEach(function (element) {
          browser
            .deleteApplicationsMatchingParticularName(element)
            .deleteDataSourcesMatchingParticularName(element);
        })
      });
  },

  'Remove the file with trash data sources and applications name from email3 file': function (browser) {
    browser.perform(() => {
      fs.unlink('namesFileEmail3.txt', function (err) {
        if (err) throw err;
      });
    })
  }
};