const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const distributionChannel = 'Google Play';
const appIcon = casual.word.substr(0, 12);
const appVersion =`1.0.${casual.month_number}`;
const versionCode = `${casual.integer(from = 1000, to = 9999)}`;
const today = new Date().toJSON().slice(0,10);
const screens = [];
const appIconFile = 'icon.png';
const lastBuild = {
  number: 0,
  link: ''
};

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 01-google-play`;

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

  'Configuring a Google Play submission for Android - Google Play': function(browser){
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const appSettings = browser.page.appSettingsOverlay();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();
    const fileManager = browser.page.fileManagerPage();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    editApp.getNamesOfScreens(screens);

    rightSideNavMenu.openAppSettingScreen();

    //generating screenshots of the application

    appSettings.switchToLaunchAssetsScreen();
    appSettings.selectScreensForScreenshotsGeneration(screens);
    appSettings.clickGenerateScreenshotsButton();
    appSettings.removeScreensSelection();

    //verifying that screenshots are saved

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .waitForAllFilesToBeLoaded()
      .verifyItemIsPresentInFileManager('Screenshots')
      .tickCheckboxNearFileManagerItem('Screenshots')
      .openActionMenuForSingleSelect()
      .selectOpenOptionInActionMenu()
      .assertFolderIsOpen('Screenshots')
      .waitForAllFilesToBeLoaded()
      .verifyItemIsPresentInFileManager(`Screenshots ${today}`);

    apps
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Android devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Google');

    //enter data for Google Play Submission

    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm.expandAppDetailsGooglePlay();
    distributionForm
      .enterAppIconNameForStoreAndMarket(appIcon)
      .checkThatScreenshotsAreSelected()
      .changeAppVersionForStoreAndMarket(appVersion)
      .enterAppVersionCodeGooglePlay(versionCode)
      .clickSaveProgressButtonForStoreAndMarket();

    //verify data is saved

    distributionForm
      .verifyGooglePlayIconAndVersionCode(appIcon, versionCode)
      .verifyAppVersionForStoreAndMarket(appVersion);

   /* // request an app build
    distributionForm.getNumberOfLastGooglePlayBuild(lastBuild);
    distributionForm.clickRequestAppButtonGooglePlay();

    //confirm that build was added

    distributionForm.verifyNumberOfLastGooglePlayBuildIncreased(lastBuild);
    distributionForm.getLinkOfLastGooglePlayBuild(lastBuild);

    //download last submitted build and check it has a correct file extension

    distributionForm.downloadLastGooglePlayBuild();
    distributionForm.assertApkFileIsPresentInDownloads(lastBuild);*/
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
