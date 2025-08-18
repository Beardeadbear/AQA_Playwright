const casual = require('casual');
const globals = require('../../globals_path');
const titleText = 'Title';
const textForAboutInfo = 'Additional text';

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 16-about-this-app`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Edit About App title and additional info in app Settings of the new app': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, 'Client Support');

    rightSideNavMenu.openAppSettingScreen();

    appSettings.switchToAboutThisAppScreen()
      .enterTitleInAboutThisAppText(titleText);
    appSettings.enterTextInAboutThisAppText(textForAboutInfo);
    appSettings.clickSaveButton();
    appSettings.checkThatChangesHasBeenSuccessfullySaved('Saved successfully!');
    appSettings.closeSettingsOverlay();
  },

  'Assert all changes reflected in About App window': function(browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.openAppHamburgerMenu();
    preview.openAboutAppOverlay()
      .assertDetailsOfAboutAppOverlay(titleText, textForAboutInfo, browser.globals.appNameGenerated);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};