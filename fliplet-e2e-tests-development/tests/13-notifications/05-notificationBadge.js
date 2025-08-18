const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');
const screensTitles = {
    screenWithNotifications: 'First screen',
};
const notificationConfigurations = {
    linkAction: 'Link to web page',
    sendWhen: 'Now',
};
const notificationValues = {
    notificationTitle: casual.word,
    notificationMessage: casual.title,
    notes: casual.short_description,
    webPageForLink: 'fliplet.com'
};
const deviceId = [];

module.exports = {
    '@disabled': (globals.smokeTest == 'true'),
    before: function (browser, done) {
        browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 05-notif`;

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
            .waitForWidgetInterfaceNewDnd(widgets.NOTIFICATIONS_BOX);
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

    'Check notification box on web and get the device id': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkPageTitle(`${screensTitles.screenWithNotifications} - ${browser.globals.appNameGenerated}`)
            .assertWidgetIsPresentOnScreen(widgets.NOTIFICATIONS_BOX)
            .allowNotificationOnPopup()
            .checkNotificationComponentElements()
            .clickAboutAppLinkOnNotificationBox()
            .checkAboutThisAppOverlay()
            .getDeviceIdFromAboutAppOverlay(deviceId)
            .closeAboutThisAppOverlay();
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
            .clickSendNotificationButton();
    },

    'Check a new notification successful message': function (browser) {
        const notificationOverlay = browser.page.notificationOverlay();

        notificationOverlay.checkSuccessfulNotificationMessage()
            .closeSuccessfulNotificationMessage()
            .assertNotificationIsPresentInTheList(notificationValues.notificationTitle);
    },

    'Return to studio to create the second notification and check "Configure your notification" section for it': function (browser) {
        const notificationOverlay = browser.page.notificationOverlay();
        const webApp = browser.page.webApplicationPages();

        webApp.switchToOpenWindowByNumber(1);

        notificationOverlay.clickCreateNewButton()
        notificationOverlay.checkNotificationSectionIsDisplay('Configure your notification', 1)
            .clickNextButton()
            .assertEmptyNotificationTitleError()
            .assertEmptyNotificationMessageError()
            .setNotificationTitle(notificationValues.newNotificationTitle)
            .setNotificationMessage(notificationValues.newNotificationMessage)
            .chooseTheLinkAction(notificationConfigurations.linkAction)
            .clickNextButton();
    },

    'Check "Send notification to..." section for the second notification': function (browser) {
        const notificationOverlay = browser.page.notificationOverlay();

        notificationOverlay.checkNotificationSectionIsDisplay('Send notification to...', 2)
            .setNotesForNotification(notificationValues.notes)
            .clickNextButton();
    },

    'Check "Send notification..." section for the second notification': function (browser) {
        const notificationOverlay = browser.page.notificationOverlay();

        notificationOverlay.checkNotificationSectionIsDisplay('Send notification...', 3)
            .disablePushNotification()
            .chooseWhenSendNotification(notificationConfigurations.sendWhen)
            .clickNextButton();
    },

    'Check second "Your notification" section with summary': function (browser) {
        const notificationOverlay = browser.page.notificationOverlay();

        notificationOverlay.checkNotificationSectionIsDisplay('Your notification', 4)
            .reviewNotificationTitleOnOverlay(notificationValues.newNotificationTitle)
            .clickSendNotificationButton();
    },

    'Check that a new notification is read': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.switchToOpenWindowByNumber(2)
            .checkPageTitle(`${screensTitles.screenWithNotifications} - ${browser.globals.appNameGenerated}`)
            .assertWidgetIsPresentOnScreen(widgets.NOTIFICATIONS_BOX)
            .refreshToUpdateNotificationBox()
            .assertNotificationIsPresentInTheBox(notificationValues.newNotificationMessage)
            .clickNotification(notificationValues.newNotificationMessage)
            .switchToOpenWindowByNumber(2)
            .checkNotificationStatus(notificationValues.newNotificationMessage, 'read')
            .assertNotificationIsPresentInTheBox(notificationValues.notificationTitle);
    },

    'Delete the created application and data source': function (browser) {
        browser
            .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
            .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
            .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
                browser.globals.emailForOrganizationTests);
    }
};