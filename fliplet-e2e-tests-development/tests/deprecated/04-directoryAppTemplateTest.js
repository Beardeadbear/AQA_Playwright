const globals = require('../../globals_path');
const casual = require('casual');
const buttonComponentName = 'com.fliplet.primary-button';
const imageComponentName = 'com.fliplet.image';
const imageName = 'qamadness.png';
const newScreenLayout = 'Article - simple';
const screenNameForButtonInteraction = 'Home';
const screenNameForImageInteraction = casual.word;
const linkOfImage = [];

module.exports = {
  '@disabled': true,
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 42-directory-template`;
    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
      .createAppUsingTemplate(browser.globals.appNameGenerated, 'Directory App');
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new screen for button component and switch to it ': function (browser) {
    const editApp = browser.page.editAppScreen();

    editApp.clickAddScreensButton()
      .selectScreenLayoutByName(newScreenLayout)
      .clickAddScreenButtonOnLayout()
      .enterScreenName(screenNameForImageInteraction)
      .assertScreenIsPresentByName(screenNameForImageInteraction)
      .openScreenByName(screenNameForImageInteraction)
      .assertScreenNameOfActiveScreen(screenNameForImageInteraction);
  },

  'Check ability to delete a component from the screen': function (browser) {
    const editApp = browser.page.editAppScreen();

    editApp.deleteComponentFromScreen(imageComponentName);
  },

  'Drop primary button to screen and edit it': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    browser.newDragAndDrop(buttonComponentName)
      .waitForWidgetInterfaceNewDnd(buttonComponentName)
      .switchToWidgetInstanceFrame();

    componentsScreen.changeComponentLabel(screenNameForButtonInteraction);
    componentsScreen.setLinkActionForComponent(1, 'Display another screen');
    componentsScreen.selectScreenForLinkingByName(screenNameForButtonInteraction);
    componentsScreen.clickSaveAndCloseButton();
  },

  'Drop Image to the screen': function (browser) {
    const editApp = browser.page.editAppScreen();

    editApp.openScreenByName(screenNameForButtonInteraction);
    editApp.deleteComponentFromScreen(imageComponentName);

    browser.newDragAndDrop(imageComponentName)
      .waitForWidgetInterfaceNewDnd(imageComponentName)
      .checkThatComponentIsPresentOnPreviewScreen(imageComponentName)
      .switchToWidgetInstanceFrame();
  },

  'Edit image component - select an image for it ': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();

    componentsScreen.switchToFLWidgetProviderFrame('@createNewFolderButton');
    componentsScreen.selectOrganizationFolder();
    componentsScreen.openFolderForImageComponentByName(browser.globals.imageFolder);
    componentsScreen.selectImageForImageComponentByName(imageName);

    list.getIdOfImageSelectedForListComponent(linkOfImage, imageName);
  },

  'Edit image component settings': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    browser.frameParent();

    componentsScreen.switchToSettingsTab();
    componentsScreen.chooseRadioForImageInteractionSettings('link');
    componentsScreen.setLinkActionForComponent(3, 'Display another screen');
    componentsScreen.selectScreenForLinkingByName(screenNameForImageInteraction);
    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview mode and check the image component': function (browser) {
    const editApp = browser.page.editAppScreen();
    const previewApp = browser.page.previewAppScreen();

    editApp.clickPreviewMenuItem();

    previewApp.assertImageOnPreviewScreen( linkOfImage[0]);

    browser.frameParent();

    previewApp.clickElementOnPreviewScreen('@imageComponent');
    previewApp.assertCorrectScreenIsShown(screenNameForImageInteraction);
  },

  'Check primary button component on preview mode': function (browser) {
    const previewApp = browser.page.previewAppScreen();

    previewApp.clickElementOnPreviewScreen('@buttonComponent');
    previewApp.assertCorrectScreenIsShown(screenNameForButtonInteraction);
  },

  'Publish the application and open it': function (browser) {
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();

    browser.frame(null);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');
    publish.clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish.clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Check the added components functionality on web': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openMenuItemByName(screenNameForButtonInteraction)
      .checkPageTitle(`${screenNameForButtonInteraction} - ${browser.globals.appNameGenerated}`)
      .clickElementOnWebAppScreen('@imageComponent')
      .checkPageTitle(`${screenNameForImageInteraction} - ${browser.globals.appNameGenerated}`)
      .clickElementOnWebAppScreen('@buttonComponent')
      .checkPageTitle(`${screenNameForButtonInteraction} - ${browser.globals.appNameGenerated}`)
      .clickElementOnWebAppScreen('@imageComponent');
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};