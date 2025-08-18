const casual = require('casual');
const publishingChannels = require('../../utils/constants/publishingChannels');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const moreDropdownMenuOptionsForApp = require('../../utils/constants/moreDropdownMenuOptionsForApp');
const widgets = require('../../utils/constants/widgets');
const description = casual.description;
const keyFeatures = casual.short_description;
const imageForIconName = 'icon.png';
const imageForAppWidgetName = 'parrots_thumb.jpg';
const imageForAppWidgetTemplateId = [];

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 17-app-templ`;
    browser.globals.appNameFromTemplate = `${casual.title} 17-app-using-templ`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.appNameFromTemplate], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and add Image component to the app': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT)
      .dragAndDrop(widgets.IMAGE)
      .waitForWidgetInterface(widgets.IMAGE)
      .checkThatComponentIsPresentOnPreviewScreen(widgets.IMAGE);
  },

  'Configure Image component': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imageForAppWidgetName)
      .assertThatCorrectFileIsSelected(imageForAppWidgetName)
      .getIdsOfSelectedFiles(imageForAppWidgetTemplateId);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Set the app to be a template': function(browser){
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appSettings = browser.page.appSettingsOverlay();

    rightSideNavMenu.openAppSettingScreen();

    appSettings
      .switchToAppTemplateScreen()
      .clickSetAppAsTemplate();
  },

  'Add description, key features and icon image for the app template': function(browser){
    const appSettings = browser.page.appSettingsOverlay();
    const framesID = [];

    appSettings
      .getIdOfFramesInAppTemplateTab(framesID)
      .enterAppTemplateDescription(framesID, description)
      .enterAppTemplateKeyFeatures(framesID, keyFeatures)
      .clickSelectImageForAppTemplate()
      .uploadAppTemplatePreview(imageForIconName)
      .clickSaveButtonAppTemplate()
      .closeSettingsOverlay();
  },

  'Publish the app': function(browser){
    const publishScreen = browser.page.publishScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPublishMode();

    publishScreen
      .clickSelectButtonNearPublishingOptionByChannelName(publishingChannels.PUBLISH_TO_THE_WEB_VIA_A_URL)
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Assert all template details in Apps screen': function(browser){
    const appsPage = browser.page.appsPage();
    const appsCreate = browser.page.createAppOverlay();

    appsPage
      .navigate()
      .waitForAppsPageToBeLoaded()
      .assertAppHasTemplateLabel(browser.globals.appNameGenerated)
      .clickNewAppButton();

    appsCreate
      .assertDetailsOfAppTemplate(browser.globals.appNameGenerated, imageForIconName, description)
      .clickTryDemoAppButtonByAppName(browser.globals.appNameGenerated)
      .assertAppFeaturesDescription(keyFeatures)
      .assertCorrectImageIsDisplayedOnPreviewTemplateScreen(imageForAppWidgetTemplateId[imageForAppWidgetTemplateId.length - 1]);
  },

  'Create a new app using the created template': function(browser){
    const appsCreate = browser.page.createAppOverlay();

    appsCreate
      .clickUseThisTemplateButton()
      .checkAppSetupSection()
      .enterAppName(browser.globals.appNameFromTemplate)
      .clickNextButton();
  },

  'Assert that the image component from the template app is displayed in the new app screen': function(browser){
    const editApp = browser.page.editAppScreen();
    const appsCreate = browser.page.createAppOverlay();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const filePicker = browser.page.filePicker();

    appsCreate.waitForAppEditModeToBeLoaded();

    appTopFixedNavigationBar
      .waitForAppTopFixedNavigationBarTobeLoaded()
      .assertOpenAppTitle(browser.globals.appNameFromTemplate);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.IMAGE);

    filePicker.assertThatCorrectFileIsSelected(imageForAppWidgetName);
  },

  'Make the app not to be a template': function(browser){
    const appSettings = browser.page.appSettingsOverlay();
    const appsPage = browser.page.appsPage();

    appsPage
      .navigate()
      .waitForAppsPageToBeLoaded()
      .expandOptionsForAppByName(browser.globals.appNameGenerated)
      .selectOptionByTitle(browser.globals.appNameGenerated, moreDropdownMenuOptionsForApp.SETTINGS)

    appSettings
      .switchToAppTemplateScreen()
      .removeAppAsTemplate()
      .clickSaveButtonAppTemplate();
  },

  'Assert the template is not present in the templates lists': function(browser){
    const appsPage = browser.page.appsPage();
    const appsCreate = browser.page.createAppOverlay();

    appsPage
      .navigate()
      .waitForAppsPageToBeLoaded()
      .clickNewAppButton();

    appsCreate.assertTemplateIsNotPresentByName(browser.globals.appNameGenerated);
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteApplicationsMatchingParticularName(browser.globals.appNameFromTemplate)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.appNameFromTemplate]);
  }
};