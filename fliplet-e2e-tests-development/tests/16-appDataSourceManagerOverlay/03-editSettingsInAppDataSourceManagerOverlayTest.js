const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 03-settings-ds-overlay`;
    browser.globals.dataSourceNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 03-settings-ds-overlay`;
    browser.globals.dataSourceNewNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 03-new-settings-ds-overlay`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.dataSourceNewNameGenerated], done)
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

  'Click App data to open Data source manager overlay in app edit mode': function(browser){
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const allDataSources = browser.page.allDataSourcesPage();

    rightSideNavMenu.openAppDataScreen();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt(browser.globals.appNameGenerated);

    allDataSources.assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Open All data sources in Data source manager overlay': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSourceManagerOverlay.clickShowAllDataSourcesButton();

    allDataSources.assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Open the data source to edit by clicking its name': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources.clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated);
  },

  'Change data source name and save': function(browser){
    const dataSource = browser.page.singleDataSourcePage();

    dataSource
      .switchToSettingsTab()
      .changeDataSourceName(browser.globals.dataSourceNewNameGenerated)
      .clickSaveChangesButtonOnSettingsScreen()
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNewNameGenerated);
  },

  'Return to the data source list and check the new data source name is in Data source manager overlay': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const allDataSources = browser.page.allDataSourcesPage();

    dataSource.clickBackToDataSourcesButton();

    allDataSources
      .assertDataSourceIsNotPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated)
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNewNameGenerated);
  },

  'Click Show App\'s data sources and check the new data source name in the list': function(browser){
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const allDataSources = browser.page.allDataSourcesPage();

    dataSourceManagerOverlay.clickShowAppsDataSourcesButton();

    allDataSources
      .assertDataSourceIsNotPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated)
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNewNameGenerated);
  },

  'Check that the data source name have been changed in Data source manager': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();

    allDataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded()
      .assertDataSourceIsNotPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated)
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNewNameGenerated);
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNewNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.dataSourceNewNameGenerated]);
  }
};