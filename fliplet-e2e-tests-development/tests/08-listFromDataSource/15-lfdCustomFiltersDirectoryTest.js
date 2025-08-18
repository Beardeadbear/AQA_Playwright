const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const lfdCustomFilterOptions = require('../../utils/constants/lfdCustomFilterOptions');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const globals = require('../../globals_path');
const usersInfo = [
  {
    "name": casual.full_name,
    "Email": casual.email,
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  },
  {
    "name": casual.full_name,
    "Email": casual.email,
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  },
  {
    "name": casual.full_name,
    "Email": casual.email,
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  }
];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-202',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 15-lfd-directory-filter`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 15-lfd-directory-filter`;

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

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.DIRECTORY);
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
      .selectDataViewValue(1, Object.keys(usersInfo[0])[0])
      .selectDataViewValue(2, Object.keys(usersInfo[0])[3])
      .selectDataViewValue(3, Object.keys(usersInfo[0])[4])
      .clickBackToSettingsButton();
  },

  'Create custom filter and save': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();

    list
      .clickAddNewFilterButton()
      .selectDataFieldForFilter(Object.keys(usersInfo[0])[0])
      .selectLogicOptionForCustomFilter(lfdCustomFilterOptions.EQUALS)
      .setValueForCustomFilter(usersInfo[0].name);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview mode and check the filter': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();

    lfdPreviewScreen.assertListItemsContainText(Object.keys(usersInfo[0])[0], usersInfo[0].name);
  },

  'Delete the created applications and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};