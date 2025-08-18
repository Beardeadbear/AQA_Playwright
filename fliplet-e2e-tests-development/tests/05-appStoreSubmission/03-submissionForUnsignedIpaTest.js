const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const appIcon = casual.word.substr(0, 12);
const appVersion =`1.0.${casual.month_number}`;
const distributionChannel = 'Unsigned IPA';
const appIconFile = 'icon.png';

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 03-unsigned-ipa`;

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

  'Configuring an App Store submission for iOS - Unsigned IPA': function(browser){
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.switchToUnsignedTab();
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //enter app icon name and app version

    distributionForm.enterAppIconNameUnsigned(appIcon);
    distributionForm.changeAppVersionUnsigned(appVersion);

    //save application

    distributionForm.clickSaveProgressButtonUnsigned();

    //verify application icon name and version are saved successfully

    distributionForm.verifyAppIconNameIsSavedUnsigned(appIcon);
    distributionForm.verifyAppVersionUnsigned(appVersion);
    distributionForm.clickRequestAppButtonUnsignedIPA();

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


