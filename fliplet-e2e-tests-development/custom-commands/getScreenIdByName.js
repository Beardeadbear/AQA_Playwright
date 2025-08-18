/**
 * Command used to get data id of the app screen by name
 * @param {String} screenName - name of the screen for id fetching
 * @param {Array} arr - empty array for pushing the result value
 */
exports.command = function(screenName, arr){
  this
    .useXpath()
    .waitForElementVisible(`//div[@class="screen-name"][text()="${screenName}"]/parent::li`, this.globals.smallWait)
    .getAttribute(`//div[@class="screen-name"][text()="${screenName}"]/parent::li`, 'data-id', function (result) {
        return arr.push(result.value);
    })
    .useCss();
};