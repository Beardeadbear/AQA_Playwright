const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');
const columns = [casual.word, casual.word];
const newColumns = [casual.word, casual.word];

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 02-edit-ds-overlay`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 02-edit-ds-overlay`;

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
  // disabled until Trash&Restore is back on staging
  // 'Open Data Source item by clicking Edit button': function(browser){
  //   const allDataSources = browser.page.allDataSourcesPage();
  //   const dataSource = browser.page.singleDataSourcePage();
  //
  //   allDataSources
  //     .clickActionsButtonForDataSource(browser.globals.dataSourceNameGenerated)
  //     .selectEditOptionInDataSourceActionsDropdown(browser.globals.dataSourceNameGenerated);
  //
  //   dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated);
  // },

  'Change data source columns names and return to data source list': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources.clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .changeDataSourceColumnNames(columns);

    dataSourceManagerOverlay.clickSaveButtonInDataSourceManagerOverlay();

    dataSource.clickBackToDataSourcesButton();
  },

  'Open All data sources in Data source manager overlay': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    allDataSources.assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);

    dataSourceManagerOverlay.clickShowAllDataSourcesButton();

    allDataSources.assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Open the data source to edit by clicking its name and check the columns names': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources.clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertDataSourceColumnNamesAreCorrect(columns);
  },

  'Change data source columns names again and save': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSource.changeDataSourceColumnNames(newColumns);

    dataSourceManagerOverlay.clickSaveButtonInDataSourceManagerOverlay();
  },

  'Check that the data source columns names have been changed': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertDataSourceColumnNamesAreCorrect(newColumns);
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};