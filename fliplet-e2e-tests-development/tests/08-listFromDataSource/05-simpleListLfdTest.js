const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const firstElement = [casual.title, 'https://cdn.fliplet.com/apps/2659/7b98218ffd06b23fd5b99bfaf53bbd7c194-850-1800.jpg',
  casual.word, casual.description];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 05-lfd-simple`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 05-lfd-simple`;

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

  'Create a new app and add Simple List lfd component': function (browser) {
    const list = browser.page.listScreens();

    browser.createApplicationWithCondition (browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.SIMPLE_LIST);
  },

  'Create and connect a data source for the Simple List': function (browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGenerated)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Edit data source for lfd component - add data to it and save changes': function (browser) {
    const list = browser.page.listScreens();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt('Edit Data Sources');

    dataSource.changeValuesInDataSourceCells(2, firstElement)

    dataSourceManagerOverlay.clickSaveButtonInDataSourceManagerOverlay();

    list.confirmDataChangesInModalWindow();
  },

  'Check Data View settings match to expected': function (browser) {
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();
    const summaryFieldsArray = ['Image', 'Primary text', 'Secondary text', 'Tertiary text'];
    const summaryColumnsArray = ['Image', 'Title', 'Description', 'Category'];

    list.clickDataViewSettings();

    dataView.assertDefaultsDataViewSettingsMatchToExpected('Simple List', summaryFieldsArray, summaryColumnsArray);
    dataView.clickBackToSettingsButton();
  },

  'Disable search and filter and check they are not present on preview screen': function (browser) {
    const list = browser.page.listScreens();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const componentsScreen = browser.page.componentsScreen();
    const preview = browser.page.previewAppScreen();

    //disable search and filters

    browser.pause(1000);

    list
      .clickAllowSearchCheckbox()
      .clickAllowFiltersCheckbox();

    browser.waitForElementNotVisible('.spinner-overlay', browser.globals.smallWait);

    componentsScreen.clickSaveAndCloseButton();

    //navigating to preview screen and asserting that all changes are saved and applied on details of card

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview
      .assertFiltersAndSearchAreNotPresent() // assert that search and filters are disabled
      .openDetailsOfListItem(1, 'list-item-title');
    preview.assertInformationIsPresentInPreviewScreen('//div[@class="simple-list-detail-value"][not(img)]',
      [firstElement[0]].concat(firstElement.slice(2)));
    preview.assertCorrectImagesArePresentInPreviewScreen('//div[@class="simple-list-detail-value"]/img', [firstElement[1]])
  },

  'Check "like" functionality for entries': function (browser) {
    const preview = browser.page.previewAppScreen();

    preview.clickLikeIconInElementDetails();
  },

  'Navigate to data sources directory and check that like appeared in data source': function (browser) {
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(`${browser.globals.appNameGenerated} - Likes`);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(`${browser.globals.appNameGenerated} - Likes`)
      .assertColumnNamesAreNotDefault()
      .assertDataInFirsLineIsNotDefault();
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};