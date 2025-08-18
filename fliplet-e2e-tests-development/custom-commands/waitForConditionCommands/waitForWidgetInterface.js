/**
 * Wait for widget interface to be present and if it is not present, check if the component is on preview screen
 * If it is not there, drop using DND 2.0. the same component again
 * Otherwise, the component is clicked on preview screen to open widget instance
 * @param {string} [component] - package name to "drop" on the page for Drag and Drop command
 */
exports.command = function(component) {
  const editApp = this.page.editAppScreen();
  const widgetInterfaceShowLocator = '.widget-interface.show';
  const widgetOnPreviewScreenLocator =`[data-widget-package="${component}"]`;
  const resultDisplaying = [];

  return this
    .switchToPreviewFrame()
    .waitForElementPresentWithoutErrors(widgetOnPreviewScreenLocator, 10000, resultDisplaying)
    .perform(function() {
      if (resultDisplaying[0] == false) {
        this.api.frame(null)
          .dragAndDrop(component)
      }
    })
    .frame(null)
    .switchToPreviewFrame()
    .waitForElementVisible(widgetOnPreviewScreenLocator, this.globals.mediumWait)
    .frameParent()
    .waitForElementPresentWithoutErrors(widgetInterfaceShowLocator, 10000, resultDisplaying)
    .perform(function() {
      if (resultDisplaying[1] == false) {
        editApp.openDetailsOfComponentByClickingOnIt(component);
      }
    })
    .waitForElementVisible(widgetInterfaceShowLocator, this.globals.mediumWait);
};
