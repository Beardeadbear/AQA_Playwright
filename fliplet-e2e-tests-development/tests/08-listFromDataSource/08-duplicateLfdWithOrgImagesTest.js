const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const columns = ['Title', 'Image', 'Category', 'Description'];
const imageNames = [
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'parrots_thumb.jpg',
  'parrots_thumb.jpg'];
const expectedImages = [
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  '.jpeg',
  '.jpeg'];
const title = [`a${casual.word}`, `b${casual.word}`, `c${casual.word}`];
const category = [casual.title, casual.title, casual.title];
const folderWithFiles = globals.imageFolder;

module.exports = {

  '@disabled': (globals.smokeTest == 'true'),

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 08-copy-lfd-orig`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 08-copy-lfd-orig`;
    browser.globals.appNameDuplicated = `${casual.title} 08-lfd-dupl`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.appNameDuplicated, browser.globals.dataSourceNameGenerated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create an app, add LFD component to the screen and select Simple List for it': function (browser) {
    const list = browser.page.listScreens();

    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP)
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
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

  'Select the existing folder for Image in LFD': function (browser) {
    const list = browser.page.listScreens();
    const dataView = browser.page.dataViewScreen();
    const filePicker = browser.page.filePicker();
    const folder = 'Image folder';

    list.clickDataViewSettings()
      .selectImageFolderOnDataView(folder)
      .clickSelectFolderButton();

    filePicker.selectOrganizationFolder()
      .selectItemInFilePicker(browser.globals.imageFolder)
      .clickSelectAndSaveButton();

    dataView.clickBackToSettingsButton();
  },

  'Edit the data source for the LFD component - add new data and new images into data source': function (browser) {
    const list = browser.page.listScreens();
    const componentsScreen = browser.page.componentsScreen();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource.changeValuesInDataSourceCells(3, [title[1], imageNames[1], category[1]])
      .changeValuesInDataSourceCells(4, [title[2], imageNames[2], category[2]])
      .changeValuesInDataSourceCells(2, [title[0], imageNames[0], category[0]]);

    dataSourceManagerOverlay.clickSaveButtonInDataSourceManagerOverlay();

    list.confirmDataChangesInModalWindow();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Duplicate the application with LFD and open it': function (browser) {
    const apps = browser.page.appsPage();

    browser.cloneApplicationByName(browser.globals.appNameGenerated, browser.globals.appNameDuplicated);

    apps.openAppByName(browser.globals.appNameDuplicated);
  },

  'Check app details contains images from folder and data form data source': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.switchToPreviewFrame();

    preview.assertInformationTextOnPreviewScreen(`//div[@class="list-item-title"]`, title);
    preview.assertInformationTextOnPreviewScreen(`//div[@class="list-item-subtitle"]`, category);
    preview.assertCorrectImagesArePresentInPreviewScreenByStyle(`//div[@class="list-item-image"]`, expectedImages);
  },

  'Check that data source was copied with the app': function (browser) {
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByUsingAppName(browser.globals.dataSourceNameGenerated, browser.globals.appNameDuplicated);

    dataSource.assertDataSourceColumnNamesAreCorrect(columns)
      .assertSpecifiedValuesInDataSource(3, [title[0], imageNames[0], category[0]])
      .assertSpecifiedValuesInDataSource(3, [title[1], imageNames[1], category[1]])
      .assertSpecifiedValuesInDataSource(3, [title[2], imageNames[2], category[2]]);
  },

  'Check that the new app folder contains images for LFD': function (browser) {
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .selectAppFromListByTitle(browser.globals.appNameDuplicated)
      .assertFolderIsOpen(browser.globals.appNameDuplicated)
      .waitForAllFilesToBeLoaded()
      .verifyItemIsPresentInFileManager(folderWithFiles)
      .tickCheckboxNearFileManagerItem(folderWithFiles)
      .openActionMenuForSingleSelect()
      .selectOpenOptionInActionMenu()
      .assertFolderIsOpen(folderWithFiles)
      .waitForAllFilesToBeLoaded()
      .verifyItemIsPresentInFileManager(imageNames[1]);
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteApplicationsMatchingParticularName(browser.globals.appNameDuplicated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.appNameDuplicated, browser.globals.dataSourceNameGenerated]);
  }
};