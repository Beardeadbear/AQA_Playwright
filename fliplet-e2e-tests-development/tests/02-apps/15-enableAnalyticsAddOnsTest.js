const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const responseBody = [];
const scriptSentryInit = "Sentry.init({ dsn: 'https://dc1cbdd4a3724ab3aa96c7fa8e9afd25@sentry.io/1404726' });";
const screenHTML = '<script src="https://browser.sentry-cdn.com/4.6.4/bundle.min.js" crossorigin="anonymous"></script>';

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 15-add-ons`;
    browser.globals.errorMessage = casual.title + casual.word;
    browser.globals.scriptError = `throw new Error("${browser.globals.errorMessage}");`;
    browser.globals.responseBody = [];

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

  'Create a new app and enable Mixpanel add-on for app': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.switchToAddOnsScreen();
    appSettings.selectAddOnByName('Mixpanel');
    appSettings.enableAddOn();

    browser
      .switchToWidgetProviderFrame()
      .waitForElementVisible('#webTracker', browser.globals.smallWait)
      .waitForElementVisible('#nativeTracker', browser.globals.smallWait)
      .frame(null);
  },

  'Enable System:Analytic add-on for app': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();

    appSettings.selectAddOnByName('System: Analytics');
    appSettings.enableAddOn();

    browser
      .switchToWidgetProviderFrame()
      .waitForElementVisible('label[for="disable-user-tracking"]', browser.globals.smallWait)
      .frame(null);
  },

  /*
    'Enable System: Error logging add-on for app and assert errors are logged': function(browser) {
      const rightSideNavMenu = browser.page.rightSideNavigationMenu();
      const appSettings = browser.page.appSettingsOverlay();
      const devOptions = browser.page.developerOptionsScreen();

      //open created application

      rightSideNavMenu.openAppSettingScreen();

      appSettings
        .switchToAddOnsScreen()
        .selectAddOnByName('System: Error logging');
      appSettings.enableAddOn();

      browser
        .switchToWidgetProviderFrame()
        .waitForElementVisible('.row.no-gutters', browser.globals.smallWait)
        .frame(null);

      appSettings.closeSettingsOverlay();

      // add Sentry DNS and Js code for error generating to an app

      devOptions.openDeveloperOptionsScreen();
      devOptions.enterScreenJavaScript(scriptSentryInit);
      devOptions.enterScreenJavaScript(browser.globals.scriptError); // error throwing
      devOptions.enterHTMLToDeveloperOptions(screenHTML);
      devOptions.clickSaveAndRunButtonSimple();

      browser
        .pause(15000) // added for Sentry API to have time for logging
        .getSentryErrors(browser.globals.sentryURI, browser.globals.sentryBearer, browser.globals.responseBody, browser.globals.errorMessage)
        .checkSentryErrors(browser.globals.responseBody, browser.globals.errorMessage);
    },
   */

  'Deleting created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};