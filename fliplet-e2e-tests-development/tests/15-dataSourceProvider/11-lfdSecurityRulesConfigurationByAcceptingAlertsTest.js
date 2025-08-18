const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-200',
  '@reference': 'https://weboo.atlassian.net/browse/OD-275',
  '@reference': 'https://weboo.atlassian.net/browse/OD-317',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 11-lfd-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 11-lfd-ds-provider`;

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

  'Create a new application, create a new app data source with no columns and security rules, add LFD to the screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createAppDataSourceViaApiWithNoSecurityRules(browser.globals.dataSourceNameGenerated, [])
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();
  },

  'Select Feed LFD layout template': function(browser){
    const list = browser.page.listScreens();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEED);
  },

  'Connect the created app data source to LFD': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatSecurityRulesMissingWarningMessageIsShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open LFd settings again and check that the data source provide is available if the connected and saved data has no columns': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const editApp = browser.page.editAppScreen();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    dataSourceProvider
      .checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated)
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

    secureRulesTabInAppDataScreen.checkThatSecurityRuleWithSpecificAccessOperationIsInTheList(dataSourceSecurityRulesOperations.read.OPERATION);

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

    secureRulesTabInAppDataScreen.checkThatSecurityRuleWithSpecificAccessOperationIsInTheList(dataSourceSecurityRulesOperations.write.OPERATION);

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

    secureRulesTabInAppDataScreen.checkThatSecurityRuleWithSpecificAccessOperationIsInTheList(dataSourceSecurityRulesOperations.update.OPERATION);

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

    secureRulesTabInAppDataScreen.checkThatSecurityRuleWithSpecificAccessOperationIsInTheList(dataSourceSecurityRulesOperations.delete.OPERATION);

    dataSourceManagerOverlay.closeDataSourceManagerOverLay();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview mode and check that LFD is present on the screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.clickEnableSecurityButtonForPreview();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();
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