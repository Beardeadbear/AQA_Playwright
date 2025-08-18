const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const publishingChannels = require('../../utils/constants/publishingChannels');
const usersInfo = [
  {
    "name": casual.full_name,
    "role": casual.integer(-10000, 10000),
    "location": casual.date('YYYY-MM-DD')
  },
  {
    "name": casual.full_name,
    "role": casual.integer(-10000, 10000),
    "location": casual.date('YYYY-MM-DD')
  },
  {
    "name": casual.full_name,
    "role": casual.integer(-10000, 10000),
    "location": casual.date('YYYY-MM-DD')
  }
];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-20',
  '@reference': 'https://weboo.atlassian.net/browse/OD-311',
  '@reference': 'https://weboo.atlassian.net/browse/OD-322',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 10-lfd-sorting`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 10-lfd-sorting`;

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

  'Add Directory LFD component to the app': function(browser){
    const list = browser.page.listScreens();

    browser
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.DIRECTORY);
  },

  'Connect the created data source to Directory': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Allow user to search list items': function(browser){
    const list = browser.page.listScreens();

    list.addValueInInputFieldForDataSourceColumnNameInSearchingBlock(Object.keys(usersInfo[0])[0]);
  },

  'Allow user to filter list items': function(browser){
    const list = browser.page.listScreens();

    list.addValueInInputFieldForDataSourceColumnNameInFilteringBlock(Object.keys(usersInfo[0])[2]);
    },

  'Open Data view settings, map data view fields and return to Settings': function(browser){
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();

    list.clickDataViewSettings();

    dataView
      .selectDataViewValue(1, Object.keys(usersInfo[0])[0])
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

  'Publish the application': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publishScreen = browser.page.publishScreen();

    appTopFixedNavigationBar.navigateToPublishMode();

    publishScreen
      .clickSelectButtonNearPublishingOptionByChannelName(publishingChannels.PUBLISH_TO_THE_WEB_VIA_A_URL)
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Check the LFD entries on web': function(browser){
    const webApp = browser.page.webApplicationPages();
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    webApp
      .checkPageTitle(browser.globals.appNameGenerated)
      .assertWidgetIsPresentOnScreen(widgets.LIST_FROM_DATA_SOURCE);

    lfdPreviewScreen
      .checkThatLfdItemHasDataByTitle(usersInfo[0].name, usersInfo[0].location)
      .checkThatLfdItemHasDataByTitle(usersInfo[1].name, usersInfo[1].location)
      .checkThatLfdItemHasDataByTitle(usersInfo[2].name, usersInfo[2].location);
  },

  'Check that sorting options are available and correspond the configured ones on web': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickSortListIconToOpenIt()
      .checkThatSortingOptionIsAvailableForUser(Object.keys(usersInfo[0])[0])
      .checkThatSortingOptionIsAvailableForUser(Object.keys(usersInfo[0])[1])
      .checkThatSortingOptionIsAvailableForUser(Object.keys(usersInfo[0])[2]);
  },

  'Check ascending order for sorting text values on web': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByAscending(Object.keys(usersInfo[0])[0])
      .checkThatLfdEntriesAreSortedByAscending(usersInfo.map(entry => entry.name), Object.keys(usersInfo[0])[0]);
  },

  'Check descending order for sorting text values on web': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByDescending(Object.keys(usersInfo[0])[0])
      .checkThatLfdEntriesAreSortedByDescending(usersInfo.map(entry => entry.name), Object.keys(usersInfo[0])[0])
      .clickSortListIconToCloseIt();
  },

  'Check ascending order for sorting numbers on web': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickSortListIconToOpenIt()
      .sortListOrderingByAscending(Object.keys(usersInfo[0])[1])
      .checkThatLfdEntriesAreSortedByNumberAscending(usersInfo.map(entry => entry.role), Object.keys(usersInfo[0])[1]);
  },

  'Check descending order for sorting numbers on web': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByDescending(Object.keys(usersInfo[0])[1])
      .checkThatLfdEntriesAreSortedByNumberDescending(usersInfo.map(entry => entry.role), Object.keys(usersInfo[0])[1])
      .clickSortListIconToCloseIt();
  },

  'Check ascending order for sorting dates on web': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickSortListIconToOpenIt()
      .sortListOrderingByAscending(Object.keys(usersInfo[0])[2])
      .checkThatLfdEntriesAreSortedByDateAscending(usersInfo.map(entry => entry.location), Object.keys(usersInfo[0])[2]);
  },

  'Check descending order for sorting dates on web': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .sortListOrderingByDescending(Object.keys(usersInfo[0])[2])
      .checkThatLfdEntriesAreSortedByDateDescending(usersInfo.map(entry => entry.location), Object.keys(usersInfo[0])[2]);
  },

  'Filter the sorted list': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .openLfdFiltersBlock()
      .clickFilterOptionButton(usersInfo[2].location)
      .assertListItemsContainText(Object.keys(usersInfo[0])[2], usersInfo[2].location)
      .closeLfdFiltersBlock();
  },

  'Search for existing value in the sorted list': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .searchForValueInLfd(usersInfo[1].name)
      .assertListItemsContainText(Object.keys(usersInfo[0])[0], usersInfo[1].name)
      .clearSearchInLfd()
      .assertListItemsAreDisplayed();
  },

  'Search for non-existing value in the sorted list': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .searchForValueInLfd(usersInfo[0].role)
      .assertThereIsNoListItemDisplayed()
      .clearSearchInLfd()
      .assertListItemsAreDisplayed();
  },

  'Delete the created applications and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};