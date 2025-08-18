const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 01-create-ds-overlay`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 01-create-ds-overlay`;
    browser.globals.existingDataSourceNameGenerated = `${casual.title} 01-create-app-ds-overlay`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.existingDataSourceNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a data source and a new application': function(browser){
    browser
      .createDataSourceViaApiUsingOrganizationId(browser.globals.existingDataSourceNameGenerated, [], browser.globals.organizationId)
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);
  },

  'Click App data to open Data source manager overlay in app edit mode ': function(browser){
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const allDataSources = browser.page.allDataSourcesPage();

    rightSideNavMenu.openAppDataScreen();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt(browser.globals.appNameGenerated);

    allDataSources.assertDataSourceIsNotPresentInDataSourceManagerListByName(browser.globals.existingDataSourceNameGenerated);
  },

  'Create a new app data source': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources
      .clickCreateDataSourceButton()
      .setValueInDataSourceModal(browser.globals.dataSourceNameGenerated)
      .clickConfirmButtonInDataSourceModal();

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated);
  },

  'Return to App data sources and check that only the app data source is in the list': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const allDataSources = browser.page.allDataSourcesPage();

    dataSource.clickBackToDataSourcesButton();

    allDataSources
      .assertDataSourceIsNotPresentInDataSourceManagerListByName(browser.globals.existingDataSourceNameGenerated)
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Open all data sources and check that both the app and non-app data sources are in the list': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSourceManagerOverlay.clickShowAllDataSourcesButton();

    allDataSources
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.existingDataSourceNameGenerated)
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Open App data sources again and check that only the app data source is in the list': function(browser){
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const allDataSources = browser.page.allDataSourcesPage();

    dataSourceManagerOverlay.clickShowAppsDataSourcesButton();

    allDataSources
      .assertDataSourceIsNotPresentInDataSourceManagerListByName(browser.globals.existingDataSourceNameGenerated)
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.existingDataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.existingDataSourceNameGenerated]);
  }
};