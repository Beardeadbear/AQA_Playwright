const util = require('util');
const activeContentStep = '(//div[@class="steps-holder"]/div[contains(@class,"step")])[%d]';
const notificationTitle = '//tr[@data-notification-id]/td/p[2]/strong[text()="%s"]';
const notificationMessage = '(//tr[@data-notification-id]/td/p[2])[%d]';
const notificationLabel = '(//tr[@data-notification-id]//span)[%d]';
const actionButtonForNotification = '(//tr[@data-notification-id]//i[contains(@class, "%s")])[%d]'; //pencil, copy, trash
const notesButtonForNotification = '(//button[contains(text(),"notes")])[%d]';
const sendToNotificationInfo = '(//td[@class="list-col-sent-to"]/p)[%d]';
const notesContent = '(//p[@class="notes-content"])[%d]';
const linkActionTab = '//div[h3[text()="Add a link"]]/div/span[text()="%s"]'; //No link, Link to screen, Link to web page
const sendToOption = '//div[h3[text()="Send notification to..."]]/div/span[text()="%s"]'; // All users , Signed in users, Test devices
const filterOptionDropdownValue = '(//select[@class ="hidden-select form-control"]/option[text()="%s"])[%d]';
const deleteFilterButton = '(//span[contains(@class, "circle")])[%d]';
const filterItemInputField = '(//input[@placeholder ="%s" or @class="token-input"])[%d]'; //Field name, Value
const notificationTimeSend = '//div[@class="tab-selection"]/span[text()="%s"]'; //Now, Then
const linkInfo = '(//tr[@data-notification-id]//p[3]/a)[%d]';
const filterSummaryItems = '.filter-summary-items li:nth-of-type(%d)';

