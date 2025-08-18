const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const imageNames = [
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'icon.png',
  'icon.png'];
const expectedImages = [
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  '.png',
  '.png'];
const title = [`a${casual.word}`, `b${casual.word}`, `c${casual.word}`];
const category = [casual.title, casual.title, casual.title];
const folderWithFiles = 'images folder';
const fileName = 'icon.png';

module.exports = {

  '@disabled': (globals.smokeTest == 'true'),

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 09-app-lfd-to-duplicate`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 09-app-lfd-to-duplicate`;
    browser.globals.appNameDuplicated = `${casual.title} 09-app-lfd-duplicated`;

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

  'Create an app for duplicating and a folder in File Manager under the app': function(browser) {
    const fileManager = browser.page.fileManagerPage();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP);

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .waitForAllFilesToBeLoaded()
      .clickNewButton()
      .selectCreateNewFolderForFileManager(folderWithFiles)
      .setNameForFileManager(folderWithFiles)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(folderWithFiles);
  },

  'Upload a file to the created folder ': function(browser) {
    const fileManager = browser.page.fileManagerPage();

    fileManager.tickCheckboxNearFileManagerItem(folderWithFiles)
      .openActionMenuForSingleSelect()
      .selectOpenOptionInActionMenu()
      .assertFolderIsOpen(folderWithFiles)
      .assertThatFolderIsEmpty()
      .clickNewButton()
      .selectUploadNewFile()
      .selectFileForUploading(fileName)
      .checkIfFileUploaded()
      .verifyItemIsPresentInFileManager(fileName);
  },

  'Open the created app, add LFD component to the screen and select Featured List for it': function (browser) {
    const apps = browser.page.appsPage();
    const list = browser.page.listScreens();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    browser.newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
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

  'Select the existing folder in File Manager for the list images': function (browser) {
    const list = browser.page.listScreens();
    const dataView = browser.page.dataViewScreen();
    const filePicker = browser.page.filePicker();
    const folder = 'Image folder';

    list.clickDataViewSettings()
      .selectImageFolderOnDataView(folder)
      .clickSelectFolderButton();

    filePicker.selectItemInFilePicker(folderWithFiles)
      .clickSelectAndSaveButton();

    dataView.clickBackToSettingsButton();
  },

  'Edit the data source for the LFD component': function (browser) {
    const list = browser.page.listScreens();
    const componentsScreen = browser.page.componentsScreen();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource.changeValuesInDataSourceCells(3, [title[1], title[1], title[1], category[1], imageNames[1]])
      .changeValuesInDataSourceCells(4, [title[2], title[2], title[2], category[2], imageNames[2]])
      .changeValuesInDataSourceCells(2, [title[0], title[0], title[0], category[0], imageNames[0]]);

    dataSourceManagerOverlay.clickSaveButtonInDataSourceManagerOverlay();

    list.confirmDataChangesInModalWindow();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Duplicate the application with LFD and open it': function (browser) {
    const apps = browser.page.appsPage();

    browser.cloneApplicationByName(browser.globals.appNameGenerated,  browser.globals.appNameDuplicated);

    apps.openAppByName(browser.globals.appNameDuplicated);
  },

  'Check app details contains images from folder and data form data source': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.switchToPreviewFrame();

    preview.assertInformationTextOnPreviewScreen(`//div[@class="small-h-card-list-item-text"]`, title);
    preview.assertCorrectImagesArePresentInPreviewScreenByStyle(`//div[@class="small-h-card-list-detail-image"]`, expectedImages);
  },

  'Check image from app folder in item details': function (browser) {
    const preview = browser.page.previewAppScreen();

    preview.openDetailsOfListItem(2, 'small-h-card-list-detail-image');

    browser
      .waitForElementVisible('.small-h-card-list-detail-name', browser.globals.smallWait)
      .waitForElementVisible('.small-h-card-list-detail-wrapper.open .small-h-card-list-detail-image', browser.globals.smallWait);

    preview.assertCorrectImagesArePresentInPreviewScreenByStyle(`//div[@class="small-h-card-list-detail-wrapper open"]//div[@class="small-h-card-list-detail-image"]`,
      [expectedImages[1]]);
  },

  'Check that new app folder contains images for LFD': function (browser) {
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