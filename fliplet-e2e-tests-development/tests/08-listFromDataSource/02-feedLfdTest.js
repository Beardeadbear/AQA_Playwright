const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const entries = [{
  "Title": casual.word,
  "Content": casual.title,
  "Date": '11-30-1986',
  "Image": 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
},
  {
    "Title": casual.word,
    "Content": casual.title,
    "Date": '11-30-1985',
    "Image": 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  },
  {
    "Title": casual.word,
    "Content": casual.title,
    "Date": '11-30-1984',
    "Image": 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
  }];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 02-lfd-feed`;
    browser.globals.existingDataSourceNameGenerated = `${casual.title} 02-lfd-feed`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.existingDataSourceNameGenerated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a data source, a new app and add Feed lfd component': function (browser) {
    const list = browser.page.listScreens();

    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .createDataSourceViaApi(browser.globals.existingDataSourceNameGenerated, entries)
      .dragAndDropWithCondition(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEED);
  },

  'Check Data View settings match to expected': function (browser) {
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();
    const summaryFieldsArray = ['Primary text', 'Secondary text', 'Tertiary text 1', 'Tertiary text 2', 'Image'];
    const summaryColumnsArray = ['Title', 'Content', 'Date', 'Categories', 'Image'];

    list.clickDataViewSettings();

    dataView.assertDefaultsDataViewSettingsMatchToExpected('Cards with description', summaryFieldsArray, summaryColumnsArray);
    dataView.clickBackToSettingsButton();
  },

  'Select an existing data source for app and check data on preview screen': function (browser) {
    const dataSourceProvider = browser.page.dataSourceProvider();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const componentsScreen = browser.page.componentsScreen();
    const preview = browser.page.previewAppScreen();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.existingDataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.existingDataSourceNameGenerated);

    componentsScreen.clickSaveAndCloseButton();

    //navigating to preview screen and asserting that all changes are saved and applied

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.switchToPreviewFrame();

    preview.assertInformationIsPresentInPreviewScreen(`//h2[@class="news-feed-item-title"]`,
      entries.map(entry => entry['Title']));
    preview.assertInformationIsPresentInPreviewScreen(`//div[@class='news-feed-item-description']`,
      entries.map(entry => entry['Content']));
    preview.assertCorrectImagesArePresentInPreviewScreen(`//div[@class="image-banner"]/img`,
      entries.map(entry => entry['Image']));
  },

  'Configure rule for number of cards to display': function (browser) {
    const numbersToDisplay = 2;
    const preview = browser.page.previewAppScreen();
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    //return to edit screen and apply rule for number of cards to display

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    list.enterNumberInItemsToShowField(numbersToDisplay);

    componentsScreen.clickSaveAndCloseButton();

    //navigating to preview screen and asserting that all changes are saved and applied

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.switchToPreviewFrame();

    preview.assertNumberOfItemsMatchesToEntered('.news-feed-item-inner-content', numbersToDisplay);

    //check details of list item can be opened to assert #3986 bug doesn't reproduce

    preview.openDetailsOfListItem(1, 'news-feed-item-description');

    browser.waitForElementVisible('.news-feed-list-detail-content-scroll-wrapper', browser.globals.smallWait);
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.existingDataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.existingDataSourceNameGenerated]);
  }
};