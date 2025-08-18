const casual = require('casual');

module.exports = {
  '@disabled': 'true', //until Trash&Restore is back on staging
  before: function(browser, done){
    browser.globals.dataSourceNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 11-data-source-restore`;

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

  'Open Trash and check that the deleted data source is present there': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.clickTrashButton()
      .assertDataSourceIsPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Restore the data source and check that it is not in Trash any more': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.clickActionsButtonForTrashedDataSource(browser.globals.dataSourceNameGenerated)
      .selectRestoreOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated)
      .acceptDatSourceRestoreCompleteAlert()
      .assertDataSourceIsNotPresentInTrashedListByName(browser.globals.dataSourceNameGenerated);
  },

  'Open all data sources and check that the restored data source is present there': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.clickAllButtonInDataSourceManager(browser.globals.dataSourceNameGenerated)
      .waitForDataSourcesPageToBeLoaded()
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Delete the created data source': function(browser){
    browser
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};