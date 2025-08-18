const globals = require('../../globals_path');
const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 05-rename`;
    browser.globals.appNewNameGenerated = `${casual.title} 05-new-name`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new application and rename it': function(browser){
    const appSettings = browser.page.appSettingsOverlay();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP);

    rightSideNavMenu.openAppSettingScreen();

    appSettings.enterNewAppName(browser.globals.appNewNameGenerated);
    appSettings.clickSaveButton();
    appSettings.closeSettingsOverlay();
  },

  'Check that the application with the new name is present in the app list': function(browser){
    const appPage = browser.page.appsPage();

    appPage.navigate()
      .waitForAppsPageToBeLoaded()
      .assertApplicationIsPresentInListByName(browser.globals.appNewNameGenerated);
  },

  'Deleting the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNewNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};