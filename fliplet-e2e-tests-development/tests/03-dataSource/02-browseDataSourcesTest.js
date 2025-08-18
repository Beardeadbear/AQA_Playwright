const casual = require('casual');
const dataSourceId = [];

module.exports = {
  before: function(browser, done){
    browser.globals.dataSourceNameGenerated = `${casual.title} 02-browse-data-source`;

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

  'Create a new data source and open it by clicking its name': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    browser.createDataSource(browser.globals.dataSourceNameGenerated);

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .getDataSourceIdThatPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated, dataSourceId)
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated)

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .clickBackToDataSourcesButton();
  },
  // disabled until Trash&Restore is back on staging
  // 'Open Data Source item by clicking Edit button': function(browser){
  //   const allDataSources = browser.page.allDataSourcesPage();
  //   const dataSource = browser.page.singleDataSourcePage();
  //
  //   allDataSources.waitForDataSourcesPageToBeLoaded()
  //     .clickActionsButtonForDataSource(browser.globals.dataSourceNameGenerated)
  //     .selectEditOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated);
  //
  //   dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
  //     .clickBackToDataSourcesButton();
  // },

  'Search for Data Source item by its name': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.waitForDataSourcesPageToBeLoaded()
      .searchForDataSourceByName(browser.globals.dataSourceNameGenerated)
      .assertAllFoundDataSourcesMatchSearchQuery(browser.globals.dataSourceNameGenerated);
  },

  'Search for Data Source item by its id': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.searchForDataSourceByName(dataSourceId[0])
      .assertAllFoundDataSourcesMatchSearchQuery(dataSourceId[0]);
  },

  'Delete the created data source': function(browser){
    browser
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};