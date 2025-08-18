const globals = require('../../globals_path');
const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');

module.exports = {
  before: function (browser, done) {
    browser.globals.appNamePublish = `${casual.title} 05-user-access-permission`;
    browser.globals.appNameEdit = `${casual.letter} ${casual.word} ${casual.letter} 05-edit-only`;
    browser.globals.appNamePreview = `${casual.title} 05-preview-only`;
    browser.globals.appNameMultiple = `${casual.title} 05-multiple-users`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNamePublish, browser.globals.appNameEdit, browser.globals.appNamePreview,
        browser.globals.appNameMultiple], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create new apps and publish one of them': function (browser) {
    const publish = browser.page.publishScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    browser.createAppUsingTemplate(browser.globals.appNameEdit, applicationTemplates.CLIENT_SUPPORT);

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');
    publish.clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameEdit);
    publish.closePublishOverlay()
      .clickVersionHistoryButton();
    publish.assertApplicationVersionNumber(1);
  },

  'Invite users to the application with "Can edit & publish updates" permission': function (browser) {
    const apps = browser.page.appsPage();
    const menu = browser.page.topMenu();
    const manageUsers = browser.page.manageUsersScreen();

    browser.createAppUsingTemplate(browser.globals.appNamePublish, 'Client Support');

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .expandOptionsForAppByName(browser.globals.appNamePublish);
    apps.selectOptionByTitle(browser.globals.appNamePublish, 'Manage users');

    manageUsers.enterEmailsForSharing(browser.globals.email3)
      .selectAccessControlLevel('Can edit & publish updates');
    manageUsers.clickShareButton();
    manageUsers.switchToWhoHasAccessTab();
    manageUsers.verifyUserIsPresentInAccessListByEmail(browser.globals.email3);

    browser.refresh();

    menu.expandMyAccountDropDown()
      .clickLogout();

    browser.login(browser.globals.email3);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.email3);
  },

  'Check that the application is present in the list and all its tabs are accessible for the user': function (browser) {
    const apps = browser.page.appsPage();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    const menu = browser.page.topMenu();

    apps.assertApplicationIsPresentInListByName(browser.globals.appNamePublish)
      .openAppByName(browser.globals.appNamePublish);

    rightSideNavMenu.assert.elementPresent('@appSettingsButton', 'Settings option is displayed to user');

    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@previewButton', 'Preview screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@editButton', 'Edit screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@publishButton', 'Publish screen is available for the user');

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Invite users to the application with "Can edit" permission': function (browser) {
    const apps = browser.page.appsPage();
    const menu = browser.page.topMenu();
    const manageUsers = browser.page.manageUsersScreen();

    browser.login();

    apps.expandOptionsForAppByName(browser.globals.appNameEdit);
    apps.selectOptionByTitle(browser.globals.appNameEdit, 'Manage users');

    manageUsers
      .enterEmailsForSharing(browser.globals.email3)
      .selectAccessControlLevel('Can edit');

    manageUsers.clickShareButton();
    manageUsers.switchToWhoHasAccessTab();
    manageUsers.verifyUserIsPresentInAccessListByEmail(browser.globals.email3);

    browser.refresh();

    menu.expandMyAccountDropDown()
      .clickLogout();

    browser.login(browser.globals.email3);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.email3);
  },

  'Check that the application is present in the list and publish mode is not accessible for the user': function (browser) {
    const apps = browser.page.appsPage();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const menu = browser.page.topMenu();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    apps.assertApplicationIsPresentInListByName(browser.globals.appNameEdit);
    apps.openAppByName(browser.globals.appNameEdit);

    rightSideNavMenu.assert.elementPresent('@appSettingsButton', 'Settings option is displayed to user');

    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@previewButton', 'Preview screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@editButton', 'Edit screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@publishButton', 'Publish screen is not available for the user');

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Invite users to the application with "Preview only" permission': function (browser) {
    const apps = browser.page.appsPage();
    const menu = browser.page.topMenu();
    const manageUsers = browser.page.manageUsersScreen();

    browser.login();
    browser.createAppUsingTemplate(browser.globals.appNamePreview, 'Client Support');

    apps.navigate()
      .waitForAppsPageToBeLoaded();
    apps.expandOptionsForAppByName(browser.globals.appNamePreview);
    apps.selectOptionByTitle(browser.globals.appNamePreview, 'Manage users');

    manageUsers.enterEmailsForSharing(browser.globals.email3)
      .selectAccessControlLevel('Preview only');
    manageUsers.clickShareButton();
    manageUsers.switchToWhoHasAccessTab();
    manageUsers.verifyUserIsPresentInAccessListByEmail(browser.globals.email3);

    browser.refresh();

    menu.expandMyAccountDropDown()
      .clickLogout();

    browser.login(browser.globals.email3);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.email3);
  },

  'Check that the application is present in the list and the user can only preview it': function (browser) {
    const apps = browser.page.appsPage();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const menu = browser.page.topMenu();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    apps.assertApplicationIsPresentInListByName(browser.globals.appNamePreview);
    apps.openAppWithoutEditPermission(browser.globals.appNamePreview);

    rightSideNavMenu.assert.elementNotPresent('@appSettingsButton', 'Settings option is displayed to user');

    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@previewButton', 'Preview screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@editButton', 'Edit screen is not available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@publishButton', 'Publish screen is not available for the user');

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Invite multiple users and check they have the same permissions': function (browser) {
    const apps = browser.page.appsPage();
    const menu = browser.page.topMenu();
    const manageUsers = browser.page.manageUsersScreen();

    browser.login();
    browser.createAppUsingTemplate(browser.globals.appNameMultiple, applicationTemplates.CLIENT_SUPPORT);

    apps.navigate()
      .waitForAppsPageToBeLoaded();
    apps.expandOptionsForAppByName(browser.globals.appNameMultiple);
    apps.selectOptionByTitle(browser.globals.appNameMultiple, 'Manage users');

    manageUsers.enterEmailsForSharing([browser.globals.email2, browser.globals.email3])
      .selectAccessControlLevel('Preview only');
    manageUsers.clickShareButton();
    manageUsers.switchToWhoHasAccessTab();
    manageUsers.verifyUserIsPresentInAccessListByEmail(browser.globals.email2);
    manageUsers.verifyUserIsPresentInAccessListByEmail(browser.globals.email3);

    browser.refresh();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Login as the first user with permissions and check he can only preview the app': function (browser) {
    const apps = browser.page.appsPage();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const menu = browser.page.topMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    browser.login(browser.globals.email2);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.email2);

    apps.assertApplicationIsPresentInListByName(browser.globals.appNameMultiple);
    apps.openAppWithoutEditPermission(browser.globals.appNameMultiple);

    rightSideNavMenu.assert.elementNotPresent('@appSettingsButton', 'Settings option is displayed to user');

    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@previewButton', 'Preview screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@editButton', 'Edit screen is not available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@publishButton', 'Publish screen is not available for the user');

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Login as the second user with permissions and check he can only preview the app too': function (browser) {
    const apps = browser.page.appsPage();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const menu = browser.page.topMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    browser.login(browser.globals.email3);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.email3);

    apps.assertApplicationIsPresentInListByName(browser.globals.appNameMultiple);
    apps.openAppWithoutEditPermission(browser.globals.appNameMultiple);

    rightSideNavMenu.assert.elementNotPresent('@appSettingsButton', 'Settings option is displayed to user');

    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@previewButton', 'Preview screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@editButton', 'Edit screen is not available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@publishButton', 'Publish screen is not available for the user');

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Delete the created applications': function (browser) {
    browser
      .login()
      .deleteApplicationsMatchingParticularName(browser.globals.appNameEdit)
      .deleteApplicationsMatchingParticularName(browser.globals.appNamePreview)
      .deleteApplicationsMatchingParticularName(browser.globals.appNameMultiple)
      .deleteApplicationsMatchingParticularName(browser.globals.appNamePublish)
      .removeNamesFromCleanersList([browser.globals.appNamePublish, browser.globals.appNameEdit, browser.globals.appNamePreview,
        browser.globals.appNameMultiple]);
  }
};