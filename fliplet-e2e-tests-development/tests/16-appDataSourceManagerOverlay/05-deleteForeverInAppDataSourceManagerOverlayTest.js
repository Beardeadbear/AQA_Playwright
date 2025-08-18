const applicationTemplates = require('../../utils/constants/applicationTemplates');
const values = require('../../utils/constants/values');
const casual = require('casual');

module.exports = {
  '@disabled': true, //until Trash&Restore is back on staging
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 05-delete-ds-overlay`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 05-delete-ds-overlay`;

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

  'Cancel data source deletion forever': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .clickActionsButtonForTrashedDataSource(browser.globals.dataSourceNameGenerated)
      .selectDeleteForeverOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .clickCancelButtonInDataSourceModal()
      .assertDataSourceIsPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Try to delete the data source forever without entering its name in the conformation modal': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .clickActionsButtonForTrashedDataSource(browser.globals.dataSourceNameGenerated)
      .selectDeleteForeverOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .clickConfirmButtonInDataSourceModal()
      .acceptIncorrectDatSourceNameForDeletionAlert();
  },

  'Try to delete the data source forever with entering space instead of the data source name in the conformation modal': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .setValueInDataSourceModal(values.SPACE)
      .clickConfirmButtonInDataSourceModal()
      .acceptIncorrectDatSourceNameForDeletionAlert()
      .clickCancelButtonInDataSourceModal()
      .assertDataSourceIsPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Try to delete the data source forever with entering an incorrect data source name in the conformation modal': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .clickActionsButtonForTrashedDataSource(browser.globals.dataSourceNameGenerated)
      .selectDeleteForeverOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .setValueInDataSourceModal(browser.globals.dataSourceNameGenerated.slice(0, - 1))
      .clickConfirmButtonInDataSourceModal()
      .acceptIncorrectDatSourceNameForDeletionAlert();
  },

  'Delete data source forever and check that it is not present in Trash list': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .setValueInDataSourceModal(browser.globals.dataSourceNameGenerated)
      .clickConfirmButtonInDataSourceModal()
      .acceptDeletionCompleteAlert()
      .assertDataSourceIsNotPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};