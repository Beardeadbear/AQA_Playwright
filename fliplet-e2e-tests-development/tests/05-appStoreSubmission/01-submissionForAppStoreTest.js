const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const today = new Date().toJSON().slice(0,10);
const distributionChannel = 'App Store';
const language = 'en-GB';
const appCategory = 'Entertainment';
const country = 'United Kingdom';
const screens = [];
const appIcon = casual.word.substr(0, 12);
const appDescription = casual.description;
const keywords = casual.array_of_words(n = 3);
const copyright = `${casual.year} ${casual.words(n = 2)}`;
const appVersion =`1.0.${casual.month_number}`;
const firstName = casual.first_name;
const lastName = casual.last_name;
const address = casual.address1;
const city = casual.city;
const postCode = casual.zip();
const phoneNumber = `+44${casual.phone.split("-").join("")}`;
const email = casual.email;
const appIconFile = 'icon.png';

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 01-app-store`;

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

  'Configuring an App Store submission for iOS - AppStore': function(browser){
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const appSettings = browser.page.appSettingsOverlay();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();
    const fileManager = browser.page.fileManagerPage();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const url = browser.globals.apiUri;


    editApp.getNamesOfScreens(screens);

    rightSideNavMenu.openAppSettingScreen();

    //generating screenshots of the application

    appSettings.switchToLaunchAssetsScreen();

    browser.pause(1000);

    appSettings.selectScreensForScreenshotsGeneration(screens);

    browser.pause(1000);

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

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //enter App Store listing details

    distributionForm.expandAppStoreListingDetailsAppStore();
    distributionForm
      .enterAppIconNameForStoreAndMarket(appIcon)
      .enterAppDescription(appDescription);
    distributionForm.selectAppPrimaryCategory(appCategory);
    distributionForm.selectPrimaryLanguage(language);
    distributionForm.enterKeywords(keywords);
    distributionForm.selectAvailabilityCountryByName(country);
    distributionForm
      .enterSupportUrl(url)
      .enterMarketingUrl(url)
      .enterPrivacyPolicyUrl(url)
      .enterCopyright(copyright);

    //change app version

    distributionForm
      .expandAppStoreTechHeading()
      .changeAppVersionForStoreAndMarket(appVersion);

    //enter App submission details

    distributionForm.expandAppSubmissionDetails();

    distributionForm
      .enterFirstName(firstName)
      .enterLastName(lastName)
      .enterAddressLine1(address)
      .enterCity(city)
      .enterPostCode(postCode);

    distributionForm.selectCountryByName(country);

    distributionForm
      .enterPhoneNumber(phoneNumber)
      .enterEmailAddress(email)
      .enterReviewerFirstName(firstName)
      .enterReviewerLastName(lastName)
      .enterReviewerEmailAddress(email)
      .enterReviewerPhoneNumber(phoneNumber)
      .clickSaveProgressButtonForStoreAndMarket();

    //verify App Store listing details were saved

    distributionForm
      .verifyAppStoreListingDetailsAreSaved(appIcon, appDescription, appCategory, language, keywords, country, url, copyright);

    //verify app version is saved

    distributionForm.verifyAppVersionForStoreAndMarket(appVersion);

    //verify App submission details were saved

    distributionForm.verifyAppSubmissionDetailsAreSaved(firstName, lastName, address, city, postCode, country, phoneNumber, email);
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};