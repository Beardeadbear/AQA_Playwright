const globals = require('../../globals_path');
const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const widgets = require('../../utils/constants/widgets');
const entries = [{
  "Cities": 'Kyiv',
  "Pollution": 30,
},
  {
    "Cities": 'Lviv',
    "Pollution": 20,
  },
  {
    "Cities": 'Kharkiv',
    "Pollution": 10,
  }];

const column = Object.keys(entries[0]);

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 03-widget-chart-screen`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 03-widget-chart-screen`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create data sources for data visualization widgets and fill it with data': function (browser) {
    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, entries)
      .newDragAndDrop(widgets.CHART_COLUMN)
      .waitForWidgetInterfaceNewDnd(widgets.CHART_COLUMN)
      .switchToWidgetInstanceFrame();
  },

  'Configure Column Chart': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    browser.switchToFLWidgetProviderFrame('#app');

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectTheColumnFromDataSourceForValue(column[0], 1);
    componentsScreen.selectTheColumnFromDataSourceForValue(column[1], 2);

    browser.frameParent();

    componentsScreen.tickCheckBoxByLabel('show_total_entries');
    componentsScreen.clickSaveAndCloseButton();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_COLUMN);
  },

  'Open the preview screen and check Column Chart': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_COLUMN)
      .switchToPreviewFrame();

    previewAppScreen.checkChartTotalAmount(entries.length);
    previewAppScreen.assertNumberOfItemsMatchesToEntered('.highcharts-series rect', entries.length);
    previewAppScreen.assertElementsHaveTextOnPreviewScreen('//*[contains(@class, "highcharts-axis-labels")]/*',
      [entries[2]['Cities'], entries[1]['Cities'], entries[0]['Cities']]);
    previewAppScreen.assertElementsHaveTextOnPreviewScreen('//*[contains(@class, "highcharts-label")]/*/*[2]',
      [entries[2]['Pollution'], entries[1]['Pollution'], entries[0]['Pollution']]);
  },

  'Add Pie Chart to the app and check that it is present on the preview screen': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    browser.dragAndDropWithCondition(widgets.CHART_PIE)
      .switchToWidgetInstanceFrame();
  },

  'Configure Pie Chart': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    browser.switchToFLWidgetProviderFrame('#app');

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectTheColumnFromDataSourceForValue(column[0], 1);
    componentsScreen.selectTheColumnFromDataSourceForValue(column[1], 2);

    browser.frameParent();

    componentsScreen.tickCheckBoxByLabel('show_total_entries');
    componentsScreen.clickSaveAndCloseButton();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_PIE);
  },

  'Open the preview screen and check Pie Chart': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_PIE)
      .switchToPreviewFrame();

    previewAppScreen.checkChartTotalAmount(entries.map(entry => entry['Pollution']).reduce((a, b) => a + b, 0));
    previewAppScreen.assertNumberOfItemsMatchesToEntered('path[fill]:not([fill="none"])', entries.length);
    previewAppScreen.assertElementsHaveTextOnPreviewScreen('//*[contains(@class, "highcharts-legend-item")]/*/*',
      entries.map(entry => entry['Cities']));
    previewAppScreen.assertElementsHaveTextOnPreviewScreen('//*[contains(@class, "highcharts-label")]/*/*[1]',
      entries.map(entry => entry['Pollution']));
    previewAppScreen.checkChartPopOverInformation('path[fill]:not([fill="none"])');
  },

  'Add Line Chart to the app and check that it is present on the preview screen': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    browser.dragAndDropWithCondition(widgets.CHART_LINE)
      .switchToWidgetInstanceFrame();
  },

  'Configure Line Chart': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    browser.switchToFLWidgetProviderFrame('#app');

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectTheColumnFromDataSourceForValue(column[1], 1);
    componentsScreen.selectTheColumnFromDataSourceForValue(column[0], 2);

    browser.frameParent();

    componentsScreen.selectTheColumnFromDataSourceForValue('number', 1);
    componentsScreen.tickCheckBoxByLabel('show_total_entries');
    componentsScreen.clickSaveAndCloseButton();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_LINE);
  },

  'Open the preview screen and check Line Chart': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_LINE)
      .switchToPreviewFrame();

    previewAppScreen.checkChartTotalAmount(entries.length);
    previewAppScreen.assertNumberOfItemsMatchesToEntered('.highcharts-markers path[fill]:not([fill="none"]):not([visibility])',
      entries.length);
    previewAppScreen.checkChartPopOverInformation('.highcharts-markers path[fill]:not([fill="none"]):not([visibility])');
  },

  'Delete the created application and data source': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};