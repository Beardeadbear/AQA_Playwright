const casual = require('casual');
const globals = require('../../globals_path');
const notificationTitle = 'Title';
const notificationMessage = 'Message for the notification';
const successMessage = 'Notification sent';
const permissionPopUpTitle = 'Title for permission popup';
const permissionPopUpMessage = 'Message for permission popup';
const updateText = 'app was updated';

module.exports = {
  '@disabled': true, //the test is obsolete
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.word.substr(0, 5)} ${casual.word.substr(0, 3)} App-${casual.word.substr(0, 2)}-29-push-notifications ${casual.word.substr(0, 3)}`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .resizeWindow(1600, 1200)
      .login()
      .createAppUsingClientSupportTemplate(browser.globals.appNameGenerated);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Publish app and submit notification with empty text and message': function(browser) {
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();

    //open created application

    apps
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    //publish an application

    editApp.clickPublishMenuItem();
    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');
    publish.clickPublishButton();

    browser
      .waitForElementVisible('.btn.btn-danger', browser.globals.mediumWait)
      .waitForElementVisible('.static.wrap.url', browser.globals.mediumWait);

    //select "Apps inside a portal shouldn't request users to subscribe" and update the application

    publish
      .closePublishOverlay()
      .openNotificationsOverlay();
    publish
      .selectPermissionPopupTab()
      .selectNoSubscribeInsidePortalCheckbox();
    publish.enterPermissionPopupTitleAndMessage(permissionPopUpTitle, permissionPopUpMessage); // configure permissions popup
    publish.clickSaveButtonPermissionPopupSettings();
    publish
      .closePublishOverlay()
      .clickUpdateYourAppsButton()
      .confirmApplicationUpdate()
      .enterUpdateText(updateText)
      .clickUpdateButton()
      .assertApplicationVersionOnUpdateScreen(2)
      .closePublishOverlay();

    //try to send empty notification

    publish.openNotificationsOverlay();
    publish
      .selectPushNotificationTab()
      .clickNewPushNotificationButton()
      .clickReviewAndSendNotificationWithEmptyFields('#push-notification-form');

    //asserting that error messages are displayed and Notification preview is not opened

    browser
      .waitForElementVisible('.text-danger.push_notification_message_error', browser.globals.mediumWait)
      .waitForElementVisible('.text-danger.push_notification_title_error', browser.globals.mediumWait);
  },

  'Enter message and title for notifications and assert details of sent notification on studio and logs': function(browser) {
    const publish = browser.page.publishScreen();

    //entering title, message and submitting new push notification

    publish.enterPushNotificationTitleAndMessage(notificationTitle, notificationMessage);
    publish.clickReviewAndSendNotification('#push-notification-form');
    publish.clickSendNotificationButtonAndConfirm();
    publish.checkIfNotificationSent(successMessage, '#push-notification-form');

    //assert details of new notification in Notifications overlay

    browser
      .switchToWidgetProviderFrame()
      .waitForElementVisible('.report-notification-title', browser.globals.mediumWait)
      .waitForElementVisible('.report-notification-message', browser.globals.mediumWait)
      .assert.containsText('.report-notification-title', notificationTitle)
      .assert.containsText('.report-notification-message', notificationMessage);

    //assert details of new notification in app logs

    browser
      .getAppLogs(browser.globals.apiUri)
      .waitForElementVisible('body pre', browser.globals.mediumWait)
      .assert.containsText('body pre', `"title":"${notificationTitle}"`)
      .assert.containsText('body pre', `"body":"${notificationMessage}"`)
      .assert.containsText('body pre', `"popupTitle":"${permissionPopUpTitle}"`)
      .assert.containsText('body pre', `"popupMessage":"${permissionPopUpMessage}"`);
  },

  'Deleting created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};