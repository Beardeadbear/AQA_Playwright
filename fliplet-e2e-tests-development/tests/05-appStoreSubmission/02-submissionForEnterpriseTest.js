const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const appIcon = casual.word.substr(0, 12);
const appVersion =`1.0.${casual.month_number}`;
const distributionChannel = 'Enterprise';
const appIconFile = 'icon.png';
const valueAppleTeam = 'LDBVG8YCU8';

module.exports = {

  '@disabled': true, //until app store submission tests are fixed

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 02-enterprise`;

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

  'Create a new application and set an icon for it': function (browser) {
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appSettings = browser.page.appSettingsOverlay();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    rightSideNavMenu.openAppSettingScreen();

    appSettings.clickChangeAppIconButton();
    appSettings.uploadAppIcon(appIconFile);
    appSettings.clickSaveButton();
    appSettings.closeSettingsOverlay();
  },

  'Configuring an App Store submission for iOS - Enterprise': function(browser){
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.switchToEnterpriseTab();
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //change app icon name and app version

    distributionForm.enterAppIconNameForEnterpriseAndSignedApk(appIcon);
    distributionForm.changeAppVersionForEnterpriseAndSignedApk(appVersion);

    //click 'Save Progress' button and verify changes have bn save

    distributionForm.clickSaveProgressButtonForEnterpriseAndSignedApk();
    distributionForm
      .verifyAppIconNameIsSavedForEnterpriseAndSignedApk(appIcon)
      .verifyAppVersionForEnterpriseAndSignedApk(appVersion);

    // login as apple developer

    distributionForm
      .enterAppleDeveloperAccountLoginEnterprise(browser.globals.appleEmail)
      .enterAppleDeveloperAccountPasswordEnterprise(browser.globals.applePassword);

    browser.pause(3000);

    distributionForm.clickAppStoreLoginButtonEnterprise();
    distributionForm.verifyUserIsLoggedInWithAppleDeveloperAccountEnterprise(browser.globals.appleEmail);
    distributionForm.selectDeveloperAccountTeam(valueAppleTeam);
    distributionForm.selectUploadYourOwnCertificate();
    distributionForm.clickBrowseCertificateButton();
    distributionForm.uploadAppleEnterpriseCertificate();

    browser.pause(2000);
    
    distributionForm.clickRequestAppButtonSigned();

    //assert modal window for app requesting is displayed

    browser
      .frame(null)
      .waitForElementVisible('.modal-content', browser.globals.mediumWait)
      .waitForElementVisible('.modal-content .btn.btn-primary', browser.globals.mediumWait)
      .assert.elementPresent('.modal-dialog .btn.btn-default');
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};