const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screensTitles = {
  screenForRedirection: 'First screen',
  protectedScreen: 'Second screen'
};
const usersInfo = [{
  "Email": casual.email,
  "Password": casual.password,
},
  {
    "Email": casual.email,
    "Password": casual.password,
  }];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 10-protected`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 10-protected`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app, a data source with entries and add Login widget': function (browser) {
    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, usersInfo)
      .dragAndDrop(widgets.LOGIN)
      .waitForWidgetInterface(widgets.LOGIN)
      .switchToWidgetInstanceFrame();
  },

  'Check that Security rule warning alert is present in Login settings settings': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.assertSecurityRuleWarningAlertIsPresentInSettings();
  },

  'Connect the created data source to login component': function (browser) {
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectFieldsForLoginFromDataSourceColumnNames(Object.keys(usersInfo[0]))
      .clickSaveAndCloseButton();
  },

  'Create a new app security rule': function (browser) {
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appSettings = browser.page.appSettingsOverlay();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.switchToSettingsTabByTabLabel('App security')
      .clickAddNewRuleButtonCheckIfExpanded();
  },

  'Configure a screen to be protected and requiring authentication via a data source': function (browser) {
    const appSettings = browser.page.appSettingsOverlay();

    appSettings.selectRequiredSecurityConditionByValue('dataSource')
      .expandScreenSelectorDropdown()
      .selectScreenRequiredAction(screensTitles.protectedScreen)
      .selectScreenForRedirection(screensTitles.screenForRedirection)
      .clickSaveRulesButton()
      .closeSettingsOverlay();
  },

  'Publish the application': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publish = browser.page.publishScreen();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL')
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Try to access protected screen without logging in': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkPageTitle(`${screensTitles.screenForRedirection} - ${browser.globals.appNameGenerated}`)
      .openWebAppMenu()
      .openMenuItemByName(screensTitles.protectedScreen)
      .checkPageTitle(`${screensTitles.screenForRedirection} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.LOGIN);
  },

  'Login to the application': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.enterEmailAndPasswordForLogin(usersInfo[0].Email, usersInfo[0].Password)
      .submitLoginForm()
      .openWebAppMenu()
      .openMenuItemByName(screensTitles.protectedScreen);
  },

  'Verify that protected screen is open after logging in': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkPageTitle(`${screensTitles.protectedScreen} - ${browser.globals.appNameGenerated}`)
  },

  'Delete the created application and data source': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};