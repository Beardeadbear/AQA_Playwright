const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');
const screensTitles = {
  screenWithNotifications: 'First screen',
};
const notificationConfigurations = {
  linkAction: 'No link',
  sendWhom: 'All users',
  sendWhen: 'Now'
};
const notificationValues = {
  demoNotificationTitle: 'Reminder',
  notificationTitle: casual.word,
  notificationMessage: casual.title,
  notes: casual.short_description,
};

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 01-notif`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app and add Notification box component': function (browser) {
    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);
    browser.newDragAndDrop(widgets.NOTIFICATIONS_BOX)
      .waitForWidgetInterfaceNewDnd(widgets.NOTIFICATIONS_BOX)
      .switchToWidgetInstanceFrame();
  },

  'Enable Show sample notifications and check it on preview mode': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    componentsScreen.assertComponentConfigurationIsOpen('Configure your notification inbox')
      .tickCheckBoxByLabel('show_demo')
      .clickSaveAndCloseButton();

    appTopFixedNavigationBar.navigateToPreviewMode();
  },

  'Check sample notification on preview mode and notification box elements': function (browser) {
    const webApp = browser.page.webApplicationPages();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.NOTIFICATIONS_BOX)
      .switchToPreviewFrame();

    webApp.checkNotificationComponentElements()
      .assertNotificationIsPresentInTheBox(notificationValues.demoNotificationTitle)
      .checkNotificationStatus(notificationValues.demoNotificationTitle, 'unread')
      .clickMarkAllAsRead()
      .checkNotificationStatus(notificationValues.demoNotificationTitle, 'read')
      .clickAboutAppLinkOnNotificationBox()
      .checkAboutThisAppOverlay()
      .closeAboutThisAppOverlay();
  },

  'Return to edit mode and click "Manage configuration" to open "Notifications" overlay': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const notificationOverlay = browser.page.notificationOverlay();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.checkThatComponentIsPresentOnPreviewScreen(widgets.NOTIFICATIONS_BOX)
      .openDetailsOfComponentByClickingOnIt(widgets.NOTIFICATIONS_BOX);

    componentsScreen.assertComponentConfigurationIsOpen('Configure your notification inbox')
      .clickManageNotificationsButton();

    notificationOverlay.assertNotificationOverlayIsOpen()
      .clickCreateNewButton();
  },

  'Configure "Configure your notification" section': function (browser) {
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

  'Configure "Send notification to..." section': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Send notification to...', 2)
      .chooseUsersForNotification(notificationConfigurations.sendWhom)
      .setNotesForNotification(notificationValues.notes)
      .clickNextButton();
  },

  'Configure "Send notification..." section': function (browser) {
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
      .reviewNotificationSendTimeOnOverlay(notificationConfigurations.sendWhen.toLowerCase())
      .clickNextButton();
  },

  'Check a new notification successful message': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkSuccessfulNotificationMessage()
      .closeSuccessfulNotificationMessage()
      .assertNotificationIsPresentInTheList(notificationValues.notificationTitle);
  },

  'Check a new notification details in the list of notifications': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationMessageIsInTheList(notificationValues.notificationMessage)
      .checkNotificationLabelInTheList('Sent')
      .checkNotificationNotesInTheList(notificationValues.notes)
      .closeNotificationOverlay();
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

  'Check a new notification in the application': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openWebAppMenu()
      .openMenuItemByName(screensTitles.screenWithNotifications)
      .checkPageTitle(`${screensTitles.screenWithNotifications} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.NOTIFICATIONS_BOX)
      .allowNotificationOnPopup()
      .refreshToUpdateNotificationBox()
      .assertNotificationIsPresentInTheBox(notificationValues.notificationTitle)
      .checkNotificationStatus(notificationValues.notificationTitle, 'unread')
      .checkNotificationMessage(notificationValues.notificationMessage)
      .clickMarkAllAsRead()
      .checkNotificationStatus(notificationValues.notificationTitle, 'read');
  },

  'Delete the created application': function (browser) {
      browser
        .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
        .removeNamesFromCleanersList([browser.globals.appNameGenerated], browser.globals.emailForOrganizationTests);
    }
};