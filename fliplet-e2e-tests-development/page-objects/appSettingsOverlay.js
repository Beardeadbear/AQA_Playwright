const util = require('util');
const elementAttributes = require('../utils/constants/elementAttributes');
const tokenInYourAppTokenList = '//td[text()="%s"]/parent::tr';
const tokenIdLocatorInYourAppTokenListByTokenName = '//td[text()="%s"]/preceding-sibling::td';
const tokenValueLocatorInYourAppTokenListByTokenName = '//td[text()="%s"]/following-sibling::td[1]';

const commands = {
  verifySettingsScreenIsOpened: function(){
    return this
      .waitForElementVisible('.nav.nav-tabs', this.api.globals.smallWait)
      .assert.containsText('.overlay-title', 'Settings');
  },

  switchToSettingsTabByTabLabel: function(tabLabel){
    const tabTitleLocator  =`//ul[@class='nav nav-tabs']/li/a[text()='${tabLabel}']`;

    this
      .api.useXpath()
      .waitForElementVisible(tabTitleLocator, this.api.globals.mediumWait)
      .click(tabTitleLocator)
      .assert.attributeContains(tabTitleLocator, 'class', 'active', "The chosen tab is open")
      .useCss();

    return this
  },

  tickCheckBoxByLabel: function(label) {
    const checkBoxLocator = `//span[@class='check']/parent::label[@for='${label}']`;

    this
      .api.useXpath()
      .waitForElementVisible(checkBoxLocator, this.api.globals.tinyWait)
      .click(checkBoxLocator)
      .expect.element(checkBoxLocator+`/parent::div/input`).to.be.selected.before(this.api.globals.tinyWait);

    this
      .api.useCss();

    return this;
  },

  enterNewAppName: function(newName){
    this
      .waitForElementVisible('@appNameField', this.api.globals.smallWait)
      .waitForElementVisible('.setting-app-icon', this.api.globals.smallWait)
      .api.pause(2000)
      .clearValue('#f-app-name')
      .setValue('#f-app-name', newName);

    return this;
  },

  clickSaveButton: function(){
    this
      .api.frame(null);

    this
      .waitForElementVisible('@saveButton', this.api.globals.smallWait)
      .click('@saveButton')
      .waitForElementPresent('@successMessageAlert', this.api.globals.smallWait)
      .api.pause(2000);

    return this;
  },

  clickAddNewRuleButton: function(){
    return this
      .waitForElementVisible('@addNewRuleButton', this.api.globals.smallWait)
      .click('@addNewRuleButton')
      .waitForElementVisible('h4.panel-title', this.api.globals.smallWait)
      .api.element('css selector', 'label[for="requirement"] select', function(result){
        this
          .pause(8000)
          .elementIdCssProperty(result.value.ELEMENT, 'visibility', function(visibility){
            //expands rule information if it wasn't expanded automatically after adding new rule
          if(visibility.value !== 'visible'){
            this
              .click('h4.panel-title')
              .waitForElementVisible('label[for="requirement"] select', this.api.globals.smallWait);
          }
        })
      });
  },

  clickAddNewRuleButtonCheckIfExpanded: function(){
    this
      .switchToWidgetProviderFrame()
      .api.pause(2000);

    this
      .waitForElementVisible('@addNewRuleButton', this.api.globals.smallWait)
      .click('@addNewRuleButton')
      .waitForElementVisible('h4.panel-title', this.api.globals.smallWait)
      .api.element('css selector', 'label[for="requirement"] select', function(result){
        this
          .pause(8000)
          .elementIdDisplayed(result.value.ELEMENT, function(visibility){
            //expands rule information if it wasn't expanded automatically after adding new rule
            if (visibility.value == false)
              this.click('h4.panel-title')
          })
        })
      .waitForElementVisible('label[for="requirement"] select', this.api.globals.smallWait);

    return this;
  },

  selectRequiredSecurityConditionByValue: function(value){
    const securityConditionFieldLocator = `select[data-name="requirement"] option[value="${value}"]`;

    this
      .waitForElementPresent(securityConditionFieldLocator, this.api.globals.smallWait)
      .api.pause(1000)
      .click(securityConditionFieldLocator)
      .pause(3000);

    return this;
  },

  expandScreenSelectorDropdown: function () {
    return this
      .waitForElementVisible('@selectScreenDropdown', this.api.globals.mediumWait)
      .click('@selectScreenDropdown')
      .waitForElementVisible('@openedMenu', this.api.globals.smallWait)
  },

  selectScreenRequiredAction: function(screen){
    this
      .api.element('xpath',`//div[contains(@class,"pages-")][not(contains(@class,'hidden'))]//span[text()="${screen}"]`, function(result){
        this.elementIdClick(result.value.ELEMENT);
      })
      .click('.form-group.clearfix[class*=pages]:not([class*=hidden]) span.caret')
      .waitForElementNotVisible('.form-group.clearfix .dropdown-menu.open', this.api.globals.smallWait);

    return this;
  },

  selectScreenForRedirection: function(screen){
    const fieldWithScreenLocator = `//div[@id="screen-list"]//select/option[text()="${screen}"]`;

    this
      .switchToFLWidgetProviderFrame('select#page')
      .api.useXpath()
      .waitForElementVisible(fieldWithScreenLocator)
      .click(fieldWithScreenLocator)
      .useCss();

    return this;
  },

  clickSaveRulesButton: function(){
    this
      .api.frame(null)
      .pause(1000);

    return this
      .waitForElementVisible('@saveButton', this.api.globals.smallWait)
      .clickElementAndCheckVisibilityOfElement('.widget-provider.has-footer footer .btn.btn-primary', '.fade-transition.alert.alert-success')
      .waitForElementPresent('@successMessageAlert', this.api.globals.smallWait);
  },

  switchToLaunchAssetsScreen: function () {
    return this
      .waitForElementVisible('@launchAssetsTab', this.api.globals.smallWait)
      .click('@launchAssetsTab');
  },

  /** @param {Array} screens  - array with screens that are used for screenshots*/
  selectScreensForScreenshotsGeneration: function(screens){
    return this
      .api.useXpath()
      .waitForElementVisible('//div[@class="multiselect"]', this.api.globals.smallWait, ()=>{
        this.api.pause(1000);
        for (let i = 0; i < screens.length; i++) {
          this.api
            .pause(500)
            .click('//input[@name="search"]')
            .pause(2000)
            .isVisible(`//span[text()="${screens[i]}"]`, function(result){
              if(result.value !== true) {
                this.click('//input[@name="search"]')
              }
            })
            .pause(1000)
            .keys([this.api.Keys.ENTER])
            .click('//input[@name="search"]') // to ensure that screen was selected
            .keys([this.api.Keys.ENTER]) // to ensure that screen was selected
            .waitForElementNotPresent('.btn.btn-primary.disabled', this.api.globals.smallWait)
            .pause(1000)
        }
      })
      .useCss();
  },

  clickGenerateScreenshotsButton: function () {
    const resultDisplaying = [];

    return this
      .waitForElementVisible('.generator-result-holder .btn.btn-primary', this.api.globals.mediumWait)
      .api.pause(3000)
      .click('.generator-result-holder .btn.btn-primary') // this click only makes button to be active
      .click('.generator-result-holder .btn.btn-primary') // this clicks the button
      .waitForElementNotPresent('p.text-warning', this.api.globals.longWait)
      .waitForElementNotPresent('.generator-result-holder .fa.fa-spinner.fa-pulse.fa-fw', this.api.globals.longWait)
      .waitForElementPresentWithoutErrors('.status-text p.text-success', this.api.globals.tinyWait, resultDisplaying)
      .perform(function() {
        if (resultDisplaying[0] == false) { // if "undefined" error appeared
          this.api
            .click('.generator-result-holder .btn.btn-primary')
            .waitForElementNotPresent('p.text-warning', this.api.globals.longWait)
            .waitForElementNotPresent('.generator-result-holder .fa.fa-spinner.fa-pulse.fa-fw', this.api.globals.longWait)
            .waitForElementPresent('p.text-success', this.api.globals.mediumWait);
        } else {
          this.api.waitForElementPresent('p.text-success', this.api.globals.mediumWait);
        }
      });
  },

  removeScreensSelection: function(){
    return this
      .waitForElementVisible('input.multiselect__input', this.api.globals.smallWait)
      .api.elements('css selector', 'i.multiselect__tag-icon', (result) => {
        for(let i = result.value.length - 1; i >= 0; i--){
          this.api.elementIdClick(result.value[i].ELEMENT);
        }
      })
      .waitForElementVisible('button[type="submit"]', this.api.globals.smallWait)
      .click('button[type="submit"]')
      .pause(2000);
  },

  switchToAppTokensTab: function () {
    return this
      .waitForElementVisible('@appTokensTab', this.api.globals.smallWait)
      .click('@appTokensTab')
      .waitForElementVisible('@createTokenButton', this.api.globals.smallWait);
  },

  /** @param {String} tokenName - name of created token
   * @param {Array} value - token, looks like eu--<some numbers> */
  assertTokenValueByTokenName: function(tokenName, value){
    return this
      .api.useXpath(()=> {
        this
          .waitForElementVisible(`//table[@class="table table-hover"]//td[text()="${tokenName}"]`, this.api.globals.smallWait)
          .waitForElementVisible('//table[@class="table table-hover"]//td/code', this.api.globals.smallWait)
          .api.pause(1500)
          .assert.containsText('//table[@class="table table-hover"]//td/code', value[0]);
      })
      .useCss();
  },

  clickEditButtonNearTokenByName: function (tokenName) {
    return this
      .api.useXpath()
      .waitForElementVisible(`//td[text()="${tokenName}"]/following-sibling::td/a`, this.api.globals.smallWait)
      .click(`//td[text()="${tokenName}"]/following-sibling::td/a`)
      .useCss()
      .waitForElementVisible('#tokenName', this.api.globals.smallWait)
      .waitForElementNotPresent('.alert.alert-warning', this.api.globals.smallWait)
      .waitForElementVisible('.app-edit-token td .btn.btn-default', this.api.globals.smallWait);
  },

  clickCreateTokenButton: function(){
    return this
      .waitForElementVisible('@createTokenButton', this.api.globals.smallWait)
      .click('@createTokenButton')
      .assert.visible('@tokenNameInputFieldOnCreateTokenModal', 'Create token modal is shown.');
  },

  enterTokenNameOnCreateTokenModal: function(tokenName){
    return this
      .waitForElementVisible('@tokenNameInputFieldOnCreateTokenModal', this.api.globals.smallWait)
      .setValue('@tokenNameInputFieldOnCreateTokenModal', tokenName)
  },

  clickSaveButtonOnCreateTokenModal: function(){
    return this
      .waitForElementVisible('@saveButtonOnCreateTokenModal', this.api.globals.smallWait)
      .click('@saveButtonOnCreateTokenModal')
      .assert.elementNotPresent('@saveButtonOnCreateTokenModal', 'Create token modal is disappeared.');
  },

  assertTokenIsPresentInYourAppTokensListByName: function(tokenName){
    this
      .api.useXpath()
      .waitForElementPresent(util.format(tokenInYourAppTokenList, tokenName), this.api.globals.longWait)
      .assert.visible(util.format(tokenInYourAppTokenList, tokenName), `Token with name ${tokenName} is present in Your app token list.`)
      .useCss();

    return this;
},

  getTokenValueByTokenName: function(tokenName, tokenValue){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(tokenValueLocatorInYourAppTokenListByTokenName, tokenName), this.api.globals.smallWait)
      .getText(util.format(tokenValueLocatorInYourAppTokenListByTokenName, tokenName), (text) => tokenValue.unshift(text.value))
      .useCss();

    return tokenValue;
  },

  getTokenIdByTokenName: function(tokenName, tokenId){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(tokenIdLocatorInYourAppTokenListByTokenName, tokenName), this.api.globals.smallWait)
      .getText(util.format(tokenIdLocatorInYourAppTokenListByTokenName, tokenName), (text) => tokenId.unshift(text.value))
      .useCss();

    return tokenId;
  },

  enterNewTokenName: function (newTokenName) {
    return this
      .api.pause(1500)
      .click('#tokenName')
      .getValue('#tokenName', (value)=> {
        for (let i = 0; i < value.value.length; i++){
          this.api.keys([this.api.Keys.BACK_SPACE]);
        }
      })
      .clearValue('#tokenName')
      .keys([newTokenName]);
  },

  clickSaveButtonForToken: function(){
    return this
      .waitForElementVisible('@saveTokenButton', this.api.globals.smallWait)
      .click('@saveTokenButton')
      .waitForElementNotPresent('@tokenNameField', this.api.globals.smallWait)
  },

  deleteCreatedToken: function () {
    return this
      .waitForElementVisible('.form-control-static', this.api.globals.smallWait)
      .api.pause(5000)
      .waitForElementVisible('.btn.btn-link.text-danger.delete-token', this.api.globals.smallWait)
      .click('.btn.btn-link.text-danger.delete-token')
      .waitForElementVisible('button.btn.btn-danger', this.api.globals.smallWait)
      .click('button.btn.btn-danger')
      .waitForElementNotPresent('.btn.btn-link.text-danger.delete-token', this.api.globals.smallWait);
  },

  assertTokenIsNotPresentInListByName: function (tokenName) {
    return this
      .api.pause(2000)
      .useXpath()
      .assert.elementNotPresent(`//table[@class="table table-hover"]//td[text()="${tokenName}"]`)
      .useCss();
  },

 closeSettingsOverlay: function () {
    return this
      .waitForElementVisible('@closeAppSettingIcon', this.api.globals.smallWait)
      .click('@closeAppSettingIcon')
      .waitForElementNotPresent('.app-settings', this.api.globals.smallWait);
  },

  clickChangeAppIconButton: function () {
    return this
      .waitForElementVisible('.input-group-btn .btn.btn-secondary ', this.api.globals.smallWait)
      .click('.input-group-btn .btn.btn-secondary ')
      .api.pause(1500);
  },

  uploadAppIcon: function (file) {
    return this
      .waitForElementPresent('#f-app-icon', this.api.globals.mediumWait)
      .api.pause(1000)
      .setValue('#f-app-icon', `/files/files/${file}`)
      .waitForElementVisible(`img.setting-app-icon[src*="data"]`, this.api.globals.smallWait);
  },

  switchToAddOnsScreen: function () {
    return this
      .waitForElementVisible('@addOnsTab', this.api.globals.smallWait)
      .click('@addOnsTab')
      .waitForElementVisible('.app-components', this.api.globals.smallWait);
  },

  selectAddOnByName: function (name) {
    return this
      .api.useXpath()
      .waitForElementVisible(`//li/a[text()='${name}']`, this.api.globals.smallWait)
      .click(`//li/a[text()='${name}']`)
      .waitForElementVisible(`//li[@class="active"]/a[text()='${name}']`, this.api.globals.smallWait)
      .useCss()
      .windowHandles(function(result) { // because of click
        this.perform(function(){
          if (result.value.length > 1) { // if "Beta" label for new add-on was clicked
            this.api.switchWindow(result.value[0]) // without this switch "delete app" block falls
          }
        })
      });
  },

  enableAddOn: function () {
    return this
      .waitForElementVisible('@enableAddOnButton', this.api.globals.smallWait)
      .click('@enableAddOnButton')
      .waitForElementVisible('@disableAddOnButton', this.api.globals.mediumWait);
  },

  enterCssAndJsResources: function (resources) {
    this
      .api.frame(null);

    return this
      .switchToWidgetProviderFrame()
      .waitForElementVisible('@textarea', this.api.globals.smallWait)
      .clearValue('@textarea')
      .setValue('@textarea', resources);
  },

  clickSaveButtonWithoutSuccessMessageAssertion: function () {
    this
      .api.frame(null)
      .pause(2000);

    return this
      .waitForElementVisible('@saveButton', this.api.globals.smallWait)
      .click('@saveButton')
      .click('@saveButton'); // added second time to be sure that success message will appear
  },

  checkIfSuccessMessageIsAppeared: function () {
    const resultDisplaying = [];

    this
      .switchToWidgetProviderFrame()
      .waitForElementPresentWithoutErrors('@successMessageAlert', this.api.globals.tinyWait, resultDisplaying)
      .api.perform(function() {
        if (resultDisplaying[0] == false) { // if success message is not visible
          this.api
            .frame(null)
            .click('footer .btn.btn-primary')
            .switchToWidgetProviderFrame()
        }
      });

    return this
      .waitForElementPresent('@successMessageAlert', this.api.globals.tinyWait)
  },

  disableAddOn: function () {
    return this
      .waitForElementVisible('@disableAddOnButton', this.api.globals.smallWait)
      .waitForElementVisible(`.widget-provider.has-footer`, this.api.globals.smallWait)
      .click('@disableAddOnButton')
      .waitForElementVisible(`.modal-dialog .btn.btn-danger`, this.api.globals.smallWait)
      .waitForElementVisible(`.modal-dialog .btn.btn-default`, this.api.globals.smallWait)
      .api.pause(2000)
      .click('.modal-dialog .btn.btn-danger')
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle',  this.api.globals.smallWait)
      .waitForElementNotPresent('.widget-provider.has-footer footer .btn.btn-primary',  this.api.globals.smallWait)
      .waitForElementVisible(`.app-components .btn.btn-success`, this.api.globals.smallWait);
  },

  switchToAboutThisAppScreen: function () {
    return this
      .waitForElementVisible('@aboutThisAppTab', this.api.globals.smallWait)
      .click('@aboutThisAppTab')
      .waitForElementVisible('.app-about #widget-provider', this.api.globals.smallWait);
  },

  enterTitleInAboutThisAppText: function (text) {
    return this
      .switchToWidgetProviderFrame()
      .switchToFrameWhenItIsLoaded('appInfo_ifr')
      .waitForElementVisible('body[data-id="appInfo"] h2', this.api.globals.smallWait)
      .api.element('css selector', 'body[data-id="appInfo"] h2', (result) => {
        this
          .api.moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT)
          .keys([` ${text}`]);
      })
  },

  enterTextInAboutThisAppText: function (text) {
    return this
      .waitForElementVisible('body[data-id="appInfo"] h2', this.api.globals.smallWait)
      .api.element('css selector', 'body[data-id="appInfo"] p', (result) => {
        this
          .api.moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT)
          .keys([this.api.Keys.ENTER])
          .keys([text]);
      })
  },

  switchToAppTemplateScreen: function () {
    return this
      .waitForElementVisible('@appTemplateTab', this.api.globals.smallWait)
      .click('@appTemplateTab')
      .waitForElementVisible('label[for="isOrgTemplate"]', this.api.globals.smallWait)
      .waitForElementVisible('.form-horizontal .btn.btn-primary', this.api.globals.smallWait);
  },

  clickSetAppAsTemplate: function () {
    this
      .waitForElementVisible('@setThisAppAsATemplateCheckbox', this.api.globals.smallWait)
      .api.pause(2000);

    this
      .click('@setThisAppAsATemplateCheckbox')
      .waitForElementVisible('@appTemplatePublishingInfo', this.api.globals.smallWait)
      .api.pause(2000);

    return this;
  },

  getIdOfFramesInAppTemplateTab: function (ids) {
    this
      .api.elements('css selector', '.form-horizontal iframe', function(result){
      for(let i = 0; i < result.value.length; i++){
        this.elementIdAttribute(result.value[i].ELEMENT, elementAttributes.ID, function(id){
          ids.push(id.value);
        })
      }
    });

    return this;
  },

  enterAppTemplateDescription: function (frameID, description) {
    this
      .api.perform(function () {
        const dataId = frameID[0].slice(0, frameID[0].length - 4);

        this.api
          .switchToFrameWhenItIsLoaded(frameID[0])
          .waitForElementVisible(`body[data-id="${dataId}"]`, this.api.globals.smallWait)
          .clearValue(`body[data-id="${dataId}"]`)
          .setValue(`body[data-id="${dataId}"]`, description)
          .frame(null);
      });

    return this;
  },

  enterAppTemplateKeyFeatures: function (frameID, features) {
    this
      .api.perform(function () {
        const dataId = frameID[1].slice(0, frameID[1].length - 4);

        this.api
          .switchToFrameWhenItIsLoaded(frameID[1])
          .waitForElementVisible(`body[data-id="${dataId}"]`, this.api.globals.smallWait)
          .clearValue(`body[data-id="${dataId}"]`)
          .setValue(`body[data-id="${dataId}"]`, features)
          .frame(null);
      });

    return this;
  },

  clickSelectImageForAppTemplate: function () {
    return this
      .waitForElementVisible('.form-horizontal .btn.btn-secondary', this.api.globals.smallWait)
      .click('.form-horizontal .btn.btn-secondary');
  },

  uploadAppTemplatePreview: function(file){
    this
      .waitForElementPresent('#f-template-preview', this.api.globals.mediumWait)
      .api.pause(2000)
      .setValue('#f-template-preview', `/files/files/${file}`)
      .waitForElementPresent('.template-preview-image img', this.api.globals.mediumWait)
      .moveToElement('.template-preview-image img', 0, 0)
      .waitForElementVisible('.template-preview-image img', this.api.globals.mediumWait)
      .pause(2000);

    return this;
  },

  clickSaveButtonAppTemplate: function(){
    this
      .waitForElementPresent('.form-horizontal .btn.btn-primary', this.api.globals.mediumWait)
      .click('.form-horizontal .btn.btn-primary')
      .waitForElementPresent('@successMessageAlert', this.api.globals.mediumWait)
      .api.pause(3000);

    return this;
  },

  removeAppAsTemplate: function () {
    this
      .waitForElementVisible('@setThisAppAsATemplateCheckbox', this.api.globals.smallWait)
      .api.pause(2000);

    this
      .click('@setThisAppAsATemplateCheckbox')
      .waitForElementNotPresent('@appTemplatePublishingInfo', this.api.globals.smallWait)
      .api.pause(2000);

    return this;
  },

  clickChangeSplashScreenButton: function () {
    return this
      .waitForElementVisible('.input-group .btn.btn-secondary', this.api.globals.smallWait)
      .click('.input-group .btn.btn-secondary')
      .waitForElementPresent('#f-app-splash', this.api.globals.mediumWait)
      .api.pause(1500);
  },

  uploadSplashScreen: function(file){
    return this
      .waitForElementPresent('#f-app-splash', this.api.globals.mediumWait)
      .api.pause(2000)
      .setValue('#f-app-splash', `/files/files/${file}`)
      .waitForElementVisible('div.full', this.api.globals.mediumWait)
      .waitForElementVisible('.splash-device', this.api.globals.mediumWait);
  },

  saveChangesLaunchAssets: function(){
    return this
      .waitForElementPresent('.btn.btn-primary[type=submit]', this.api.globals.mediumWait)
      .click('.btn.btn-primary[type=submit]')
      .click('.btn.btn-primary[type=submit]'); // added second time to be sure that success message will appear
  },

  checkThatChangesHasBeenSuccessfullySaved: function(successMessage) {
    return this
      .waitForElementPresent('@successMessageAlert',this.api.globals.smallWait)
      .assert.containsText('@successMessageAlert', successMessage)
  },

  checkErrorMessageAlert: function(errorMessage){
    return this
      .waitForElementPresent('@errorMessageAlert', this.api.globals.smallWait)
      .assert.containsText('@errorMessageAlert', errorMessage);
    },

  clickSeeHowYourSplashScreenLooks: function () {
    return this
      .waitForElementVisible('.form-group div>a', this.api.globals.smallWait)
      .click('.form-group div>a')
      .waitForElementVisible('.frame .splash-device', this.api.globals.smallWait);
  },

  checkThatImageIsUploadedForSplashScreen: function(imageName){
    return this
      .waitForElementVisible('@uploadImageForSplashScreenInLaunchAsset', this.api.globals.smallWait)
      .assert.attributeContains('@uploadImageForSplashScreenInLaunchAsset', 'style', imageName);
  },

  assertImageNameInDevicePreviewImageUrls: function (image) {
    return this
      .waitForElementVisible('.device-holder.tablet.ios .splash-device',  this.api.globals.smallWait)
      .assert.attributeContains('.device-holder.tablet.ios .splash-device', 'style', image)
      .waitForElementVisible('.device-holder.mobile.ios.iphone-x .splash-device',  this.api.globals.smallWait)
      .assert.attributeContains('.device-holder.mobile.ios.iphone-x .splash-device', 'style', image)
      .waitForElementVisible('.device-holder.mobile.android .splash-device',  this.api.globals.smallWait)
      .assert.attributeContains('.device-holder.mobile.android .splash-device', 'style', image)
      .waitForElementVisible('div[class="device-holder mobile ios"] .splash-device',  this.api.globals.smallWait)
      .assert.attributeContains('div[class="device-holder mobile ios"] .splash-device', 'style', image);
  },

  changeBlacklistedAssetsText: function (text) {
    return this
      .waitForElementVisible('#blacklistedAssets',  this.api.globals.smallWait)
      .clearValue('#blacklistedAssets')
      .setValue('#blacklistedAssets', text);
  },

  switchToCustomFontsScreen: function () {
    return this
      .waitForElementVisible('@customFontsTab', this.api.globals.smallWait)
      .click('@customFontsTab')
      .switchToWidgetProviderFrame();
  },

  uploadFontFile: function (file) {
    const resultDisplaying = [];
    const uploadFileLocator  = '#upload-file';
    const fileIsLoadedLocator = '.image-holder.file .image-overlay';

    return this
      .waitForElementPresent(uploadFileLocator, this.api.globals.mediumWait)
      .api.pause(2000)
      .setValue(uploadFileLocator, `/files/files/${file}`)
      .waitForElementPresentWithoutErrors(fileIsLoadedLocator, this.api.globals.smallWait, resultDisplaying)
      .perform(function() {
        if (resultDisplaying[0] == false) {
          this.api.click('a.actionUploadFile')
            .pause(1000)
            .waitForElementPresent(uploadFileLocator, this.api.globals.mediumWait)
            .pause(2000)
            .setValue(uploadFileLocator, `/files/files/${file}`)
        }
      })
      .waitForElementVisible(fileIsLoadedLocator, this.api.globals.smallWait)
      .frame(null);
  },

  openDetailsOfCustomFont: function () {
    return this
      .waitForElementVisible('.thumb-wrapper .btn.btn-link',  this.api.globals.mediumWait)
      .api.pause(2000)
      .click('.thumb-wrapper .btn.btn-link')
      .waitForElementVisible('.dropdown-menu.dropdown-menu-right',  this.api.globals.mediumWait);
  },

  clickDeleteFileButton: function () {
    return this
      .waitForElementVisible('.text-danger.delete-file',  this.api.globals.mediumWait)
      .click('.text-danger.delete-file')
      .api.frame(null)
      .acceptModalWindow()
      .switchToWidgetProviderFrame()
      .waitForElementNotPresent('.image-holder.file',  this.api.globals.mediumWait)
      .frame(null);
  }
};

