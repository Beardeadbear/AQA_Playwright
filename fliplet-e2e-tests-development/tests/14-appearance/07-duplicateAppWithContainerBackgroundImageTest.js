const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const widgets = require('../../utils/constants/widgets');
const publishingChannels = require('../../utils/constants/publishingChannels');
const globals = require('../../globals_path');
const screensTitles = {
  firstScreen: 'First screen',
  secondScreen: 'Second screen'
};
const imagesForDuplicatedApp ={
  firstImage: 'welcome.jpg',
  secondImage: 'profile.png'
};
const folderName = casual.word;
const imageName = 'icon.png';
const imageId = [];

module.exports = {

  '@disabled': (globals.smokeTest == 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/ID-423',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 06-app-dupl-container`;
    browser.globals.appDuplicated = `${casual.letter} ${casual.word} ${casual.letter} 06-duplicated-container`;

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

  'Create a new application and add Container to the first screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .newDragAndDrop(widgets.CONTAINER)
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CONTAINER);
  },

  'Open the appearance settings for the container and choose Add image for background': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();

    editAppScreen.openEditAppearanceSettingForComponent(widgets.CONTAINER);

    appearanceScreen
      .selectImageOptionForContainerBackground()
      .clickImageButtonForContainerBackground();
  },

  'Upload and select image for container background': function(browser){
    const filePicker = browser.page.filePicker();
    const appearanceScreen = browser.page.appearanceScreen();

    filePicker
      .clickSelectFilesButton()
      .selectFileForUploading(imageName)
      .assertThatCorrectFileIsSelected(imageName)
      .clickSelectAndSaveButton();

    appearanceScreen.assertThatCorrectImageIsSelectedForContainerBackground(imageName);
  },

  'Switch to the second screen and add Container': function(browser){
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.secondScreen);

    rightSideNavMenu.openComponentsScreen();

    browser
      .newDragAndDrop(widgets.CONTAINER)
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CONTAINER);
  },

  'Open the appearance settings for the container and choose Change image for background': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();

    editAppScreen.openEditAppearanceSettingForComponent(widgets.CONTAINER);

    appearanceScreen
      .selectImageOptionForContainerBackground()
      .clickImageButtonForContainerBackground();
  },

  'Create and open a new folder in file picker': function(browser){
    const filePicker = browser.page.filePicker();

    filePicker
      .clickCreateFolderButton()
      .enterFolderNameInFilePicker(folderName)
      .confirmFolderCreationInFilePicker()
      .assertItemIsPresentInFilePicker(folderName)
      .openFolderInFilePicker(folderName)
      .assertCorrectFolderIsOpen(folderName);
  },

  'Upload and select image for container background to the folder': function(browser){
    const filePicker = browser.page.filePicker();
    const appearanceScreen = browser.page.appearanceScreen();

    filePicker
      .clickSelectFilesButton()
      .selectFileForUploading(imageName)
      .assertThatCorrectFileIsSelected(imageName)
      .clickSelectAndSaveButton();

    appearanceScreen.assertThatCorrectImageIsSelectedForContainerBackground(imageName);
  },

  'Publish the application': function (browser) {
    const publish = browser.page.publishScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish
      .clickSelectButtonNearPublishingOptionByChannelName(publishingChannels.PUBLISH_TO_THE_WEB_VIA_A_URL)
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Check the container background image on the first screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp
      .checkPageTitle(`${screensTitles.firstScreen} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.CONTAINER)
      .assertContainerHasCorrectImageForBackground(imageName)
  },

  'Check the container background image on the second screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp
      .openWebAppMenu()
      .openMenuItemByName(screensTitles.secondScreen)
      .checkPageTitle(`${screensTitles.secondScreen} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.CONTAINER)
      .assertContainerHasCorrectImageForBackground(imageName);
  },

  'Duplicate the application with images for container background and open it': function(browser){
    const appsPage = browser.page.appsPage();

    browser.cloneApplicationByName(browser.globals.appNameGenerated, browser.globals.appDuplicated);

    appsPage.openAppByName(browser.globals.appDuplicated);
  },

  'Check that the duplicated application contains the container widget with background image on the first screen': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();
    const filePicker = browser.page.filePicker();

    editAppScreen.openEditAppearanceSettingForComponent(widgets.CONTAINER);

    appearanceScreen
      .assertThatImageIsSelectedForContainerBackground()
      .clickImageButtonForContainerBackground();

    filePicker.assertThatCorrectFileIsSelected(imageName);
  },

  'Switch to another screen of the duplicated application and check the container background image there': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const editAppScreen = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();
    const filePicker = browser.page.filePicker();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    appScreensLeftsidePanel.openScreenByName(screensTitles.secondScreen);

    rightSideNavMenu.openComponentsScreen();

    editAppScreen.openEditAppearanceSettingForComponent(widgets.CONTAINER);

    appearanceScreen
      .assertThatImageIsSelectedForContainerBackground()
      .clickImageButtonForContainerBackground();

    filePicker
      .assertCorrectFolderIsOpen(folderName)
      .assertThatCorrectFileIsSelected(imageName);
  },

  'Navigate to preview and check the container background image on the first screen of the duplicated application' : function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appTopFixedNavigationBar.navigateToPreviewMode();

    appScreensLeftsidePanel.openScreenByName(screensTitles.firstScreen);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CONTAINER);

    previewAppScreen.assertContainerHasCorrectImageForBackground(imageName);
  },

  'Check the container background image on the second screen of the duplicated application' : function(browser){
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.secondScreen);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CONTAINER);

    previewAppScreen.assertContainerHasCorrectImageForBackground(imageName);
  },

  'Open File Manager and check that the duplicated app folder contains the image and the folder with the image': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager
      .navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .selectAppFromListByTitle(browser.globals.appDuplicated)
      .assertFolderIsOpen(browser.globals.appDuplicated)
      .verifyItemIsPresentInFileManager(imageName)
      .verifyItemIsPresentInFileManager(folderName)
      .openFolderUsingDoubleClickByName(folderName)
      .assertFolderIsOpen(folderName)
      .verifyItemIsPresentInFileManager(imageName);
  },

  'Navigate to edit mode of the duplicated application, open the appearance settings for the container and choose Change image for background': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();
    const appsPage = browser.page.appsPage();

    appsPage
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appDuplicated);

    editAppScreen.openEditAppearanceSettingForComponent(widgets.CONTAINER);

    appearanceScreen
      .selectImageOptionForContainerBackground()
      .clickImageButtonForContainerBackground();
  },

  'Change image for container background for the container on the first screen of the duplicated application': function(browser){
    const filePicker = browser.page.filePicker();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imagesForDuplicatedApp.firstImage)
      .assertThatCorrectFileIsSelected(imagesForDuplicatedApp.firstImage)
      .getIdsOfSelectedFiles(imageId)
      .clickSelectAndSaveButton();
    },

  'Switch to another screen of the duplicated application, open the appearance settings for the container and choose Change image for background': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appearanceScreen = browser.page.appearanceScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appearanceScreen.assertThatCorrectImageIsSelectedForContainerBackground(imageId[imageId.length-1]);

    appScreensLeftsidePanel.openScreenByName(screensTitles.secondScreen);

    rightSideNavMenu.openComponentsScreen();

    editAppScreen.openEditAppearanceSettingForComponent(widgets.CONTAINER);

    appearanceScreen
      .selectImageOptionForContainerBackground()
      .clickImageButtonForContainerBackground();
  },

  'Change image for container background for the container on the second screen of the duplicated application': function(browser){
    const filePicker = browser.page.filePicker();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imagesForDuplicatedApp.secondImage)
      .assertThatCorrectFileIsSelected(imagesForDuplicatedApp.secondImage)
      .getIdsOfSelectedFiles(imageId)
      .clickSelectAndSaveButton();
  },

  'Navigate to preview and check the changed container background image on the first screen of the duplicated application' : function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.assertThatCorrectImageIsSelectedForContainerBackground(imageId[imageId.length-1]);

    appTopFixedNavigationBar.navigateToPreviewMode();

    appScreensLeftsidePanel.openScreenByName(screensTitles.firstScreen);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CONTAINER);

    previewAppScreen.assertContainerHasCorrectImageForBackground(imageId[imageId.length-2]);
  },

  'Check the changed container background image on the second screen of the duplicated application' : function(browser){
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.secondScreen);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.CONTAINER);

    previewAppScreen.assertContainerHasCorrectImageForBackground(imageId[imageId.length-1]);
  },

  'Delete the created applications': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteApplicationsMatchingParticularName(browser.globals.appDuplicated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.appDuplicated]);
  }
};