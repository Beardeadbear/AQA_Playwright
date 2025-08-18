const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const componentsConfigurationsTabs = require('../../utils/constants/componentsConfigurationsTabs');
const screenLayouts = require('../../utils/constants/screenLayouts');
const widgets = require('../../utils/constants/widgets');
const screenNameForSkipButton ='Home';
const screenNameForSlideButton = 'Get in touch';
const slideImageName = 'icon.png';
const backgroundImageName = 'download.jpg';
const introOnboardingScreenName = casual.word;
const slideTitles = [casual.word, casual.word];
const slideDescriptions = [casual.short_description, casual.short_description];
const backgroundImageId = [];
const slideImageId = [];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 02-intro-onboarding`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app and add Intro-onboarding layout screen there': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP);

    appScreensLeftsidePanel
      .clickAddScreensButton()
      .selectScreenLayoutOnPageLayoutsOverlay(screenLayouts.INTRO_ONBOARDING)
      .clickAddScreenButtonOnPageLayoutsOverlay()
      .enterScreenNameOnAppScreenModal(introOnboardingScreenName)
      .clickConfirmButtonOnAppScreenModal()
      .assertScreenIsPresentInAppScreenList(introOnboardingScreenName)
      .checkTitleOfActiveScreen(introOnboardingScreenName);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.ONBOARDING);

    editAppScreen.openDetailsOfComponentByClickingOnIt(widgets.ONBOARDING);
  },

  'Configure slider options - enable skip to the screen': function (browser) {
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .assertComponentConfigurationIsOpen('Configure your onboarding slider')
      .switchToTabName(componentsConfigurationsTabs.SLIDER_OPTIONS);

    slidesConfigurationScreen.configureSkipButtonInSliderOptions();

    componentsScreen.selectScreenForLinkingByName(screenNameForSkipButton);
  },

  'Configure slider options - add background image': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const filePicker = browser.page.filePicker();

    slidesConfigurationScreen.clickAddImageForSliderButton();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(backgroundImageName)
      .assertThatCorrectFileIsSelected(backgroundImageName)
      .getIdsOfSelectedFiles(backgroundImageId)
      .clickSelectAndSaveButton();
  },

  'Add the 1-st slide with an image': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const filePicker = browser.page.filePicker();

    componentsScreen.switchToTabName(componentsConfigurationsTabs.SLIDES);

    slidesConfigurationScreen
      .removeSlidePanel(1)
      .clickAddNewSlideButton(1)
      .clickAddImageForSliderButton();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(slideImageName)
      .assertThatCorrectFileIsSelected(slideImageName)
      .getIdsOfSelectedFiles(slideImageId)
      .clickSelectAndSaveButton();
  },

  'Add a title and description to the 1-st slide': function (browser) {
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    browser.switchToWidgetInstanceFrame();

    slidesConfigurationScreen
      .changeSlideTitle(slideTitles[0])
      .changeSlideDescription(slideDescriptions[0]);
  },

  'Add a button to the 1-st slide with link to another screen': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    slidesConfigurationScreen.enterTitleForSlideButton(1, screenNameForSlideButton);

    componentsScreen
      .setLinkActionForComponent(1, 'Display another screen')
      .selectScreenForLinkingByName(screenNameForSlideButton);

    slidesConfigurationScreen.collapseSlidePanel(1);
  },

  'Add the 2-nd slide to the screen': function (browser) {
    const filePicker = browser.page.filePicker();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    slidesConfigurationScreen
      .clickAddNewSlideButton(2)
      .clickAddImageForSliderButton();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(slideImageName)
      .assertThatCorrectFileIsSelected(slideImageName)
      .getIdsOfSelectedFiles(slideImageId)
      .clickSelectAndSaveButton();
  },

  'Add a title and description to the 2-st slide': function (browser) {
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    browser.switchToWidgetInstanceFrame();

    slidesConfigurationScreen
      .changeSlideTitle(slideTitles[1])
      .changeSlideDescription(slideDescriptions[1])
      .collapseSlidePanel(2);
  },

  'Add the 3-rd slide and check slides panels functionality': function (browser) {
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const componentsScreen = browser.page.componentsScreen();

    slidesConfigurationScreen
      .clickAddNewSlideButton(3)
      .collapseSlidePanel(3)
      .checkExpandCollapsePanelsFunctionality();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview screen and assert that all changes are applied': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.ONBOARDING)
      .switchToPreviewFrame();

    previewAppScreen
      .assertCorrectBackgroundImageForOnboardingLayoutIsDisplayed(backgroundImageId[0])
      .checkSlidesPaginationBullets(3);
  },

  'Check the 1-st slide on the preview screen': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen
      .checkSlideComponents(slideTitles[0])
      .checkSlideDescription(slideDescriptions[0])
      .assertCorrectSlideImageIsDisplayed(slideImageId[0])
      .checkSlidePagination('next', 2);
  },

  'Check the 2-nd slide on the preview screen and pagination': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen
      .assertCorrectBackgroundImageForOnboardingLayoutIsDisplayed(backgroundImageId[0])
      .checkSlideComponents(slideTitles[1])
      .checkSlideDescription(slideDescriptions[1])
      .assertCorrectSlideImageIsDisplayed(slideImageId[1])
      .checkSlidePagination('prev', 1)
      .checkSlideComponents(slideTitles[0])
      .checkSlideDescription(slideDescriptions[0])
      .assertCorrectSlideImageIsDisplayed(slideImageId[0])
      .assertCorrectBackgroundImageForOnboardingLayoutIsDisplayed(backgroundImageId[0]);
  },

  'Navigate to edit mode to remove the 3-rd slide and change the 1-st slide title': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const editApp = browser.page.editAppScreen();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.ONBOARDING);

    slidesConfigurationScreen
      .removeSlidePanel(3)
      .expandSlidePanel(1)
      .changeSlideTitle(slideTitles[1]);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview mode and check that the 3-rd slide is not present on the preview screen': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.ONBOARDING)
      .switchToPreviewFrame();

    previewAppScreen
      .checkSlideComponents(slideTitles[1])
      .checkSlideDescription(slideDescriptions[0])
      .assertCorrectSlideImageIsDisplayed(slideImageId[0])
      .checkSlidesPaginationBullets(slideTitles.length)
      .assertCorrectBackgroundImageForOnboardingLayoutIsDisplayed(backgroundImageId[0]);
  },

  'Check the slide button functionality': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    previewAppScreen.clickSkipSlidesButton();

    appScreensLeftsidePanel
      .checkTitleOfActiveScreen(screenNameForSkipButton)
      .openScreenByName(introOnboardingScreenName);
  },

  'Check slides on web preview mode': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.openPreviewForDeviceByName('Web');

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.ONBOARDING)
      .switchToPreviewFrame();

    previewAppScreen
      .checkSlideComponents(slideTitles[1])
      .checkSlideDescription(slideDescriptions[0])
      .assertCorrectSlideImageIsDisplayed(slideImageId[0])
      .checkSlidesPaginationBullets(slideTitles.length)
      .assertCorrectBackgroundImageForOnboardingLayoutIsDisplayed(backgroundImageId[0]);
  },

  'Return to mobile mode and check skip button functionality': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    previewAppScreen.openPreviewForDeviceByName('Mobile');

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.ONBOARDING)
      .switchToPreviewFrame();

    previewAppScreen.clickSlideButton(screenNameForSlideButton);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenNameForSlideButton);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
