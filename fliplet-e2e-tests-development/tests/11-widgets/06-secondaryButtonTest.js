const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const secondaryButtonLabel = casual.word ;

module.exports = {
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 06-secondary-button`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and drop Secondary Button widget': function(browser) {
    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.SECONDARY_BUTTON)
      .switchToWidgetInstanceFrame();
  },

  'Edit Secondary Button - set label for it and link action to display App Info': function(browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.changeComponentLabel(secondaryButtonLabel)
      .setLinkActionForComponent(1, 'Open the about this app overlay');
    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview screen and assert that all changes are applied - label and link actions are correct' :function(browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp.checkThatComponentIsPresentOnPreviewScreen(widgets.SECONDARY_BUTTON)
      .switchToPreviewFrame()
      .clickButtonComponentByValue(secondaryButtonLabel)
      .assertAppInfoOverlayIsOpened();
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};