const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const casual = require('casual');
const appsId = [];
const initialAmountOfSecurityRules = [];

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGeneratedFirst = `${casual.title} 06-secure-rule-1`;
    browser.globals.appNameGeneratedSecond = `${casual.title} 06-secure-rule-2`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 06-sec-rule`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGeneratedFirst, browser.globals.appNameGeneratedSecond,
        browser.globals.dataSourceNameGenerated], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and add Directory LFD widget to it': function(browser){
    const list = browser.page.listScreens();

    browser.createAppUsingTemplate(browser.globals.appNameGeneratedFirst, applicationTemplates.BLANK, appsId)
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.DIRECTORY);
  },

  'Create a data source for Directory LFD widget': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGenerated)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Create the second app and add Featured list LFD widget to it': function(browser){
    const list = browser.page.listScreens();

    browser.createAppUsingTemplate(browser.globals.appNameGeneratedSecond, applicationTemplates.BLANK, appsId)
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEATURED_LIST);
  },

  'Select the previously created data source for Featured list LFD widget': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.clickShowAllDataSources()
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open the created data source and switch to the tab with security rules to create a new security rule for the first app': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .switchToSecurityRuleTab();
  },

  'Check that the created data source has no security rules': function(browser){
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    secureRulesTabInAppDataScreen.checkThatDataSourceHasNoSecurityRule()
      .getInitialAmountOfDataSourceSecurityRulesBeforeAddingNewOne(initialAmountOfSecurityRules);
  },

  'Add a new security rule for the data source': function(browser){
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();

    secureRulesTabInAppDataScreen.clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();

    dataSourceSecurityRuleOverlay.selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.delete.OPERATION)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.assertSecurityRuleIsAdded(initialAmountOfSecurityRules.pop())
      .getInitialAmountOfDataSourceSecurityRulesBeforeAddingNewOne(initialAmountOfSecurityRules);
  },

  'Select only write operation for the first app data source security rule': function(browser){
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    secureRulesTabInAppDataScreen.clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();

    dataSourceSecurityRuleOverlay.clickSpecificAppsButton()
      .selectApplicationForSecurityRule(appsId[appsId.length - 2])
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.write.OPERATION)
      .unselectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.delete.OPERATION)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.clickSaveAndApplyButtonForDataSourceSecurityRule()
      .acceptApplyingChangesToDataSourceSecurityRules()
      .assertSecurityRuleIsAdded(initialAmountOfSecurityRules.pop());
    secureRulesTabInAppDataScreen.getInitialAmountOfDataSourceSecurityRulesBeforeAddingNewOne(initialAmountOfSecurityRules);
  },

  'Delete the first security rule': function(browser){
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    secureRulesTabInAppDataScreen.deleteSecurityRule()
      .clickSaveAndApplyButtonForDataSourceSecurityRule()
      .acceptApplyingChangesToDataSourceSecurityRules()
      .assertSecurityRuleIsRemoved(initialAmountOfSecurityRules.pop());
  },

  'Check security rule for the first app - only write': function(browser){
    const apps = browser.page.appsPage();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGeneratedFirst);

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.clickEnableSecurityButtonForPreview()
      .assertElementNotPresentOnPreviewScreen('@lfdItem');
  },

  'Open the created data source and switch to the tab with security rules to create a new security rule for the second app': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .switchToSecurityRuleTab();
  },

  'Add a new security rule for the the second app': function(browser){
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    secureRulesTabInAppDataScreen.getInitialAmountOfDataSourceSecurityRulesBeforeAddingNewOne(initialAmountOfSecurityRules);
    secureRulesTabInAppDataScreen.clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();
  },

  'Select only read operation for the second app data source security rule': function(browser){
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    dataSourceSecurityRuleOverlay.clickSpecificAppsButton()
      .selectApplicationForSecurityRule(appsId[appsId.length - 1])
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.read.OPERATION)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.clickSaveAndApplyButtonForDataSourceSecurityRule()
      .acceptApplyingChangesToDataSourceSecurityRules()
      .assertSecurityRuleIsAdded(initialAmountOfSecurityRules[initialAmountOfSecurityRules.length - 1]);
  },

  'Check security rule for the first app - only read': function(browser){
    const apps = browser.page.appsPage();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGeneratedSecond);

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.assertElementVisibleOnPreviewScreen('@lfdItem');
  },

  'Delete the created applications and data source':
    function(browser){
      browser
        .deleteApplicationsMatchingParticularName(browser.globals.appNameGeneratedFirst)
        .deleteApplicationsMatchingParticularName(browser.globals.appNameGeneratedSecond)
        .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
        .removeNamesFromCleanersList([browser.globals.appNameGeneratedFirst, browser.globals.appNameGeneratedSecond,
          browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
    }
};