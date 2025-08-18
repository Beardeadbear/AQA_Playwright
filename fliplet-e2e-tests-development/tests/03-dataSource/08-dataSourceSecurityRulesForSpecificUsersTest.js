const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const widgets = require('../../utils/constants/widgets');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const casual = require('casual');

const screensTitles = {
  screenWithAgenda: 'First screen',
  screenWithLogin: 'Second screen',
};
const usersInfo = [{
  "name": casual.full_name,
  "email": casual.email.toLowerCase(),
  "password": casual.password,
  "company": casual.word,
  "position": casual.title
},
  {
    "name": casual.full_name,
    "email": casual.email.toLowerCase(),
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  }];

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 08-sec-rule`;
    browser.globals.dataSourceNameGeneratedLFD = `${casual.title} 08-sec-rule`;
    browser.globals.dataSourceNameGeneratedLogin = `${casual.title} 08-sec-rule`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGeneratedLFD,
        browser.globals.dataSourceNameGeneratedLogin], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app, a data source with entries and add LFD Agenda component': function(browser){
    const list = browser.page.listScreens();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGeneratedLogin, usersInfo)
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.AGENDA);
  },

  'Create a data source for Agenda LFD widget': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGeneratedLFD)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGeneratedLFD);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Add Login component to another screen and open its configuration': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLogin);

    browser.newDragAndDrop(widgets.LOGIN)
      .waitForWidgetInterfaceNewDnd(widgets.LOGIN)
      .switchToWidgetInstanceFrame();
  },

  'Connect the data source with users list to login component': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGeneratedLogin)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGeneratedLogin);

    componentsScreen.selectFieldsForLoginFromDataSourceColumnNames(["email", "password"])
      .switchToFlWidgetFrameByNumber(2)
      .selectScreenForLinkingByName(screensTitles.screenWithAgenda)
      .clickSaveAndCloseButton();
  },

  'Open the created data source and switch to the tab with security rules to create a new security rule': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGeneratedLFD);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGeneratedLFD)
      .switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();

    dataSourceSecurityRuleOverlay.selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.read.OPERATION)
      .clickAddRuleButton();
  },

  'Add a condition for the app data source security rule': function(browser){
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    secureRulesTabInAppDataScreen.clickEditButtonForSecurityRule();

    dataSourceSecurityRuleOverlay.clickSpecificUsersButton()
      .configureFilterFoDataSourceSecurityRule('company', 'Equals', usersInfo[1].company)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.clickSaveAndApplyButtonForDataSourceSecurityRule()
      .acceptApplyingChangesToDataSourceSecurityRules();
  },

  'Check data source security rule for users whose data is different from the specified conditions - no access': function(browser){
    const apps = browser.page.appsPage();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.clickEnableSecurityButtonForPreview();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLogin);

    preview.signInIntoLoginFormWithSecurityEnabled(usersInfo[0].email, usersInfo[0].password);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screensTitles.screenWithAgenda);

    preview.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .assertElementNotPresentOnPreviewScreen('@lfdItem');
  },

  'Publish the application and open it on web': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publish = browser.page.publishScreen();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL')
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Check data source security rule for users whose data is the same as the specified conditions - they have access': function(browser){
    const webApp = browser.page.webApplicationPages();

    webApp.openWebAppMenu()
      .openMenuItemByName(screensTitles.screenWithLogin)
      .checkPageTitle(`${screensTitles.screenWithLogin} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.LOGIN)
      .enterEmailAndPasswordForLogin(usersInfo[1].email, usersInfo[1].password)
      .submitLoginForm()
      .assertLoginIsSuccessful()
      .checkPageTitle(`${screensTitles.screenWithAgenda} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.LIST_FROM_DATA_SOURCE)
      .openAndCheckLfdItemDetails();
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGeneratedLFD)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGeneratedLogin)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGeneratedLFD,
        browser.globals.dataSourceNameGeneratedLogin], browser.globals.emailForOrganizationTests);
  }
};