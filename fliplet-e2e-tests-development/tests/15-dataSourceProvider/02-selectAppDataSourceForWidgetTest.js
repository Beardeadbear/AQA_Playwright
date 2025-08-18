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

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 02-select-app-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 02-select-app-ds-provider`;

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

  'Create an app, an app data source for data visualization widget and fill it with data': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, entries)
      .newDragAndDrop(widgets.CHART_DONUT)
      .waitForWidgetInterfaceNewDnd(widgets.CHART_DONUT)
      .switchToWidgetInstanceFrame()
      .switchToFLWidgetProviderFrame('#app');
  },

  'Select the created data source in data source provider from App data sources': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Configure Donut Chart': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .selectTheColumnFromDataSourceForValue(columns[0], 1)
      .selectTheColumnFromDataSourceForValue(columns[1], 2);

    browser.frameParent();

    componentsScreen
      .tickCheckBoxByLabel('show_total_entries')
      .clickSaveAndCloseButton();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_DONUT);
  },

  'Open the preview screen and check Column Donut': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_DONUT)
      .switchToPreviewFrame();

    previewAppScreen
      .checkChartTotalAmount(entries.map(entry => entry['Value']).reduce((a, b) => a + b, 0))
      .assertNumberOfItemsMatchesToEntered('path[fill]:not([fill="none"])', entries.length)
      .assertElementsHaveTextOnPreviewScreen('//*[contains(@class, "highcharts-legend-item")]/*/*', entries.map(entry => entry['Name']))
      .assertElementsHaveTextOnPreviewScreen('//*[contains(@class, "highcharts-label")]/*/*[1]', entries.map(entry => entry['Value']));
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};