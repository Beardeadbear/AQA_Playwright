const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const distributionChannel = 'Signed APK';
const appIcon = casual.word.substr(0, 12);
const appVersion =`1.0.${casual.month_number}`;
const versionCode = `${casual.integer(from = 1000, to = 9999)}`;
const appIconFile = 'icon.png';
const lastBuild = {
  number: 0,
  link: ''
};

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 02-signed-apk`;

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

  'Configuring a Google Play submission for Android - Signed APK': function (browser) {
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Android devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');
    distributionForm.switchToSignedApkTab();
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //enter data for Apk submission

    distributionForm.enterAppIconNameForEnterpriseAndSignedApk(appIcon);
    distributionForm
      .changeAppVersionForEnterpriseAndSignedApk(appVersion)
      .enterAppVersionCodeSignedApk(versionCode)
      .clickSaveProgressButtonForEnterpriseAndSignedApk();

    //verifying that entered data is saved

    distributionForm
      .verifyAppIconNameIsSavedForEnterpriseAndSignedApk(appIcon)
      .verifyAppVersionForEnterpriseAndSignedApk(appVersion)
      .verifyVersionCodeIsSavedForSignedApk(versionCode);
    distributionForm.clickRequestAppButtonSigned();

    //assert modal window for app requesting is displayed

    browser
      .frame(null)
      .waitForElementVisible('.modal-content', browser.globals.mediumWait)
      .waitForElementVisible('.modal-content .btn.btn-primary', browser.globals.mediumWait);

    /*// request an app build
    distributionForm.getNumberOfLastSignedBuild(lastBuild);
    distributionForm.clickRequestAppButtonSigned();

    //confirm that build was added

    distributionForm.verifyNumberOfLastSignedBuildIncreased(lastBuild);
    distributionForm.getLinkOfLastSignedBuild(lastBuild);

    //download last submitted build and check it has a correct file extension

    browser
      .refresh()
      .switchToWidgetProviderFrame();

    distributionForm.switchToSignedApkTab();

    distributionForm.downloadLastSignedBuild();
    distributionForm.assertApkFileIsPresentInDownloads(lastBuild);*/
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};