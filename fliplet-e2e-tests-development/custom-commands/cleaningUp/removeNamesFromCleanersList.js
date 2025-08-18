/* Custom command is added into each test only after block for removing app and data sources which were used in the test.
 * Command gets names of apps/data sources from test and removes them from the namesFile.txt.
 * The sense of command is to reduce working time for the additional cleaners from cleanup block,
 * without clearing names of already deleted apps/data sources additional cleaner will spend a lot of time for asserting that each element is not present.
 * @param {Array} [names]- array of app and data source names from the test
 * @param {String} userEmail - user email that is used for the current test
 */
const replace = require('replace-in-file');
let fileName;

exports.command = function(names, userEmail) {
  const firstRegexElement = new RegExp( names[0] + ",", "g");
  const secondRegexElement = new RegExp( names[1] + ",", "g");
  const thirdRegexElement = new RegExp( names[2] + ",", "g");
  const fourthRegexElement = new RegExp( names[3] + ",", "g"); // only 4 elements of array are processed

  this.perform (function(){
    if (userEmail === undefined) {
      fileName = 'namesFileEmail1.txt';
      }
    else fileName = 'namesFileEmail3.txt';
  });

   this.perform(function () {
      const options = {
        files: fileName,
        from: [firstRegexElement, secondRegexElement, thirdRegexElement, fourthRegexElement],
        to: "",
      };

      replace(options, (error, results) => {
      });
    });

   return this;
};
