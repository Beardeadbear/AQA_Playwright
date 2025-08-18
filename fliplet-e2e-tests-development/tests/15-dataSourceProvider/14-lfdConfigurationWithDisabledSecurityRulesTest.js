const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-201',
  '@reference': 'https://weboo.atlassian.net/browse/OD-265',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 14-lfd-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 14-lfd-ds-provider`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done,
        browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app data source with no security rules': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createAppDataSourceViaApiWithNoSecurityRules(browser.globals.dataSourceNameGenerated, []);
  },

  'Open the created data source and switch to the tab with security rules': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .switchToSecurityRuleTab();
  },

  'Create a new security rule with READ operation and disable it': function(browser){
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();

    secureRulesTabInAppDataScreen
      .clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();

    dataSourceSecurityRuleOverlay
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.read.OPERATION)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.disableSecurityRuleInTheList(dataSourceSecurityRulesOperations.read.OPERATION);
  },

  'Create a new security rule with WRITE operation and disable it': function(browser){
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();

    secureRulesTabInAppDataScreen
      .clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();

    dataSourceSecurityRuleOverlay
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.write.OPERATION)
      .unselectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.read.OPERATION)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.disableSecurityRuleInTheList(dataSourceSecurityRulesOperations.write.OPERATION);
  },

  'Create a new security rule with UPDATE operation and disable it': function(browser){
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();

    secureRulesTabInAppDataScreen
      .clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();

    dataSourceSecurityRuleOverlay
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.update.OPERATION)
      .unselectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.write.OPERATION)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.disableSecurityRuleInTheList(dataSourceSecurityRulesOperations.update.OPERATION);
  },

  'Create a new security rule with DELETE operation and disable it': function(browser){
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();

    secureRulesTabInAppDataScreen
      .clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();

    dataSourceSecurityRuleOverlay
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.delete.OPERATION)
      .unselectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.update.OPERATION)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.disableSecurityRuleInTheList(dataSourceSecurityRulesOperations.delete.OPERATION);
  },

  'Save changes in data source security rule': function(browser){
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    secureRulesTabInAppDataScreen
      .clickSaveAndApplyButtonForDataSourceSecurityRule()
      .acceptApplyingChangesToDataSourceSecurityRules();
  },

  'Open the created application': function(browser){
    const apps = browser.page.appsPage();

    apps
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);
  },

  'Add LFD to the screen': function(browser){
    browser
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();
  },

  'Select Agenda LFD layout template': function(browser){
    const list = browser.page.listScreens();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.AGENDA);
  },

  'Connect the created app data source to LFD': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatSecurityRulesMissingWarningMessageIsShown();
  },

  'Click Configure data source security rules in data source provider': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickConfigureSecurityRules()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();
  },

  'Open the data source settings and check Read security rule is added': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource.switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.assertThatSecurityRuleIsEnabled(dataSourceSecurityRulesOperations.read.OPERATION);

    dataSourceManagerOverlay.closeDataSourceManagerOverLay();
  },

  'Configure access for adding entries in Entry management': function(browser){
    const list = browser.page.listScreens();

    list
      .confirmDataChangesInModalWindow()
      .expandEntryManagementBlock()
      .enableAllowUserToAddListItemsOptionInEntryManagement();
  },

  'Check that the security rules alert is shown for LFD adding entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .checkThatSecurityRulesMissingWarningMessageIsShown()
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.write.ACCESS)
      .confirmDataSourceProviderModal()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();
  },

  'Open the data source settings and check Write security rule is added': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource.switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.assertThatSecurityRuleIsEnabled(dataSourceSecurityRulesOperations.write.OPERATION);

    dataSourceManagerOverlay.closeDataSourceManagerOverLay();
  },

  'Configure access for Editing entries in Entry management': function(browser){
    const list = browser.page.listScreens();

    list.enableAllowUserToEditListItemsOptionInEntryManagement();
  },

  'Check that the security rules alert is shown for LFD editing entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .checkThatSecurityRulesMissingWarningMessageIsShown()
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.update.ACCESS)
      .confirmDataSourceProviderModal()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();
  },

  'Open the data source settings and check Update security rule is added': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource.switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.assertThatSecurityRuleIsEnabled(dataSourceSecurityRulesOperations.update.OPERATION);

    dataSourceManagerOverlay.closeDataSourceManagerOverLay();
  },

  'Configure access for deleting entries in Entry management': function(browser){
    const list = browser.page.listScreens();

    list.enableAllowUserToDeleteListItemsOptionInEntryManagement();
  },

  'Check that the security rules alert is shown for LFD deleting entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .checkThatSecurityRulesMissingWarningMessageIsShown()
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.delete.ACCESS)
      .confirmDataSourceProviderModal()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();
  },

  'Open the data source settings and check Delete security rule is added': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();
    const componentsScreen = browser.page.componentsScreen();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource.switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.assertThatSecurityRuleIsEnabled(dataSourceSecurityRulesOperations.delete.OPERATION);

    dataSourceManagerOverlay.closeDataSourceManagerOverLay();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};