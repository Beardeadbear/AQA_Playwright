const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const tokenName = casual.word.concat(casual.letter);
const screensTitles = {
  screenWithAppList: 'First screen',
  screenWithLogin: 'Second screen'
};
const usersInfo = [
  {
    "Email": casual.email.toLowerCase(),
    "Password": casual.password
  },
  {
    "Email": casual.email.toLowerCase(),
    "Password": casual.password
  },
  {
    "Email": casual.email.toLowerCase(),
    "Password": casual.password
  }
];
const columns = Object.keys(usersInfo[0]);
const newColumns = [casual.word];
const appId = [];

module.exports = {

  '@reference': 'https://weboo.atlassian.net/browse/OD-1',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 04-edit-ds-provider`;
    browser.globals.appForListNameGenerated = `${casual.title} 04-edit-ds-provider-add`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 04-edit-ds-provider`;
    browser.globals.dataSourceNameGeneratedForUsers = `${casual.title} 04-edit-ds-provider-add`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.appForListNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.dataSourceNameGeneratedForUsers], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create new data sources with user data, two new apps and add App list widget to the first one': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appForListNameGenerated, applicationTemplates.BLANK)
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, usersInfo)
      .createDataSourceViaApi(browser.globals.dataSourceNameGeneratedForUsers, usersInfo.slice(1, 3))
      .dragAndDropWithCondition(widgets.APP_LIST)
      .switchToWidgetInstanceFrame();
  },

  'Choose the app for the app list': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .tickCheckBoxByLabel('test_apps')
      .chooseAppForAppList(browser.globals.appForListNameGenerated)
      .getAppIdFromAppListConfigurationsByAppName(browser.globals.appForListNameGenerated, appId);
  },

  'Configure app list settings for Some Authorized Users security option and select a data source in data source provider': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.tickCheckBoxByLabel('security-access-list-app-control');

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGeneratedForUsers)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGeneratedForUsers);

    componentsScreen.selectDataSourceEmailColumnForAppListSecurityOption(columns[0]);
  },

  'Click View data source and edit the data source columns names': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGeneratedForUsers)
      .assertDataSourceColumnNamesAreCorrect(columns)
      .changeDataSourceColumnNames(newColumns.concat(`APP:${appId[0]}`));

    dataSourceManagerOverlay.clickSaveButtonInDataSourceManagerOverlayOpenFromDataSourceProvider();
  },

  'Check that the changes made in data source open and edit via data source provider is applied to App list configurations': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    browser.switchToWidgetInstanceFrame();

    componentsScreen.selectDataSourceEmailColumnForAppListSecurityOption(newColumns[0]);
  },

  'Create token for the app list': function(browser){
    const publishScreen = browser.page.publishScreen();

    publishScreen
      .clickCreateNewTokenButton()
      .enterNewTokenName(tokenName)
      .clickOkButton();
  },

  'Configure Login screen in App list settings': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const editApp = browser.page.editAppScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    componentsScreen
      .switchToTabName('Login screen')
      .setLinkActionForComponent(2, 'Display another screen')
      .selectScreenForLinkingByName(screensTitles.screenWithLogin);

    componentsScreen.switchToTabName('Settings');

    dataSourceProvider.checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGeneratedForUsers);

    componentsScreen.clickSaveAndCloseButton();

    editApp.assertAppListIsHiddenBySingInButton();
  },

  'Switch to another screen and drop Login component there': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLogin);

    browser
      .dragAndDropWithCondition(widgets.LOGIN)
      .switchToWidgetInstanceFrame();
  },

  'Configure Login component': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen
      .selectFieldsForLoginFromDataSourceColumnNames(columns)
      .clickSaveAndCloseButton();
  },

  'Publish the application': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publishScreen = browser.page.publishScreen();

    appTopFixedNavigationBar.navigateToPublishMode();

    publishScreen
      .clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL')
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Login as user with access and check that the App list is available': function(browser){
    const webApp = browser.page.webApplicationPages();

    webApp
      .checkPageTitle(`${screensTitles.screenWithAppList} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.APP_LIST)
      .assertAppListIsHiddenBySingInButton()
      .clickElementOnWebAppScreen('@signInAppListButton')
      .checkPageTitle(`${screensTitles.screenWithLogin} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.LOGIN)
      .enterEmailAndPasswordForLogin(usersInfo[1].Email, usersInfo[1].Password)
      .submitLoginForm()
      .openWebAppMenu()
      .openMenuItemByName(screensTitles.screenWithAppList)
      .assertWidgetIsPresentOnScreen(widgets.APP_LIST)
      .checkTheAppInAppList(browser.globals.appForListNameGenerated);
  },

  'Login as user with no access and check the App list is not available': function(browser){
    const webApp = browser.page.webApplicationPages();

    webApp
      .clickSignOutButtonInAppList()
      .clickSignOutButtonOnAlert()
      .checkPageTitle(`${screensTitles.screenWithLogin} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.LOGIN)
      .enterEmailAndPasswordForLogin(usersInfo[0].Email, usersInfo[0].Password)
      .submitLoginForm()
      .openWebAppMenu()
      .openMenuItemByName(screensTitles.screenWithAppList)
      .assertWidgetIsPresentOnScreen(widgets.APP_LIST)
      .assertAppListIsHiddenBySingInButton();
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteApplicationsMatchingParticularName(browser.globals.appForListNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGeneratedForUsers)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.appForListNameGenerated,
        browser.globals.dataSourceNameGenerated, browser.globals.dataSourceNameGeneratedForUsers], browser.globals.emailForOrganizationTests);
  }
};