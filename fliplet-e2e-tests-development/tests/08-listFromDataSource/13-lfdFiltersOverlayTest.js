const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const lfdInfo = [
  {
    "title": casual.title,
    "description": casual.integer(- 100, 100),
    "date": casual.date('DD MMM YYYY')
  },
  {
    "title": casual.title,
    "description": casual.integer(- 100, 100),
    "date": casual.date('DD MMM YYYY')
  },
  {
    "title": casual.title,
    "description": casual.integer(- 100, 100),
    "date": casual.date('DD MMM YYYY')
  }
];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-90',
  '@reference': 'https://weboo.atlassian.net/browse/OD-106',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 13-lfd-filter-overlay`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 13-lfd-filter-overlay`;

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

  'Create a new app and app data source with security rules': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, lfdInfo);
  },

  'Add News Feed LFD component to the app': function(browser){
    const list = browser.page.listScreens();

    browser
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEED);
  },

  'Connect the created data source to the LFD': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Open Data view settings, map data view fields and return to Settings': function(browser){
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();

    list.clickDataViewSettings();

    dataView
      .selectDataViewValue(1, Object.keys(lfdInfo[0])[0])
      .selectDataViewValue(2, Object.keys(lfdInfo[0])[1])
      .selectDataViewValue(3, Object.keys(lfdInfo[0])[2])
      .clickBackToSettingsButton();
  },

  'Enable displaying filters as full screen overlay': function(browser){
    const list = browser.page.listScreens();

    list.clickDisplayFiltersAsFullScreenOverlay();
  },

  'Allow user to filter list items by selecting values for it': function(browser){
    const list = browser.page.listScreens();
    const componentsScreen = browser.page.componentsScreen();

    list
      .addValueInInputFieldForDataSourceColumnNameInFilteringBlock(Object.keys(lfdInfo[0])[0])
      .addValueInInputFieldForDataSourceColumnNameInFilteringBlock(Object.keys(lfdInfo[0])[1])
      .addValueInInputFieldForDataSourceColumnNameInFilteringBlock(Object.keys(lfdInfo[0])[2]);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview and check the LFD entries': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();

    lfdPreviewScreen
      .checkThatLfdItemHasDataByTitle(lfdInfo[0].title, lfdInfo[0].description)
      .checkThatLfdItemHasDataByTitle(lfdInfo[1].title, lfdInfo[1].description)
      .checkThatLfdItemHasDataByTitle(lfdInfo[2].title, lfdInfo[2].description);
  },

  'Open LFD filters overlay and expand the first filter option': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .openFilterOverlayForLFD()
      .expandFilterOptionByLabel(Object.keys(lfdInfo[0])[0]);
  },

  'Select values for the first filter and check the active filters count': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .selectFilterByTitle(Object.keys(lfdInfo[0])[0], lfdInfo[0].title)
      .selectFilterByTitle(Object.keys(lfdInfo[0])[0], lfdInfo[1].title)
      .selectFilterByTitle(Object.keys(lfdInfo[0])[0], lfdInfo[2].title);
  },

  'Unselect values for the first filter and check the active filters count': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .unselectFilterByTitle(Object.keys(lfdInfo[0])[0], lfdInfo[2].title)
      .unselectFilterByTitle(Object.keys(lfdInfo[0])[0], lfdInfo[1].title);
  },

  'Clear filters and check that all list items are shown': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickClearButtonInFiltersOverlay()
      .checkThatActiveFiltersGroupIsAbsent()
      .checkThatLfdItemHasDataByTitle(lfdInfo[0].title, lfdInfo[0].description)
      .checkThatLfdItemHasDataByTitle(lfdInfo[1].title, lfdInfo[1].description)
      .checkThatLfdItemHasDataByTitle(lfdInfo[2].title, lfdInfo[2].description);
  },

  'Open LFD filters overlay, expand the first filter option ones more and select values for the first filter': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .openFilterOverlayForLFD()
      .selectFilterByTitle(Object.keys(lfdInfo[0])[0], lfdInfo[0].title);
  },

  'Select values for the second filter': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .expandFilterOptionByLabel(Object.keys(lfdInfo[0])[1])
      .selectFilterByTitle(Object.keys(lfdInfo[0])[1], lfdInfo[1].description);
  },

  'Apply filters and check the active filters': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickApplyButtonInFiltersOverlay()
      .assertActiveFilterIsPresentInLfd(lfdInfo[0].title)
      .assertActiveFilterIsPresentInLfd(lfdInfo[1].description);
  },

  'Check that the shown list items correspond the selected filters': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .assertListItemsContainText(Object.keys(lfdInfo[0])[1], lfdInfo[1].description)
      .assertListItemsContainText(Object.keys(lfdInfo[0])[0], lfdInfo[0].title);
  },

  'Remove the filters and check that all list items are show': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickActiveFilterToDismissIt(lfdInfo[0].title)
      .assertListItemsContainText(Object.keys(lfdInfo[0])[1], lfdInfo[1].description)
      .clickActiveFilterToDismissIt(lfdInfo[1].description);
  },

  'Check that all list items are shown after dismissing the filters': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .checkThatLfdItemHasDataByTitle(lfdInfo[0].title, lfdInfo[0].description)
      .checkThatLfdItemHasDataByTitle(lfdInfo[1].title, lfdInfo[1].description)
      .checkThatLfdItemHasDataByTitle(lfdInfo[2].title, lfdInfo[2].description);
  },

  'Delete the created applications and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};