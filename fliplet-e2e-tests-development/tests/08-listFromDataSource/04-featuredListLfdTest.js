const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 04-lfd-featured`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 04-lfd-featured`;

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

  'Create a new app and add Featured List lfd component': function (browser) {
    const list = browser.page.listScreens();

    browser.createApplicationWithCondition (browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEATURED_LIST);
  },

  'Create and connect a data source for the Featured List': function (browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGenerated)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Check Data View settings match to expected': function (browser) {
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();
    const summaryFieldsArray = ['Primary text 1', 'Primary text 2', 'Secondary text', 'Tertiary text', 'Image'];
    const summaryColumnsArray = ['First Name', 'Last Name', 'Title', 'Location', 'Image'];

    list.clickDataViewSettings();

    dataView.assertDefaultsDataViewSettingsMatchToExpected('Small horizontal cards', summaryFieldsArray, summaryColumnsArray);
    dataView.clickBackToSettingsButton();
  },

  'Create custom filter and assert data on preview screen matches to it': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();
    const preview = browser.page.previewAppScreen();
    const fieldNameForFilter = 'Last Name';
    const logicForFilter = 'contains'; // should be from small letter
    const valueForFilter = 'Smith';

    list
      .clickAddNewFilterButton()
      .selectDataFieldForFilter(fieldNameForFilter)
      .selectLogicOptionForCustomFilter(logicForFilter)
      .setValueForCustomFilter(valueForFilter);

    componentsScreen.clickSaveAndCloseButton();

    //navigating to preview screen and asserting that all changes are saved and applied

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.assertAllShownItemsMatchToFilter('.small-h-card-list-item-text', valueForFilter);

    //check details of list item can be opened to assert #3986 bug doesn't reproduce

    preview.openDetailsOfListItem(1, 'small-h-card-list-detail-image');

    browser
      .waitForElementVisible('.small-h-card-list-detail-name', browser.globals.smallWait)
      .waitForElementVisible('.small-h-card-list-detail-wrapper.open .small-h-card-list-detail-image', browser.globals.smallWait);
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};