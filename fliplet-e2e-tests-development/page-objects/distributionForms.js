const elementAttributes = require('../utils/constants/elementAttributes');
const values = require('../utils/constants/values');

const commands = {
  verifyCorrectDistributionChannelIsSelected: function(distributionChannel){
    this
      .api.useXpath()
      .waitForElementVisible(`//span[text()="${distributionChannel}"]`, this.api.globals.smallWait)
      .expect.element(`//span[text()="${distributionChannel}"]/ancestor::li`).to.have.attribute('class').equals('active');

    this.api.useCss();

    return this;
  },

  checkThatScreenshotsAreSelected: function(){
    return this
      .assert.elementPresent('.row.screenshot-previews .mobile-thumbs')
      .assert.elementPresent('.row.screenshot-previews .tablet-thumbs');
  },

  expandAppStoreListingDetailsAppStore: function () {
    return this
      .api.pause(5000)
      .waitForElementVisible('#appStoreGeneralHeading', this.api.globals.tinyWait)
      .click('#appStoreGeneralHeading')
      .waitForElementVisible('#fl-store-iconName', this.api.globals.smallWait);
  },

  /** Same locators are used both for AppStore and Google Play, one command is used for both*/
  enterAppIconNameForStoreAndMarket: function (name) {
    return this
      .clearValue('@appIconNameField')
      .setValue('@appIconNameField', name);
  },

  enterAppDescription: function(description){
    return this
      .clearValue('@appDescriptionField')
      .setValue('@appDescriptionField', description);
  },

  selectAppPrimaryCategory: function(category){
    return this.api.selectValueFromDropdown('fl-store-category1', category);
  },

  selectPrimaryLanguage: function(language){
    return this.api.selectValueFromDropdown('fl-store-language', language);
  },

  enterKeywords: function(keywords){
    return this
      .api.elements('css selector', 'a.close', function(result){
        for (let i = result.value.length; i > 0; i--){
          this.elementIdClick(result.value[i-1].ELEMENT);
        }
      })
      .setValue('#fl-store-keywords-tokenfield', keywords.join())
      .keys([this.api.Keys.ENTER]);
  },

  selectAvailabilityCountryByName: function (name) {
    return this
      .click('span.filter-option.pull-left')
      .waitForElementVisible('.dropdown-menu.open', this.api.globals.tinyWait)
      .click('.actions-btn.bs-deselect-all.btn.btn-default')
      .click('.dropdown-menu.open input')
      .setValue('.dropdown-menu.open input', name)
      .api.keys([this.api.Keys.ENTER])
      .click('span.filter-option.pull-left');
  },

  enterSupportUrl: function(url){
    return this
      .clearValue('@supportUrlField')
      .setValue('@supportUrlField', url);
  },

  enterMarketingUrl: function(url){
    return this
      .clearValue('@marketingUrlField')
      .setValue('@marketingUrlField', url);
  },

  enterPrivacyPolicyUrl: function(url){
    return this
      .clearValue('@privacyPolicyUrlField')
      .setValue('@privacyPolicyUrlField', url);
  },

  enterCopyright: function(copyright){
    return this
      .clearValue('@copyrightField')
      .setValue('@copyrightField', copyright);
  },

  expandAppStoreTechHeading: function(){
    return this
      .waitForElementVisible('@appTechnicalDetailsAccordionHeading', this.api.globals.longWait)
      .click('@appTechnicalDetailsAccordionHeading')
      .assert.attributeContains('@appTechnicalDetailsAccordionHeadingTitle', elementAttributes.ARIA_EXPANDED, values.TRUE,
        'App technical details are open.');
  },

  collapseAppStoreTechHeading: function(){
    return this
      .waitForElementVisible('@appTechnicalDetailsAccordionHeading', this.api.globals.longWait)
      .click('@appTechnicalDetailsAccordionHeading')
      .assert.attributeContains('@appTechnicalDetailsAccordionHeadingTitle', elementAttributes.ARIA_EXPANDED, values.FALSE,
        'App technical details are closed.');
  },

  /** Same locators are used both for AppStore and Google Play, one command is used for both*/
  changeAppVersionForStoreAndMarket: function(appVersion){
    return this
      .waitForElementVisible('@versionNumberStore', this.api.globals.smallWait)
      .clearValue('@versionNumberStore')
      .setValue('@versionNumberStore', appVersion);
  },

  expandAppSubmissionDetails: function () {
    return this
      .api.element('css selector', '#appStoreContactsHeading', function(result) {
        this.elementIdLocation(result.value.ELEMENT, (location) => {
          this
            .execute(function (location) {
              let x = location.value.x;
              let y = location.value.y - 150;
              window.scrollTo(x, y);
            }, [location])
            .elementIdClick(result.value.ELEMENT)
        })
      })
      .waitForElementVisible('#fl-store-fname', this.api.globals.smallWait);
  },

  enterFirstName: function(firstName){
    return this
      .clearValue('@firstNameField')
      .setValue('@firstNameField', firstName);
  },

  enterLastName: function(lastName){
    return this
      .clearValue('@lastNameField')
      .setValue('@lastNameField', lastName);
  },

  enterAddressLine1: function(addressLine){
    return this
      .clearValue('@addressLine1field')
      .setValue('@addressLine1field', addressLine);
  },

  enterCity: function (city) {
    return this
      .clearValue('@cityField')
      .setValue('@cityField', city);
  },

  enterPostCode: function(postCode){
    return this
      .clearValue('@postCodeField')
      .setValue('@postCodeField', postCode);
  },

  selectCountryByName: function (country) {
    return this.api.selectValueFromDropdown('fl-store-userCountry', country);
  },

  enterPhoneNumber: function (number) {
    return this
      .clearValue('@phoneNumberField')
      .setValue('@phoneNumberField', number);
  },

  enterEmailAddress: function (email) {
    return this
      .clearValue('@emailAddressField')
      .setValue('@emailAddressField', email);
  },

  enterReviewerFirstName: function (firstName) {
    return this
      .clearValue('@reviewerFirstNameField')
      .setValue('@reviewerFirstNameField', firstName);
  },

  enterReviewerLastName: function (lastName) {
    return this
      .clearValue('@reviewerLastNameField')
      .setValue('@reviewerLastNameField', lastName);
  },

  enterReviewerEmailAddress: function (email) {
    return this
      .clearValue('@reviewerEmailAddressField')
      .setValue('@reviewerEmailAddressField', email);
  },

  enterReviewerPhoneNumber: function (phone) {
    return this
      .clearValue('@reviewerPhoneNumberField')
      .setValue('@reviewerPhoneNumberField', phone);
  },

  /** Same locators are used both for AppStore and Google Play, one command is used for both*/
  clickSaveProgressButtonForStoreAndMarket: function () {
    return this
      .waitForElementVisible('@saveProgressButtonStore', this.api.globals.smallWait)
      .clickElementAndCheckVisibilityOfElement('.btn.btn-primary[data-app-store-save]','.text-success.save-appStore-progress')
      .waitForElementVisible('.text-success.save-appStore-progress', this.api.globals.smallWait)
  },

  verifyAppStoreListingDetailsAreSaved: function(name, description, category, language, keywords, country, url, copyright){
    return this
      .assert.value('@appIconNameField', name)
      .assert.value('@appDescriptionField', description)
      .assert.value('#fl-store-category1', category)
      .assert.value('#fl-store-language', language)
      .assert.value('#fl-store-keywords', keywords.join(", "))
      .assert.attributeEquals('.btn.dropdown-toggle.btn-default', 'title', country)
      .assert.value('@supportUrlField', url)
      .assert.value('@marketingUrlField', url)
      .assert.value('@privacyPolicyUrlField', url)
      .assert.value('@copyrightField', copyright);
  },

  /** Same locators are used both for AppStore and Google Play, one command is used for both*/
  verifyAppVersionForStoreAndMarket: function(appVersion){
    return this.assert.value('@versionNumberStore', appVersion);
  },

  verifyAppSubmissionDetailsAreSaved: function (firstName, lastName, address, city, postCode, country, phone, email) {
    return this
      .assert.value('@firstNameField', firstName)
      .assert.value('@lastNameField', lastName)
      .assert.value('@addressLine1field', address)
      .assert.value('@cityField', city)
      .assert.value('@postCodeField', postCode)
      .assert.value('#fl-store-userCountry', country)
      .assert.value('@phoneNumberField', phone)
      .assert.value('@emailAddressField', email)
      .assert.value('@reviewerFirstNameField', firstName)
      .assert.value('@reviewerLastNameField', lastName)
      .assert.value('@reviewerEmailAddressField', email)
      .assert.value('@reviewerPhoneNumberField', phone);
  },

  switchToEnterpriseTab: function(){
    const appListingDetailsPanelLocator= 'div[id="enterpriseGeneralHeading"]';

    return this
      .waitForElementVisible('#enterprise-control', this.api.globals.smallWait)
      .api.pause(3000)
      .click('a[href="#enterprise-tab"]')
      .pause(1000)
      .isVisible(appListingDetailsPanelLocator, function(result){
        if (result.value !== true) {
          this.click('a[href="#enterprise-tab"]');
        }
      })
      .waitForElementVisible(appListingDetailsPanelLocator,this.api.globals.smallWait);
  },

  /** Same locators are used both for AppStore and Google Play, one command is used for both*/
  enterAppIconNameForEnterpriseAndSignedApk: function (name) {
    const iconNameInputFieldLocator = '#fl-ent-iconName';
    const appListingDetailsPanelLocator= 'div[id="enterpriseGeneralHeading"]';

    return this
      .api.pause(3000)
      .waitForElementVisible(appListingDetailsPanelLocator, this.api.globals.smallWait)
      .click(appListingDetailsPanelLocator)
      .waitForElementVisible(iconNameInputFieldLocator, this.api.globals.smallWait)
      .clearValue(iconNameInputFieldLocator)
      .setValue(iconNameInputFieldLocator, name)
      .pause(2000)
  },

  /** Same locators are used both for AppStore and Google Play, one command is used for both*/
  changeAppVersionForEnterpriseAndSignedApk: function(appVersion){
    return this
      .waitForElementVisible('div[id="enterpriseTechHeading"]', this.api.globals.smallWait)
      .click('div[id="enterpriseTechHeading"]')
      .waitForElementVisible('@versionNumberEnterprise', this.api.globals.smallWait)
      .clearValue('@versionNumberEnterprise')
      .setValue('@versionNumberEnterprise', appVersion);
  },

  /** Same locators are used both for AppStore and Google Play, one command is used for both*/
  clickSaveProgressButtonForEnterpriseAndSignedApk: function () {
    const saveProgressButtonEnterpriseLocator = '.btn.btn-primary[data-enterprise-save]';
    const successMessageLocator = '.text-success.save-enterprise-progress';

    return this
      .waitForElementVisible(saveProgressButtonEnterpriseLocator, this.api.globals.smallWait)
      .api.pause(2000)
      .clickElementAndCheckVisibilityOfElement(saveProgressButtonEnterpriseLocator,successMessageLocator)
      .waitForElementPresent(successMessageLocator, this.api.globals.mediumWait)
  },

  /** Same locators are used both for AppStore and Google Play, one command is used for both*/
  verifyAppIconNameIsSavedForEnterpriseAndSignedApk: function (name) {
    return this.assert.value('#fl-ent-iconName', name);
  },

  /** Same locators are used both for AppStore and Google Play, one command is used for both*/
  verifyAppVersionForEnterpriseAndSignedApk: function(appVersion){
    return this.assert.value('@versionNumberEnterprise', appVersion);
  },

  switchToUnsignedTab: function(){
    return this
      .waitForElementVisible('#unsigned-control', this.api.globals.smallWait)
      .api.pause(3000)
      .click('a[href="#unsigned-tab"]')
      .pause(1000)
      .isVisible('div[id="unsignedGeneralHeading"]', function(result){
        if (result.value !== true) {
          this.click('a[href="#unsigned-tab"]');
        }
      })
      .waitForElementVisible('div[id="unsignedGeneralHeading"]',this.api.globals.smallWait);
  },

  enterAppIconNameUnsigned: function (name) {
    return this
      .api.pause(1500)
      .waitForElementVisible('div[id="unsignedGeneralHeading"]', this.api.globals.smallWait)
      .pause(1500)
      .click('div[id="unsignedGeneralHeading"]')
      .waitForElementVisible('#fl-uns-iconName', this.api.globals.smallWait)
      .clearValue('#fl-uns-iconName')
      .setValue('#fl-uns-iconName', name);
  },

  changeAppVersionUnsigned: function(appVersion){
    return this
      .waitForElementVisible('div[id="unsignedTechHeading"]', this.api.globals.smallWait)
      .click('div[id="unsignedTechHeading"]')
      .api.pause(2000)
      .isVisible('#fl-uns-versionNumber', function(displaying) {
        if (displaying.value !== true){
          this.click('div[id="unsignedTechHeading"]')
        }
      })
      .waitForElementVisible('#fl-uns-versionNumber', this.api.globals.mediumWait)
      .clearValue('#fl-uns-versionNumber')
      .setValue('#fl-uns-versionNumber', appVersion);
  },

  clickSaveProgressButtonUnsigned: function () {
    return this
      .waitForElementVisible('@saveProgressButtonUnsigned', this.api.globals.smallWait)
      .clickElementAndCheckVisibilityOfElement('.btn.btn-primary[data-unsigned-save]', '.text-success.save-unsigned-progress')
      .waitForElementVisible('.text-success.save-unsigned-progress', this.api.globals.smallWait);
  },

  verifyAppIconNameIsSavedUnsigned: function (name) {
    return this.assert.value('#fl-uns-iconName', name);
  },

  verifyAppVersionUnsigned: function(appVersion){
    return this.assert.value('@versionNumberUnsigned', appVersion);
  },

  expandAppDetailsGooglePlay: function(){
    return this
      .api.pause(2000)
      .waitForElementVisible('#appStoreSettingsHeading', this.api.globals.smallWait)
      .click('#appStoreSettingsHeading')
      .waitForElementVisible('#fl-store-iconName', this.api.globals.smallWait);
  },

  enterAppVersionCodeGooglePlay: function(versionCode){
    return this
      .clearValue('@appVersionPlay')
      .setValue('@appVersionPlay', versionCode);
  },

  /** Same locators are used for both tabs, one command is used*/
  verifyGooglePlayIconAndVersionCode: function (name, versionCode) {
    return this
      .assert.value('@appIconNameField', name)
      .assert.value('@appVersionPlay', versionCode);
  },

  switchToSignedApkTab: function(){
    return this
      .waitForElementVisible('#fliplet-signed-control', this.api.globals.smallWait)
      .api.pause(3000)
      .click('a[href="#fliplet-signed-tab"]')
      .pause(1000)
      .isVisible('div[id="enterpriseGeneralHeading"]', function(result){
        if (result.value !== true) {
          this.click('a[href="#fliplet-signed-tab"]');
        }
      })
      .waitForElementVisible('div[id="enterpriseGeneralHeading"]',this.api.globals.smallWait);
  },

  enterAppVersionCodeSignedApk: function(versionCode){
    return this
      .clearValue('@appVersionSigned')
      .setValue('@appVersionSigned', versionCode);
  },

  verifyVersionCodeIsSavedForSignedApk: function(versionCode){
    return this.assert.value('@appVersionSigned',versionCode);
  },

  clickRequestAppButtonGooglePlay: function(){
    return this
      .waitForElementVisible('@requestAppPlay', this.api.globals.smallWait)
      .api.pause(2000)
      .click('button[data-app-store-build]')
      .pause(1000);
  },

  clickRequestAppButtonSigned: function(){
    const requestAppSignedLocator = 'button[data-enterprise-build]';

    return this
      .waitForElementVisible(requestAppSignedLocator, this.api.globals.smallWait)
      .api.pause(2000)
      .click(requestAppSignedLocator)
      .pause(1000);
  },

  getNumberOfLastGooglePlayBuild: function (lastBuild) {
    this
      .api.useXpath()
      .getText('(//td[@class="app-build-download"]/div)[1]', (result) =>
        lastBuild.number = parseInt(result.value.split('#')[1]))
      .useCss();

    return lastBuild;
  },

  getNumberOfLastSignedBuild: function (lastBuild) {
    const signed = '//*[contains(@class,"app-build-enterprise-status-holder")]';

    this
      .api.useXpath()
      .getText(`(${signed}//td[@class="app-build-download"]/div)[1]`, (result) =>
        lastBuild.number = parseInt(result.value.split('#')[1]))
      .useCss();

    return lastBuild;
  },

  verifyNumberOfLastGooglePlayBuildIncreased: function (lastBuild) {
    return this
      .api.useXpath()
      .waitForElementNotPresent('//*[@class="app-build-progress-holder"][contains(text(), "In progress")]', 300000)
      .waitForElementVisible('(//*[@class="app-build-progress-holder"][contains(text(), "In testing")])[1]', this.api.globals.smallWait)
      .getText('(//td[@class="app-build-download"]/div)[1]', (result) => {
        const currentBuild = parseInt(result.value.split('#')[1]);
        this.assert.ok(currentBuild > lastBuild.number,
          `Number of the last build is ${currentBuild} now, number of last build before submission was ${lastBuild.number}`);
      })
      .useCss();
  },

  verifyNumberOfLastSignedBuildIncreased: function (lastBuild) {
    const signed = '//*[contains(@class,"app-build-enterprise-status-holder")]';

    return this
      .api.useXpath()
      .waitForElementNotPresent(`//*[@class="app-build-progress-holder"][contains(text(), "In progress")]`, 360000)
      .waitForElementVisible(`(${signed}//div[contains(text(), "In testing")])[1]`, this.api.globals.smallWait)
      .getText(`(${signed}//td[@class="app-build-download"]/div)[1]`, (result) => {
        const currentBuild = parseInt(result.value.split('#')[1]);
        this.assert.ok(currentBuild > lastBuild.number,
          `Number of the last build is ${currentBuild} now, number of last build before submission was ${lastBuild.number}`);
      })
      .useCss();
  },

  getLinkOfLastGooglePlayBuild: function(lastBuild){
    this
      .api.useXpath()
      .getAttribute('(//div[@class="download-build"]/a)[1]', 'href', (result) => {
        lastBuild.link = result.value;
      })
      .useCss();

    return lastBuild;
  },

  getLinkOfLastSignedBuild: function(lastBuild){
    const signed = '//*[contains(@class,"app-build-enterprise-status-holder")]';

    this
      .api.useXpath()
      .getAttribute(`(${signed}//div[@class="download-build"]/a)[1]`, 'href', (result) => {
        lastBuild.link = result.value;
      })
      .useCss();

    return lastBuild;
  },

  downloadLastGooglePlayBuild: function () {
    return this
      .api.refresh()
      .switchToWidgetProviderFrame()
      .waitForElementVisible('.app-build-status', this.api.globals.smallWait)
      .useXpath()
      .click('(//div[@class="download-build"]/a)[1]')
      .pause(1000)
      .keys([this.api.Keys.ENTER])
      .pause(7000)
      .useCss();
  },

  downloadLastSignedBuild: function () {
    const signed = '//*[contains(@class,"app-build-enterprise-status-holder")]';

    return this
      .waitForElementVisible('.app-build-enterprise-status-holder .app-build-status', this.api.globals.smallWait)
      .api.useXpath()
      .click(`(${signed}//div[@class="download-build"]/a)[1]`)
      .pause(1000)
      .keys([this.api.Keys.ENTER])
      .pause(7000)
      .useCss();
  },

  assertApkFileIsPresentInDownloads: function (lastBuild) {
    return this
      .api.url('chrome://downloads/')
      .pause(1000)
      .execute(function(){
        const name = document
          .querySelector('downloads-manager')
          .shadowRoot.querySelector('#downloads-list')
          .getElementsByTagName('downloads-item')[0]
          .shadowRoot.querySelector('#name');

        const link = document
          .querySelector('downloads-manager')
          .shadowRoot.querySelector('#downloads-list')
          .getElementsByTagName('downloads-item')[0]
          .shadowRoot.querySelector('#url');

        return [name, link];
      },[], function(properties) {
        this
          .elementIdText(properties.value[0].ELEMENT, function (downloadedFile) {
            const fileFormat = downloadedFile.value.split(".")[1];
            this.assert.equal(fileFormat, 'apk', `Build is downloaded in .${fileFormat} format`);
          })
          .elementIdText(properties.value[1].ELEMENT, function (linkText) {
            this.assert.equal(linkText.value, lastBuild.link,
              `Link of downloaded .apk is matching link on page`);

          });
      });
  },

  enterAppleDeveloperAccountLogin: function (login) {
    return this
      .waitForElementVisible('.btn.btn-primary.login-appStore-button', this.api.globals.smallWait)
      .waitForElementVisible('.appStore-login-details .alert.alert-info', this.api.globals.smallWait)
      .waitForElementVisible('@appleDeveloperLoginField', this.api.globals.smallWait)
      .clearValue('@appleDeveloperLoginField')
      .setValue('@appleDeveloperLoginField', login);
  },

  enterAppleDeveloperAccountPassword: function (password) {
    return this
      .waitForElementVisible('@appleDeveloperPasswordField', this.api.globals.tinyWait)
      .clearValue('@appleDeveloperPasswordField')
      .setValue('@appleDeveloperPasswordField', password);
  },

  clickAppStoreLoginButton: function () {
    return this
      .waitForElementVisible('@appStoreLoginButton', this.api.globals.tinyWait)
      .moveToElement('@appStoreLoginButton', 10, 10)
      .click('@appStoreLoginButton')
      .moveToElement('@appStoreLoginButton', 10, 10);
  },

  verifyAppleDeveloperPortalErrorMessageIsDisplayed: function (message) {
    return this
      .api.frame(null)
      .waitForElementVisible('.modal-content', this.api.globals.smallWait)
      .waitForElementVisible('.alert.alert-info.alert-sm', this.api.globals.smallWait)
      .waitForElementVisible('.modal-footer .btn.btn-primary', this.api.globals.smallWait)
      .assert.containsText('.alert.alert-info.alert-sm', message);
  },

  verifyUserIsLoggedInWithAppleDeveloperAccount: function (email) {
    const resultDisplaying = [];

    return this
      .waitForElementPresentWithoutErrors('.appStore-logged-in.show', this.api.globals.tinyWait, resultDisplaying)
      .api.perform(function() {
        if (resultDisplaying[0] == false) { // if login is still loading
          this.api
            .refresh()
            .useXpath()
            .waitForElementVisible(`//div[text()="Publish to Apple devices"]/ancestor::div/div/a`, this.api.globals.smallWait)
            .waitForElementVisible(`//div[@class="launch-option-buttons"]`, this.api.globals.smallWait)
            .pause(2500)
            .click(`//div[text()="Publish to Apple devices"]/ancestor::div/div/a`)
            .useCss()
            .pause(2000)
            .element('css selector', '.overlay-title', function(result){
              if(result.status !== 0){
                this
                  .useXpath()
                  .click(`//div[text()="Publish to Apple devices"]/ancestor::div/div/a`);
              }
            })
            .useCss()
            .waitForElementVisible('.overlay-title', this.api.globals.mediumWait)
            .moveToElement(`.row.apple-provider-frame`, 50, 50)
            .switchToWidgetProviderFrame()
            .pause(3000)
            .waitForElementVisible('div[id="appStoreTechHeading"]', this.api.globals.smallWait)
            .click('div[id="appStoreTechHeading"]');
        }
      })
      .waitForElementVisible('.appStore-logged-in.show', this.api.globals.longWait)
      .assert.containsText('.appStore-logged-email', email, 'User is logged in with correct account email')
      .assert.elementPresent('a.log-out-appStore')
      .waitForElementVisible('a.log-out-appStore', this.api.globals.longWait)
      .pause(3000);
  },

  logoutFromAppleDeveloperAccount: function () {
    return this
      .moveToElement('@appStoreLogoutButton', 50, 50)
      .waitForElementVisible('@appStoreLogoutButton', this.api.globals.smallWait)
      .click('@appStoreLogoutButton')
      .waitForElementVisible('@appStoreLoginButton', this.api.globals.smallWait);
  },

  scrollDownAndSwitchToWidgetProviderFrameByDistributionName: function(channelName){
    return this
      .moveToElement(`.row.${channelName.toLowerCase()}-provider-frame`, 50, 50)
      .switchToWidgetProviderFrame()
      .api.pause(3000);
  },

  acceptModalWindowWithError: function(){
    return this
      .api.frame(null)
      .waitForElementVisible('.modal-dialog .modal-content', this.api.globals.smallWait)
      .waitForElementVisible('.modal-dialog .btn.btn-primary', this.api.globals.smallWait)
    //  .assert.elementNotPresent('.modal-dialog .btn.btn-default')
      .click('.modal-dialog .btn.btn-primary');
  },

  changeBundleIDForStoreAndMarket: function(bundleIdValue){
    const resultDisplaying = [];

    return this
      .waitForElementVisible('#appStoreSettings .btn.btn-sm.btn-default', this.api.globals.smallWait)
      .api.pause(1500)
      .click('#appStoreSettings .btn.btn-sm.btn-default')
      .frame(null)
      .waitForElementPresentWithoutErrors('.modal-dialog .modal-content', this.api.globals.tinyWait, resultDisplaying)
      .perform(function() {
        if (resultDisplaying[0] == false) { // if modal window didn't appear
          this.api
            .switchToWidgetProviderFrame()
            .click('#appStoreSettings .btn.btn-sm.btn-default')
            .frame(null)
        }
      })
      .waitForElementVisible('.modal-dialog .modal-content', this.api.globals.smallWait)
      .waitForElementVisible('.modal-dialog .btn.btn-primary', this.api.globals.smallWait)
      .click('.modal-dialog .btn.btn-primary')
      .switchToWidgetProviderFrame()
      .waitForElementVisible('#fl-store-bundleId', this.api.globals.smallWait)
      .clearValue('#fl-store-bundleId')
      .setValue('#fl-store-bundleId', bundleIdValue);
  },

  changeBundleIDForEnterpriseAndSignedApk: function(bundleIdValue) {
    const resultDisplaying = [];

    return this
      .waitForElementVisible('#enterpriseTech .btn.btn-sm.btn-default', this.api.globals.smallWait)
      .api.pause(1500)
      .click('#enterpriseTech .btn.btn-sm.btn-default')
      .frame(null)
      .waitForElementPresentWithoutErrors('.modal-dialog .modal-content', this.api.globals.tinyWait, resultDisplaying)
      .perform(function() {
        if (resultDisplaying[0] == false) { // if modal window didn't appear
          this.api
            .switchToWidgetProviderFrame()
            .click('#enterpriseTech .btn.btn-sm.btn-default')
            .frame(null)
        }
      })
      .waitForElementVisible('.modal-dialog .modal-content', this.api.globals.smallWait)
      .waitForElementVisible('.modal-dialog .btn.btn-primary', this.api.globals.smallWait)
      .click('.modal-dialog .btn.btn-primary')
      .switchToWidgetProviderFrame()
      .waitForElementVisible('#fl-ent-bundleId', this.api.globals.smallWait)
      .clearValue('#fl-ent-bundleId')
      .setValue('#fl-ent-bundleId', bundleIdValue);
  },

  openAppDetailsTabForEnterpriseAndSignedApk: function(){
    return this
      .waitForElementVisible('#accordionEnterprise [href="#enterpriseSettings"]', this.api.globals.smallWait)
      .click('#accordionEnterprise [href="#enterpriseSettings"]')
      .waitForElementVisible('#enterpriseSettings .setting-splash-screen.default', this.api.globals.smallWait);
  },

  expandAppDetailsAppStore: function(){
    return this
      .api.pause(2000)
      .waitForElementPresent('#appStoreSettingsHeading', this.api.globals.smallWait)
      .moveToElement('#appStoreSettingsHeading', 5, 5)
      .waitForElementVisible('#appStoreSettingsHeading', this.api.globals.smallWait)
      .click('#appStoreSettingsHeading')
      .waitForElementVisible('#fl-store-appName', this.api.globals.smallWait);
  },

  enterAppStoreListingName: function (name) {
    return this
      .waitForElementVisible('#fl-store-appName', this.api.globals.smallWait)
      .clearValue('#fl-store-appName')
      .setValue('#fl-store-appName', name);
  },

  clickRequestAppButtonAppStore: function(){
    return this
      .waitForElementVisible('.btn.btn-primary.fl-green.button-appStore-request', this.api.globals.smallWait)
      .api.pause(2000)
      .click('.btn.btn-primary.fl-green.button-appStore-request')
      .pause(1000);
  },

  clickRequestAppButtonUnsignedIPA: function(){
    return this
      .waitForElementVisible('button[data-unsigned-build]', this.api.globals.smallWait)
      .api.pause(2000)
      .click('button[data-unsigned-build]')
      .pause(1000);
  },

  expandAppDetailsUnsignedIPA: function(){
    return this
      .api.pause(2000)
      .waitForElementVisible('#unsignedSettingsHeading', this.api.globals.smallWait)
      .click('#unsignedSettingsHeading');
  },

  changeBundleIDForUnsignedIPA: function(bundleIdValue) {
    const resultDisplaying = [];

    return this
      .waitForElementVisible('#unsignedTech .btn.btn-sm.btn-default', this.api.globals.smallWait)
      .api.pause(1500)
      .click('#unsignedTech .btn.btn-sm.btn-default')
      .frame(null)
      .waitForElementPresentWithoutErrors('.modal-dialog .modal-content', this.api.globals.tinyWait, resultDisplaying)
      .perform(function() {
        if (resultDisplaying[0] == false) { // if modal window didn't appear
          this.api
            .switchToWidgetProviderFrame()
            .click('#unsignedTech .btn.btn-sm.btn-default')
            .frame(null)
        }
      })
      .waitForElementVisible('.modal-dialog .modal-content', this.api.globals.smallWait)
      .waitForElementVisible('.modal-dialog .btn.btn-primary', this.api.globals.smallWait)
      .click('.modal-dialog .btn.btn-primary')
      .switchToWidgetProviderFrame()
      .waitForElementVisible('#fl-uns-bundleId ', this.api.globals.smallWait)
      .clearValue('#fl-uns-bundleId ')
      .setValue('#fl-uns-bundleId ', bundleIdValue)
      .click('#fl-uns-bundleId ');
  },

  selectDeveloperAccountTeam: function(value){
    return this
      .waitForElementVisible('#fl-ent-teams', this.api.globals.smallWait)
      .selectValueFromDropdown('fl-ent-teams', value)
      .waitForElementVisible('label[for="fl-ent-distribution-3"]', this.api.globals.smallWait)
      .api.pause(2000);
  },

  selectUploadYourOwnCertificate: function(){
    return this
      .waitForElementVisible('label[for="fl-ent-distribution-3"] span', this.api.globals.smallWait)
      .api.pause(2000)
      .clickElementAndCheckVisibilityOfElement('label[for="fl-ent-distribution-3"] span', '.enterprise-upload-certificate .btn.btn-default')
      .clickElementAndCheckVisibilityOfElement('label[for="fl-ent-distribution-3"] span', '.enterprise-upload-certificate .btn.btn-default') // to prevent case when radio button is not selected
      .waitForElementVisible('.enterprise-upload-certificate .btn.btn-default', this.api.globals.smallWait)
      .waitForElementNotPresent('.enterprise-generate-file.indented-area.show', this.api.globals.mediumWait)
      .pause(2000);
  },

  uploadAppleEnterpriseCertificate: function(){
    const resultDisappear = [];

    return this
      .waitForElementPresent('#fl-ent-certificate', this.api.globals.mediumWait)
      .api.pause(1000)
      .setValue('#fl-ent-certificate', '/files/files/enterpriseCertificate.p12')
      .assert.value('#fl-ent-certificate-label', `enterpriseCertificate.p12`)
      .waitForElementNotPresentWithoutErrors('.enterprise-generate-file.indented-area.show', this.api.globals.tinyWait, resultDisappear)
      .perform(function() {
        if (resultDisappear[0] == false) { // if "generate certificate" is selected
          this.api.clickElementAndCheckVisibilityOfElement('label[for="fl-ent-distribution-3"] span', '.enterprise-upload-certificate .btn.btn-default');
        }
      })
      .waitForElementNotPresent('.enterprise-generate-file.indented-area.show', this.api.globals.mediumWait);
  },

  enterAppleDeveloperAccountLoginEnterprise: function (login) {
    return this
      .waitForElementVisible('@logInEnterpriseButton', this.api.globals.smallWait)
      .waitForElementVisible('.enterprise-login-details p.help-block.label-helper', this.api.globals.smallWait)
      .waitForElementVisible('@appleDeveloperAccountLoginInputField', this.api.globals.smallWait)
      .clearValue('@appleDeveloperAccountLoginInputField')
      .setValue('@appleDeveloperAccountLoginInputField', login);
  },

  enterAppleDeveloperAccountPasswordEnterprise: function (password) {
    return this
      .waitForElementVisible('@appleDeveloperAccountPasswordInputField', this.api.globals.tinyWait)
      .clearValue('@appleDeveloperAccountPasswordInputField')
      .setValue('@appleDeveloperAccountPasswordInputField', password);
  },

  clickAppStoreLoginButtonEnterprise: function () {
    return this
      .waitForElementVisible('@logInEnterpriseButton', this.api.globals.tinyWait)
      .moveToElement('@logInEnterpriseButton', 10, 10)
      .click('@logInEnterpriseButton');
  },

  verifyUserIsLoggedInWithAppleDeveloperAccountEnterprise: function (email) {
    const correctEmailMessage = 'User is logged in with correct account email';
    const correctEmailMessageLocator = '.enterprise-logged-in.show';

    return this
      .waitForElementVisible(correctEmailMessageLocator, this.api.globals.longWait)
      .assert.containsText(correctEmailMessageLocator, email, correctEmailMessage)
      .assert.elementPresent('@logOutEnterpriseButton')
      .waitForElementVisible('@logOutEnterpriseButton', this.api.globals.longWait)
      .api.pause(3000);
  },

  clickBrowseCertificateButton: function(){
    const uploadCertificateBrowseButtonSelector = '.enterprise-upload-certificate .input-group-btn span';

    return this
      .waitForElementVisible(uploadCertificateBrowseButtonSelector, this.api.globals.smallWait)
      .click(uploadCertificateBrowseButtonSelector)
      .api.pause(1000);
  },

  clickLoadTeamsButtonEnterprise: function() {
    return this
      .waitForElementVisible('#fl-load-ent-teams', this.api.globals.smallWait)
      .api.pause(1000)
      .click('#fl-load-ent-teams')
      .waitForElementVisible('#fl-ent-teams', this.api.globals.smallWait);
  },

  logoutFromEnterpriseDeveloperAccount: function () {
    return this
      .moveToElement('@logOutEnterpriseButton', 50, 50)
      .waitForElementVisible('@logOutEnterpriseButton', this.api.globals.smallWait)
      .click('@logOutEnterpriseButton')
      .waitForElementVisible('@logInEnterpriseButton', this.api.globals.smallWait);
  },

  typeBundleIDForEnterpriseAndSignedApk: function(bundleIdValue) {
    return this
      .waitForElementVisible('#fl-ent-bundleId', this.api.globals.smallWait)
      .clearValue('#fl-ent-bundleId')
      .setValue('#fl-ent-bundleId', bundleIdValue);
  },

  selectDeveloperAccountTeamAppStore: function(value){
    return this
      .waitForElementVisible('#fl-store-teams', this.api.globals.smallWait)
      .selectValueFromDropdown('fl-store-teams', value)
      .waitForElementVisible('label[for="fl-store-distribution-3"]', this.api.globals.smallWait)
      .api.pause(2000);
  },

  selectUploadYourOwnCertificateAppStore: function(){
    return this
      .waitForElementVisible('label[for="fl-store-distribution-3"] span', this.api.globals.smallWait)
      .api.pause(2000)
      .clickElementAndCheckVisibilityOfElement('label[for="fl-store-distribution-3"] span', '.appStore-upload-certificate .btn.btn-default')
      .clickElementAndCheckVisibilityOfElement('label[for="fl-store-distribution-3"] span', '.appStore-upload-certificate .btn.btn-default') // to prevent case when radio button is not selected
      .waitForElementVisible('.appStore-upload-certificate .btn.btn-default', this.api.globals.smallWait)
      .pause(1000);
  },

  clickBrowseCertificateButtonAppStore: function(){
    return this
      .waitForElementVisible('.appStore-upload-certificate .input-group-btn span', this.api.globals.smallWait)
      .api.pause(1500)
      .click('.appStore-upload-certificate .input-group-btn span')
      .pause(2000);
  },

  uploadAppleStoreCertificate: function(){
    return this
      .waitForElementPresent('#fl-store-certificate', this.api.globals.mediumWait)
      .api.pause(1000)
      .setValue('#fl-store-certificate', '/files/files/appStoreCertificate.p12')
      .assert.value('#fl-store-certificate-label', `appStoreCertificate.p12`);
  },

  selectUseExistingScreenshots: function(){
    return this
      .waitForElementPresent('#fl-store-screenshots-existing', this.api.globals.mediumWait)
      .waitForElementVisible('label[for="fl-store-screenshots-existing"] span', this.api.globals.mediumWait)
      .click('label[for="fl-store-screenshots-existing"] span')
      .waitForElementVisible('div[data-item="fl-store-screenshots-existing"]', this.api.globals.mediumWait);
  },

  clickLoadTeamsButtonAppStore: function() {
    return this
      .waitForElementVisible('#fl-load-store-teams', this.api.globals.smallWait)
      .api.pause(4000)
      .click('#fl-load-store-teams')
      .waitForElementVisible('#fl-store-teams', this.api.globals.smallWait);
  },

  clearKeywords: function(){
    return this
      .api.elements('css selector', 'a.close', function(result){
        for (let i = result.value.length; i > 0; i--){
          this.elementIdClick(result.value[i-1].ELEMENT);
        }
      });
  },

  clearAvailabilityCountries: function () {
    return this
      .click('span.filter-option.pull-left')
      .waitForElementVisible('.dropdown-menu.open', this.api.globals.tinyWait)
      .click('.actions-btn.bs-deselect-all.btn.btn-default')
      .click('span.filter-option.pull-left');
  },

  assertErrorsAreVisibleOnPublishOverlay: function (errors) {
    return this
      .api.perform(function () {
        for (let i = 0; i < errors.length; i++) {
          this
            .api.useXpath()
            .waitForElementVisible(`(//div[@class="help-block with-errors"]//li)[${i+1}]`, this.api.globals.longWait)
            .assert.containsText(`(//div[@class="help-block with-errors"]//li)[${i+1}]`, errors[i])
            .useCss();
        }
      })
  },

  changeBundleIDForAppStore: function(bundleIdValue){
    const resultDisplaying = [];

    return this
      .waitForElementVisible('#appStoreTech .btn.btn-sm.btn-default', this.api.globals.smallWait)
      .api.pause(1500)
      .click('#appStoreTech .btn.btn-sm.btn-default')
      .frame(null)
      .waitForElementPresentWithoutErrors('.modal-dialog .modal-content', this.api.globals.tinyWait, resultDisplaying)
      .perform(function() {
        if (resultDisplaying[0] == false) { // if modal window didn't appear
          this.api
            .switchToWidgetProviderFrame()
            .click('#appStoreTech .btn.btn-sm.btn-default')
            .frame(null)
        }
      })
      .waitForElementVisible('.modal-dialog .modal-content', this.api.globals.smallWait)
      .waitForElementVisible('.modal-dialog .btn.btn-primary', this.api.globals.smallWait)
      .click('.modal-dialog .btn.btn-primary')
      .switchToWidgetProviderFrame()
      .waitForElementVisible('#fl-store-bundleId', this.api.globals.smallWait)
      .clearValue('#fl-store-bundleId')
      .setValue('#fl-store-bundleId', bundleIdValue);
  },

  checkIfDeveloperTeamsAreAvailable: function(){
    const resultDisplaying = [];

    return this
      .waitForElementPresentWithoutErrors('.select-proxy-display[style="display: inline-block;"] #fl-store-teams', this.api.globals.tinyWait,
        resultDisplaying)
      .api.perform(function() {
        if (resultDisplaying[0] == false) { // if teams are not available
          this.api
            .waitForElementVisible('#fl-load-store-teams', this.api.globals.smallWait)
            .pause(1000)
            .click('#fl-load-store-teams')
            .waitForElementVisible('#fl-store-teams', this.api.globals.smallWait);
        } else {
          this.api.waitForElementVisible('#fl-store-teams', this.api.globals.smallWait);
        }
      })
  },

  enterAppSpecificPassword: function (password) {
    return this
      .waitForElementVisible('#fl-store-appPassword', this.api.globals.tinyWait)
      .clearValue('#fl-store-appPassword')
      .setValue('#fl-store-appPassword', password);
  },

  checkThatImageIsUploadedForSplashScreen(imageName){
    return this
      .waitForElementVisible('@uploadedImageForSplashScreen', this.api.globals.smallWait)
      .assert.attributeContains('@uploadedImageForSplashScreen', 'style', imageName)
  }
};

