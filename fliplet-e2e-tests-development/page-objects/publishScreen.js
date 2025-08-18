const util = require('util');
const selectLinkForPublishingChanel = '//div[text()="%s "]/ancestor::div/div[@class="launch-option-buttons"]/a';
const publishToOverlay = '.overlay-title'

const commands = {
  clickSelectButtonNearPublishingOptionByChannelName: function(channelName){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(selectLinkForPublishingChanel, channelName), this.api.globals.smallWait)
      .pause(2500)
      .click(util.format(selectLinkForPublishingChanel, channelName))
      .pause(2000)
      .element('css selector', publishToOverlay, function(result){
        if(result.status !== 0){
          this
            .click(util.format(selectLinkForPublishingChanel, channelName));
        }
      })
      .useCss()
      .waitForElementVisible(publishToOverlay, this.api.globals.mediumWait);

    return this;
  },

  clickPublishButton: function(){
    return this
      .waitForElementVisible('@needHelpLinkOnOnPublishToOverlay', this.api.globals.smallWait)
      .waitForElementVisible('@publishButtonOnPublishToOverlay', this.api.globals.smallWait)
      .click('@publishButtonOnPublishToOverlay');
  },

  assertGeneratedAppUrlContainsAppName: function(appName){
    const casual = require('casual');

    this
      .api.pause(5000)
      .element('css selector', '.modal-content', function(result){
        if (result.status === 0) {
          appName = `${appName}${casual.word.substr(0, 4)}`;
          this
            .waitForElementVisible('.modal-footer .btn.btn-primary', this.globals.smallWait)
            .click('.modal-footer .btn.btn-primary')
            .waitForElementVisible('.bootbox-input.bootbox-input-text.form-control', this.globals.smallWait)
            .clearValue('.bootbox-input.bootbox-input-text.form-control')
            .setValue('.bootbox-input.bootbox-input-text.form-control', appName)
            .waitForElementVisible('.modal-footer .btn.btn-primary', this.globals.smallWait)
            .click('.modal-footer .btn.btn-primary')
        }
      })
      .waitForElementVisible('.static.wrap.url a', this.api.globals.longWait)
      .assert.containsText('.static.wrap.url a', appName.toLowerCase().split(" ").join("-"));

    return this;
  },

  closePublishOverlay: function(){
    return this
      .waitForElementVisible('@closeOverlayButton', this.api.globals.tinyWait)
      .moveToElement('@closeOverlayButton', 0, 0, function(){
        this.doubleClick();
      })
      .waitForElementNotPresent('@closeOverlayButton', this.api.globals.smallWait);
  },

  clickVersionHistoryButton: function(){
    return this
      .waitForElementVisible('@versionHistoryButton', this.api.globals.smallWait)
      .click('@versionHistoryButton')
      .waitForElementVisible('.update-notes-holder', this.api.globals.smallWait);
  },

  assertApplicationVersionNumber: function(appVersion){
    return this
      .api.useXpath()
      .waitForElementVisible('(//div[@class="update-version"])[1]', this.api.globals.smallWait)
      .assert.containsText('(//div[@class="update-version"])[1]', appVersion.toString())
      .useCss();
  },

  clickUpdateYourAppsButton: function(){
    return this
      .waitForElementVisible('@updateYourAppsButton', this.api.globals.smallWait)
      .click('@updateYourAppsButton')
      .waitForElementVisible('@proceedButton', this.api.globals.smallWait);
  },

  confirmApplicationUpdate: function(){
    return this
      .click('@proceedButton')
      .waitForElementVisible('.container.overlay-content', this.api.globals.smallWait)
  },

  enterUpdateText: function(text){
    return this
      .waitForElementVisible('@updateNotesField', this.api.globals.smallWait)
      .setValue('@updateNotesField', text);
  },

  clickUpdateButton: function() {
    return this
      .moveToElement('@updateButton', 0, 0)
      .click('@updateButton')
      .waitForElementVisible('.publishing-app-msg.text-info', this.api.globals.smallWait);
  },

  assertApplicationVersionOnUpdateScreen: function(appVersion){
    return this
      .waitForElementNotPresent('.publishing-app-msg.text-info', this.api.globals.longWait)
      .waitForElementVisible('.app-version>div>p', this.api.globals.mediumWait)
      .assert.containsText('.app-version>div>p', `Current app version: ${appVersion}`);
  },

  clickOpenUrlButtonAndSwitchToOpenedWindow: function(){
    this
      .waitForElementVisible('.btn.btn-danger', this.api.globals.smallWait)
      .waitForElementVisible('.btn.btn-default[success]', this.api.globals.smallWait)
      .waitForElementVisible('@openUrlButton', this.api.globals.smallWait)
      .api.pause(1500)
      .execute(function () {
        const url = document.querySelector(`.copy-holder a`);
        url.click();
      })
      .pause(3000)
      .checkOpenedWindowAndSwitchToIt('.copy-holder a');

    return this;
  },

  getApplicationToken: function (arr) {
    this
      .api.element('css selector', '.wrap.embed', (result) => {
      this.api.elementIdText(result.value.ELEMENT, (text) =>{
        arr.push(text.value.split('"')[1].split("=")[1]);
      })
    });

    return arr;
  },

  clickSeeEmbedCodeButton: function(){
    return this
      .waitForElementVisible('@seeEmbedCodeButton', this.api.globals.tinyWait)
      .click('@seeEmbedCodeButton')
      .waitForElementVisible('.wrap.embed', this.api.globals.tinyWait);
  },

  enterNewTokenName: function(name){
    return this
      .waitForElementVisible('@tokenNameField', this.api.globals.smallWait)
      .clearValue('@tokenNameField')
      .setValue('@tokenNameField', name)
  },

  clickSelectDifferentAppTokenButton: function(){
    return this
      .waitForElementVisible('@selectDifferentTokenButton', this.api.globals.smallWait)
      .click('@selectDifferentTokenButton')
      .waitForElementVisible('.description.help-block', this.api.globals.mediumWait)
      .moveToElement('@createNewTokenButton', 0, 0);
  },

  clickCreateNewTokenButton: function(){
    this
      .waitForElementVisible('@createNewTokenButton', this.api.globals.smallWait)
      .api.pause(2000)
      .element('xpath', '//a[contains(text(), "new token")]', (result)=>{
        this
          .api.moveTo(result.value.ELEMENT)
          .mouseButtonClick(0);
      })
      .frame(null)
      .waitForElementVisible('.bootbox .modal-body', this.api.globals.smallWait);

    return this;
  },

  clickOkButton: function(){
    return this
      .waitForElementVisible('@okTokenButton', this.api.globals.smallWait)
      .click('@okTokenButton')
      .waitForElementNotPresent('.bootbox .modal-body', this.api.globals.smallWait);
  },

  /** @param {Array} arr - an array where to store obtained token link   */
  getTokenLink: function(arr){
    this
      .waitForElementVisible('.wrap.embed', this.api.globals.tinyWait)
      .api.element('css selector', '.wrap.embed', (result) => {
        this.api.elementIdText(result.value.ELEMENT, (text) => {
          return arr.push(text.value.split('"')[1]);
        })
      })
  },

  checkThatPageWithAppLinkIsOpened: function(tokenLink){
    const link = tokenLink instanceof Array ? tokenLink.toString() : tokenLink;

    return this
      .api.url(link)
      .waitForElementVisible('html>body>pre', this.api.globals.smallWait)
      .assert.containsText('html>body>pre', 'PLEASE DO NOT INCLUDE THIS CODE DIRECTLY ON YOUR PAGE');
  },

  openWebApplicationByLinkFromToken: function(screen, name){
    return this
      .api.element('css selector', 'html>body>pre', (result) => {
        this.api.elementIdText(result.value.ELEMENT, (text) => {
          const appLink = text.value.split('"')[3];
          this
            .api.url(appLink)
            .waitForElementVisible('.nav-title>span', this.api.globals.smallWait)
            .assert.title(`${screen} - ${name}`);
        })
      });
  },

  assertUserCannotPublishAppUpdates: function(){
    return this
      .waitForElementVisible('.overlay-title', this.api.globals.smallWait)
      .api.pause(2000)
      .assert.elementNotPresent('.publish-holder .btn.btn-primary');
  },

  /** @param {Array} arr - array with stored values of old and new tokens   */
 assertNewTokenValueNotMatchPrevious: function (arr) {
   return this.assert.notEqual(arr[1], arr[0], 'New token was generated with link not matching previous one');
 },

  openNotificationsOverlay: function(){
   return this
      .waitForElementVisible('@notificationsButton', this.api.globals.tinyWait)
      .click('@notificationsButton');
  },


  clickReviewAndSendNotificationWithEmptyFields: function(notificationTypeID){
    return this
      .waitForElementVisible(`${notificationTypeID} .btn.btn-primary.notification-send`, this.api.globals.tinyWait)
      .api.pause(3000)
      .click(`${notificationTypeID} .btn.btn-primary.notification-send`);
  },

  clickReviewAndSendNotification: function(notificationTypeID){
    const resultDisplaying = [];

    return this
      .waitForElementVisible(`${notificationTypeID} .btn.btn-primary.notification-send`, this.api.globals.tinyWait)
      .api.pause(4000)
      .click(`${notificationTypeID} .btn.btn-primary.notification-send`)
      .frame(null)
      .waitForElementPresentWithoutErrors('.modal-content', this.api.globals.tinyWait, resultDisplaying)
      .perform(function() {
        if (resultDisplaying[0] == false) { // if modal window is not present
          this.api
            .switchToWidgetProviderFrame()
            .click(`${notificationTypeID} .btn.btn-primary.notification-send`);
        }
      });
  },

  clickSendNotificationButtonAndConfirm: function(){
    return this
      .api.frame(null)
      .waitForElementVisible('.modal-content', this.api.globals.smallWait)
      .waitForElementVisible('.modal-footer .btn.btn-primary', this.api.globals.tinyWait)
      .waitForElementVisible('.modal-content .btn.btn-default', this.api.globals.tinyWait)
      .waitForElementPresent('.modal-backdrop.fade.in', this.api.globals.tinyWait)
      .pause(3000)
      .click('.modal-footer .btn.btn-primary')
      .waitForElementNotPresent('.modal-footer .btn.btn-default', this.api.globals.smallWait)
      .pause(3000);
  },

  checkIfNotificationSent: function(successMessage, notificationTypeID){
    const resultDisplaying = [];

    return this
      .waitForElementPresentWithoutErrors('.modal-title', this.api.globals.tinyWait, resultDisplaying)
      .api.perform(function() {
        if (resultDisplaying[0] == false) { // if notification success modal window is not present
          this.api
            .sendNotification(notificationTypeID)
            .waitForElementPresentWithoutErrors('.modal-title', this.api.globals.tinyWait, resultDisplaying)
            .perform(function () {
              if (resultDisplaying[0] == false) { // if notification success modal window is not present
                this.api
                  .sendNotification(notificationTypeID)
                  .waitForElementVisible('.modal-title', this.api.globals.smallWait)
                  .assert.containsText(".modal-title", successMessage)
                  .waitForElementVisible('.modal-footer .btn.btn-primary', this.api.globals.tinyWait)
                  .click('.modal-footer .btn.btn-primary')
                  .pause(1500);
              } else { // if success modal window is present
                this.api
                  .waitForElementVisible('.modal-title', this.api.globals.smallWait)
                  .assert.containsText(".modal-title", successMessage)
                  .waitForElementVisible('.modal-footer .btn.btn-primary', this.api.globals.tinyWait)
                  .click('.modal-footer .btn.btn-primary')
                  .pause(1500);
              }
            })
        } else { // if success modal window is present
          this.api
            .waitForElementVisible('.modal-title', this.api.globals.smallWait)
            .assert.containsText(".modal-title", successMessage)
            .waitForElementVisible('.modal-footer .btn.btn-primary', this.api.globals.tinyWait)
            .click('.modal-footer .btn.btn-primary')
            .pause(1500);
        }
      })
  },

  openEditMenu: function(){
    return this
      .waitForElementVisible('.nav-flow a[href*="edit"]', this.api.globals.smallWait)
      .click('.nav-flow a[href*="edit"]')
      .waitForElementVisible('ul.widgets', this.api.globals.longWait)
      .api.refresh()
      .waitForElementVisible('ul.widgets', this.api.globals.longWait)
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.mediumWait)
      .frame(null);
  },

  selectPushNotificationTab: function(){
    return this
      .waitForElementVisible('a[href="#push-notifications-tab"]', this.api.globals.smallWait)
      .click('a[href="#push-notifications-tab"]')
      .waitForElementVisible('#push-notifications-tab .btn.btn-primary[data-action="new-notification"]', this.api.globals.mediumWait);
  },

  clickNewPushNotificationButton: function(){
    return this
      .waitForElementVisible('@newPushAppNotificationButton', this.api.globals.tinyWait)
      .click('@newPushAppNotificationButton')
      .waitForElementVisible('#push_notification_title', this.api.globals.smallWait)
      .waitForElementVisible('.btn.btn-primary.notification-send', this.api.globals.smallWait);
  },

  selectPermissionPopupTab: function(){
    return this
      .waitForElementVisible('a[href="#settings-tab"]', this.api.globals.smallWait)
      .click('a[href="#settings-tab"]')
      .waitForElementVisible('#popup_title', this.api.globals.mediumWait);
  },

  enterPermissionPopupTitleAndMessage: function(title, message){
    return this
      .waitForElementVisible('input#popup_title', this.api.globals.smallWait)
      .clearValue('input#popup_title')
      .clearValue('textarea#popup_message')
      .setValue('input#popup_title', title)
      .setValue('textarea#popup_message', message)
      .api.pause(2000);
  },

  selectNoSubscribeInsidePortalCheckbox: function(){
    return this
      .waitForElementVisible('.checkbox.checkbox-icon label[for="portal-popup"] span', this.api.globals.smallWait)
      .click('.checkbox.checkbox-icon label[for="portal-popup"] span')
      .api.pause(2000);
  },

  clickSaveButtonPermissionPopupSettings: function(){
    return this
      .api.frame(null)
      .waitForElementVisible('footer .btn.btn-primary', this.api.globals.smallWait)
      .click('footer .btn.btn-primary')
      .switchToWidgetProviderFrame()
      .waitForElementVisible('.settings-saved-app-msg.fade-transition', this.api.globals.smallWait)
      .frame(null);
  },

  enterPushNotificationTitleAndMessage: function(title, message){
    return this
      .waitForElementVisible('input[name="push_notification_title"]', this.api.globals.tinyWait)
      .api.pause(2000)
      .clearValue('input[name="push_notification_title"]')
      .setValue('input[name="push_notification_title"]', title)
      .waitForElementVisible('textarea[name="push_notification_message"]', this.api.globals.smallWait)
      .clearValue('textarea[name="push_notification_message"]')
      .setValue('textarea[name="push_notification_message"]', message)
      .waitForElementVisible('span[id=push-message-count]', this.api.globals.tinyWait);
  },
};

