/**
 * Command for accepting modal windows during tests
 */
exports.command = function(){
  return this
    .waitForElementVisible('div[style] .modal-content', this.globals.mediumWait)
    .waitForElementVisible('.modal-content .btn.btn-primary', this.globals.mediumWait)
    .waitForElementVisible('.modal-content .btn.btn-default', this.globals.mediumWait)
    .click('.modal-content .btn.btn-primary')
    .waitForElementNotPresent('.modal-content .btn.btn-default', this.globals.mediumWait)
    .waitForElementNotPresent('.modal-content .btn.btn-primary', this.globals.mediumWait);
};