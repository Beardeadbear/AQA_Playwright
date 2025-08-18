const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const widgets = require('../../utils/constants/widgets');

module.exports = {

  '@disabled': (globals.smokeTest == 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-200',
  '@reference': 'https://weboo.atlassian.net/browse/OD-284',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 12-lfd-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 12-lfd-ds-provider`;

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

  'Create a new application, create a new app data source with default security rules, add LFD widget to the screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, [])
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();
  },

  'Select Featured List LFD layout template': function(browser){
    const list = browser.page.listScreens();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEATURED_LIST);
  },

  'Connect the created app data source to LFD': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Check that Security rules missing warning message is not shown if the data source connected to the provider has security rules': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.checkThatSecurityRulesMissingWarningMessageIsNotShown();
  },

  'Configure access for Editing entries in Entry management and check that the security rules alert is not shown': function(browser){
    const list = browser.page.listScreens();
    const dataSourceProvider = browser.page.dataSourceProvider();

    list
      .expandEntryManagementBlock()
      .enableAllowUserToEditListItemsOptionInEntryManagement();

    dataSourceProvider.checkThatSecurityRulesMissingWarningMessageIsNotShown();
  },

  'Configure access for deleting entries in Entry management and check that the security rules alert is not shown': function(browser){
    const list = browser.page.listScreens();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();

    list.enableAllowUserToDeleteListItemsOptionInEntryManagement();

    dataSourceProvider.checkThatSecurityRulesMissingWarningMessageIsNotShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open the LFD settings and check that the data source provide is available and there is no Security rules Missing warning message shown': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const editApp = browser.page.editAppScreen();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    dataSourceProvider
      .checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated)
      .checkThatSecurityRulesMissingWarningMessageIsNotShown();
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
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};