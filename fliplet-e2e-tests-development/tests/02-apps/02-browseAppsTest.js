const globals = require('../../globals_path');
const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');

module.exports = {
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 02-browse`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Page with apps can be opened': function (browser) {
    const apps = browser.page.appsPage();

    apps.navigate()
      .waitForAppsPageToBeLoaded();
    },

  'Selecting Preview app option redirects user to preview screen': function(browser){
    const apps = browser.page.appsPage();
    const preview = browser.page.previewAppScreen();

    apps.expandOptionsForAppByName(browser.globals.appNameGenerated);
    apps.selectOptionByTitle(browser.globals.appNameGenerated, 'Preview app');

    preview.verifyPreviewScreenIsOpened();
  },

  'Selecting Edit app option redirects user to edit screen': function(browser){
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();

    apps.navigate()
      .waitForAppsPageToBeLoaded();
    apps.clickEditButtonUnderAppByName(browser.globals.appNameGenerated);

    editApp.verifyEditScreenIsOpened();
  },

  'Selecting Settings option redirects user to settings screen': function(browser){
    const apps = browser.page.appsPage();
    const appSettings = browser.page.appSettingsOverlay();

    apps.navigate()
      .waitForAppsPageToBeLoaded();
    apps.expandOptionsForAppByName(browser.globals.appNameGenerated);
    apps.selectOptionByTitle(browser.globals.appNameGenerated, 'Settings');

    appSettings.verifySettingsScreenIsOpened();
  },

  'Deleting created applications': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};