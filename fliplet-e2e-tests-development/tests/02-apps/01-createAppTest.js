const globals = require('../../globals_path');
const casual = require('casual');
const collaboratorEmailAddress = casual.email;
const appIconImageName = 'icon.png';
const iconImageId = [];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 01-create-app`;

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

  'Open Apps page and click "Create app" button': function (browser) {
    const appPage = browser.page.appsPage();

    appPage.navigate()
      .waitForAppsPageToBeLoaded()
      .clickNewAppButton();
  },

  'Check app templates section and click "Use template" button': function (browser) {
    const appsCreateOverlay = browser.page.createAppOverlay();

    appsCreateOverlay.assertAppSetupOverlayIsOpen()
      .checkAppTemplateSection()
      .waitForAppTemplatesToBeLoaded()
      .clickUseAppTemplate('Client Support')
  },

  'Check app setup section and check that it is impossible to create app with no name': function (browser) {
    const appsCreateOverlay = browser.page.createAppOverlay();

    appsCreateOverlay.checkAppSetupSection()
      .checkErrorMessageIfNoAppNameHasBeenEntered()
  },

  'Check ability to go back to the previous section and change an app layout': function(browser){
    const appsCreateOverlay = browser.page.createAppOverlay();

    appsCreateOverlay.clickBackButton()
      .assertAppSetupOverlayIsOpen()
      .checkAppTemplateSection()
      .waitForAppTemplatesToBeLoaded()
      .clickUseAppTemplate('Event');
  },

  'Enter a name for the app and check ability to download an app icon': function (browser) {
    const appsCreateOverlay = browser.page.createAppOverlay();

    appsCreateOverlay.checkAppSetupSection()
      .enterAppName(browser.globals.appNameGenerated)
      .downloadAppIcon(appIconImageName);

    appsCreateOverlay.clickNextButton();
  },

  'Check that the app has been created and edit mode is open': function (browser) {
    const appsCreateOverlay = browser.page.createAppOverlay();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appsCreateOverlay.waitForAppEditModeToBeLoaded();

    appTopFixedNavigationBar.waitForAppTopFixedNavigationBarTobeLoaded();

    appTopFixedNavigationBar.assertOpenAppTitle(browser.globals.appNameGenerated)
    .assertIconImageIsPresentAndGetItsId(iconImageId);
  },

  'Check that data sources have been created with the app': function (browser) {
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .assertDataSourceIsPresentInListByAppName(browser.globals.appNameGenerated);
  },

  'Navigate to Apps page and check that the app is present in apps list': function (browser) {
    const apps = browser.page.appsPage();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .assertApplicationIsPresentInListByName(browser.globals.appNameGenerated)
      .assertAppHasIconImage(browser.globals.appNameGenerated, iconImageId);
  },

  'Delete the created application and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};