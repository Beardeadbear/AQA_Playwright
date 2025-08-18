const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screenLayouts = require('../../utils/constants/screenLayouts');
const appScreenDropdownMenuOptions = require('../../utils/constants/appScreenDropdownMenuOptions');
const componentsConfigurationsTabs = require('../../utils/constants/componentsConfigurationsTabs');
const publishingChannels = require('../../utils/constants/publishingChannels');
const widgets = require('../../utils/constants/widgets');
const backgroundImageName = 'download.jpg';
const slideImageName = 'icon.png';
const onboardingScreenName = casual.word;
const screenNameForSlideButton = 'First screen';
const screenNameForSkipButton = 'Second screen';
const slideTitles = [casual.word, casual.word];
const slideDescriptions = [casual.short_description, casual.short_description];
const backgroundImageId = [];
const slideImageId = [];

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 01-onboarding`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and add a new screen using Onboarding layout': function(browser){
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    rightSideNavMenu.openLayoutsScreen();

    appScreensLeftsidePanel
      .selectScreenLayoutOnPageLayoutsOverlay(screenLayouts.ONBOARDING.toUpperCase())
      .clickAddScreenButtonOnPageLayoutsOverlay()
      .enterScreenNameOnAppScreenModal(onboardingScreenName)
      .clickConfirmButtonOnAppScreenModal()
      .assertScreenIsPresentInAppScreenList(onboardingScreenName)
      .checkTitleOfActiveScreen(onboardingScreenName);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.ONBOARDING);
  },

  'Manage screens for the application to make Onboarding screen to be the first screen': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel
      .openMenuOptionsForScreen(screenNameForSlideButton)
      .selectActionForAppScreen(appScreenDropdownMenuOptions.DELETE)
      .confirmAppScreenDeletion()
      .assertScreenIsNotPresentInAppScreenList(screenNameForSlideButton)
      .openMenuOptionsForScreen(screenNameForSkipButton)
      .selectActionForAppScreen(appScreenDropdownMenuOptions.DUPLICATE)
      .assertScreenIsPresentInAppScreenList(`Copy of ${screenNameForSkipButton}`)
      .openMenuOptionsForScreen(`Copy of ${screenNameForSkipButton}`)
      .selectActionForAppScreen(appScreenDropdownMenuOptions.RENAME)
      .enterScreenNameOnAppScreenModal(screenNameForSlideButton)
      .clickConfirmButtonOnAppScreenModal()
      .assertScreenIsPresentInAppScreenList(screenNameForSlideButton)
      .checkTitleOfActiveScreen(screenNameForSlideButton);
  },

  'Open Onboarding layout configuration': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(onboardingScreenName);

    editAppScreen.openDetailsOfComponentByClickingOnIt(widgets.ONBOARDING);

    componentsScreen
      .assertComponentConfigurationIsOpen('Configure your onboarding slider')
      .switchToTabName(componentsConfigurationsTabs.SLIDER_OPTIONS);
  },

  'Configure slider options - enable skip to the screen': function(browser){
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const componentsScreen = browser.page.componentsScreen();

    slidesConfigurationScreen.configureSkipButtonInSliderOptions();

    componentsScreen.selectScreenForLinkingByName(screenNameForSkipButton);
  },

  'Configure slider options - add background image': function(browser){
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

  'Add the 1-st slide to the screen with a title and description': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    componentsScreen.switchToTabName(componentsConfigurationsTabs.SLIDES);

    slidesConfigurationScreen
      .clickAddNewSlideButton(1)
      .changeSlideTitle(slideTitles[0])
      .changeSlideDescription(slideDescriptions[0]);
  },

  'Add an image to the 1-st slide': function(browser){
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const filePicker = browser.page.filePicker();

    slidesConfigurationScreen.clickAddImageForSliderButton();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(slideImageName)
      .assertThatCorrectFileIsSelected(slideImageName)
      .getIdsOfSelectedFiles(slideImageId)
      .clickSelectAndSaveButton();
  },

  'Add a button to the slide with link to the screen': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    slidesConfigurationScreen.enterTitleForSlideButton(1, screenNameForSlideButton);

    componentsScreen
      .setLinkActionForComponent(1, 'Display another screen')
      .selectScreenForLinkingByName(screenNameForSlideButton);

    slidesConfigurationScreen.collapseSlidePanel(1);
  },

  'Add the 2-nd slide to the screen with a title, description and image': function(browser){
    const filePicker = browser.page.filePicker();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    slidesConfigurationScreen
      .clickAddNewSlideButton(2)
      .changeSlideTitle(slideTitles[1])
      .changeSlideDescription(slideDescriptions[1])
      .clickAddImageForSliderButton();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(slideImageName)
      .assertThatCorrectFileIsSelected(slideImageName)
      .getIdsOfSelectedFiles(slideImageId)
      .clickSelectAndSaveButton();

    slidesConfigurationScreen.collapseSlidePanel(2);
  },

  'Add the 3-nd slide and check slides panels functionality': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();

    slidesConfigurationScreen
      .clickAddNewSlideButton(3)
      .collapseSlidePanel(3)
      .checkExpandCollapsePanelsFunctionality();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview screen and assert that all changes are applied': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.ONBOARDING)
      .switchToPreviewFrame();

    previewAppScreen.assertCorrectBackgroundImageForOnboardingLayoutIsDisplayed(backgroundImageId[0])
      .checkSlidesPaginationBullets(3);
  },

  'Check the first slide on the preview screen': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen
      .checkSlideComponents(slideTitles[0])
      .checkSlideDescription(slideDescriptions[0])
      .assertCorrectSlideImageIsDisplayed(slideImageId[0])
      .checkSlidePagination('next', 2);
  },

  'Check the second slide on the preview screen': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen
      .checkSlideComponents(slideTitles[1])
      .checkSlideDescription(slideDescriptions[1])
      .assertCorrectSlideImageIsDisplayed(slideImageId[1]);
  },

  'Navigate to edit mode and remove the last slide and check that it is not present on the preview screen': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const slidesConfigurationScreen = browser.page.slidesConfigurationScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editAppScreen.openDetailsOfComponentByClickingOnIt(widgets.ONBOARDING);

    slidesConfigurationScreen.removeSlidePanel(3);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview mode and check that the 3-rd slide is not present on the preview screen': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.ONBOARDING)
      .switchToPreviewFrame();

    previewAppScreen
      .checkSlideComponents(slideTitles[0])
      .checkSlideDescription(slideDescriptions[0])
      .assertCorrectSlideImageIsDisplayed(slideImageId[0])
      .checkSlidesPaginationBullets(slideTitles.length)
      .assertCorrectBackgroundImageForOnboardingLayoutIsDisplayed(backgroundImageId[0]);
  },

  'Check the button and skip function': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    previewAppScreen.clickSkipSlidesButton();

    appScreensLeftsidePanel
      .checkTitleOfActiveScreen(screenNameForSkipButton)
      .openScreenByName(onboardingScreenName);

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.ONBOARDING)
      .switchToPreviewFrame();

    previewAppScreen.clickSlideButton(screenNameForSlideButton);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenNameForSlideButton);
  },

  'Publish the application': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publishScreen = browser.page.publishScreen();

    appTopFixedNavigationBar.navigateToPublishMode();

    publishScreen
      .clickSelectButtonNearPublishingOptionByChannelName(publishingChannels.PUBLISH_TO_THE_WEB_VIA_A_URL)
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Check Onboarding screen on web': function(browser){
    const webApp = browser.page.webApplicationPages();

    webApp
      .checkPageTitle(`${onboardingScreenName} - ${browser.globals.appNameGenerated}`)
      .checkOnboardingScreen(2, 2)
      .checkOnboardingSlidesFunctionality()
      .checkSkipButton()
      .checkPageTitle(`${screenNameForSkipButton} - ${browser.globals.appNameGenerated}`)
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