const commands = {
  assertNotificationOverlayIsOpen: function () {
    this.api.frame(null);
    this.expect.section('@contentHeader').to.be.visible.before(this.api.globals.longWait);
    this.section.contentHeader.waitForElementVisible('@closeNotificationOverlayButton', this.api.globals.longWait)
      .waitForElementVisible('@notificationOverlayTitle', this.api.globals.longWait)
      .assert.containsText('@notificationOverlayTitle', 'Notifications');

    return this;
  },

  closeNotificationOverlay: function () {
    this.api.frame(null);
    this.section.contentHeader.waitForElementVisible('@closeNotificationOverlayButton', this.api.globals.longWait)
      .click('@closeNotificationOverlayButton');
    this.expect.section('@contentHeader').to.not.be.present.before(this.api.globals.longWait);

    return this;
  },

  clickCreateNewButton: function () {
    return this
      .switchToWidgetProviderFrame()
      .waitForElementVisible('@newInAppNotificationButton', this.api.globals.longWait)
      .click('@newInAppNotificationButton')
      .waitForElementNotVisible('@newInAppNotificationButton', this.api.globals.longWait);
  },

  checkNotificationSectionIsDisplay: function (title, sectionNumber) {
    this.section.contentBody.waitForElementVisible('@sectionTitle', this.api.globals.longWait)
      .assert.containsText('@sectionTitle', title);
    this.api.useXpath()
      .waitForElementVisible(util.format(activeContentStep, sectionNumber), this.api.globals.longWait)
      .assert.attributeContains(util.format(activeContentStep, sectionNumber), 'class', 'active')
      .useCss();

    return this;
  },

  clickNextButton: function () {
    this.section.contentBody.waitForElementVisible('@backButton', this.api.globals.longWait)
      .waitForElementVisible('@nextButton', this.api.globals.longWait)
      .click('@nextButton');

    return this;
  },

  clickSendNotificationButton: function () {
    this.section.contentBody.waitForElementVisible('@backButton', this.api.globals.longWait)
      .waitForElementVisible('@sendNotificationButton', this.api.globals.longWait)
      .click('@sendNotificationButton');

    return this;
  },

  clickBackButton: function () {
    this.section.contentBody.waitForElementVisible('@backButton', this.api.globals.longWait)
      .click('@backButton');

    return this;
  },

  assertEmptyNotificationTitleError: function () {
    this.section.contentBody.waitForElementVisible('@emptyTitleError', this.api.globals.longWait)
      .assert.containsText('@emptyTitleError', 'Please enter a title');

    return this;
  },

  assertEmptyNotificationMessageError: function () {
    this.section.contentBody.waitForElementVisible('@emptyMessageError', this.api.globals.longWait)
      .assert.containsText('@emptyMessageError', 'Please enter a message');

    return this;
  },

  setNotificationTitle: function (notificationTitle) {
    this.section.contentBody.waitForElementVisible('@notificationTitleInputField', this.api.globals.longWait)
      .clearValue('@notificationTitleInputField')
      .setValue('@notificationTitleInputField', notificationTitle);

    return this;
  },

  setNotificationMessage: function (notificationMessage) {
    this.section.contentBody.waitForElementVisible('@notificationMessageTextarea', this.api.globals.longWait)
      .clearValue('@notificationMessageTextarea')
      .setValue('@notificationMessageTextarea', notificationMessage);

    return this;
  },

  assertValueInNotificationTitleInOverlay(notificationTitle) {
    this.section.contentBody.waitForElementVisible('@notificationTitleInputField', this.api.globals.longWait)
      .assert.value('@notificationTitleInputField', notificationTitle, "Notification title value is correct");

    return this;
  },

  assertValueInNotificationMessageInOverlay(notificationMessage) {
    this.section.contentBody.waitForElementVisible('@notificationMessageTextarea', this.api.globals.longWait)
      .assert.value('@notificationMessageTextarea', notificationMessage, "Notification message value is correct");

    return this;
  },

  chooseTheLinkAction: function (linkAction) {
    this.api.useXpath()
      .waitForElementVisible(util.format(linkActionTab, linkAction), this.api.globals.longWait)
      .click(util.format(linkActionTab, linkAction))
      .assert.attributeContains(util.format(linkActionTab, linkAction), 'class', 'active')
      .useCss();

    return this;
  },

  checkLinkAction: function (linkAction){
    this.api.useXpath()
      .waitForElementVisible(util.format(linkActionTab, linkAction), this.api.globals.longWait)
      .assert.attributeContains(util.format(linkActionTab, linkAction), 'class', 'active')
      .useCss();

    return this;
  },

  clickPreviewTargetScreenButton: function () {
    this.section.contentBody.waitForElementVisible('@previewTargetScreenButton', this.api.globals.smallWait)
      .click('@previewTargetScreenButton');

    this.api.frame(null);

    this.expect.section('@previewTargetScreenOverlay').to.be.visible.before(this.api.globals.mediumWait);

    return this;
  },

  checkPreviewTargetScreen: function () {
    this.section.previewTargetScreenOverlay.waitForElementVisible('@titleOverlay', this.api.globals.smallWait)
      .assert.containsText('@titleOverlay', 'Previewing target screen')
      .assert.visible('@devicePreview', 'The device preview is visible on preview screen overlay');

    return this;
  },

  closePreviewTargetScreen: function () {
    this.section.previewTargetScreenOverlay.waitForElementVisible('@closeButtonOverlay', this.api.globals.smallWait)
      .click('@closeButtonOverlay');

    this.expect.section('@previewTargetScreenOverlay').to.not.be.present.before(this.api.globals.mediumWait);

    return this
      .switchToWidgetProviderFrame();
  },

  chooseUsersForNotification: function (whom) {
    this.api.useXpath()
      .waitForElementVisible(util.format(sendToOption, whom), this.api.globals.longWait)
      .click(util.format(sendToOption, whom))
      .assert.attributeContains(util.format(sendToOption, whom), 'class', 'active')
      .useCss();

    return this;
  },

  checkUsersForNotification: function (whom) {
    this.api.useXpath()
      .waitForElementVisible(util.format(sendToOption, whom), this.api.globals.longWait)
      .assert.attributeContains(util.format(sendToOption, whom), 'class', 'active')
      .useCss();

    return this;
  },

  setNotesForNotification: function (notes) {
    this.section.contentBody.waitForElementVisible('@notesTextarea', this.api.globals.longWait)
      .setValue('@notesTextarea', notes);

    return this;
  },

  checkNotesForNotification: function (notes) {
    this.section.contentBody.waitForElementVisible('@notesTextarea', this.api.globals.longWait)
      .assert.value('@notesTextarea', notes, "Notification notes are correct");

    return this;
  },

  chooseWhenSendNotification: function (when) {
    this.api.useXpath()
      .waitForElementVisible(util.format(notificationTimeSend, when), this.api.globals.longWait)
      .click(util.format(notificationTimeSend, when))
      .assert.attributeContains(util.format(notificationTimeSend, when), 'class', 'active')
      .useCss();

    return this;
  },

  reviewNotificationTitleOnOverlay: function (title) {
    this.section.contentBody.waitForElementVisible('@reviewNotificationTitle', this.api.globals.longWait)
      .assert.containsText('@reviewNotificationTitle', title);

    return this;
  },

  reviewNotificationMessageOnOverlay: function (message) {
    this.section.contentBody.waitForElementVisible('@reviewNotificationMessage', this.api.globals.longWait)
      .assert.containsText('@reviewNotificationMessage', message);

    return this;
  },

  reviewNotificationRecipientsOnOverlay: function (whom) {
    this.section.contentBody.waitForElementVisible('@reviewNotificationRecipients', this.api.globals.longWait)
      .assert.containsText('@reviewNotificationRecipients', whom);

    return this;
  },

  checkNotificationFilterSummaryItems: function (fieldName, filterOption, value, numberOfFilter = 1) {
    return this
      .waitForElementVisible(util.format(filterSummaryItems, numberOfFilter), this.api.globals.longWait)
      .assert.containsText(util.format(filterSummaryItems, numberOfFilter), `${fieldName} ${filterOption.toLowerCase()} ${value}`);
  },

  reviewNotificationSendTimeOnOverlay: function (when) {
    this.section.contentBody.waitForElementVisible('@reviewNotificationSendTime', this.api.globals.longWait)
      .assert.containsText('@reviewNotificationSendTime', when);

    return this;
  },

  checkNotificationActionLink: function (linkAction, notificationNumber) {
    this.api.useXpath()
      .waitForElementVisible(util.format(linkInfo, notificationNumber || 1), this.api.globals.longWait)
      .assert.containsText(util.format(linkInfo, notificationNumber || 1), linkAction)
      .useCss();

    return this;
  },

  checkSuccessfulNotificationMessage: function () {
    this
      .api.frame(null);

    this
      .waitForElementVisible('@modalContentTitle', this.api.globals.longWait)
      .assert.containsText('@modalContentTitle', 'Success!');

    return this;
  },

  closeSuccessfulNotificationMessage: function () {
    return this
      .waitForElementVisible('@modalContentOkButton', this.api.globals.smallWait)
      .click('@modalContentOkButton')
      .assert.elementNotPresent('@modalContentTitle')
      .switchToWidgetProviderFrame()
      .waitForElementNotPresent('@loadingSpinner', this.api.globals.longWait)
      .waitForElementNotPresent('@emptyNotificationsHolder', this.api.globals.longWait)
  },

  assertNotificationIsPresentInTheList: function (title) {
    this.api.useXpath()
      .waitForElementVisible(util.format(notificationTitle, title), this.api.globals.longWait)
      .useCss();

    return this;
  },

  checkNotificationMessageIsInTheList: function (message, notificationNumber) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(notificationMessage, notificationNumber || 1), this.api.globals.longWait)
      .assert.containsText(util.format(notificationMessage, notificationNumber || 1), message)
      .useCss();

    return this;
  },

  checkNotificationLabelInTheList: function (label, notificationNumber) {
    this.api.useXpath()
      .waitForElementVisible(util.format(notificationLabel, notificationNumber || 1), this.api.globals.longWait)
      .assert.containsText(util.format(notificationLabel, notificationNumber || 1), label)
      .useCss();

    return this;
  },

  checkNotificationRecipientsInTheList: function (whom, notificationNumber) {
    this.api.useXpath()
      .waitForElementVisible(util.format(sendToNotificationInfo, notificationNumber || 1), this.api.globals.longWait)
      .assert.containsText(util.format(sendToNotificationInfo, notificationNumber || 1), whom)
      .useCss();

    return this;
  },

  checkNotificationNotesInTheList: function (notes, notificationNumber) {
    this.api.useXpath()
      .waitForElementVisible(util.format(notesContent, notificationNumber || 1), this.api.globals.longWait)
      .assert.containsText(util.format(notesContent, notificationNumber || 1), notes)
      .useCss();

    return this;
  },

  deleteNotification: function (notificationNumber) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(actionButtonForNotification, 'trash', notificationNumber || 1), this.api.globals.longWait)
      .click(util.format(actionButtonForNotification, 'trash', notificationNumber || 1))
      .useCss()
      .frame(null)
      .acceptModalWindow()
      .switchToWidgetProviderFrame();

    return this
      .waitForElementNotPresent('@loadingSpinner', this.api.globals.longWait)
      .waitForElementVisible('@newInAppNotificationButton', this.api.globals.longWait);
  },

  copyNotification(notificationNumber) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(actionButtonForNotification, 'copy', notificationNumber || 1), this.api.globals.longWait)
      .click(util.format(actionButtonForNotification, 'copy', notificationNumber || 1))
      .waitForElementNotVisible(util.format(actionButtonForNotification, 'copy', notificationNumber || 1), this.api.globals.longWait)
      .useCss();

    return this;
  },

  assertNotificationIsNotPresentInTheList: function (notificationTitle) {
    this.api.useXpath()
      .assert.elementNotPresent(util.format(notificationTitle, notificationTitle))
      .useCss();

    return this;
  },

  addFilterForNotification: function (filterNumber) {
    this.section.contentBody.waitForElementVisible('@addFilterButton', this.api.globals.longWait)
      .click('@addFilterButton');

    this.api.useXpath()
      .assert.visible(util.format(deleteFilterButton, filterNumber || 1))
      .useCss();

    return this;
  },

  deleteFilterForNotification: function (filterNumber) {
    this.api.useXpath()
      .waitForElementVisible(util.format(deleteFilterButton, filterNumber || 1), this.api.globals.smallWait)
      .click(util.format(deleteFilterButton, filterNumber || 1))
      .waitForElementNotPresent(util.format(deleteFilterButton, filterNumber || 1), this.api.globals.smallWait)
      .useCss();

    return this;
  },

  configureFilterForNotification: function (fieldName, filterOption, value, numberOfFilter) {
    this.api.useXpath()
      .waitForElementPresent(util.format(filterOptionDropdownValue, filterOption, numberOfFilter || 1), this.api.globals.smallWait)
      .click(util.format(filterOptionDropdownValue, filterOption, numberOfFilter || 1))
      .expect.element(util.format(filterOptionDropdownValue, filterOption, numberOfFilter || 1)).to.be.selected
      .before(this.api.globals.smallWait);

    this
      .waitForElementVisible(util.format(filterItemInputField, 'Field name', numberOfFilter || 1), this.api.globals.longWait)
      .clearValue(util.format(filterItemInputField, 'Field name', numberOfFilter || 1))
      .setValue(util.format(filterItemInputField, 'Field name', numberOfFilter || 1), fieldName);

    this
      .waitForElementVisible(util.format(filterItemInputField, 'Value', numberOfFilter || 1), this.api.globals.longWait)
      .clearValue(util.format(filterItemInputField, 'Value', numberOfFilter || 1))
      .setValue(util.format(filterItemInputField, 'Value', numberOfFilter || 1), value)
      .api.useCss();

    return this;
  },

  checkFiltersValuesInOverlay: function (fieldName, filterOption, value, numberOfFilter) {
    this.api.useXpath()
      .waitForElementPresent(util.format(filterOptionDropdownValue, filterOption, numberOfFilter || 1), this.api.globals.smallWait)
      .expect.element(util.format(filterOptionDropdownValue, filterOption, numberOfFilter || 1)).to.be.selected
      .before(this.api.globals.smallWait);

    this
      .waitForElementVisible(util.format(filterItemInputField, 'Field name', numberOfFilter || 1), this.api.globals.longWait)
      .assert.value(util.format(filterItemInputField, 'Field name', numberOfFilter || 1), fieldName, "Filter field name is correct");

    this
      .waitForElementVisible(util.format(filterItemInputField, 'Value', numberOfFilter || 1), this.api.globals.longWait)
      .assert.value(util.format(filterItemInputField, 'Value', numberOfFilter || 1), value, "Filter value is correct")
      .api.useCss();

    return this;
  },

  saveNotificationAsDraft: function () {
    this.section.contentBody.waitForElementVisible('@saveAsDraftLink', this.api.globals.longWait)
      .click('@saveAsDraftLink');

    return this
      .waitForElementNotPresent('@loadingSpinner', this.api.globals.longWait);
  },

  editNotificationNotesInTheList: function (notes, notificationNumber) {
    this.api.useXpath()
      .waitForElementPresent(util.format(notesButtonForNotification, notificationNumber || 1), this.api.globals.smallWait)
      .click(util.format(notesButtonForNotification, notificationNumber || 1))
      .useCss();

    return this.waitForElementVisible('@editNotesTextarea', this.api.globals.smallWait)
      .clearValue('@editNotesTextarea')
      .setValue('@editNotesTextarea', notes)
      .click('@saveButtonOnEditNote')
      .waitForElementNotPresent('@saveButtonOnEditNote', this.api.globals.smallWait);
  },

  clickEditNotificationInTheList: function (notificationNumber) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(actionButtonForNotification, 'pencil', notificationNumber || 1), this.api.globals.longWait)
      .click(util.format(actionButtonForNotification, 'pencil', notificationNumber || 1))
      .waitForElementNotVisible(util.format(actionButtonForNotification, 'pencil', notificationNumber || 1), this.api.globals.longWait)
      .useCss();

    return this;
  },

  enterWebPageForLinkToWeb: function (webPage) {
    this
      .switchToFlWidgetFrameByNumber(2)
      .waitForElementVisible('@webPageInputField', this.api.globals.longWait)
      .setValue('@webPageInputField', webPage)
      .api.frameParent();

    return this;
  },

  enterDeviceIdForRecipients: function (deviceId) {
    this.section.contentBody.waitForElementVisible('@deviceIdInputField', this.api.globals.longWait)
      .setValue('@deviceIdInputField', deviceId);

    return this;
  },

  disablePushNotification: function () {
    const pushNotificationButtonLocator = '//span[text()="Push notification"]';

    this
      .waitForElementVisible('@pushNotificationButton', this.api.globals.longWait)
      .api.element('xpath', pushNotificationButtonLocator, (result) => {
      this.api.elementIdAttribute(result.value.ELEMENT, 'class', classValue => {
        if (classValue.value.toString().includes('active')) {
          this
            .api.logTestInfo('Push notifications are active. Let\'s disable them.')
            .useXpath()
            .click(pushNotificationButtonLocator)
            .useCss();
        }
      })
    });

    return this
      .assert.attributeEquals('@pushNotificationButton', 'class', 'tab tab-checked',
        'Push notifications are disabled.');
  }
};

