const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const distributionChannel = 'Google Play';
const appIcon = 'text_has_51_characters_Lorem ipsum dolor sit ametc1';
const appIconFile = 'icon.png';

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 03-google-play-invalid-data`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .deleteCookies()
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new application and submit Google Play app details with empty required fields': function(browser){
    const editApp = browser.page.editAppScreen();
    const appSettings = browser.page.appSettingsOverlay();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Android devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm.expandAppDetailsGooglePlay();

    //assert warning about missing screenshots is displayed

    browser
      .waitForElementVisible('div[data-item="fl-store-screenshots-new-warning"]', browser.globals.mediumWait)
      .assert.containsText('div[data-item="fl-store-screenshots-new-warning"]',
      "We couldn't find any generated screenshots of your app!");

    //assert user is not able to request app build without app icon

    distributionForm.enterAppIconNameForStoreAndMarket(appIcon);
    distributionForm.clickRequestAppButtonGooglePlay();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.clickSaveProgressButtonForStoreAndMarket();

    browser
      .waitForElementVisible('#appStoreSettings .form-group.clearfix.app-icon-name.has-error .app-details-error', browser.globals.mediumWait)
      .assert.containsText('#appStoreSettings .form-group.clearfix.app-icon-name.has-error .app-details-error',
      'Upload a 1024 × 1024 pixels image. Click the change button to upload a new app icon.')
      .refresh();

    //add app icon to app

    publish.openEditMenu();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.clickChangeAppIconButton();
    appSettings.uploadAppIcon(appIconFile);
    appSettings.clickSaveButton();
    appSettings.closeSettingsOverlay();
    editApp.clickPublishMenuItem();

    // assert user is not able to request build without icon name

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Android devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm.expandAppDetailsGooglePlay();
    distributionForm.enterAppIconNameForStoreAndMarket('');
    distributionForm.clickRequestAppButtonGooglePlay();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');

    browser
      .waitForElementVisible('.help-block.with-errors .list-unstyled', browser.globals.mediumWait)
      .assert.containsText('.help-block.with-errors .list-unstyled', 'Please enter an app icon name');

    //assert user is not able to enter longer than 50 characters icon name

    distributionForm.enterAppIconNameForStoreAndMarket(appIcon);
    distributionForm.clickSaveProgressButtonForStoreAndMarket();

    browser
      .pause(1000)
      .assert.value('#fl-store-iconName', appIcon.slice(0, -1));

    //clear App Version and assert errors are displayed

    distributionForm
      .changeAppVersionForStoreAndMarket('')
      .clickRequestAppButtonGooglePlay();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter an app version number']);

    //clear Version Code and assert errors are displayed

    distributionForm
      .changeAppVersionForStoreAndMarket('1')
      .enterAppVersionCodeGooglePlay('')
      .clickRequestAppButtonGooglePlay();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter an app version code']);

    //clear Bundle ID and assert app build cannot be requested with empty Build ID value

    distributionForm
      .changeAppVersionForStoreAndMarket('1')
      .enterAppVersionCodeGooglePlay('1000')
      .changeBundleIDForStoreAndMarket('');
    distributionForm.clickRequestAppButtonGooglePlay();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');

    browser
      .waitForElementVisible('.fl-bundleId-field.show .list-unstyled li', browser.globals.mediumWait)
      .assert.containsText('.fl-bundleId-field.show .list-unstyled li', 'Please enter the Bundle ID');
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