module.exports = {
  commands: [commands],
  elements: {
    appNameField: {
      selector: '#f-app-name'
    },
    backIconButton: {
      selector: '.exit'
    },
    appSecurityTab: {
      selector: `//li/a[text()="App security"]`,
      locateStrategy: 'xpath'
    },
    addNewRuleButton: {
      selector: '.btn.btn-default.new-hook-page'
    },
    selectScreenDropdown: {
      selector: '.form-group.clearfix[class*=pages]:not([class*=hidden]) button'
    },
    openedMenu: {
      selector: '.form-group.clearfix[class*=pages]:not([class*=hidden]) .dropdown-menu.open'
    },
    saveButton: {
      selector:'.btn.btn-primary[type="submit"], footer .btn.btn-primary'
    },
    launchAssetsTab: {
      selector: `//li/a[text()="Launch assets"]`,
      locateStrategy: 'xpath'
    },
    uploadImageForSplashScreenInLaunchAsset: {
      selector: '.preview-flex .full'
    },
    errorMessageAlert: {
      selector: '.alert.alert-danger'
    },
    successMessageAlert: {
      selector: '.alert.alert-success'
    },
    appTokensTab: {
      selector: `//li/a[text()="App tokens"]`,
      locateStrategy: 'xpath'
    },
    tokenNameField:{
      selector: '#tokenName'
    },
    saveTokenButton: {
      selector: '.app-edit-token .form-group .btn.btn-primary'
    },
    deleteTokenPermanentlyButton: {
      selector: '.btn.btn-link.text-danger.delete-token'
    },
    deleteTokenModalButton: {
      selector: 'button.btn.btn-danger'
    },
    closeAppSettingIcon: {
      selector: '.overlay-close'
    },
    addOnsTab: {
      selector: `//li/a[text()="Add-ons"]`,
      locateStrategy: 'xpath'
    },
    aboutThisAppTab: {
      selector: `//li/a[text()="About this app"]`,
      locateStrategy: 'xpath'
    },
    appTemplateTab: {
      selector: `//li/a[text()="App template"]`,
      locateStrategy: 'xpath'
    },
    customFontsTab: {
      selector: `//li/a[text()="Custom fonts"]`,
      locateStrategy: 'xpath'
    },
    textarea: {
      selector:'textarea.form-control'
    },
    enableAddOnButton: {
      selector:'.btn.btn-success'
    },
    disableAddOnButton: {
      selector: '.pull-right.btn.btn-danger'
    },
    createTokenButton: {
      selector: '//a[text()="Create token"]',
      locateStrategy: 'xpath'
    },
    tokenNameInputFieldOnCreateTokenModal: {
      selector: '.app-edit-token #tokenName'
    },
    saveButtonOnCreateTokenModal: {
      selector: '.app-edit-token .btn.btn-primary'
    },
    appTemplatePublishingInfo: {
      selector:'.callout.callout-warning, .callout.callout-info'
    },
    setThisAppAsATemplateCheckbox: {
      selector: 'label[for="isOrgTemplate"] span'
    }
  }
};