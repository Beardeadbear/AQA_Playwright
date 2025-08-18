const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const appVersion =`1.0.${casual.month_number}`;
const appIconFile = 'icon.png';
const appIcon = 'text_has_31_characters_Lorem_ip';
const valueAppleTeam = 'H25Z7T6F52';
const distributionChannel = 'App Store';
const language = 'en-GB';
const appCategory = 'Entertainment';
const country = 'United Kingdom';
const appDescription = casual.description;
const keywords = casual.array_of_words(n = 3);
const copyright = `${casual.year} ${casual.words(n = 2)}`;
const firstName = casual.first_name;
const lastName = casual.last_name;
const address = casual.address1;
const city = casual.city;
const postCode = casual.zip();
const phoneNumber = `+44${casual.phone.split("-").join("")}`;
const email = casual.email;
const url = globals.apiUri;

module.exports = {

  '@disabled': true, //until app store submission tests are fixed
  // '@disabled': (globals.smokeTest === 'true'),

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 07-app-store-invalid-data`;

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

  'Create a new app and choose to publish to App device': function(browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
  },

  'Enter App Store listing details': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.expandAppStoreListingDetailsAppStore();
    distributionForm.enterAppIconNameForStoreAndMarket(appIcon)
        .enterAppDescription(appDescription);
    distributionForm.selectAppPrimaryCategory(appCategory);
    distributionForm.selectPrimaryLanguage(language);
    distributionForm.enterKeywords(keywords);
    distributionForm.selectAvailabilityCountryByName(country);
    distributionForm.enterSupportUrl(url)
        .enterMarketingUrl(url)
        .enterPrivacyPolicyUrl(url)
        .enterCopyright(copyright);
    },

  'Change app version and enter App submission details': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.expandAppStoreTechHeading()
      .changeAppVersionForStoreAndMarket(appVersion);
    distributionForm.expandAppSubmissionDetails();
    distributionForm.enterFirstName(firstName)
      .enterLastName(lastName)
      .enterAddressLine1(address)
      .enterCity(city)
      .enterPostCode(postCode);
    distributionForm.selectCountryByName(country);
    distributionForm.enterPhoneNumber(phoneNumber)
      .enterEmailAddress(email)
      .enterReviewerFirstName(firstName)
      .enterReviewerLastName(lastName)
      .enterReviewerEmailAddress(email)
      .enterReviewerPhoneNumber(phoneNumber)
      .clickSaveProgressButtonForStoreAndMarket();
    distributionForm.expandAppStoreTechHeading()
      .enterAppleDeveloperAccountLogin(browser.globals.appleEmail)
      .enterAppleDeveloperAccountPassword(browser.globals.applePassword);

    browser.pause(4000);

    distributionForm.clickAppStoreLoginButton();
  },

  'Verify user is logged in': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.verifyUserIsLoggedInWithAppleDeveloperAccount(browser.globals.appleEmail);
    distributionForm.checkIfDeveloperTeamsAreAvailable();
    distributionForm.selectDeveloperAccountTeamAppStore(valueAppleTeam);
    distributionForm.selectUploadYourOwnCertificateAppStore();
    distributionForm.clickBrowseCertificateButtonAppStore();
    distributionForm.uploadAppleStoreCertificate();
    distributionForm.collapseAppStoreTechHeading();
    distributionForm.expandAppDetailsAppStore();
    distributionForm.selectUseExistingScreenshots();
    distributionForm.clickSaveProgressButtonForStoreAndMarket();

  },

  'Assert app build cannot be requested without app icon': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('#appStoreSettings .form-group.clearfix.app-icon-name.has-error .help-block.text-danger.app-details-error', browser.globals.mediumWait)
      .assert.containsText('#appStoreSettings .form-group.clearfix.app-icon-name.has-error .help-block.text-danger.app-details-error',
      'Upload a 1024 × 1024 pixels image. Click the change button to upload a new app icon.')
      .refresh();

  },

  'Open the app settings and add app icon': function(browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const appSettings = browser.page.appSettingsOverlay();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.clickChangeAppIconButton();
    appSettings.uploadAppIcon(appIconFile);
    appSettings.clickSaveButton();
    appSettings.closeSettingsOverlay();
  },

  'Navigate to publish mode to assert build cannot be requested with empty store listing name': function(browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm.expandAppStoreTechHeading();
    distributionForm.clickLoadTeamsButtonAppStore();
    distributionForm.selectDeveloperAccountTeamAppStore(valueAppleTeam);
    distributionForm.selectUploadYourOwnCertificateAppStore();
    distributionForm.clickBrowseCertificateButtonAppStore();
    distributionForm.uploadAppleStoreCertificate();
    distributionForm.collapseAppStoreTechHeading();
    distributionForm.expandAppDetailsAppStore();
    distributionForm.enterAppStoreListingName('');
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('#fl-store-appName', browser.globals.mediumWait)
      .assert.cssProperty('#fl-store-appName', 'border-color', 'rgb(169, 68, 66)');

    distributionForm.enterAppStoreListingName(appIcon);
    distributionForm.clickSaveProgressButtonForStoreAndMarket();

    browser
      .pause(1000)
      .assert.value('#fl-store-appName', appIcon.slice(0, -1));
  },

  'Clear app icon name and app description and assert build cannot be requested': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.expandAppStoreListingDetailsAppStore();
    distributionForm
      .enterAppIconNameForStoreAndMarket('')
      .enterAppDescription('');
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter an app icon name',
      'Please enter a description for your app with at least 10 up to 4000 characters']);
  },

  'Assert build cannot be requested with less then 10 characters in app description': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm
      .enterAppIconNameForStoreAndMarket(appIcon)
      .enterAppDescription('123456789');
    distributionForm.clickRequestAppButtonAppStore();

    browser
      .pause(1000)
      .assert.value('#fl-store-iconName', appIcon.slice(0, -1));

    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter a description for your app with at least 10 up to 4000 characters']);
    },

  'Assert build cannot be requested with not selected Primary category and Language': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.enterAppDescription(appDescription);
    distributionForm.selectAppPrimaryCategory('');
    distributionForm.selectPrimaryLanguage('');
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please select a category', 'Please select a language']);
  },

  'Assert build cannot be requested without keywords and availability (Countries)': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.selectAppPrimaryCategory(appCategory);
    distributionForm.selectPrimaryLanguage(language);
    distributionForm.clearKeywords();
    distributionForm.clearAvailabilityCountries();
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter at least one keyword', 'Please select at least one country']);
  },

  'Assert build cannot be requested without support and marketing URLs': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.enterKeywords(keywords);
    distributionForm.selectAvailabilityCountryByName(country);
    distributionForm
      .enterSupportUrl('')
      .enterMarketingUrl('');
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter your Support URL', 'Please enter your Marketing URL']);
  },

  'Assert build cannot be requested without Privacy Policy url and copyright': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.enterSupportUrl(browser.globals.apiUri)
      .enterMarketingUrl(browser.globals.apiUri)
      .enterPrivacyPolicyUrl('')
      .enterCopyright('');
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter your Privacy Policy URL', 'Please enter your Copyright text']);
  },

  'Assert build cannot be requested with not URL input in URL field': function(browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm.enterSupportUrl(firstName)
      .enterMarketingUrl(firstName)
      .enterPrivacyPolicyUrl(firstName)
      .enterCopyright(copyright);
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter your Support URL', 'Please enter your Marketing URL', 'Please enter your Privacy Policy URL']);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
