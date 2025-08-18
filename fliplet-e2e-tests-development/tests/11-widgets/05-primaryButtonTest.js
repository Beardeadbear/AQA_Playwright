const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const primaryButtonLabel = casual.word;
const screenNameForButtonInteraction = 'Second screen';

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 05-primary-button`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app and drop Primary Button widget onto the screen': function (browser) {
    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.PRIMARY_BUTTON)
      .switchToWidgetInstanceFrame();
  },

  'Edit Primary Button - set label for it and link action to display another screen': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.changeComponentLabel(primaryButtonLabel)
      .setLinkActionForComponent(1, 'Display another screen')
      .selectScreenForLinkingByName(screenNameForButtonInteraction);
    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview screen and assert that all changes are applied - label and link action are correct': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp.checkThatComponentIsPresentOnPreviewScreen(widgets.PRIMARY_BUTTON)
      .switchToPreviewFrame()
      .clickButtonComponentByValue(primaryButtonLabel);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenNameForButtonInteraction);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
