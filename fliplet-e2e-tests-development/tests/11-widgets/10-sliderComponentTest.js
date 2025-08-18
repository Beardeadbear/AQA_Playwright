const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const videoFileName = 'stars.mp4';
const images = ['welcome.jpg', 'venue.jpg', 'travel.jpg'];
const screenNameForSlideButton = casual.word;
const slideTitles = [casual.word, casual.word, casual.word];
const slideDescriptions = [casual.short_description, casual.short_description, casual.short_description];
const imagesId = [];
const mediaId = [];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 10-slider`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app and add Slider component to the app': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.SLIDER)
      .switchToWidgetInstanceFrame();

    componentsScreen.assertComponentConfigurationIsOpen('Configure your onboarding slider');
  },

  'Add the 1-st slide and set an image for it': function (browser) {
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const filePicker = browser.page.filePicker();

    slidesConfigurationScreen.clickAddNewSlideButton(1)
      .changeSlideTitle(slideTitles[0])
      .changeSlideDescription(slideDescriptions[0])
      .clickAddImageForSliderButton();

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(images[0])
      .assertThatCorrectFileIsSelected(images[0])
      .clickSelectAndSaveButton();

    slidesConfigurationScreen.collapseSlidePanel(1);
  },

  'Add the 2-nd slide and set an image for it': function (browser) {
    const filePicker = browser.page.filePicker();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    slidesConfigurationScreen.clickAddNewSlideButton(2)
      .changeSlideTitle(slideTitles[1])
      .changeSlideDescription(slideDescriptions[1])
      .clickAddImageForSliderButton();

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(images[1])
      .assertThatCorrectFileIsSelected(images[1])
      .clickSelectAndSaveButton();
  },

  'Add a button with a video link to the 2-nd slide': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    browser.switchToWidgetInstanceFrame();

    slidesConfigurationScreen.enterTitleForSlideButton(2, screenNameForSlideButton);

    componentsScreen.setLinkActionForComponent(2, 'Play a video')
      .clickBrowseYourMediaLibraryForVideoButton();

    filePicker.selectOrganizationFolder(2)
      .openFolderInFilePicker(browser.globals.videoFolder, 2)
      .assertCorrectFolderIsOpen(browser.globals.videoFolder, 2)
      .selectItemInFilePicker(videoFileName, 2)
      .assertThatCorrectFileIsSelected(videoFileName, 2)
      .getIdsOfSelectedFiles(mediaId, 2)
      .clickSelectAndSaveButton();

    slidesConfigurationScreen.collapseSlidePanel(2);
    },

  'Add the 3-rd slide and set an image for it': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const filePicker = browser.page.filePicker();

    slidesConfigurationScreen.clickAddNewSlideButton(3)
      .changeSlideTitle(slideTitles[2])
      .changeSlideDescription(slideDescriptions[2])
      .clickAddImageForSliderButton();

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(images[2])
      .assertThatCorrectFileIsSelected(images[2])
      .getIdsOfSelectedFiles(images)
      .clickSelectAndSaveButton();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Get slide images id': function(browser){
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    slidesConfigurationScreen.getSlideImageId(1, imagesId);
    slidesConfigurationScreen.getSlideImageId(2, imagesId);
    slidesConfigurationScreen.getSlideImageId(3, imagesId);
  },

  'Navigate to the preview screen and assert that all changes are applied': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.SLIDER)
      .switchToPreviewFrame();

    previewAppScreen.checkSlidesPaginationBullets(slideTitles.length);
},

  'Check the 1-st slide on the preview screen': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.checkSlideComponents(slideTitles[0])
      .checkSlideDescription(slideDescriptions[0])
      .assertCorrectSlideImageIsDisplayed(imagesId[imagesId.length-3])
      .checkSlidePagination('next', 2);
  },

  'Check the 2-nd slide on the preview screen': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.checkSlidesPaginationBullets(slideTitles.length)
      .checkSlideComponents(slideTitles[1])
      .checkSlideDescription(slideDescriptions[1])
      .assertCorrectSlideImageIsDisplayed(imagesId[imagesId.length-2])
      .checkSlidePagination('next', 3);
  },

  'Switch to tablet mode and check the 3-nd slide': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.openPreviewForDeviceByName('Tablet');

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.SLIDER)
      .switchToPreviewFrame();

    previewAppScreen.checkSlidesPaginationBullets(slideTitles.length)
      .checkSlideComponents(slideTitles[2])
      .checkSlideDescription(slideDescriptions[2])
      .assertCorrectSlideImageIsDisplayed(imagesId[imagesId.length-1]);
  },

  'Switch to mobile mode to check slide button functionality': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.openPreviewForDeviceByName('Mobile');

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.SLIDER)
      .switchToPreviewFrame();

    previewAppScreen.checkSlidePagination('prev', 2)
      .checkSlideComponents(slideTitles[1])
      .checkSlideDescription(slideDescriptions[1])
      .assertCorrectSlideImageIsDisplayed(imagesId[imagesId.length-2])
      .clickSlideButton(screenNameForSlideButton)
      .assertCorrectVideoIsDisplayed(mediaId[mediaId.length-1]);
  },

  'Delete the created application': function (browser) {
      browser
        .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
        .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
    }
};