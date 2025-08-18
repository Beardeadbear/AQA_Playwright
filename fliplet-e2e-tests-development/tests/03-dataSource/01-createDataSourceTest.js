const values = require('../../utils/constants/values');
const casual = require('casual');

module.exports = {
  before: function (browser, done) {
    browser.globals.dataSourceNameGenerated = `${casual.title} 01-create-data-source`;

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

  'Assert that a new data source cannot be created without entering a name': function(browser){
    const menu = browser.page.topMenu();
    const allDataSources = browser.page.allDataSourcesPage();

    menu.clickManageAppData();

    allDataSources.waitForDataSourcesPageToBeLoaded()
      .clickCreateDataSourceButton()
      .clickConfirmButtonInDataSourceModal()
      .acceptYouMustEnterDataSourceNameAlert();
  },

  'Assert that a new data source cannot be created with an empty name': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.setValueInDataSourceModal(values.SPACE)
      .clickConfirmButtonInDataSourceModal()
      .acceptYouMustEnterDataSourceNameAlert();
  },

  'Assert that a new data source with a non-empty name can be created': function(browser) {
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources.setValueInDataSourceModal(browser.globals.dataSourceNameGenerated)
      .clickConfirmButtonInDataSourceModal();

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated);
  },

  'Delete the created data source': function(browser){
    browser
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};