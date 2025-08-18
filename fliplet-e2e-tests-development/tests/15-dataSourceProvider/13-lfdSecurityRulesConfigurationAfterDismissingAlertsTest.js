const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-200',
  '@reference': 'https://weboo.atlassian.net/browse/OD-282',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 13-lfd-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 13-lfd-ds-provider`;

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

  'Create a new application, app data source with no security rule and add LFD to the screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createAppDataSourceViaApiWithNoSecurityRules(browser.globals.dataSourceNameGenerated, [])
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();
  },

  'Select Simple List LFD layout template': function(browser){
    const list = browser.page.listScreens();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.SIMPLE_LIST);
  },

  'Connect the created app data source to LFD': function(browser){
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

  'Configure access for adding entries in Entry management to check that Security rules Missing warning message is shown and save': function(browser){
    const list = browser.page.listScreens();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();

    list
      .expandEntryManagementBlock()
      .enableAllowUserToAddListItemsOptionInEntryManagement();

    dataSourceProvider
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.write.ACCESS)
      .cancelDataSourceProviderModal()
      .checkThatSecurityRulesMissingWarningMessageIsShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open LFD settings and check that Security rules Missing warning message is still shown for adding entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const editApp = browser.page.editAppScreen();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    dataSourceProvider
      .checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated)
      .checkThatSecurityRulesMissingWarningMessageIsShown();
  },

  'Click Configure data source security rules in data source provider for adding new entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickConfigureSecurityRules()
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

  'Configure access for editing entries in Entry management to check that Security rules Missing warning message is shown and save': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();

    list
      .confirmDataChangesInModalWindow()
      .expandEntryManagementBlock()
      .enableAllowUserToEditListItemsOptionInEntryManagement();

    dataSourceProvider
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.update.ACCESS)
      .cancelDataSourceProviderModal()
      .checkThatSecurityRulesMissingWarningMessageIsShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open LFD settings again and check that Security rules Missing warning message is still shown for editing entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const editApp = browser.page.editAppScreen();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    dataSourceProvider
      .checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated)
      .checkThatSecurityRulesMissingWarningMessageIsShown();
  },

  'Click Configure data source security rules in data source provider for editing entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickConfigureSecurityRules()
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

  'Configure access for deleting entries in Entry management to check that Security rules Missing warning message is shown and save': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();

    list
      .expandEntryManagementBlock()
      .enableAllowUserToDeleteListItemsOptionInEntryManagement();

    dataSourceProvider
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.delete.ACCESS)
      .cancelDataSourceProviderModal()
      .checkThatSecurityRulesMissingWarningMessageIsShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open LFD settings again and check that Security rules Missing warning message is still shown for deleting entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const editApp = browser.page.editAppScreen();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    dataSourceProvider
      .checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated)
      .checkThatSecurityRulesMissingWarningMessageIsShown();
  },

  'Click Configure data source security rules in data source provider for deleting entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickConfigureSecurityRules()
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