module.exports = {
  commands: [commands],
  sections: {
    contentHeader: {
      selector: '.overlay-content-header',
      elements: {
        closeNotificationOverlayButton: {
          selector: '.overlay-close'
        },
        notificationOverlayTitle: {
          selector: '.overlay-title'
        }
      }
    },
    contentBody: {
      selector: '.notification-form',
      elements: {
        contentStepHolder: {
          selector: '.content-steps-holder'
        },
        sectionTitle: {
          selector: 'div.row:not([style*=none])> div> h3'
        },
        saveAsDraftLink: {
          selector: 'div.row:not([style*=none]) .step-summary a.btn.btn-link',
        },
        backButton: {
          selector: 'div.row:not([style*=none]) .step-summary .btn.btn-default'
        },
        nextButton: {
          selector: 'div.row:not([style*=none]) .step-summary .btn.btn-primary'
        },
        notificationTitleInputField: {
          selector: '//div[h3[text()="Configure your notification"]]//input',
          locateStrategy: 'xpath'
        },
        notificationMessageTextarea: {
          selector: '//div[h3[text()="Configure your notification"]]//textarea',
          locateStrategy: 'xpath'
        },
        emptyTitleError: {
          selector: '.form-group.clearfix  input +div +div.text-danger'
        },
        emptyMessageError: {
          selector: '.form-group.clearfix textarea+div +div.text-danger'
        },
        previewTargetScreenButton: {
          selector: 'p.text-center a'
        },
        addFilterButton: {
          selector: 'a.btn.btn-default i.fa.fa-fw.fa-plus'
        },
        notesTextarea: {
          selector: '//textarea[contains(@placeholder, "notes")]',
          locateStrategy: 'xpath'
        },
        reviewNotificationTitle: {
          selector: '.notification-message strong'
        },
        reviewNotificationMessage: {
          selector: '.notification-message'
        },
        reviewNotificationRecipients: {
          selector: '.notification-review h4:nth-of-type(1)'
        },
        reviewNotificationSendTime: {
          selector: '.notification-review h4:nth-of-type(2)'
        },
        deviceIdInputField: {
          selector: '.token-input'
        },
        sendNotificationButton: {
          selector: '.col-md-10.col-md-offset-1 .step-summary .btn.btn-primary'
        }
      }
    },
    previewTargetScreenOverlay: {
      selector: '#overlay-content-1',
      elements: {
        closeButtonOverlay: {
          selector: '.overlay-close'
        },
        titleOverlay: {
          selector: '.overlay-title'
        },
        devicePreview: {
          selector: '.device.mobile'
        }
      }
    }
  },
  elements: {
    emptyNotificationsHolder: {
      selector: '.notifications-empty'
    },
    newInAppNotificationButton: {
      selector: '.btn.btn-primary i'
    },
    pushNotificationSettingsButton: {
      selector: '.btn-default.show-settings.pull-right'
    },
    modalContentTitle: {
      selector: 'div[style="display: block;"] .modal-dialog .modal-title'
    },
    modalContentOkButton: {
      selector: 'div[style="display: block;"] .modal-dialog [data-bb-handler="ok"]'
    },
    showTimeZoneCheckbox: {
      selector: '[for=show-timezone] span'
    },
    paginationButtons: {
      selector: '.pagination.clearfix'
    },
    amountNotificationsShownOnPageDropdown: {
      selector: '.select-proxy-display'
    },
    editNotesTextarea: {
      selector: '.list-col-notes textarea'
    },
    saveButtonOnEditNote: {
      selector: '.list-col-notes .btn.btn-sm.btn-primary'
    },
    cancelButtonOnEditMode: {
      selector: '.list-col-notes .btn.btn-sm.btn-primary + .btn.btn-sm.btn-default'
    },
    loadingSpinner: {
      selector: '.spinner-overlay'
    },
    webPageInputField: {
      selector: '#url'
    },
    pushNotificationButton: {
      selector: '//span[text()="Push notification"]',
      locateStrategy: 'xpath'
    }
  }
};
