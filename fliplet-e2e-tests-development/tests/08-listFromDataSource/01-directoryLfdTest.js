const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const person = ['Edited', casual.last_name, casual.word, casual.city];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 01-lfd-directory`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 01-lfd-directory`;

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

  'Create a new app and add Directory lfd component': function (browser){
    const list = browser.page.listScreens();

    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.DIRECTORY);
  },

  'Create and connect a data source for the Directory': function (browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGenerated)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Check Data View settings match to expected': function (browser) {
    const summaryFieldsArray = ['Primary text 1', 'Primary text 2', 'Secondary text', 'Tertiary text', 'Image'];
    const summaryColumnsArray = ['First Name', 'First Name', 'Title', 'Location', 'Image'];
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();
    const dataSourceProvider = browser.page.dataSourceProvider();

    list.clickDataViewSettings();

    dataView.assertDefaultsDataViewSettingsMatchToExpected('Small expandable cards', summaryFieldsArray, summaryColumnsArray);
    dataView.clickBackToSettingsButton();

    dataSourceProvider.checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated);
  },

  'Change sorting order of entries and check data on "preview" screen': function (browser) {
    const list = browser.page.listScreens();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const componentsScreen = browser.page.componentsScreen();
    const preview = browser.page.previewAppScreen();
    const names = [];

    list
      .expandSortingOptionsForList()
      .changeSortOrderToDescending();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt('Edit Data Sources');

    //add some data to it and save changes

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .changeValuesInDataSourceCells(3, person);

    dataSourceManagerOverlay.clickSaveButtonInDataSourceManagerOverlay();

    list.confirmDataChangesInModalWindow();

    //change sorting options of a list

    componentsScreen.clickSaveAndCloseButton();

    //navigating to preview screen and asserting that all changes are saved and applied

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.switchToPreviewFrame();

    preview.getNamesInSmallCardsList(names);
    preview.assertEditedPersonNameIsPresentInList(names, person);
    preview.assertEditedPersonInformationIsPresentInList(names, person);
    preview.assertUserNamesAreSortedDescending(names);

    //search for a person and assert he/she is present

    preview.enterSearchRequestOnPreviewScreen(person[0]);
    preview.clickSearchButtonOnPreviewScreen();
    preview.assertEditedPersonNameIsPresentInList(names, person);

    //check details of list item can be opened to assert #3986 bug doesn't reproduce

    preview.openDetailsOfListItem(1, 'small-card-list-name');

    browser.waitForElementVisible('.small-card-detail-wrapper .small-card-list-detail-image', browser.globals.smallWait);
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};