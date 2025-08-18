const values = require('../../utils/constants/values');
const casual = require('casual');

module.exports = {
  '@disabled': 'true', //until Trash&Restore is back on staging
  before: function (browser, done) {
    browser.globals.dataSourceNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 10-data-source-trash`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.dataSourceNameGenerated], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new data source and assert it is present in the data source manager list': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    browser.createDataSource(browser.globals.dataSourceNameGenerated);

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Delete the data source from All data source list': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.clickActionsButtonForDataSource(browser.globals.dataSourceNameGenerated)
      .selectDeleteOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .acceptDeleteDataSourceModal()
      .waitForDataSourcesPageToBeLoaded()
      .assertDataSourceIsNotPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Open Trash and check that the deleted data source is present there': function(browser) {
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.clickTrashButton()
      .assertDataSourceIsPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Cancel data source deletion forever': function(browser) {
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.clickActionsButtonForTrashedDataSource(browser.globals.dataSourceNameGenerated)
      .selectDeleteForeverOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .clickCancelButtonInDataSourceModal()
      .assertDataSourceIsPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Try to delete the data source forever without entering its name in the conformation modal': function(browser) {
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.clickActionsButtonForTrashedDataSource(browser.globals.dataSourceNameGenerated)
      .selectDeleteForeverOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .clickConfirmButtonInDataSourceModal()
      .acceptIncorrectDatSourceNameForDeletionAlert();
  },

  'Try to delete the data source forever with entering space instead of the data source name in the conformation modal': function(browser) {
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.setValueInDataSourceModal(values.SPACE)
      .clickConfirmButtonInDataSourceModal()
      .acceptIncorrectDatSourceNameForDeletionAlert()
      .clickCancelButtonInDataSourceModal()
      .assertDataSourceIsPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Try to delete the data source forever with entering an incorrect data source name in the conformation modal': function(browser) {
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.clickActionsButtonForTrashedDataSource(browser.globals.dataSourceNameGenerated)
      .selectDeleteForeverOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .setValueInDataSourceModal(browser.globals.dataSourceNameGenerated.replace(1, 2))
      .clickConfirmButtonInDataSourceModal()
      .acceptIncorrectDatSourceNameForDeletionAlert();
  },

  'Delete data source forever and check that it is not present in Trash list': function(browser) {
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.setValueInDataSourceModal(browser.globals.dataSourceNameGenerated)
      .clickConfirmButtonInDataSourceModal()
      .acceptDeletionCompleteAlert()
      .assertDataSourceIsNotPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Delete the created data source': function(browser){
    browser
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};