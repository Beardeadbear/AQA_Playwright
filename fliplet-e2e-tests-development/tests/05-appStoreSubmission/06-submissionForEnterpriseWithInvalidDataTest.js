const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const appVersion =`1.0.${casual.month_number}`;
const distributionChannel = 'Enterprise';
const appIconFile = 'icon.png';
const appIcon = 'text_has_31_characters_Lorem_ip';
const valueAppleTeam = 'LDBVG8YCU8';

module.exports = {

  '@disabled': true, //until app store submission tests are fixed
 // '@disabled': (globals.smokeTest === 'true'),

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 06-enterprise-invalid-data`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .deleteCookies()
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new application, open publish screen, change app icon name and app version' : function (browser) {
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.switchToEnterpriseTab();
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm.enterAppIconNameForEnterpriseAndSignedApk(appIcon);
    distributionForm.changeAppVersionForEnterpriseAndSignedApk(appVersion);
    distributionForm.clickSaveProgressButtonForEnterpriseAndSignedApk();
  },

  'Login as Apple developer' : function (browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.enterAppleDeveloperAccountLoginEnterprise(browser.globals.appleEmail)
      .enterAppleDeveloperAccountPasswordEnterprise(browser.globals.applePassword);

    browser.pause(3000);

    distributionForm.clickAppStoreLoginButtonEnterprise();
    distributionForm.verifyUserIsLoggedInWithAppleDeveloperAccountEnterprise(browser.globals.appleEmail);
    distributionForm.selectDeveloperAccountTeam(valueAppleTeam);
    distributionForm.selectUploadYourOwnCertificate();
    distributionForm.clickBrowseCertificateButton();
    distributionForm.uploadAppleEnterpriseCertificate();
  },

  'Configuring an App Store submission with invalid data - Enterprise': function(browser){
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();
    const appSettings = browser.page.appSettingsOverlay();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    // assert build cannot be requested without icon

    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.openAppDetailsTabForEnterpriseAndSignedApk();
    distributionForm.clickSaveProgressButtonForEnterpriseAndSignedApk();

    browser
      .waitForElementVisible('#enterpriseSettings .form-group.clearfix.app-icon-name.has-error .help-block.text-danger.app-details-error', browser.globals.mediumWait)
      .assert.containsText('#enterpriseSettings .form-group.clearfix.app-icon-name.has-error .help-block.text-danger.app-details-error',
      'Upload a 1024 × 1024 pixels image. Click the change button to upload a new app icon.')
      .refresh();

    // add app icon

    publish.openEditMenu();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.clickChangeAppIconButton();
    appSettings.uploadAppIcon(appIconFile);
    appSettings.clickSaveButton();
    appSettings.closeSettingsOverlay();
    editApp.clickPublishMenuItem();

    // assert build cannot be requested with empty icon name

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.switchToEnterpriseTab();
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    browser.pause(3000);

    distributionForm.changeAppVersionForEnterpriseAndSignedApk(appVersion);
    distributionForm.clickLoadTeamsButtonEnterprise();
    distributionForm.selectDeveloperAccountTeam(valueAppleTeam);
    distributionForm.selectUploadYourOwnCertificate();
    distributionForm.clickBrowseCertificateButton();
    distributionForm.uploadAppleEnterpriseCertificate();
    distributionForm.enterAppIconNameForEnterpriseAndSignedApk('');
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('.help-block.with-errors .list-unstyled', browser.globals.mediumWait)
      .assert.containsText('.help-block.with-errors .list-unstyled', 'Please enter an app icon name')
      .click('div[id="enterpriseGeneralHeading"]')
      .waitForElementNotVisible('#fl-ent-iconName', browser.globals.mediumWait);

    // enter app icon name

    distributionForm.enterAppIconNameForEnterpriseAndSignedApk(appIcon);
    distributionForm.clickSaveProgressButtonForEnterpriseAndSignedApk();

    // select developer team again and assert build cannot be requested with empty app version

    distributionForm.changeAppVersionForEnterpriseAndSignedApk('');
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('.help-block.with-errors li', browser.globals.mediumWait)
      .assert.containsText('.help-block.with-errors li', 'Please enter an app version number')
      .click('div[id="enterpriseTechHeading"]')
      .waitForElementNotVisible('#fl-ent-teams', browser.globals.mediumWait)
      .pause(1000);

    // clear bundle ID and assert build cannot be requested

    distributionForm.changeAppVersionForEnterpriseAndSignedApk(appVersion);
    distributionForm.changeBundleIDForEnterpriseAndSignedApk('');
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('.fl-bundleId-field.show .list-unstyled li', browser.globals.mediumWait)
      .assert.containsText('.fl-bundleId-field.show .list-unstyled li', 'Please enter your Bundle ID');

    // logout from apple developer account and assert build cannot be requested without developer account

    distributionForm.typeBundleIDForEnterpriseAndSignedApk('QA_test');
    distributionForm.logoutFromEnterpriseDeveloperAccount();
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('.list-unstyled li', browser.globals.mediumWait)
      .assert.containsText('.list-unstyled li', 'Please enter a password');

    distributionForm.enterAppleDeveloperAccountPasswordEnterprise(browser.globals.applePassword);

    browser.pause(3000);

    distributionForm.clickAppStoreLoginButtonEnterprise();
    distributionForm.verifyUserIsLoggedInWithAppleDeveloperAccountEnterprise(browser.globals.appleEmail);

    browser.pause(3000);

    // assert build cannot be requested without selecting of apple developer team

    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('#fl-ent-teams', browser.globals.mediumWait)
      .assert.cssProperty('#fl-ent-teams', 'border-color', 'rgb(169, 68, 66)');

    // assert build cannot be requested without certificate

    distributionForm.selectDeveloperAccountTeam(valueAppleTeam);
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('#fl-ent-teams', browser.globals.mediumWait)
      .refresh();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser.pause(3000);

    distributionForm.switchToEnterpriseTab();
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    browser.pause(2000);

    distributionForm.changeAppVersionForEnterpriseAndSignedApk(appVersion);
    distributionForm.clickLoadTeamsButtonEnterprise();
    distributionForm.selectDeveloperAccountTeam(valueAppleTeam);
    distributionForm.selectUploadYourOwnCertificate(); // additional assertion that build cannot be requested when "upload certificate" is selected
    distributionForm.clickRequestAppButtonSigned();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser.waitForElementVisible('#fl-ent-teams', browser.globals.mediumWait);
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
