const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const usersInfo = [
  {
    "title": casual.word,
    "description": casual.double(-1000, 1000),
    "subtitle": casual.date('YYYY-MM-DD')
  },
  {
    "title": casual.word,
    "description": casual.double(-1000, 1000),
    "subtitle": casual.date('YYYY-MM-DD')
  },
  {
    "title": casual.word,
    "description": casual.double(-1000, 1000),
    "subtitle": casual.date('YYYY-MM-DD')
  }
];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-20',
  '@reference': 'https://weboo.atlassian.net/browse/OD-315',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 11-lfd-sorting`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 11-lfd-sorting`;

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
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, usersInfo);
  },

  'Add Simple List LFD component to the app': function(browser){
    const list = browser.page.listScreens();

    browser
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.SIMPLE_LIST);
  },

  'Connect the created data source to Simple List': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Disable searching, filtering and bookmarking list items': function(browser){
    const list = browser.page.listScreens();

    list
      .clickAllowSearchCheckbox()
      .clickAllowFiltersCheckbox()
      .expandSocialFeaturesBlock()
      .clickAllowUserToBookmarkListItemsCheckbox();
  },

  'Open Data view settings, map data view fields and return to Settings': function(browser){
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();

    list.clickDataViewSettings();

    dataView
      .selectDataViewValue(2, Object.keys(usersInfo[0])[0])
      .selectDataViewValue(3, Object.keys(usersInfo[0])[1])
      .selectDataViewValue(4, Object.keys(usersInfo[0])[2])
      .clickBackToSettingsButton();
  },

  'Enable allowing users to sort the list and select data source columns': function(browser){
    const list = browser.page.listScreens();
    const componentsScreen = browser.page.componentsScreen();

    list
      .enableAllowUsersToSortTheList()
      .addValueInInputFieldForDataSourceColumnNameInSortingListByUser(Object.keys(usersInfo[0])[0])
      .addValueInInputFieldForDataSourceColumnNameInSortingListByUser(Object.keys(usersInfo[0])[1])
      .addValueInInputFieldForDataSourceColumnNameInSortingListByUser(Object.keys(usersInfo[0])[2]);

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
      .checkThatLfdItemHasDataByTitle(usersInfo[0].title, usersInfo[0].subtitle)
      .checkThatLfdItemHasDataByTitle(usersInfo[1].title, usersInfo[1].subtitle)
      .checkThatLfdItemHasDataByTitle(usersInfo[2].title, usersInfo[2].subtitle);
  },

  'Check that sorting options are available and correspond the configured ones': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickSortListIconToOpenIt()
      .checkThatSortingOptionIsAvailableForUser(Object.keys(usersInfo[0])[0])
      .checkThatSortingOptionIsAvailableForUser(Object.keys(usersInfo[0])[1])
      .checkThatSortingOptionIsAvailableForUser(Object.keys(usersInfo[0])[2]);
  },

  'Check ascending order for sorting text values': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByAscending(Object.keys(usersInfo[0])[0])
      .checkThatLfdEntriesAreSortedByAscending(usersInfo.map(entry => entry.title), Object.keys(usersInfo[0])[0]);
  },

  'Check descending order for sorting text values': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByDescending(Object.keys(usersInfo[0])[0])
      .checkThatLfdEntriesAreSortedByDescending(usersInfo.map(entry => entry.title), Object.keys(usersInfo[0])[0]);
  },

  'Check ascending order for sorting numbers': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByAscending(Object.keys(usersInfo[0])[1])
      .checkThatLfdEntriesAreSortedByNumberAscending(usersInfo.map(entry => entry.description), Object.keys(usersInfo[0])[1]);
  },

  'Check descending order for sorting numbers': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByDescending(Object.keys(usersInfo[0])[1])
      .checkThatLfdEntriesAreSortedByNumberDescending(usersInfo.map(entry => entry.description), Object.keys(usersInfo[0])[1]);
  },

  'Check ascending order for sorting dates': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByAscending(Object.keys(usersInfo[0])[2])
      .checkThatLfdEntriesAreSortedByDateAscending(usersInfo.map(entry => entry.subtitle), Object.keys(usersInfo[0])[2]);
  },

  'Check descending order for sorting dates': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByDescending(Object.keys(usersInfo[0])[2])
      .checkThatLfdEntriesAreSortedByDateDescending(usersInfo.map(entry => entry.subtitle), Object.keys(usersInfo[0])[2]);
  },

  'Check that sorting options can be closed': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickSortListIconToCloseIt();
  },

  'Delete the created applications and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};