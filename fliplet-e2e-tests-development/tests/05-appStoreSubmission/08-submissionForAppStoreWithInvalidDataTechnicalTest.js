const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const appVersion =`1.0.${casual.month_number}`;
const appIconFile = 'icon.png';
const appIcon = 'text_has_31_characters_Lorem_ip';
const valueAppleTeam = 'H25Z7T6F52';
const today = new Date().toJSON().slice(0,10);
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

module.exports = {

  '@disabled': true, //until app store submission tests are fixed
  // '@disabled': (globals.smokeTest === 'true'),

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 08-appStore-invalid-data`;

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

  'Create a new application and open publish screen' : function (browser) {
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu()
    const appSettings = browser.page.appSettingsOverlay();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    rightSideNavMenu.openAppSettingScreen();

    appSettings.clickChangeAppIconButton();
    appSettings.uploadAppIcon(appIconFile);
    appSettings.clickSaveButton();
    appSettings.closeSettingsOverlay();

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
  },

  'Enter App Store listing details' : function (browser) {
    const distributionForm = browser.page.distributionForms();
    const url = browser.globals.apiUri;

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

  'Enter App submission details and change app version' : function (browser) {
    const distributionForm = browser.page.distributionForms();

    distributionForm
      .expandAppStoreTechHeading()
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
    distributionForm
      .expandAppStoreTechHeading()
      .enterAppleDeveloperAccountLogin(browser.globals.appleEmail)
      .enterAppleDeveloperAccountPassword(browser.globals.applePassword);

    browser.pause(4000);

    distributionForm.clickAppStoreLoginButton();
  },

  'Verify user is logged in' : function (browser) {
    const distributionForm = browser.page.distributionForms();
    const publish = browser.page.publishScreen();

    distributionForm.verifyUserIsLoggedInWithAppleDeveloperAccount(browser.globals.appleEmail);
    distributionForm.collapseAppStoreTechHeading();
    distributionForm.expandAppDetailsAppStore();
    distributionForm.selectUseExistingScreenshots();
    distributionForm.clickSaveProgressButtonForStoreAndMarket();

    browser.pause(2000)
      .refresh();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm
      .expandAppStoreTechHeading()
      .clickLoadTeamsButtonAppStore();
    distributionForm.checkIfDeveloperTeamsAreAvailable();
    distributionForm.selectDeveloperAccountTeamAppStore(valueAppleTeam);
    distributionForm.selectUploadYourOwnCertificateAppStore();
    distributionForm.clickBrowseCertificateButtonAppStore();
    distributionForm.uploadAppleStoreCertificate();
    distributionForm.enterAppSpecificPassword(appCategory);
  },

  'Configuring an App Store submission with invalid data - AppStore': function(browser){
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    // assert app build cannot be requested with empty first and last names

    distributionForm.expandAppSubmissionDetails();
    distributionForm
      .enterFirstName('')
      .enterLastName('')
      .clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter your first name', 'Please enter your last name']);

    // assert app build cannot be requested with empty address and city

    distributionForm
      .enterFirstName(firstName)
      .enterLastName(lastName)
      .enterAddressLine1('')
      .enterCity('')
      .clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter your address']);

    browser
      .waitForElementVisible('#fl-store-city', browser.globals.mediumWait)
      .assert.cssProperty('#fl-store-city', 'border-color', 'rgb(169, 68, 66)');

    // assert app build cannot be requested with empty post code and country

    distributionForm
      .enterAddressLine1(address)
      .enterCity(city)
      .enterPostCode('')
      .selectCountryByName('');
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter your post code', 'Please enter your country']);

    // assert app build cannot be requested with empty phone number and email

    distributionForm
      .enterPostCode(postCode)
      .selectCountryByName(country);
    distributionForm
      .enterPhoneNumber('')
      .enterEmailAddress('')
      .clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter a valid phone number', 'Please enter a valid email address']);

    // assert app build cannot be requested with empty reviewer first name and last name

    distributionForm
      .enterPhoneNumber(phoneNumber)
      .enterEmailAddress(email)
      .enterReviewerFirstName('')
      .enterReviewerLastName('')
      .clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter the first name', 'Please enter the last name']);

    // assert app build cannot be requested with empty reviewer email and phone number

    distributionForm
      .enterReviewerFirstName(firstName)
      .enterReviewerLastName(lastName)
      .enterReviewerEmailAddress('')
      .enterReviewerPhoneNumber('')
      .clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter a valid email address', 'Please enter a valid phone number']);

    // assert app build cannot be requested with invalid data in email fields and in phone number fields

    distributionForm
      .enterReviewerEmailAddress('test')
      .enterReviewerPhoneNumber('test')
      .enterPhoneNumber('test')
      .enterEmailAddress('test')
      .clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter a valid phone number', 'Please enter a valid email address',  'Please enter a valid email address', 'Please enter a valid phone number']);

    // assert app build cannot be requested with empty app version

    distributionForm
      .enterPhoneNumber(phoneNumber)
      .enterEmailAddress(email)
      .enterReviewerEmailAddress(email)
      .enterReviewerPhoneNumber(phoneNumber)
      .expandAppStoreTechHeading()
      .changeAppVersionForStoreAndMarket('')
      .clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter an app version number']);

    // assert app build cannot be requested with empty app specific password

    distributionForm
      .changeAppVersionForStoreAndMarket(appVersion)
      .enterAppSpecificPassword('')
      .clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter an app-specific password']);

    // assert app build cannot be requested with empty Bundle ID

    distributionForm
      .enterAppSpecificPassword(appCategory)
      .changeBundleIDForAppStore('');
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('.fl-bundleId-field.show .help-block.with-errors li', browser.globals.smallWait)
      .assert.containsText('.fl-bundleId-field.show .help-block.with-errors li', 'Please enter the Bundle ID');

    // logout from apple developer account and assert build cannot be requested without developer account

    distributionForm.logoutFromAppleDeveloperAccount();

    browser.refresh();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm.expandAppStoreTechHeading();
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.assertErrorsAreVisibleOnPublishOverlay(['Please enter a valid email address', 'Please enter a password']);

    // assert build cannot be requested without selecting of apple developer team

    distributionForm
      .enterAppleDeveloperAccountLogin(browser.globals.appleEmail)
      .enterAppleDeveloperAccountPassword(browser.globals.applePassword);

    browser.pause(3000);

    distributionForm.clickAppStoreLoginButton();
    distributionForm.verifyUserIsLoggedInWithAppleDeveloperAccount(browser.globals.appleEmail);
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.checkIfDeveloperTeamsAreAvailable();

    browser.assert.cssProperty('#fl-store-teams', 'border-color', 'rgb(169, 68, 66)');

    // assert build cannot be requested without certificate

    distributionForm.selectDeveloperAccountTeamAppStore(valueAppleTeam);

    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser.waitForElementVisible('#fl-store-teams', browser.globals.mediumWait);

    distributionForm.selectUploadYourOwnCertificateAppStore();
    distributionForm.clickRequestAppButtonAppStore();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser.waitForElementVisible('#fl-store-teams', browser.globals.mediumWait);
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