module.exports = {
  commands: [commands],
  elements: {
    appIconNameField: {
      selector: '#fl-store-iconName'
    },
    appDescriptionField: {
      selector: '#fl-store-description'
    },
    keywordsField: {
      selector: '#fl-store-keywords-tokenfield'
    },
    supportUrlField: {
      selector: '#fl-store-support'
    },
    marketingUrlField: {
      selector: '#fl-store-marketing'
    },
    privacyPolicyUrlField: {
      selector: '#fl-store-privacy'
    },
    copyrightField: {
      selector: '#fl-store-copyright'
    },
    versionNumberStore: {
      selector: '#fl-store-versionNumber'
    },
    firstNameField: {
      selector: '#fl-store-fname'
    },
    lastNameField: {
      selector: '#fl-store-lname'
    },
    addressLine1field: {
      selector: '#fl-store-address1'
    },
    cityField: {
      selector: '#fl-store-city'
    },
    postCodeField: {
      selector: '#fl-store-postCode'
    },
    phoneNumberField: {
      selector: '#fl-store-phone'
    },
    emailAddressField: {
      selector: '#fl-store-email'
    },
    reviewerFirstNameField: {
      selector: '#fl-store-revFirstName'
    },
    reviewerLastNameField: {
      selector: '#fl-store-revLastName'
    },
    reviewerEmailAddressField: {
      selector: '#fl-store-revEmail'
    },
    reviewerPhoneNumberField: {
      selector: '#fl-store-revPhone'
    },
    saveProgressButtonStore: {
      selector: '.btn.btn-primary[data-app-store-save]'
    },
    versionNumberEnterprise: {
      selector: '#fl-ent-versionNumber'
    },
    versionNumberUnsigned: {
      selector: '#fl-uns-versionNumber'
    },
    saveProgressButtonUnsigned: {
      selector: '.btn.btn-primary[data-unsigned-save]'
    },
    appVersionPlay: {
      selector: '#fl-store-versionCode'
    },
    appVersionSigned: {
      selector: '#fl-ent-versionCode'
    },
    requestAppPlay: {
      selector: 'button[data-app-store-build]'
    },
    appleDeveloperLoginField: {
      selector: '#fl-store-appDevLogin'
    },
    appleDeveloperPasswordField: {
      selector: '#fl-store-appDevPass'
    },
    appStoreLoginButton: {
      selector: '.appStore-login-details .btn.btn-primary.login-appStore-button'
    },
    appStoreLogoutButton: {
      selector: 'a.log-out-appStore'
    },
    logInEnterpriseButton: {
      selector: '.btn.btn-primary.login-enterprise-button'
    },
    logOutEnterpriseButton: {
      selector: 'a.log-out-enterprise'
    },
    appleDeveloperAccountLoginInputField: {
      selector: '#fl-ent-appDevLogin'
    },
    appleDeveloperAccountPasswordInputField: {
      selector: '#fl-ent-appDevPass'
    },
    uploadedImageForSplashScreen: {
      selector: '#appStoreSettings .setting-splash-screen.userUploaded'
    },
    appTechnicalDetailsAccordionHeading: {
      selector: 'div[id="appStoreTechHeading"]'
    },
    appTechnicalDetailsAccordionHeadingTitle: {
      selector: 'div[id="appStoreTechHeading"] h4'
    }
  }
};