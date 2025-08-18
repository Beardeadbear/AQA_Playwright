const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const widgets = require('../../utils/constants/widgets');
const folderWithFiles = 'images folder';
const imageName = 'download.jpg';
const galleryImageName = ['icon.png'];
const galleryImageTitle = [casual.word];
const linkOfImage = [];
const linkOfGalleryImage = [];

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 06-app-to-duplicate`;
    browser.globals.appDuplicated = `${casual.title} 06-duplicated-app`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.appDuplicated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create an app and a folder in File Manager under the app': function(browser){
    const fileManager = browser.page.fileManagerPage();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);

    fileManager
      .navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .assertThatFolderIsEmpty()
      .clickNewButton()
      .selectCreateNewFolderForFileManager(folderWithFiles)
      .setNameForFileManager(folderWithFiles)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(folderWithFiles);
  },

  'Upload a file to the created folder ': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager
      .tickCheckboxNearFileManagerItem(folderWithFiles)
      .openActionMenuForSingleSelect()
      .selectOpenOptionInActionMenu()
      .assertFolderIsOpen(folderWithFiles)
      .assertThatFolderIsEmpty()
      .clickNewButton()
      .selectUploadNewFile()
      .selectFileForUploading(galleryImageName[0])
      .verifyItemIsPresentInFileManager(galleryImageName[0]);
  },

  'Configure Image component on the app screen': function(browser){
    const filePicker = browser.page.filePicker();
    const appsPage = browser.page.appsPage();
    const componentsScreen = browser.page.componentsScreen();

    appsPage
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    browser.newDragAndDrop(widgets.IMAGE)
      .waitForWidgetInterfaceNewDnd(widgets.IMAGE);

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imageName)
      .assertThatCorrectFileIsSelected(imageName);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Configure Gallery component on the app screen': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();

    browser.newDragAndDropAccordion(widgets.GALLERY)
      .waitForWidgetInterfaceNewDnd(widgets.GALLERY)
      .switchToWidgetInstanceFrame();

    componentsScreen.clickAddImagesButton();

    filePicker
      .openFolderInFilePicker(folderWithFiles)
      .assertCorrectFolderIsOpen(folderWithFiles)
      .selectMultipleItemsInFilePicker(galleryImageName)
      .assertCorrectAmountOfSelectedItemsInFilePicker(galleryImageName.length)
      .clickSelectAndSaveButton();

    componentsScreen
      .assertCorrectQtyOfImagesDisplayedInGallery(galleryImageName.length)
      .changeTitlesForGalleryImages(galleryImageTitle)
      .clickSaveAndCloseButton();
  },

  'Duplicate the app with Image and Gallery and check that folders and files are duplicated as well': function(browser){
    const fileManager = browser.page.fileManagerPage();

    browser.cloneApplicationByName(browser.globals.appNameGenerated, browser.globals.appDuplicated);

    fileManager
      .navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .selectAppFromListByTitle(browser.globals.appDuplicated)
      .assertFolderIsOpen(browser.globals.appDuplicated)
      .waitForAllFilesToBeLoaded()
      .verifyItemIsPresentInFileManager(folderWithFiles)
      .openFolderUsingDoubleClickByName(folderWithFiles)
      .assertFolderIsOpen(folderWithFiles)
      .verifyItemIsPresentInFileManager(galleryImageName[0]);
  },

  'Open the duplicated application and check duplicated Image component': function(browser){
    const filePicker = browser.page.filePicker();
    const editApp = browser.page.editAppScreen();
    const appsPage = browser.page.appsPage();

    appsPage
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appDuplicated);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.IMAGE);

    filePicker.assertThatCorrectFileIsSelected(imageName);

    editApp.getImageIdFromEditModeScreen(linkOfImage);
  },

  'Check duplicated Gallery component with images from file picker': function(browser){
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.GALLERY);

    componentsScreen
      .assertCorrectQtyOfImagesDisplayedInGallery(galleryImageName.length)
      .checkGalleryImagesTitles(galleryImageTitle)
      .clickAddImagesButton();

    filePicker
      .openFolderInFilePicker(folderWithFiles)
      .assertCorrectFolderIsOpen(folderWithFiles)
      .selectMultipleItemsInFilePicker(galleryImageName)
      .getIdsOfSelectedFiles(linkOfGalleryImage)
      .assertCorrectAmountOfSelectedItemsInFilePicker(galleryImageName.length)
      .clickSelectAndSaveButton();

    componentsScreen
      .assertCorrectQtyOfImagesDisplayedInGallery(galleryImageName.length * 2)
      .clickSaveAndCloseButton();
  },

  'Check the duplicated app data - image and gallery components on preview mode': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp
      .assertImageOnPreviewScreen(linkOfImage[linkOfImage.length - 1])
      .assertCorrectImagesAreAddedToGallery([galleryImageName[galleryImageName.length - 1],
        galleryImageName[galleryImageName.length - 1]], [linkOfGalleryImage[linkOfGalleryImage.length - 1],
        linkOfGalleryImage[linkOfGalleryImage.length - 1]]);
  },

  'Delete the created applications': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteApplicationsMatchingParticularName(browser.globals.appDuplicated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.appDuplicated]);
  }
};