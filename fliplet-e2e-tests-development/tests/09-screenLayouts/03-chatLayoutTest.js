const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screenLayouts = require('../../utils/constants/screenLayouts');
const screenLayoutTags = require('../../utils/constants/screenLayoutTags');
const casual = require('casual');
const screensTitles = {
  screenWithChat: screenLayouts.CHAT_MESSAGING,
  screenWithLogin: 'First screen',
};
const usersInfo = [{
  "Name": `C${casual.first_name.toLowerCase()}`,
  "Email": casual.email.toLowerCase(),
  "Image": 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  "Password": casual.password,
  "Position": casual.word
},
  {
    "Name": `B${casual.first_name.toLowerCase()}`,
    "Email": casual.email.toLowerCase(),
    "Image": 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    "Password": casual.password,
    "Position": casual.word
  },
  {
    "Name": `A${casual.first_name.toLowerCase()}`,
    "Email": casual.email.toLowerCase(),
    "Image": 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    "Password": casual.password,
    "Position": casual.word
  }];
const columns = Object.keys(usersInfo[0]);
const groupName = casual.word.toUpperCase();
const messages = [casual.sentence, casual.sentence, casual.sentence];
const sentImageId = [];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 03-chat-screen`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 03-chat-screen`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app, a data source with entries': function (browser) {
    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, usersInfo);
  },

  'Add a screen with Chat layout and open its configuration': function (browser) {
    const editApp = browser.page.editAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.clickAddScreensButton()
      .chooseScreenLayoutTag(screenLayoutTags.MESSAGING_NOTIFICATIONS)
      .selectScreenLayoutByName(screenLayouts.CHAT_MESSAGING)
      .clickAddScreenButtonOnLayout()
      .enterScreenNameOnAppScreenModal(screensTitles.screenWithChat)
      .clickConfirmButtonOnAppScreenModal()
      .assertScreenIsPresentByName(screensTitles.screenWithChat)
      .checkTitleOfActiveScreen(screensTitles.screenWithChat);

    editApp.checkThatComponentIsPresentOnPreviewScreen(widgets.CHAT)
      .openDetailsOfComponentByClickingOnIt(widgets.CHAT);
  },

  'Connect the created data source to chat screen': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.mapContactsDataForChat(columns[0], columns[1], columns[2], columns[4]) //TODO: refactoring
      .switchToTabName('Security settings')
      .switchToFlWidgetFrameByNumber(2)
      .selectScreenForLinkingByName(screensTitles.screenWithLogin)
      .clickSaveAndCloseButton();
  },

  'Drop login component to the first app screen and connect the created data source to it': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const dataSourceProvider = browser.page.dataSourceProvider();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLogin);

    browser.newDragAndDrop(widgets.LOGIN)
      .waitForWidgetInterfaceNewDnd(widgets.LOGIN)
      .switchToWidgetInstanceFrame();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectFieldsForLoginFromDataSourceColumnNames([columns[1], columns[3]])
      .switchToFlWidgetFrameByNumber(2)
      .selectScreenForLinkingByName(screensTitles.screenWithChat)
      .clickSaveAndCloseButton();
  },

  'Navigate to preview screen and login': function (browser) {
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLogin);  //TODO: check that user cannot use chat without login

    preview.switchToPreviewFrame()
      .signInIntoLoginForm(usersInfo[0].Email, usersInfo[0].Password);
  },

  'Open screen with chart and check contacts list': function (browser) {
    const editApp = browser.page.editAppScreen();
    const chatScreen = browser.page.chatScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithChat);

    editApp.checkThatComponentIsPresentOnPreviewScreen(widgets.CHAT)
      .switchToPreviewFrame();

    chatScreen.checkChatDetails()
      .openChooseContactsListOverlay()
      .assertUserIsNotPresentInContactList(usersInfo[0].Name)
      .assertUserIsPresentInContactList(usersInfo[1].Name, usersInfo[1].Position)
      .assertUserIsPresentInContactList(usersInfo[2].Name, usersInfo[2].Position);
  },

  'Search for a user and start a new conversation with one user': function (browser) {
    const preview = browser.page.previewAppScreen();
    const chatScreen = browser.page.chatScreen();

    preview.enterSearchRequestOnPreviewScreen(usersInfo[1].Name);

    chatScreen.selectUserForConversation(usersInfo[1].Name)
      .clickNextButtonToStartAConversation()
      .checkConversationTitle(usersInfo[1].Name.toUpperCase());
  },

  'Send th 1-st message and check that it is present in chat': function (browser) {
    const chatScreen = browser.page.chatScreen();
    const currentTimeMessage = [];

    chatScreen.enterMessageInChat(messages[0])
      .clickSendButtonInChat()
      .checkThatMessageHasBeenSent(messages[0])
      .getCurrentUTCtime(currentTimeMessage)
      .clickTextMessage(messages[0])
      .assertTimeNearMessageIsCorrect(currentTimeMessage);
  },

  'Delete message and check it is not present in the chat': function (browser) {
    const chatScreen = browser.page.chatScreen();

    chatScreen.clickDeleteIconAboveMessage(messages[0])
      .conformDeletingInChat()
      .assertMessageIsNotAtTheChat(messages[0]);
  },

  'Send the 2-nd message and edit it': function (browser) {
    const chatScreen = browser.page.chatScreen();

    chatScreen.enterMessageInChat(messages[1])
      .clickSendButtonInChat()
      .checkThatMessageHasBeenSent(messages[1])
      .clickTextMessage(messages[1])
      .clickEditIconAboveMessage(messages[1])
      .enterMessageInChat(messages[2])
      .clickSaveButtonForEditedMessage()
      .checkThatMessageHasBeenSent(messages[2])
      .assertThatMessageHasEditedSign(messages[2])
      .assertMessageIsNotAtTheChat(messages[1]);
  },

  'Send the 3-rd message with an image attached': function (browser) {
    const chatScreen = browser.page.chatScreen();
    const fileName = 'icon.png';

    chatScreen.clickAttachImageIcon()
      .selectAnImageForUploading(fileName)
      .clickSendButtonInChat()
      .checkThatImageHasBeenSent()
      .checkAbilityToOpenImageInViewMode();
  },

  'Open contacts screen and start new group conversation': function (browser) {
    const chatScreen = browser.page.chatScreen();

    chatScreen.clickBackToContactsScreenFromChat()
      .checkChatDetails()
      .assertConversationWithCertainUserPresent(usersInfo[1].Name)
      .openChooseContactsListOverlay()
      .selectUserForConversation(usersInfo[1].Name)
      .selectUserForConversation(usersInfo[2].Name)
      .clickNextButtonToStartAConversation();
  },

  'Assert that it is not possible to create group with an empty name': function (browser) {
    const chatScreen = browser.page.chatScreen();

    chatScreen.clickCreateGroupButton()
      .enterGroupName(' ')
      .clickCreateGroupButton()
      .assertErrorCreatingConversation();
  },

  'Enter a valid chat name and send a message to the group': function (browser) {
    const chatScreen = browser.page.chatScreen();
    const currentTimeGroup = [];

    chatScreen
      .enterGroupName(groupName)
      .clickCreateGroupButton()
      .enterMessageInChat(messages[2])
      .clickSendButtonInChat()
      .checkThatMessageHasBeenSent(messages[2])
      .getCurrentUTCtime(currentTimeGroup)
      .clickTextMessage(messages[2])
      .assertTimeNearMessageIsCorrect(currentTimeGroup);
  },

  'Send a message with an attached image to the group': function (browser) {
    const chatScreen = browser.page.chatScreen();
    const fileName = 'icon.png';

    chatScreen.clickAttachImageIcon()
      .selectAnImageForUploading(fileName)
      .clickSendButtonInChat()
      .checkThatImageHasBeenSent()
      .checkAbilityToOpenImageInViewMode()
      .getSentImageId(sentImageId);
  },

  'Open group details to check participants': function (browser) {
    const chatScreen = browser.page.chatScreen();

    chatScreen.checkConversationTitle(groupName)
      .clickGroupTitle(groupName)
      .assertUserIsPresentInGroupList(usersInfo[1].Name, usersInfo[1].Position)
      .assertUserIsPresentInGroupList(usersInfo[2].Name, usersInfo[2].Position)
      .clickBackToContactsScreenFromGroupChat()
      .checkConversationTitle(groupName);
  },

  'Return to chats screen and leave the group': function (browser) {
    const chatScreen = browser.page.chatScreen();

    chatScreen.clickBackToConversationFromGroupChat()
      .clickBackToContactsScreenFromChat()
      .assertConversationWithCertainUserPresent(usersInfo[1].Name)
      .assertConversationWithCertainUserPresent(groupName)
      .removeConversationByTitle(groupName)
      .conformDeletingInChat()
      .assertConversationWithCertainUserIsnNotPresent(groupName);
  },

  'Publish the application': function (browser) {
    const publish = browser.page.publishScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');
    publish.clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish.clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Login as the 2-nd user adn go to the screen with chat': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openWebAppMenu()
      .openMenuItemByName(screensTitles.screenWithLogin)
      .checkPageTitle(`${screensTitles.screenWithLogin} - ${browser.globals.appNameGenerated}`)
      .checkTitleOnScreen(screensTitles.screenWithLogin)
      .enterEmailAndPasswordForLogin(usersInfo[1].Email, usersInfo[1].Password)
      .submitLoginForm()
      .checkPageTitle(`${screensTitles.screenWithChat} - ${browser.globals.appNameGenerated}`)
      .checkTitleOnScreen(screensTitles.screenWithChat)
      .allowNotificationOnPopup();
  },

  'Check chat received messages': function (browser) {
    const chatScreen = browser.page.chatScreen();

    chatScreen.checkChatDetails()
      .assertConversationWithCertainUserPresent(usersInfo[0].Name)
      .assertConversationWithCertainUserPresent(`${usersInfo[2].Name}, ${usersInfo[0].Name}`)
      .openDetailsOfConversation(`${usersInfo[2].Name}, ${usersInfo[0].Name}`)
      .checkConversationTitle(`${usersInfo[2].Name.toUpperCase()}, ${usersInfo[0].Name.toUpperCase()}`)
      .assertMessageIsPresent(messages[2])
      .checkReceivedImage(sentImageId);
  },

  'Check chat contact list': function (browser) {
    const chatScreen = browser.page.chatScreen();

    chatScreen.openChooseContactsListOverlay()
      .assertUserIsNotPresentInContactList(usersInfo[1].Name)
      .assertUserIsPresentInContactList(usersInfo[0].Name, usersInfo[0].Position)
      .assertUserIsPresentInContactList(usersInfo[2].Name, usersInfo[2].Position);
  },

  'Delete the created application and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};
