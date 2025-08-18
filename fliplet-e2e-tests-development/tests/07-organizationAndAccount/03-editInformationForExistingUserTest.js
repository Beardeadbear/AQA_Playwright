const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const firstName = globals.firstName;
const lastName = globals.lastName;
const firstNameEdited = casual.first_name;
const lastNameEdited = casual.last_name;
const password = globals.userEditedPassword;

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 03-edit-users`;
    browser.globals.userEmailGenerated = process.env.FLIPLET_E2E_EMAIL.replace('@', `+${casual.integer(from = 1000, to = 100000)}${casual.word.substr(0, 6)}@`);

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

  'Create a new app and publish it': function (browser) {
    const publish = browser.page.publishScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');
    publish.clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish.closePublishOverlay();
  },

  'Open Manage users': function (browser) {
    const appsPage = browser.page.appsPage();
    const menu = browser.page.topMenu();

    appsPage.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickManageOrganization();
  },

  'Create a new organization user with Standard role': function (browser) {
    const manageOrganization = browser.page.manageOrganizationPages();
    const manageUsers = browser.page.manageUsersScreen();

    manageOrganization.switchToUsersTab()
      .clickCreateNewUserButton()
      .enterUserEmailAddress(browser.globals.userEmailGenerated)
      .enterUserFirstName(firstName)
      .enterUserLastName(lastName)
      .clickSetPassword()
      .enterAndConfirmUserPassword(browser.globals.userPassword)
      .clickCreateUserButton();

    manageUsers.clickGoBackAfterCreatingOfUser();

    manageOrganization.assertUserIsPresentInListByEmail(browser.globals.userEmailGenerated);
  },

  'Edit information for the existing user': function (browser) {
    const menu = browser.page.topMenu();
    const manageOrganization = browser.page.manageOrganizationPages();
    const apps = browser.page.appsPage();

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickManageOrganization();

    manageOrganization.switchToUsersTab()
      .clickEditButtonNearUserByEmail(browser.globals.userEmailGenerated)
      .enterUserFirstName(firstNameEdited)
      .enterUserLastName(lastNameEdited)
      .clickSaveButtonOnUserEdit()
      .waitForUserTabToBeLoadedInManageOrganization()
      .verifyFirstAndLastNamesAreChangedByEmail(browser.globals.userEmailGenerated, firstNameEdited, lastNameEdited);
  },

  'Edit credentials for the existing user': function (browser) {
    const menu = browser.page.topMenu();
    const manageOrganization = browser.page.manageOrganizationPages();
    const signIn = browser.page.signInPage();
    const apps = browser.page.appsPage();

    manageOrganization.switchToUsersTab()
      .clickEditButtonNearUserByEmail(browser.globals.userEmailGenerated)
      .enterAndConfirmUserPassword(password)
      .clickSaveButtonOnUserEdit();

    menu.expandMyAccountDropDown()
      .clickLogout();

    signIn.setValueForEmail(browser.globals.userEmailGenerated)
      .clickContinueButtonForSignIn()
      .setValueForPassword(password)
      .clickContinueButtonForSignIn()
      .enterConfirmationPasswordForAccountUpdating(password)
      .setValueForPassword(password)
      .clickContinueButtonForSignIn();

    apps.waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.userEmailGenerated);
  },

  'Assign a new app to the existing user': function (browser) {
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();
    const manageOrganization = browser.page.manageOrganizationPages();
    const accessLevel = 'can edit & publish updates';

    apps.waitForAppsPageToBeLoaded()
      .assertApplicationIsNotPresentInListByName(browser.globals.appNameGenerated);

    menu.clickLogout();

    browser.login(browser.globals.emailForOrganizationTests);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.emailForOrganizationTests)
      .clickManageOrganization();

    manageOrganization.switchToUsersTab()
      .clickEditButtonNearUserByEmail(browser.globals.userEmailGenerated)
      .clickAssignAppAccessToUser()
      .checkUserCredentialsForAppAssigning(firstNameEdited, lastNameEdited, browser.globals.userEmailGenerated)
      .selectAppForGrantingAccess(browser.globals.appNameGenerated)
      .selectPermissionForApplications(accessLevel)
      .clickAssignButton()
      .assertAppIsAddedToAssigned(browser.globals.appNameGenerated)
      .clickSaveButtonForAssigningApp();

    menu.expandMyAccountDropDown()
      .clickLogout();

    browser.login(browser.globals.userEmailGenerated, password);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.userEmailGenerated);
  },

  'Check that the application is present in the list and all its tabs are accessible': function (browser) {
    const apps = browser.page.appsPage();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    apps.assertApplicationIsPresentInListByName(browser.globals.appNameGenerated);
    apps.openAppByName(browser.globals.appNameGenerated);

    rightSideNavMenu.assert.elementPresent('@appSettingsButton', 'Settings option is displayed to user');

    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@previewButton', 'Preview screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@editButton', 'Edit screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@publishButton', 'Publish screen is available for the user');
  },

  'Lower the access lever to "Can edit"': function (browser) {
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();
    const manageOrganization = browser.page.manageOrganizationPages();
    const accessLevel = 'Can edit';

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickLogout();

    browser.login(browser.globals.emailForOrganizationTests);

    menu.expandMyAccountDropDown();
    menu.clickManageOrganization();

    manageOrganization.switchToUsersTab()
      .clickEditButtonNearUserByEmail(browser.globals.userEmailGenerated)
      .clickAssignAppAccessToUser()
      .checkUserCredentialsForAppAssigning(firstNameEdited, lastNameEdited, browser.globals.userEmailGenerated)
      .changeLevelOfAccessToApplicationByName(browser.globals.appNameGenerated, accessLevel)
      .clickSaveButtonForAssigningApp();

    menu.expandMyAccountDropDown()
      .clickLogout();

    browser.login(browser.globals.userEmailGenerated, password);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.userEmailGenerated);
  },

  'Check that the application is present in the list and publish mode is not accessible': function (browser) {
    const apps = browser.page.appsPage();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    apps.assertApplicationIsPresentInListByName(browser.globals.appNameGenerated);
    apps.openAppByName(browser.globals.appNameGenerated);

    rightSideNavMenu.assert.elementPresent('@appSettingsButton', 'Settings option is displayed to user');

    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@previewButton', 'Preview screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@editButton', 'Edit screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@publishButton', 'Publish screen is not available for the user');
  },

  'Lower the access level to "Preview only"': function (browser) {
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();
    const manageOrganization = browser.page.manageOrganizationPages();
    const accessLevel = 'Preview only';

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown();
    menu.clickLogout();

    browser.login(browser.globals.emailForOrganizationTests);

    menu.expandMyAccountDropDown()
      .clickManageOrganization();

    manageOrganization.switchToUsersTab()
      .clickEditButtonNearUserByEmail(browser.globals.userEmailGenerated)
      .clickAssignAppAccessToUser()
      .checkUserCredentialsForAppAssigning(firstNameEdited, lastNameEdited, browser.globals.userEmailGenerated)
      .changeLevelOfAccessToApplicationByName(browser.globals.appNameGenerated, accessLevel)
      .clickSaveButtonForAssigningApp();

    menu.expandMyAccountDropDown();
    menu.clickLogout();

    browser.login(browser.globals.userEmailGenerated, password);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.userEmailGenerated);
  },

  'Check that the application is present in the list and preview mode is only accessible': function (browser) {
    const apps = browser.page.appsPage();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    apps.assertApplicationIsPresentInListByName(browser.globals.appNameGenerated);
    apps.openAppWithoutEditPermission(browser.globals.appNameGenerated);

    rightSideNavMenu.assert.elementNotPresent('@appSettingsButton', 'Settings option is not displayed to user');

    appTopFixedNavigationBar.section.rightNavBar.assert.elementPresent('@previewButton', 'Preview screen is available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@editButton', 'Edit screen is not available for the user');
    appTopFixedNavigationBar.section.rightNavBar.assert.elementNotPresent('@publishButton', 'Publish screen is not available for the user');
  },

  'Unassign the application from the user': function (browser) {
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();
    const manageOrganization = browser.page.manageOrganizationPages();

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickLogout();

    browser.login(browser.globals.emailForOrganizationTests);

    menu.expandMyAccountDropDown()
      .clickManageOrganization();

    manageOrganization.switchToUsersTab()
      .clickEditButtonNearUserByEmail(browser.globals.userEmailGenerated)
      .clickAssignAppAccessToUser()
      .checkUserCredentialsForAppAssigning(firstNameEdited, lastNameEdited, browser.globals.userEmailGenerated)
      .unasignApplicationFromUserByName(browser.globals.appNameGenerated)
      .clickSaveButtonForAssigningApp();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Check that the user has no access to the application': function (browser) {
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();

    browser.login(browser.globals.userEmailGenerated, password);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.userEmailGenerated);

    apps.waitForAppsPageToBeLoaded()
      .assertApplicationIsNotPresentInListByName(browser.globals.appNameGenerated)
      .navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Delete the user from the organization': function (browser) {
    const menu = browser.page.topMenu();
    const manageOrganization = browser.page.manageOrganizationPages();

    browser.login(browser.globals.emailForOrganizationTests);

    menu.expandMyAccountDropDown();
    menu.clickManageOrganization();

    manageOrganization.switchToUsersTab()
      .clickEditButtonNearUserByEmail(browser.globals.userEmailGenerated)
      .clickDeleteUserButton()
      .switchToUsersTab()
      .assertUserIsNotPresentInListByEmail(browser.globals.userEmailGenerated);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated], browser.globals.emailForOrganizationTests);
  }
};