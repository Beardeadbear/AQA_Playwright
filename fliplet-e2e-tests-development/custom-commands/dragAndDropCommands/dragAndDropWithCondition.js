/* Custom command
 * defines which dnd version (dnd 2.0. or dnd 3.0.) will be used for the current test based on the selected app template,
 * and uses the appropriate dragAndDropCommands command for dropping a widget
 * @param {package} widget to drop
 */
const widgets = require('../../utils/constants/widgets');

exports.command = function (package) {
  const resultDisplaying = [];

  this
    .frame(null)
    .waitForElementVisible('.main-element', this.globals.longWait)
    .waitForElementPresentWithoutErrors(`div[data-package="${widgets.CONTAINER}"]`, this.globals.smallWait, resultDisplaying)
    .perform(function () {
      if (resultDisplaying[0] === true) {
        this.api.newDragAndDrop(package)
          .waitForWidgetInterfaceNewDnd(package);
      } else {
        this.api.dragAndDrop(package)
          .waitForWidgetInterface(package);
      }
    });
};