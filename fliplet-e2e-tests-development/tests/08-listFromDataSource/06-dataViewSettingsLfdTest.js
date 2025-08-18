const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const screenDataId = [];
const screensTitles = {
  screenWithALfd: 'First screen',
  screenForRedirection: 'Second screen',
};
const entries = [{
  "Name": casual.first_name.toUpperCase(),
  "Surname": casual.last_name.toUpperCase(),
  "Image": 'colonel-meow.JPG',
  "Secondary": casual.word,
  "Tetriary": casual.word,
},
  {
    "Name": casual.first_name.toUpperCase(),
    "Surname": casual.last_name.toUpperCase(),
    "Image": 'parrots_thumb.jpg',
    "Secondary": casual.word,
    "Tetriary": casual.word,
  },
  {
    "Name": casual.first_name.toUpperCase(),
    "Surname": casual.last_name.toUpperCase(),
    "Image": 'colonel-meow.JPG',
    "Secondary": casual.word,
    "Tetriary": casual.word,
  }
];
let columns = Object.keys(entries[0]);

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 06-data-view-settings`;
    browser.globals.existingDataSourceNameGenerated = `${casual.title} 06-data-view-settings`;
    browser.globals.appNameDuplicated = `${casual.title} 06-data-view-dupl`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.existingDataSourceNameGenerated, browser.globals.appNameDuplicated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app and get screen id for redirection': function (browser) {
    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .getScreenIdByName(screensTitles.screenForRedirection, screenDataId);
  },

  'Create a data source with content and add Featured List lfd component': function (browser) {
    const list = browser.page.listScreens();
    const dataSourceProvider = browser.page.dataSourceProvider();

    entries[2]["Screen for redirect"] = screenDataId[screenDataId.length-1]; //to add to entries object new property with screen id

    browser.createDataSourceViaApi(browser.globals.existingDataSourceNameGenerated, entries)
      .dragAndDropWithCondition(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEATURED_LIST);

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.existingDataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.existingDataSourceNameGenerated);
    },

  'Map data view fields in LFD details': function (browser) {
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();

    list.clickDataViewSettings();

    dataView.selectDataViewValue(1, columns[0])
      .selectDataViewValue(2, columns[1])
      .selectDataViewValue(3, columns[3])
      .selectDataViewValue(4, columns[4])
      .selectDataViewValue(5, columns[2]);
  },

  'Configure folder in File Manager for entry images': function (browser) {
    const dataView = browser.page.dataViewScreen();
    const folder = 'Image folder';
    const filePicker = browser.page.filePicker();

    dataView.selectImageFolderOnDataView(folder)
      .clickSelectFolderButton();

    filePicker.selectOrganizationFolder()
      .selectItemInFilePicker(browser.globals.imageFolder)
      .clickSelectAndSaveButton();
  },

  'Enable auto update when new fields are added': function (browser) {
    const dataView = browser.page.dataViewScreen();
    const componentsScreen = browser.page.componentsScreen();

    dataView.clickAutoUpdateWhenNewFieldsAreAdded();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview screen and assert displayed data': function (browser) {
    const preview = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.switchToPreviewFrame();

    preview.assertInformationIsPresentInPreviewScreen(`//div[@class="small-h-card-list-item-text"]`,
      [entries[2]['Name'], entries[1]['Name'], entries[0]['Name']]);
    preview.assertInformationIsPresentInPreviewScreen(`//div[@class="small-h-card-list-item-text"]`,
      [entries[2]['Surname'], entries[1]['Surname'], entries[0]['Surname']]);
    preview.assertCorrectImagesArePresentInPreviewScreenByStyle('//div[@class="small-h-card-list-detail-image"]',
      [entries[2]['Image'], entries[1]['Image'], entries[0]['Image']]);
  },

  'Check data in details of list item': function (browser) {
    const preview = browser.page.previewAppScreen();

    preview.openDetailsOfListItem(1, 'small-h-card-list-detail-image');
    preview.assertInformationIsPresentInPreviewScreen(`//div[@class="small-h-card-list-detail-name"]`, [entries[2].Name]);
    preview.assertInformationIsPresentInPreviewScreen(`//div[@class="small-h-card-list-detail-name"]`, [entries[2].Surname]);
    preview.assertInformationIsPresentInPreviewScreen(`//div[@class="small-h-card-list-detail-role"]`, [entries[2].Secondary]);
    preview.assertInformationIsPresentInPreviewScreen(`//div[@class="small-h-card-list-detail-location"]`, [entries[2].Tetriary]);
    preview.assertElementPresentOnPreviewScreenXpath(`//div[@class="small-h-card-list-detail-label"][text()="Screen for redirect"]`);
  },

  'Go back to edit mode and configure screen opening after click on list entry': function (browser) {
    const dataView = browser.page.dataViewScreen();
    const componentsScreen = browser.page.componentsScreen();
    const editApp = browser.page.editAppScreen();
    const list = browser.page.listScreens();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    list.clickDataViewSettings();

    dataView.clickOpenLinkOption();
    dataView.configureLinkTypeForEntryOnClick("Screen for redirect", 'screen');

    componentsScreen.clickSaveAndCloseButton();
  },

  'Check that redirect works after click list entry': function (browser) {
    const preview = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();

    preview.clickListItemImageByTitle(entries[2].Surname);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screensTitles.screenForRedirection);
  },

  'Duplicate the application and check a new one is present in the list': function (browser) {
    const apps = browser.page.appsPage();

    browser.cloneApplicationByName(browser.globals.appNameGenerated, browser.globals.appNameDuplicated);

    apps.assertApplicationIsPresentInListByName(browser.globals.appNameDuplicated);
  },

  'Check data view settings copied properly': function (browser) {
    const apps = browser.page.appsPage();
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();
    const editApp = browser.page.editAppScreen();
    const summaryFieldsArray = ['Primary text 1', 'Primary text 2', 'Secondary text', 'Tertiary text', 'Image'];

    apps.openAppByName(browser.globals.appNameDuplicated);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    list.clickDataViewSettings();

    dataView.assertDefaultsDataViewSettingsMatchToExpected('Small horizontal cards', summaryFieldsArray, columns);
    dataView.clickBackToSettingsButton();
  },

  'Open preview screen and assert displayed data in the duplicated app': function (browser) {
    const preview = browser.page.previewAppScreen();
    const imagesInCopiedApp = ['.jpg', '.jpg']; // in copied app file names are encrypted
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    browser.switchToPreviewFrame();

    preview.assertInformationIsPresentInPreviewScreen(`//div[@class="small-h-card-list-item-text"]`,
      [entries[0]['Name'], entries[1]['Name'][1], entries[2]['Name']]);
    preview.assertInformationIsPresentInPreviewScreen(`//div[@class="small-h-card-list-item-text"]`,
      [entries[0]['Surname'], entries[1]['Surname'][1], entries[2]['Surname']]);
    preview.assertCorrectImagesArePresentInPreviewScreenByStyle('//div[@class="small-h-card-list-detail-image"]',
      imagesInCopiedApp);
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.existingDataSourceNameGenerated)
      .deleteApplicationsMatchingParticularName(browser.globals.appNameDuplicated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameDuplicated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.existingDataSourceNameGenerated, browser.globals.appNameDuplicated]);
  }
};