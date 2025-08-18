const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');
const appDataSourceId = [];
const orgDataSourceId = [];

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 04-search-ds-overlay`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 04-search-ds-overlay`;
    browser.globals.organizationDataSourceNameGenerated = `${casual.title} 04-search-ord-ds`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.organizationDataSourceNameGenerated], done)
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
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, [])
      .createDataSourceViaApiUsingOrganizationId(browser.globals.organizationDataSourceNameGenerated, [],
        browser.globals.organizationId);
  },

  'Click App data to open Data source manager overlay in app edit mode': function(browser){
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const allDataSources = browser.page.allDataSourcesPage();

    rightSideNavMenu.openAppDataScreen();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt(browser.globals.appNameGenerated);

    allDataSources
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated)
      .getDataSourceIdThatPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated, appDataSourceId);
  },

  'Search for the data source in App\'s data sources by its name': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .searchForDataSourceByName(browser.globals.dataSourceNameGenerated)
      .assertAllFoundDataSourcesMatchSearchQuery(browser.globals.dataSourceNameGenerated);
  },

  'Search for the data source in App\'s data sources by its id': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .searchForDataSourceByName(appDataSourceId[0])
      .assertAllFoundDataSourcesMatchSearchQuery(appDataSourceId[0]);
  },

  'Click Show All data sources': function(browser){
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const allDataSources = browser.page.allDataSourcesPage();

    dataSourceManagerOverlay.clickShowAllDataSourcesButton();

    allDataSources
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.organizationDataSourceNameGenerated)
      .getDataSourceIdThatPresentInDataSourceManagerListByName(browser.globals.organizationDataSourceNameGenerated, orgDataSourceId);
  },

  'Search for the data source in All data sources by its name': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .searchForDataSourceByName(browser.globals.organizationDataSourceNameGenerated)
      .assertAllFoundDataSourcesMatchSearchQuery(browser.globals.organizationDataSourceNameGenerated);
  },

  'Search for the data source in All data sources by its id': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .searchForDataSourceByName(orgDataSourceId[0])
      .assertAllFoundDataSourcesMatchSearchQuery(orgDataSourceId[0]);
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.organizationDataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};