const util = require('util');
const recipientCard = '//div[contains(@class, "%s-list")]//div[@class="contact-user-%s"][text()="%s"]';
const selectedRecipientCard = '(//div[@class="contact-image-holder"]/div[@class="contact-name-holder"][text()="%s"])[2]';
const textMessage = '//div[@class="chat-text"][contains(text(),"%s")]';
const iconAboveMessage = '//div[@class="chat-text"][contains(text(),"%s")]/parent::div/parent::div//div[@class="edit-button %s-message"]';
const editedSignBelowMessage = '//div[@class="chat-body"][div[contains(text(),"%s")]]/div[@class="chat-edited"]';
const nameTitleOnConversationCard = '//div[@class="chat-info"]/div[@class="chat-user-name"][text()="%s"]';
const actionsHolderOnChatCard = '//div[@class="chat-user-name"][text()="%s"]/parent::div/parent::div//div[@class="icon icon-show-more"]';
const highlightedChatElementColor ='#474975';

const commands = {
  selectUserForConversation: function (recipientName) {
    this
      .waitForElementVisible('@userContactCard', this.api.globals.mediumWait)
      .api.useXpath()
      .waitForElementVisible(util.format(recipientCard, 'user', 'name', recipientName), this.api.globals.mediumWait)
      .click(util.format(recipientCard, 'user', 'name', recipientName))
      .waitForElementVisible(util.format(selectedRecipientCard, recipientName), this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  assertUserIsPresentInContactList: function (name, title) {
    this
      .waitForElementVisible('@userContactCard', this.api.globals.mediumWait)
      .api.useXpath()
      .pause(1000)
      .assert.elementPresent(util.format(recipientCard, 'user', 'name', name))
      .assert.elementPresent(util.format(recipientCard, 'user', 'preview', title))
      .useCss();

    return this;
  },

  assertUserIsNotPresentInContactList: function (recipientName) {
    this
      .waitForElementVisible('@userContactCard', this.api.globals.mediumWait)
      .api.useXpath()
      .pause(1000)
      .assert.elementNotPresent(util.format(recipientCard, 'user', 'name', recipientName))
      .useCss();

    return this;
  },

  assertUserIsPresentInGroupList: function (name, title) {
    this
      .api.useXpath()
      .pause(1000)
      .assert.elementPresent(util.format(recipientCard, 'participants', 'name', name))
      .assert.elementPresent(util.format(recipientCard, 'participants', 'preview', title))
      .useCss();

    return this;
  },

  clickNextButtonToStartAConversation: function () {
    return this
      .waitForElementVisible('@nextButton', this.api.globals.longWait)
      .assertElementPropertyHasCorrectColor('@nextButton', 'background-color', highlightedChatElementColor)
      .click('@nextButton');
  },

  enterMessageInChat: function (message) {
    return this
      .waitForElementVisible('@inputFieldToTypeMessage', this.api.globals.mediumWait)
      .click('@inputFieldToTypeMessage')
      .clearValue('@inputFieldToTypeMessage')
      .setValue('@inputFieldToTypeMessage', message);
  },

  clickAttachImageIcon: function () {
    this
      .waitForElementVisible('@attachImageButton', this.api.globals.mediumWait)
      .api.element('css selector', '.image-button', function (result) {
      this
        .moveTo(result.value.ELEMENT)
        .mouseButtonClick(0);
    })
      .pause(2000);

    return this
      .waitForElementPresent('@imageInputField', this.api.globals.mediumWait)
  },

  selectAnImageForUploading: function (file) {
    return this
      .setValue('@imageInputField', `/files/files/${file}`)
      .waitForElementVisible('.clear-image', this.api.globals.smallWait)
      .waitForElementVisible('@attachedImageCanvas', this.api.globals.smallWait);
  },

  checkThatImageHasBeenSent: function () {
    this
      .waitForElementVisible('@imageInSentMessage', this.api.globals.longWait)
      .waitForElementNotVisible('@attachedImageCanvas', this.api.globals.mediumWait)
      .api.pause(2000);

    return this;
  },

  checkAbilityToOpenImageInViewMode: function () {
    this
      .waitForElementVisible('@imageInSentMessage', this.api.globals.smallWait)
      .click('@imageInSentMessage')
      .waitForElementVisible('@imageInViewMode', this.api.globals.mediumWait)
      .api.pause(1000)
      .keys([this.api.Keys.ESCAPE]);

    return this
      .waitForElementNotVisible('@imageInViewMode', this.api.globals.mediumWait)
  },

  clickSaveButtonForEditedMessage: function () {
    return this
      .waitForElementVisible('@saveButton', this.api.globals.mediumWait)
      .assertElementPropertyHasCorrectColor('@saveButton', 'background-color', highlightedChatElementColor)
      .click('@saveButton')
      .waitForElementNotVisible('@saveButton', this.api.globals.mediumWait);
  },

  assertThatMessageHasEditedSign: function (editedMessage) {
    this
      .api.useXpath()
      .assert.visible(util.format(editedSignBelowMessage, editedMessage))
      .useCss();

    return this;
  },

  clickSendButtonInChat: function () {
    this
      .api.pause(1000);

    return this
      .waitForElementVisible('@sendButton', this.api.globals.mediumWait)
      .assertElementPropertyHasCorrectColor('@sendButton', 'background-color', highlightedChatElementColor)
      .click('@sendButton');
  },

  checkThatMessageHasBeenSent: function (message) {
    this
      .waitForElementVisible('@lastMessageInChat', this.api.globals.mediumWait)
      .expect.element('@lastMessageInChat').text.to.equal(message);

    return this
      .waitForElementNotVisible('@messageSendingLoader', this.api.globals.longWait)
  },

  clickTextMessage: function (message) {
    this
      .api.element('xpath', util.format(textMessage, message), function (result) {
      this
        .moveTo(result.value.ELEMENT, 0, 0)
        .mouseButtonClick(0);
    })
      .useCss()
      .pause(1000);

    return this;
  },

  clickDeleteIconAboveMessage: function (message) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(iconAboveMessage, message, 'delete'), this.api.globals.mediumWait)
      .click(util.format(iconAboveMessage, message, 'delete'))
      .useCss()
      .pause(1500);

    return this;
  },

  conformDeletingInChat: function () {
    return this
      .waitForElementVisible('@confirmButton', this.api.globals.mediumWait)
      .click('@confirmButton');
  },

  assertMessageIsNotAtTheChat: function (message) {
    return this
      .assert.elementNotPresent(util.format(textMessage, message), 'The message was successfully removed');
  },

  clickEditIconAboveMessage: function (message) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(iconAboveMessage, message, 'edit'), this.api.globals.mediumWait)
      .click(util.format(iconAboveMessage, message, 'edit'))
      .useCss();

    return this;
  },

  assertTimeNearMessageIsCorrect: function (time) {
    let timeStatus = false;
    const logSymbols = require('log-symbols');

    return this
      .waitForElementVisible('@timeStampNearSentMessage', this.api.globals.smallWait)
      .getText('@timeStampNearSentMessage', function (result) {
        this.logTestInfo(result.value);

        if (result.value == time[0] || result.value == time[1] || result.value == time[2]) {
          timeStatus = true;
          console.log('', logSymbols.success.green, `Time near message matches to sending time by GMT: ${result.value}`);
        } else console.log('', logSymbols.error.red, `Time near message doesn't match to sending time by GMT: ${result.value}`);

        this.assert.ok(timeStatus, 'Asserting time near message is correct');
      })
  },

  openDetailsOfConversation: function (name) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(nameTitleOnConversationCard, name), this.api.globals.mediumWait)
      .click(util.format(nameTitleOnConversationCard, name))
      .useCss();

    return this;
  },

  checkChatDetails: function () {
    return this
      .waitForElementPresent('@chatList', this.api.globals.mediumWait)
      .waitForElementVisible('@startNewConversationButton', this.api.globals.mediumWait)
      .assert.elementPresent('@chatArea');
  },

  openChooseContactsListOverlay: function () {
    this.api.pause(2000);

    return this
      .waitForElementVisible('@startNewConversationButton', this.api.globals.smallWait)
      .click('@startNewConversationButton')
      .click('@startNewConversationButton')
      .assert.visible('@contactsListOverlay');
  },

  closeContactsListOverlay: function () {
    this
      .waitForElementVisible('@startNewConversationButton', this.api.globals.smallWait)
      .api.execute(function () {
      const likeIcon = document.querySelector('.contacts-back');
      likeIcon.click();
    });

    return this
      .waitForElementNotVisible('@contactsListOverlay', this.api.globals.smallWait);
  },

  clickBackToContactsScreenFromGroupChat: function() {
    this
      .waitForElementVisible('@goBackToContactListButton', this.api.globals.mediumWait)
      .click('@goBackToContactListButton')
      .waitForElementVisible('@startNewConversationButton', this.api.globals.mediumWait)
      .api.pause(1000);

    return this;
  },

  clickBackToContactsScreenFromChat: function() {
    this
      .waitForElementVisible('@goBackToContactListButton', this.api.globals.mediumWait)
      .api.execute(function () {
        const goback = document.querySelector('.chat-back .fa.fa-angle-left');
        goback.click();
      })
      .pause(1000);

    return this
      .waitForElementVisible('@startNewConversationButton', this.api.globals.mediumWait);
  },

  clickBackToConversationFromGroupChat: function () {
    this
      .waitForElementVisible('@goBackFromGroupDetails', this.api.globals.mediumWait)
      .click('@goBackFromGroupDetails')
      .waitForElementVisible('@inputFieldToTypeMessage', this.api.globals.mediumWait)
      .api.pause(1000);

    return this;
  },

  assertConversationWithCertainUserPresent: function (name) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(nameTitleOnConversationCard, name), this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  assertConversationWithCertainUserIsnNotPresent: function (name) {
    this
      .api.useXpath()
      .waitForElementNotPresent(util.format(nameTitleOnConversationCard, name), this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  clickCreateGroupButton: function () {
    this
      .waitForElementVisible('@createGroupButton', this.api.globals.mediumWait)
      .click('@createGroupButton')
      .api.pause(2000);

    return this;
  },

  enterGroupName: function (groupName) {
    this.api.pause(1500);

    this
      .waitForElementVisible('@groupNameInputField', this.api.globals.mediumWait)
      .click('@groupNameInputField')
      .setValue('@groupNameInputField', groupName)
      .assertElementPropertyHasCorrectColor('@createGroupButton', 'background-color', highlightedChatElementColor)
      .api.pause(1500);

    return this;
  },

  assertErrorCreatingConversation: function () {
    return this
      .waitForElementVisible('@errorCreatingConversation', this.api.globals.mediumWait)
      .assert.containsText('@errorCreatingConversation', 'Error creating conversation.')
  },

  clickGroupTitle: function (groupName) {
    this.api.pause(2000);

    this
      .waitForElementVisible('@userNameHolderInChat', this.api.globals.mediumWait)
      .click('@userNameHolderInChat')
      .waitForElementVisible('@groupInfoTitle', this.api.globals.mediumWait)
      .expect.element('@groupInfoTitle').text.to.equal(groupName);

    return this;
  },

  checkConversationTitle: function (recipientName) {
    this
      .waitForElementVisible('@sendButton', this.api.globals.mediumWait)
      .assert.visible('@inputFieldToTypeMessage')
      .waitForElementVisible('@userNameHolderInChat', this.api.globals.mediumWait)
      .expect.element('@userNameHolderInChat').text.to.equal(recipientName);

    return this;
  },

  removeConversationByTitle: function (chatName) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(actionsHolderOnChatCard, chatName), this.api.globals.mediumWait)
      .click(util.format(actionsHolderOnChatCard, chatName))
      .useCss()
      .pause(1500);

    return this
      .waitForElementVisible('@deleteChatButton', this.api.globals.mediumWait)
      .click('@deleteChatButton');
  },

  assertMessageIsPresent: function (message) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(textMessage, message), this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  getSentImageId: function (imageId) {
    this.api.pause(2000);

    this.waitForElementVisible('@attachedImageInMessage', this.api.globals.mediumWait)
      .getAttribute('@attachedImageInMessage', 'src', (src) => imageId.shift(src.value.toString().match(/files\/(\d{6})/)[1]));

    return imageId;
  },

  checkReceivedImage: function (imageId) {
    return this
      .waitForElementVisible('@attachedImageInMessage', this.api.globals.mediumWait)
      .assert.attributeContains('@attachedImageInMessage', 'src', imageId);
  }
};

