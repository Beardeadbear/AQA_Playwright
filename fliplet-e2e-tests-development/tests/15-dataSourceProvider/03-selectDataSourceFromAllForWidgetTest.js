const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');
const entries = [
  {
    'Name': casual.word,
    'Value': Math.floor(Math.random() * 10) + 21,
  },
  {
    'Name': casual.word,
    'Value': Math.floor(Math.random() * 10) + 11,
  },
  {
    'Name': casual.word,
    'Value': Math.floor(Math.random() * 10) + 1
  }
];
const columns = Object.keys(entries[0]);

module.exports = {

  '@reference': 'https://weboo.atlassian.net/browse/OD-1',
  '@reference': 'https://weboo.atlassian.net/browse/OD-278',
  '@reference': 'https://weboo.atlassian.net/browse/OD-215',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 03-select-all-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 03-select-all-ds-provider`;
    browser.globals.orgDataSourceNameGenerated = `${casual.title} 03-select-all-ds-provider`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.orgDataSourceNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app, the app and organization data sources': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, [])
      .createDataSourceViaApiUsingOrganizationId(browser.globals.orgDataSourceNameGenerated, entries, browser.globals.organizationId);
  },

  'Add Bar Chart Widget to it and switch to its settings': function(browser){
    browser
      .newDragAndDrop(widgets.CHART_BAR)
      .waitForWidgetInterfaceNewDnd(widgets.CHART_BAR)
      .switchToWidgetInstanceFrame()
      .switchToFLWidgetProviderFrame('#app');
  },

  'Check that data sources not connected to the app are not visible in data source provider until Show all data sources is enabled': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .assertThatDataSourceIsShownInDataSourceProvider(browser.globals.dataSourceNameGenerated)
      .assertThatDataSourceIsNotPresentInDataSourceProvider(browser.globals.orgDataSourceNameGenerated);
  },

  'Select a data source in data source provider from App data sources': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Enable Show all data sources in data source provider to select the created data source from all data sources': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickShowAllDataSources()
      .assertThatDataSourceIsShownInDataSourceProvider(browser.globals.dataSourceNameGenerated)
      .assertThatDataSourceIsShownInDataSourceProvider(browser.globals.orgDataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Select data source from All data sources and check that after unchecking Show all data sources the selected data source is not shown': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.orgDataSourceNameGenerated)
      .uncheckShowAllDataSources()
      .checkThatNoDataSourceSelectedInDropdownList()
      .assertThatDataSourceIsShownInDataSourceProvider(browser.globals.dataSourceNameGenerated)
      .assertThatDataSourceIsNotPresentInDataSourceProvider(browser.globals.orgDataSourceNameGenerated);
  },

  'Select a data source in data source provider from All data sources': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickShowAllDataSources()
      .assertThatDataSourceIsShownInDataSourceProvider(browser.globals.orgDataSourceNameGenerated)
      .selectDataSourceInDropdownList(browser.globals.orgDataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.orgDataSourceNameGenerated);
  },

  'Configure Bar Chart': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .selectTheColumnFromDataSourceForValue(columns[0], 1)
      .selectTheColumnFromDataSourceForValue(columns[1], 2);

    browser.frameParent();

    componentsScreen
      .tickCheckBoxByLabel('show_total_entries')
      .clickSaveAndCloseButton();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_BAR);
  },

  'Open the preview screen and check Bar Chart': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_BAR)
      .switchToPreviewFrame();

    previewAppScreen
      .checkChartTotalAmount(entries.length)
      .assertNumberOfItemsMatchesToEntered('.highcharts-series rect', entries.length)
      .assertElementsHaveTextOnPreviewScreen('//*[contains(@class, "highcharts-axis-labels")]/*',
        [entries[2]['Name'], entries[1]['Name'], entries[0]['Name']])
      .assertElementsHaveTextOnPreviewScreen('//*[contains(@class, "highcharts-label")]/*/*[2]',
        [entries[2]['Value'], entries[1]['Value'], entries[0]['Value']]);
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.orgDataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.orgDataSourceNameGenerated]);
  }
};