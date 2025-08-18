const casual = require('casual');
const globals = require('../../globals_path');
const imageName = 'icon.png';
const jsonErrorMessage = 'The JSON syntax of the assets to be skipped is incorrect.';
const validJSON = '{ "type": "extension", "value": "pdf" }';

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 18-launch-assets`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Upload a new splash screen for the created app in Launch assets': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, 'Directory App');

    rightSideNavMenu.openAppSettingScreen();

    appSettings.switchToLaunchAssetsScreen()
      .clickChangeSplashScreenButton();
    appSettings.uploadSplashScreen(imageName);
    appSettings.saveChangesLaunchAssets();
    appSettings.checkThatChangesHasBeenSuccessfullySaved('saved');

    browser.pause(2000)
      .refresh();

    rightSideNavMenu.openAppSettingScreen();
  },

  'Assert that preview of screens contains image name in URL': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();

    appSettings.switchToLaunchAssetsScreen()
      .clickSeeHowYourSplashScreenLooks()
      .checkThatImageIsUploadedForSplashScreen(imageName)
      .assertImageNameInDevicePreviewImageUrls(imageName);
  },

  'Check Blacklisted Assets block with invalid data': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();

    appSettings.changeBlacklistedAssetsText('test')
      .saveChangesLaunchAssets()
      .checkErrorMessageAlert(jsonErrorMessage);
  },

  'Check Blacklisted Assets block with valid data': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();

    appSettings.changeBlacklistedAssetsText(validJSON)
      .saveChangesLaunchAssets()
      .checkThatChangesHasBeenSuccessfullySaved('saved');
    appSettings.closeSettingsOverlay();
  },

  'Check that a new Splash screen has appeared in Apple submission details': function(browser) {
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected('App Store');
    distributionForm.expandAppDetailsAppStore();
    distributionForm.checkThatImageIsUploadedForSplashScreen(imageName);

    browser.refresh()
      .pause(4000);
  },

  'Check that a new splash screen is visible in Android submission details': function(browser) {
    const distributionForm = browser.page.distributionForms();
    const publish = browser.page.publishScreen();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Android devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.verifyCorrectDistributionChannelIsSelected('Google Play');
    distributionForm.expandAppDetailsGooglePlay();
    distributionForm.checkThatImageIsUploadedForSplashScreen(imageName);
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};