module.exports = {
  commands: [commands],
  elements: {
    chatList: {
      selector: '.chat-list'
    },
    chatArea: {
      selector: '#chat-handle'
    },
    startNewConversationButton: {
      selector: '.start-new i'
    },
    contactsListOverlay: {
      selector: '.contacts-holder-overlay'
    },
    userContactCard: {
      selector: '.contact-card .contact-user-name'
    },
    nextButton: {
      selector: '.btn.contacts-done'
    },
    inputFieldToTypeMessage: {
      selector: '.input-first-row textarea.form-control'
    },
    sendButton: {
      selector: '.btn.send-button'
    },
    lastMessageInChat: {
      selector: '.chat-messages-holder .chat.chat-right:last-of-type .chat-text'
    },
    userNameHolderInChat: {
      selector: '.chat-top-header .chat-user-name'
    },
    messageSendingLoader: {
      selector: '//i[@class="fa fa-circle-o-notch fa-spin"]',
      locateStrategy: 'xpath'
    },
    timeStampNearSentMessage: {
      selector: '.chat.tapped .msg-time'
    },
    confirmButton: {
      selector: '.button.action-sheet-option'
    },
    saveButton: {
      selector: '.btn.send-save-button'
    },
    attachImageButton: {
      selector: '.image-button'
    },
    imageInputField: {
      selector: '#image-input'
    },
    attachedImageCanvas: {
      selector: '#image-canvas'
    },
    imageInSentMessage: {
      selector: '.chat-image img'
    },
    imageInViewMode: {
      selector: 'img.pswp__img'
    },
    goBackToContactListButton: {
      selector: '.chat-back .fa.fa-angle-left'
    },
    goBackFromGroupDetails: {
      selector: '.group-participants-back.icon-btn'
    },
    createGroupButton: {
      selector: '.btn.contacts-create'
    },
    groupNameInputField: {
      selector: '.form-control.group-name-field'
    },
    errorCreatingConversation: {
      selector: '.fl-toast-body'
    },
    groupInfoTitle: {
      selector: '.participants-info'
    },
    deleteChatButton: {
      selector: '.chat-card.show-actions [data-action=delete]'
    },
    attachedImageInMessage: {
      selector: '.chat-image img[src]'
    }
  }
};
