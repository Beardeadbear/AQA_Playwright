const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const imageNames = ['welcome.jpg', 'venue.jpg', 'travel.jpg'];
const imageIds = [];

module.exports = {
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 09-images`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app, add a new image component and select an existing image for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const previewApp = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const filePicker = browser.page.filePicker();
    const imageName = 'highlights.jpg';
    const linkOfImage = [];

    browser
      .createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.IMAGE);

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imageName)
      .assertThatCorrectFileIsSelected(imageName)
      .getIdsOfSelectedFiles(linkOfImage);

    componentsScreen.clickSaveAndCloseButton();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.IMAGE);

    previewApp.assertImageOnPreviewScreen(linkOfImage[0]);
  },

  'Change image for the image component to a new uploaded one': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();
    const editApp = browser.page.editAppScreen();
    const filePicker = browser.page.filePicker();
    const imageName = 'icon.png';
    const linkOfImage = [];

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.IMAGE);

    filePicker
      .openAppFolderWithFiles()
      .clickSelectFilesButton()
      .selectFileForUploading(imageName)
      .assertThatCorrectFileIsSelected(imageName)
      .getIdsOfSelectedFiles(linkOfImage);

    componentsScreen.clickSaveAndCloseButton();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.IMAGE)

    previewApp.assertImageOnPreviewScreen(linkOfImage[0]);
  },

  'Add gallery component and select images for it': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();
    appTopFixedNavigationBar.navigateToEditMode();

    browser
      .dragAndDropWithCondition(widgets.GALLERY)
      .switchToWidgetInstanceFrame();

    componentsScreen.clickAddImagesButton();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectMultipleItemsInFilePicker(imageNames)
      .assertCorrectAmountOfSelectedItemsInFilePicker(imageNames.length)
      .getIdsOfSelectedFiles(imageIds)
      .clickSelectAndSaveButton();
  },

  'Check ability to delete images from gallery and assert selected images are displayed in the screen': function(browser){
    const previewApp = browser.page.previewAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    componentsScreen
      .assertCorrectQtyOfImagesDisplayedInGallery(imageNames.length)
      .deleteSelectedImageFromGallery(imageIds[imageIds.length-1])
      .assertCorrectQtyOfImagesDisplayedInGallery(imageNames.length-1)
      .clickSaveAndCloseButton();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.GALLERY)
      .switchToPreviewFrame();

    previewApp.assertCorrectImagesAreAddedToGallery([imageNames[imageNames.length-3], imageNames[imageNames.length-2]],
      imageIds[imageIds.length-2] ,imageIds[imageIds.length-3]);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};