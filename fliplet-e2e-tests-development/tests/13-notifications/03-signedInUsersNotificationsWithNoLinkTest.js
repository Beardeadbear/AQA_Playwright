const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');
const screensTitles = {
  screenWithNotifications: 'First screen',
  screenWithLogin: 'Second screen',
};
const notificationConfigurations = {
  linkAction: 'No link',
  sendWhom: 'Signed in users',
  sendWhen: 'Now',
  isOneOfFilter: 'Is one of',
  notContainFilter: 'Does not contain',
  isNotOneOfFilter: 'Is not one of'
};
const notificationValues = {
  notificationTitle: casual.word.concat(casual.letter),
  notificationMessage: casual.title,
  notes: casual.short_description,
  newNotificationTitle: casual.letter.concat(casual.word),
  newNotificationMessage: casual.title,
  newNotes: casual.short_description
};
const usersInfo = [{
  "name": casual.full_name,
  "email": casual.email.toLowerCase(),
  "password": casual.password,
  "company": casual.word,
  "position": casual.title
},
  {
    "name": casual.full_name,
    "email": casual.email.toLowerCase(),
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  }];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 03-notif`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 03-notifications`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done,
        browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app, a data source with entries and add Notification box component': function (browser) {
    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, usersInfo)
      .newDragAndDrop(widgets.NOTIFICATIONS_BOX)
      .waitForWidgetInterfaceNewDnd(widgets.NOTIFICATIONS_BOX);
  },

  'Add Login screen layout and open its configuration': function (browser) {
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLogin);

    browser.newDragAndDrop(widgets.LOGIN)
      .waitForWidgetInterfaceNewDnd(widgets.LOGIN)
      .switchToWidgetInstanceFrame();
  },

  'Connect the data source with users list to login component': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectFieldsForLoginFromDataSourceColumnNames(["email", "password"])
      .switchToFlWidgetFrameByNumber(2)
      .selectScreenForLinkingByName(screensTitles.screenWithNotifications)
      .clickSaveAndCloseButton();
  },

  'Publish the application and open it on web': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publish = browser.page.publishScreen();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL')
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Login to the web application as the first user': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkPageTitle(`${screensTitles.screenWithNotifications} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.NOTIFICATIONS_BOX)
      .allowNotificationOnPopup()
      .openWebAppMenu()
      .openMenuItemByName(screensTitles.screenWithLogin)
      .checkPageTitle(`${screensTitles.screenWithLogin} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.LOGIN)
      .enterEmailAndPasswordForLogin(usersInfo[0].email, usersInfo[0].password)
      .submitLoginForm()
      .assertLoginIsSuccessful()
      .checkPageTitle(`${screensTitles.screenWithNotifications} - ${browser.globals.appNameGenerated}`);
  },

  'Return to studio and open Notifications settings': function (browser) {
    const publish = browser.page.publishScreen();
    const notificationOverlay = browser.page.notificationOverlay();
    const webApp = browser.page.webApplicationPages();

    webApp.switchToOpenWindowByNumber(1);

    publish.closePublishOverlay()
      .openNotificationsOverlay();

    notificationOverlay.assertNotificationOverlayIsOpen()
      .clickCreateNewButton();
  },

  'Check "Configure your notification" section': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Configure your notification', 1)
      .clickNextButton()
      .assertEmptyNotificationTitleError()
      .assertEmptyNotificationMessageError()
      .setNotificationTitle(notificationValues.notificationTitle)
      .setNotificationMessage(notificationValues.notificationMessage)
      .chooseTheLinkAction(notificationConfigurations.linkAction)
      .clickNextButton();
  },

  'Check "Send notification to..." section': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Send notification to...', 2)
      .chooseUsersForNotification(notificationConfigurations.sendWhom)
      .addFilterForNotification()
      .configureFilterForNotification("position", notificationConfigurations.notContainFilter, usersInfo[1].position
        .substring(0, usersInfo[1].position.indexOf(" ")))
      .addFilterForNotification()
      .configureFilterForNotification("company", notificationConfigurations.isOneOfFilter,
        `${usersInfo[0].company}, ${usersInfo[1].company}`, 2)
      .setNotesForNotification(notificationValues.notes)
      .clickNextButton();
  },

  'Check "Send notification..." section': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Send notification...', 3)
      .disablePushNotification()
      .chooseWhenSendNotification(notificationConfigurations.sendWhen)
      .clickNextButton();
  },

  'Check "Your notification" section with summary': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Your notification', 4)
      .reviewNotificationTitleOnOverlay(notificationValues.notificationTitle)
      .reviewNotificationMessageOnOverlay(notificationValues.notificationMessage)
      .reviewNotificationRecipientsOnOverlay(notificationConfigurations.sendWhom.toLowerCase().slice(0, -1))
      .checkNotificationFilterSummaryItems("position", notificationConfigurations.notContainFilter,
        usersInfo[1].position.substring(0, usersInfo[1].position.indexOf(" ")))
      .checkNotificationFilterSummaryItems("company", `${notificationConfigurations.isOneOfFilter}`,
        `${usersInfo[0].company}, ${usersInfo[1].company}`, 2)
      .reviewNotificationSendTimeOnOverlay(notificationConfigurations.sendWhen.toLowerCase())
      .clickNextButton();
  },

  'Check a new notification successful message': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkSuccessfulNotificationMessage()
      .closeSuccessfulNotificationMessage()
      .assertNotificationIsPresentInTheList(notificationValues.notificationTitle);
  },

  'Check a new notification details in the list of notifications with shown timezone': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();
    const componentsScreen = browser.page.componentsScreen();

    notificationOverlay.checkNotificationMessageIsInTheList(notificationValues.notificationMessage)
      .checkNotificationLabelInTheList('Sent')
      .checkNotificationNotesInTheList(notificationValues.notes);

   componentsScreen.tickCheckBoxByLabel('show-timezone');

   notificationOverlay.checkNotificationLabelInTheList('GMT')
  },

  'Check a new notification in the application on web': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.switchToOpenWindowByNumber(2)
      .checkPageTitle(`${screensTitles.screenWithNotifications} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.NOTIFICATIONS_BOX)
      .refreshToUpdateNotificationBox()
      .assertNotificationIsPresentInTheBox(notificationValues.notificationTitle)
      .checkNotificationStatus(notificationValues.notificationTitle, 'unread')
      .checkNotificationMessage(notificationValues.notificationMessage)
      .clickMarkAllAsRead()
      .checkNotificationStatus(notificationValues.notificationTitle, 'read');
  },

  'Return to studio to create the second notification and check "Configure your notification" section for it': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();
    const webApp = browser.page.webApplicationPages();

    webApp.switchToOpenWindowByNumber(1);

    notificationOverlay.clickCreateNewButton()
      .checkNotificationSectionIsDisplay('Configure your notification', 1)
      .setNotificationMessage(notificationValues.newNotificationMessage)
      .setNotificationTitle(notificationValues.newNotificationTitle)
      .chooseTheLinkAction(notificationConfigurations.linkAction)
      .clickNextButton();
  },

  'Check "Send notification to..." section for the second notification': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Send notification to...', 2)
      .chooseUsersForNotification(notificationConfigurations.sendWhom)
      .addFilterForNotification()
      .configureFilterForNotification("company", notificationConfigurations.isNotOneOfFilter,
        `${usersInfo[0].company}, ${usersInfo[1].company}`)
      .setNotesForNotification(notificationValues.newNotes)
      .clickNextButton();
  },

  'Check "Send notification..." section for the second notification': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Send notification...', 3)
      .disablePushNotification()
      .chooseWhenSendNotification(notificationConfigurations.sendWhen)
      .clickNextButton();
  },

  'Check "Your notification" section with summary for the second notification': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Your notification', 4)
      .reviewNotificationTitleOnOverlay(notificationValues.newNotificationTitle)
      .reviewNotificationMessageOnOverlay(notificationValues.newNotificationMessage)
      .reviewNotificationRecipientsOnOverlay(notificationConfigurations.sendWhom.toLowerCase().slice(0, -1))
      .checkNotificationFilterSummaryItems("company", `${notificationConfigurations.isNotOneOfFilter}`,
        `${usersInfo[0].company}, ${usersInfo[1].company}`)
      .reviewNotificationSendTimeOnOverlay(notificationConfigurations.sendWhen.toLowerCase())
      .clickNextButton();
  },

  'Check a new notification successful message for the second notification': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkSuccessfulNotificationMessage()
      .closeSuccessfulNotificationMessage()
      .assertNotificationIsPresentInTheList(notificationValues.notificationTitle);
  },

  'Check the second notification details in the list of notifications': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationMessageIsInTheList(notificationValues.newNotificationMessage)
      .checkNotificationLabelInTheList('Sent')
      .checkNotificationNotesInTheList(notificationValues.newNotes)
      .checkNotificationLabelInTheList('GMT')
      .assertNotificationIsPresentInTheList(notificationValues.notificationTitle)
      .checkNotificationMessageIsInTheList(notificationValues.notificationMessage, 2)
      .checkNotificationLabelInTheList('Sent', 2)
      .checkNotificationNotesInTheList(notificationValues.notes, 2)
     .checkNotificationLabelInTheList('GMT', 2);
  },

  'Check that a new notification that does not response the filter is not present in the notification box': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.switchToOpenWindowByNumber(2)
      .checkPageTitle(`${screensTitles.screenWithNotifications} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.NOTIFICATIONS_BOX)
      .refreshToUpdateNotificationBox()
      .assertNotificationIsPresentInTheBox(notificationValues.notificationTitle)
      .checkNotificationStatus(notificationValues.notificationTitle, 'read')
      .checkNotificationMessage(notificationValues.notificationMessage)
      .assertNotificationIsNotPresentInTheBox(notificationValues.newNotificationTitle);
  },

  'Delete the created application and data source': function (browser) {
      browser
        .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
        .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
        .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
          browser.globals.emailForOrganizationTests);
    }
};