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
const newEntries = [
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
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 05-change-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 05-change-ds-provider`;
    browser.globals.orgDataSourceNameGenerated = `${casual.title} 05-change-ds-provider`;

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

  'Create a new app, app and organization data sources': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, newEntries)
      .createDataSourceViaApiUsingOrganizationId(browser.globals.orgDataSourceNameGenerated, entries, browser.globals.organizationId);
  },

  'Add Scatter Chart Widget to it and switch to its settings': function(browser){
    browser
      .newDragAndDrop(widgets.CHART_SCATTER)
      .waitForWidgetInterfaceNewDnd(widgets.CHART_SCATTER)
      .switchToWidgetInstanceFrame()
      .switchToFLWidgetProviderFrame('#app');
  },

  'Select a data source in data source provider from App data sources': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Configure Scatter Chart': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .selectTheColumnFromDataSourceForValue(columns[1], 1)
      .selectTheColumnFromDataSourceForValue(columns[0], 2)

    browser.frameParent();

    componentsScreen
      .selectTheColumnFromDataSourceForValue('number', 1)
      .tickCheckBoxByLabel('show_total_entries')
      .clickSaveAndCloseButton();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_SCATTER);
  },

  'Open the preview screen and check Chart': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_SCATTER)
      .switchToPreviewFrame();

    previewAppScreen
      .checkChartTotalAmount(entries.length)
      .assertNumberOfItemsMatchesToEntered('.highcharts-markers path[fill]:not([fill="none"]):not([visibility])',
        entries.length)
      .checkChartPopOverInformation('.highcharts-markers path[fill]:not([fill="none"]):not([visibility])');
  },

  'Navigate to edit mode and open Chart settings': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editAppScreen.openDetailsOfComponentByClickingOnIt(widgets.CHART_SCATTER);

    browser.switchToFLWidgetProviderFrame('#app');
  },

  'Check that the app data source is selected in data source provider after Settings opening': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated)
  },

  'Click Change data source link': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickChangeDataSourceLink()
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

  'Configure Scatter Chart after changing data source': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .selectTheColumnFromDataSourceForValue(columns[1], 1)
      .selectTheColumnFromDataSourceForValue(columns[0], 2)
      .clickSaveAndCloseButton();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_SCATTER);
  },

  'Open the preview screen again and check Chart with new entries': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_SCATTER)
      .switchToPreviewFrame();

    previewAppScreen
      .checkChartTotalAmount(newEntries.length)
      .assertNumberOfItemsMatchesToEntered('.highcharts-markers path[fill]:not([fill="none"]):not([visibility])',
        newEntries.length)
      .checkChartPopOverInformation('.highcharts-markers path[fill]:not([fill="none"]):not([visibility])');
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