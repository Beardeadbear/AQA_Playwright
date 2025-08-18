const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const lfdCustomFilterOptions = require('../../utils/constants/lfdCustomFilterOptions');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const globals = require('../../globals_path');
const usersInfo = [
  {
    "title": casual.word,
    "description": casual.double(-1000, 1000),
    "subtitle": casual.title
  },
  {
    "title": casual.word,
    "description": casual.double(-1000, 1000),
    "subtitle": casual.title
  },
  {
    "title": casual.word,
    "description": casual.double(-1000, 1000),
    "subtitle": casual.title
  }
];
module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-202',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 17-lfd-simple-filter`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 17-lfd-simple-filter`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done,
        browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
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

  'Add Directory LFD component to the app and select Directory layout': function(browser){
    const list = browser.page.listScreens();

    browser
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.SIMPLE_LIST);
  },

  'Connect the created data source to Directory': function(browser){
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
      .selectDataViewValue(2, Object.keys(usersInfo[0])[0])
      .selectDataViewValue(3, Object.keys(usersInfo[0])[1])
      .selectDataViewValue(4, Object.keys(usersInfo[0])[2])
      .clickBackToSettingsButton();
  },

  'Create custom filter and save': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();

    list
      .clickAddNewFilterButton()
      .selectDataFieldForFilter(Object.keys(usersInfo[2])[2])
      .selectLogicOptionForCustomFilter(lfdCustomFilterOptions.TEXT_DOES_NOT_CONTAIN)
      .setValueForCustomFilter(usersInfo[2].subtitle);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview mode and check the filter': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();

    lfdPreviewScreen.assertListItemsDoNotContainText(Object.keys(usersInfo[2])[2], usersInfo[2].subtitle);
  },

  'Delete the created applications and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};