module.exports = {
  commands: [commands],
  elements: {
    previewSubmitText: {
      selector: '.callout.callout-warning .bolder'
    },
    publishButtonOnPublishToOverlay: {
      selector: '.publish-btn-holder button'
    },
    needHelpLinkOnOnPublishToOverlay: {
      selector: '.fa.fa-comments'
    },
    createNewTokenButton: {
      selector: '//a[contains(text(),"new token")]',
      locateStrategy: 'xpath'
    },
    tokenNameField: {
      selector: '.bootbox-input.bootbox-input-text.form-control'
    },
    okTokenButton: {
      selector: 'button[data-bb-handler="confirm"]'
    },
    updateNotesField: {
      selector: 'textarea.form-control'
    },
    updateButton: {
      selector: '.clearfix > .btn.btn-primary'
    },
    generatedAppUrl: {
      selector: '.static.wrap.url a'
    },
    closeOverlayButton: {
      selector: '.overlay-close i'
    },
    versionHistoryButton: {
      selector: '.launch-option-buttons .btn.btn-link'
    },
    proceedButton: {
      selector: 'button[data-bb-handler="confirm"]'
    },
    seeEmbedCodeButton: {
      selector: '.copy-holder .btn.btn-link'
    },
    updateYourAppsButton: {
      selector: '.launch-option-buttons .btn.btn-primary'
    },
    openUrlButton: {
      selector: '.copy-holder a'
    },
    selectDifferentTokenButton: {
      selector: '//button[text()="Select a different app token"]',
      locateStrategy: 'xpath'
    },
    notificationsButton: {
      selector: '//a[@class="btn btn-default"][1]',
      locateStrategy: 'xpath'
    }
  }
};
