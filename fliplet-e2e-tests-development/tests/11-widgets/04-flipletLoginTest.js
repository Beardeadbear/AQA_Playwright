const casual = require('casual');
const globals = require('../../globals_path');
const flipletLoginComponent = 'com.fliplet.login';
const protectedScreen = 'Directory';
const screenForRedirection = 'Home';
const screenWithNoProtection = 'Blog';

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.word} ${casual.word} 04-fliplet-login`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 04-fliplet-login`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login()
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Crete a new application and add Fliplet login component': function (browser) {
    const editApp = browser.page.editAppScreen();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, 'Directory App');

    editApp.deleteComponentFromScreen('com.fliplet.image');

    browser.newDragAndDrop(flipletLoginComponent)
      .waitForWidgetInterfaceNewDnd(flipletLoginComponent)
      .switchToWidgetInstanceFrame();
  },

  'Configure Fliplet login component': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.setLinkActionForComponent(1, 'Display another screen');
    componentsScreen.selectScreenForLinkingByName(protectedScreen);
    componentsScreen.clickSaveAndCloseButton();
  },

  'Create a new security rule for the app': function (browser) {
    const appSettings = browser.page.appSettingsOverlay();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.switchToSettingsTabByTabLabel('App security')
      .clickAddNewRuleButtonCheckIfExpanded();
  },

  'Configure all the screens to be protected and requiring authentication except one': function (browser) {
    const appSettings = browser.page.appSettingsOverlay();

    appSettings.selectRequiredSecurityConditionByValue('flipletLogin')
      .tickCheckBoxByLabel('whitelist_1')
      .expandScreenSelectorDropdown()
      .selectScreenRequiredAction(screenWithNoProtection)
      .selectScreenForRedirection(screenForRedirection)
      .clickSaveRulesButton()
      .closeSettingsOverlay();
  },

  'Publish the application': function (browser) {
    const publish = browser.page.publishScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');
    publish.clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish.clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Try to access the protected and unprotected screen without logging in': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkPageTitle(`${screenForRedirection} - ${browser.globals.appNameGenerated}`)
      .openMenuItemByName(screenWithNoProtection)
      .checkPageTitle(`${screenWithNoProtection} - ${browser.globals.appNameGenerated}`)
      .openMenuItemByName(protectedScreen)
      .checkPageTitle(`${screenForRedirection} - ${browser.globals.appNameGenerated}`);
  },

  'Try to login with an incorrect email': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.enterEmailForLoginComponent(casual.email)
      .clickContinueForLoginComponent()
      .checkPageTitle(`${screenForRedirection} - ${browser.globals.appNameGenerated}`);
  },

  'Try to login with an incorrect password': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.enterEmailForLoginComponent(browser.globals.email2)
      .clickContinueForLoginComponent()
      .enterPasswordForLoginComponent(browser.globals.password.replace(1, 2))
      .submitLoginForm()
      .checkPageTitle(`${screenForRedirection} - ${browser.globals.appNameGenerated}`);
  },

  'Login to the application and verify that the protected screen is open after logging in': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.enterPasswordForLoginComponent(browser.globals.password)
      .submitLoginForm()
      .checkPageTitle(`${protectedScreen} - ${browser.globals.appNameGenerated}`);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};