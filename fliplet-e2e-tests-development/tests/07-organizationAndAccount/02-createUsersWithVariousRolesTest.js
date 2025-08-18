const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const firstName = globals.firstName;
const lastName = globals.lastName;

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 02-create-users`;
    browser.globals.userEmailGenerated = process.env.FLIPLET_E2E_EMAIL.replace('@', `+${casual.integer(from = 1000, to = 100000)}${casual.word.substr(0, 6)}@`);

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app and open Manage users': function (browser) {
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickManageOrganization();
  },

  'Create a new organization user with Standard role': function (browser) {
    const manageOrganization = browser.page.manageOrganizationPages();

    manageOrganization.switchToUsersTab()
      .clickCreateNewUserButton()
      .enterUserEmailAddress(browser.globals.userEmailGenerated)
      .enterUserFirstName(firstName)
      .enterUserLastName(lastName)
      .clickSetPassword()
      .enterAndConfirmUserPassword(browser.globals.userPassword)
      .clickCreateUserButton();
  },

  'Check that a new user is in the users list and log out': function (browser) {
    const manageOrganization = browser.page.manageOrganizationPages();
    const manageUsers = browser.page.manageUsersScreen();
    const menu = browser.page.topMenu();

    manageUsers.clickGoBackAfterCreatingOfUser();

    manageOrganization.assertUserIsPresentInListByEmail(browser.globals.userEmailGenerated);

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Login and verify that the user has no access to organization applications': function (browser) {
    const menu = browser.page.topMenu();
    const signIn = browser.page.signInPage();
    const apps = browser.page.appsPage();

    signIn.setValueForEmail(browser.globals.userEmailGenerated)
      .clickContinueButtonForSignIn()
      .setValueForPassword(browser.globals.userPassword)
      .clickContinueButtonForSignIn()
      .enterConfirmationPasswordForAccountUpdating(browser.globals.userPassword)
      .setValueForPassword(browser.globals.userPassword)
      .clickContinueButtonForSignIn();

    apps.waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .checkThatLinkIsNotPresentInMenuBar('Manage organization')
      .clickLogout();
  },

  'Extend the user permissions to Admin role': function (browser) {
    const menu = browser.page.topMenu();
    const manageOrganization = browser.page.manageOrganizationPages();

    browser.login(browser.globals.emailForOrganizationTests);

    menu.expandMyAccountDropDown()
      .clickManageOrganization();

    manageOrganization.switchToUsersTab()
      .clickEditButtonNearUserByEmail(browser.globals.userEmailGenerated)
      .selectAdminUserRole()
      .clickSaveButtonOnUserEdit();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Login as the new user and check that the app is visible': function (browser) {
    const menu = browser.page.topMenu();
    const manageOrganization = browser.page.manageOrganizationPages();

    browser.login(browser.globals.userEmailGenerated, browser.globals.userPassword);

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.userEmailGenerated)
      .clickManageOrganization();

    manageOrganization.switchToAppsTab()
      .assertApplicationIsPresentInListByName(browser.globals.appNameGenerated);

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Delete the user from organization': function (browser) {
    const menu = browser.page.topMenu();
    const manageOrganization = browser.page.manageOrganizationPages();

    browser.login(browser.globals.emailForOrganizationTests);

    menu.expandMyAccountDropDown()
      .clickManageOrganization();

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
