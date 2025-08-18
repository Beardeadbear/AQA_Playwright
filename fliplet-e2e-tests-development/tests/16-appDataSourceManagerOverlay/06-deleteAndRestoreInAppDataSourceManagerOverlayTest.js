const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');

module.exports = {
  '@disabled': true, //until Trash&Restore is back on staging
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 06-restore-ds-overlay`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 06-restore-ds-overlay`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new application and the app data source': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, []);
  },

  'Click App data to open Data source manager overlay in app edit mode ': function(browser){
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const allDataSources = browser.page.allDataSourcesPage();

    rightSideNavMenu.openAppDataScreen();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt(browser.globals.appNameGenerated);

    allDataSources.assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Delete the data source from App\'s data source list': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .clickActionsButtonForDataSource(browser.globals.dataSourceNameGenerated)
      .selectDeleteOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .acceptDeleteDataSourceModal()
      .assertDataSourceIsNotPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Open Trash and check that the deleted data source is present there': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .clickTrashButton()
      .assertDataSourceIsPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Restore the data source and check that it is not in Trash any more': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .clickActionsButtonForTrashedDataSource(browser.globals.dataSourceNameGenerated)
      .selectRestoreOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .acceptDatSourceRestoreCompleteAlert()
      .assertDataSourceIsNotPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Open all data sources and check that the restored data source is present there': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .clickAllButtonInDataSourceManager(browser.globals.dataSourceNameGenerated)
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Delete the created app and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};