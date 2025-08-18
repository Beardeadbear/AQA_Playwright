/**
 * Command to check if click on element returned the expected result in the form of new visible element
 * If expected element is not visible, click will be repeated
 * Created for cases when button is visible but JS js not ready to perform actions
 * @param {String} selectorToClickOn - css selector to element which should be clicked
 * @param {String} selectorToExpect - css selector to element which should be present after performed click
 */
exports.command = function(selectorToClickOn, selectorToExpect){
  return this
    .waitForElementVisible(selectorToClickOn, this.globals.smallWait)
    .click(selectorToClickOn)
    .pause(1000)
    .isVisible(selectorToExpect, function(result){
      if (result.value !== true) {
        this.execute(function (selectorToClickOn) {
          const elementForClick = document.querySelector(selectorToClickOn);
          elementForClick.click();
        }, [selectorToClickOn]);
      }
    });
};