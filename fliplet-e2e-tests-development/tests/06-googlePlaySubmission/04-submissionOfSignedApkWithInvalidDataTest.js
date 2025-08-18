const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const distributionChannel = 'Signed APK';
const appIcon = 'text_has_51_characters_Lorem ipsum dolor sit ametc1';
const appIconFile = 'icon.png';

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 04-signed-apk-invalid-data`;

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

  'Submitting of Signed APK app details with empty required fields': function(browser){
    const editApp = browser.page.editAppScreen();
    const appSettings = browser.page.appSettingsOverlay();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Android devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.switchToSignedApkTab();
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //assert user is not able to request build without app icon

    distributionForm.enterAppIconNameForEnterpriseAndSignedApk('icon');
    distributionForm.openAppDetailsTabForEnterpriseAndSignedApk();
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');

    browser
      .waitForElementVisible('#enterpriseSettings .form-group.clearfix.app-icon-name.has-error .help-block.text-danger.app-details-error', browser.globals.mediumWait)
      .assert.containsText('#enterpriseSettings .form-group.clearfix.app-icon-name.has-error .help-block.text-danger.app-details-error', 'Click the change button to upload an app icon')
      .refresh();

    //add app icon to app

    publish.openEditMenu();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.clickChangeAppIconButton();
    appSettings.uploadAppIcon(appIconFile);
    appSettings.clickSaveButton();
    appSettings.closeSettingsOverlay();
    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Android devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');

    //assert error about empty icon name is displayed

    distributionForm.switchToSignedApkTab();
    distributionForm.enterAppIconNameForEnterpriseAndSignedApk('');
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');

    browser
      .waitForElementVisible('.help-block.with-errors .list-unstyled', browser.globals.mediumWait)
      .assert.containsText('.help-block.with-errors .list-unstyled', 'Please enter an app icon name')
      .click('div[id="enterpriseGeneralHeading"]')
      .waitForElementNotVisible('#fl-ent-iconName', browser.globals.smallWait);

    //assert user is not able to enter longer than 50 characters icon name

    distributionForm.enterAppIconNameForEnterpriseAndSignedApk(appIcon);
    distributionForm.clickSaveProgressButtonForEnterpriseAndSignedApk();

    browser
      .pause(1000)
      .assert.value('#fl-ent-iconName', appIcon.slice(0, -1));

    //clear App Version Number and assert errors are displayed

    distributionForm.changeAppVersionForEnterpriseAndSignedApk('');
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter an app version number']);

    browser
      .click('div[id="enterpriseTechHeading"]')
      .waitForElementNotVisible('#fl-ent-versionNumber', browser.globals.smallWait);

    //clear Version Code and assert errors are displayed

    distributionForm
      .changeAppVersionForEnterpriseAndSignedApk('1')
      .enterAppVersionCodeSignedApk('');
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter an app version code']);

    //clear Bundle ID and assert app build cannot be requested with empty Build ID value

    distributionForm.switchToSignedApkTab();
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm
      .enterAppVersionCodeSignedApk('1000')
      .changeBundleIDForEnterpriseAndSignedApk('');
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');

    browser
      .waitForElementVisible('.fl-bundleId-field.show .list-unstyled li', browser.globals.mediumWait)
      .assert.containsText('.fl-bundleId-field.show .list-unstyled li', 'Please enter your Bundle ID');
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
