const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');
const screensTitles = {
  screenWithLogin: "Directory",
  screenWithNotifications: 'Home',
  screenForRedirect: 'Get in touch'
};
const notificationConfigurations = {
  linkAction: 'Link to screen',
  sendWhom: 'Signed in users',
  sendWhen: 'Now',
  equalFilter: 'Equals',
  notEqualFilter: 'Not equal',
  containsFilter: 'Contains'
};
const notificationValues = {
  notificationTitle: casual.word.concat(casual.letter),
  newNotificationTitle: casual.letter.concat(casual.word),
  notificationMessage: casual.title,
  newNotificationMessage: casual.title,
  notes: casual.short_description,
  newNotes: casual.short_description,
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

  '@disabled': (globals.smokeTest === 'true'),

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 02-notif`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 02-notifications`;

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
    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, usersInfo)
      .newDragAndDrop(widgets.NOTIFICATIONS_BOX)
      .waitForWidgetInterfaceNewDnd(widgets.NOTIFICATIONS_BOX);
  },

  'Add Login and open its configuration': function (browser) {
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

    webApp.openMenuItemByName(screensTitles.screenWithLogin)
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

  'Check "Configure your notification" section and empty title/message errors': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Configure your notification', 1)
      .clickNextButton()
      .assertEmptyNotificationTitleError()
      .assertEmptyNotificationMessageError()
      .setNotificationTitle(notificationValues.notificationTitle)
      .clickNextButton()
      .assertEmptyNotificationMessageError()
      .setNotificationMessage(notificationValues.notificationMessage);
  },

  'Select screen redirection for the notification link and check screen preview': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();
    const componentsScreen = browser.page.componentsScreen();
    const previewAppScreen = browser.page.previewAppScreen();

    notificationOverlay.chooseTheLinkAction(notificationConfigurations.linkAction);

    componentsScreen.switchToFLWidgetProviderFrame('@screenListDropdownField')
      .selectScreenForLinkingByName(screensTitles.screenForRedirect)

    notificationOverlay.clickPreviewTargetScreenButton()
      .checkPreviewTargetScreen();

    previewAppScreen.assertCorrectMenuItemIsSelected('Contact');

    notificationOverlay.closePreviewTargetScreen()
      .clickNextButton();
  },

  'Check "Send notification to..." section': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Send notification to...', 2)
      .chooseUsersForNotification(notificationConfigurations.sendWhom)
      .addFilterForNotification()
      .configureFilterForNotification("company", notificationConfigurations.equalFilter, usersInfo[0].company)
      .addFilterForNotification()
      .configureFilterForNotification("position", notificationConfigurations.containsFilter, usersInfo[0].position
        .substring(0, usersInfo[0].position.indexOf(" ")), 2)
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
      .checkNotificationFilterSummaryItems("company", `is ${notificationConfigurations.equalFilter.slice(0, -1)} to`,
        usersInfo[0].company)
      .checkNotificationFilterSummaryItems("position", notificationConfigurations.containsFilter,
        usersInfo[0].position.substring(0, usersInfo[0].position.indexOf(" ")), 2)
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
      .checkNotificationActionLink(screensTitles.screenForRedirect);
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
      .checkNotificationStatus(notificationValues.notificationTitle, 'read')
      .clickNotification(notificationValues.notificationTitle)
      .checkIfNotificationHasBeenClicked(notificationValues.notificationTitle)
      .checkPageTitle(`${screensTitles.screenForRedirect} - ${browser.globals.appNameGenerated}`);
  },

  'Return to studio to copy the first notification and check "Configure your notification" section': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();
    const webApp = browser.page.webApplicationPages();

    webApp.switchToOpenWindowByNumber(1);

    notificationOverlay.switchToWidgetProviderFrame()
      .copyNotification()
      .checkNotificationSectionIsDisplay('Configure your notification', 1)
      .assertValueInNotificationTitleInOverlay(notificationValues.notificationTitle)
      .assertValueInNotificationMessageInOverlay(notificationValues.notificationMessage)
      .setNotificationMessage(notificationValues.newNotificationMessage)
      .setNotificationTitle(notificationValues.newNotificationTitle)
      .checkLinkAction(notificationConfigurations.linkAction)
      .clickNextButton();
  },

  'Check "Send notification to..." section for the copied notification': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Send notification to...', 2)
      .checkUsersForNotification(notificationConfigurations.sendWhom)
      .checkFiltersValuesInOverlay("company", notificationConfigurations.equalFilter, usersInfo[0].company)
      .checkFiltersValuesInOverlay("position", notificationConfigurations.containsFilter, usersInfo[0].position
        .substring(0, usersInfo[0].position.indexOf(" ")), 2)
      .deleteFilterForNotification(2)
      .configureFilterForNotification("company", notificationConfigurations.notEqualFilter, usersInfo[0].company)
      .checkNotesForNotification(notificationValues.notes);
  },

  'Save the copied notification as a draft after adding filter': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.saveNotificationAsDraft()
      .checkSuccessfulNotificationMessage()
      .closeSuccessfulNotificationMessage()
      .assertNotificationIsPresentInTheList(notificationValues.newNotificationTitle)
      .checkNotificationLabelInTheList('Draft');
  },

  'Edit notification notes, proceed to edit the draft notification and check "Configure your notification" section': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.editNotificationNotesInTheList(notificationValues.newNotes)
      .checkNotificationNotesInTheList(notificationValues.newNotes)
      .clickEditNotificationInTheList()
      .checkNotificationSectionIsDisplay('Configure your notification', 1)
      .assertValueInNotificationTitleInOverlay(notificationValues.newNotificationTitle)
      .assertValueInNotificationMessageInOverlay(notificationValues.newNotificationMessage)
      .checkLinkAction(notificationConfigurations.linkAction)
      .clickNextButton();
  },

  'Check "Send notification to..." section for the copied notification after saving as a draft': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Send notification to...', 2)
      .checkUsersForNotification(notificationConfigurations.sendWhom)
      .checkFiltersValuesInOverlay("company", notificationConfigurations.notEqualFilter, usersInfo[0].company)
      .checkNotesForNotification(notificationValues.newNotes)
      .clickNextButton();
  },

  'Check "Send notification..." section for the copied notification after saving as a draft': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Send notification...', 3)
      .disablePushNotification()
      .chooseWhenSendNotification(notificationConfigurations.sendWhen)
      .clickNextButton();
  },

  'Check "Your notification" section with summary for the copied notification after saving as a draft': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationSectionIsDisplay('Your notification', 4)
      .reviewNotificationTitleOnOverlay(notificationValues.newNotificationTitle)
      .reviewNotificationMessageOnOverlay(notificationValues.newNotificationMessage)
      .reviewNotificationRecipientsOnOverlay(notificationConfigurations.sendWhom.toLowerCase().slice(0, -1))
      .checkNotificationFilterSummaryItems("company", `is ${notificationConfigurations.notEqualFilter} to`, usersInfo[0].company)
      .reviewNotificationSendTimeOnOverlay(notificationConfigurations.sendWhen.toLowerCase())
      .clickNextButton();
  },

  'Check the copied notification successful message': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkSuccessfulNotificationMessage()
      .closeSuccessfulNotificationMessage()
      .assertNotificationIsPresentInTheList(notificationValues.newNotificationTitle);
  },

  'Check the copied notification details in the list of notifications': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.checkNotificationMessageIsInTheList(notificationValues.newNotificationMessage)
      .checkNotificationLabelInTheList('Sent')
      .checkNotificationNotesInTheList(notificationValues.newNotes)
      .checkNotificationActionLink(screensTitles.screenForRedirect);
  },

  'Delete the first created notification': function (browser) {
    const notificationOverlay = browser.page.notificationOverlay();

    notificationOverlay.deleteNotification(2)
      .assertNotificationIsNotPresentInTheList(notificationValues.notificationTitle);
  },

  'Check that all the notification are not present in the application': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.switchToOpenWindowByNumber(2)
      .checkPageTitle(`${screensTitles.screenForRedirect} - ${browser.globals.appNameGenerated}`)
      .openMenuItemByName(screensTitles.screenWithNotifications)
      .checkPageTitle(`${screensTitles.screenWithNotifications} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.NOTIFICATIONS_BOX)
      .refreshToUpdateNotificationBox()
      .assertNotificationIsNotPresentInTheBox(notificationValues.notificationTitle)
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