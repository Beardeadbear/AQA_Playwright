const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const tokenName = casual.word.concat(casual.letter);
const screensTitles = {
  screenWithAppList: 'First screen',
  screenWithLogin: 'Second screen'
};
const usersInfo = [{
  "Email": casual.email.toLowerCase(),
  "Password": casual.password,
},
  {
    "Email": casual.email.toLowerCase(),
    "Password": casual.password,
  }];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 07-app-list`;
    browser.globals.appForListNameGenerated = `${casual.title} 07-app-list-add`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 07-app-list`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.appForListNameGenerated,
        browser.globals.dataSourceNameGenerated], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new data source with user data, two new apps and add App list widget to the first one': function (browser) {
    browser.createAppUsingTemplate(browser.globals.appForListNameGenerated, applicationTemplates.DIRECTORY_APP)
      .createApplicationWithCondition(browser.globals.appNameGenerated)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, usersInfo)
      .dragAndDropWithCondition(widgets.APP_LIST)
      .switchToWidgetInstanceFrame();
  },

  'Configure app list settings - check app presence in published and all app list': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.tickCheckBoxByLabel('test_apps');
    componentsScreen.assertAppIsPresentInAppList(browser.globals.appForListNameGenerated);
    componentsScreen.tickCheckBoxByLabel('published-apps');
    componentsScreen.assertAppIsNotPresentInAppList(browser.globals.appForListNameGenerated);
  },

  'Configure app list settings for no security option - create token and chose the app for the list': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const publish = browser.page.publishScreen();

    componentsScreen.tickCheckBoxByLabel('test_apps');
    componentsScreen.chooseAppForAppList(browser.globals.appForListNameGenerated);

    publish.clickCreateNewTokenButton();
    publish.enterNewTokenName(tokenName)
      .clickOkButton();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open the preview screen and check App list for no security option': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.checkThatComponentIsPresentOnPreviewScreen(widgets.APP_LIST)
      .switchToPreviewFrame()
      .checkThatAppIsInAppList(browser.globals.appForListNameGenerated);
  },

  'Return to edit mode and configure app list settings for All Authorized Users security option': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const editApp = browser.page.editAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.APP_LIST);

    componentsScreen.tickCheckBoxByLabel('security-access-list');
    componentsScreen.switchToTabName('Login screen');
    componentsScreen.setLinkActionForComponent(1, 'Display another screen');
    componentsScreen.selectScreenForLinkingByName(screensTitles.screenWithLogin);
    componentsScreen.clickSaveAndCloseButton();

    editApp.assertAppListIsHiddenBySingInButton();
  },

  'Switch to another screen and drop login component there': function (browser) {
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLogin);

    browser.dragAndDropWithCondition(widgets.LOGIN)
      .switchToWidgetInstanceFrame();
  },

  'Configure the login component': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectFieldsForLoginFromDataSourceColumnNames(Object.keys(usersInfo[0]))
      .clickSaveAndCloseButton();
  },

  'Publish the application': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publish = browser.page.publishScreen();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');
    publish.clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish.clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Check that the web application is open and app list is not visible without authorization': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openWebAppMenu()
      .openMenuItemByName(screensTitles.screenWithAppList)
      .checkPageTitle(`${screensTitles.screenWithAppList} - ${browser.globals.appNameGenerated}`)
      .assertAppListIsHiddenBySingInButton()
      .clickElementOnWebAppScreen('@signInAppListButton')
      .checkPageTitle(`${screensTitles.screenWithLogin} - ${browser.globals.appNameGenerated}`);
  },

  'Login and check the app list': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.assertWidgetIsPresentOnScreen(widgets.LOGIN)
      .enterEmailAndPasswordForLogin(usersInfo[0].Email, usersInfo[0].Password)
      .submitLoginForm()
      .openWebAppMenu()
      .openMenuItemByName(screensTitles.screenWithAppList)
      .checkTheAppInAppList(browser.globals.appForListNameGenerated)
      .clickAppIconInAppList()
      .checkPageTitle(`Home - ${browser.globals.appForListNameGenerated}`);
  },

  'Delete the created application and data source': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteApplicationsMatchingParticularName(browser.globals.appForListNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.appForListNameGenerated,
        browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};