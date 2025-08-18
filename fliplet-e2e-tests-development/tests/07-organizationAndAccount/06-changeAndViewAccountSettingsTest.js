const globals = require('../../globals_path');
const casual = require('casual');
const firstName = globals.firstName;
const lastName = globals.lastName;
const firstNameEdited = casual.first_name;
const lastNameEdited = casual.last_name;
const password = globals.userEditedPassword;

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser) {
    browser.globals.userEmailGenerated = process.env.FLIPLET_E2E_EMAIL.replace('@',
      `+${casual.integer(from = 1000, to = 100000)}${casual.word.substr(0, 6)}@`);

    browser.login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new user': function (browser) {
    const menu = browser.page.topMenu();
    const manageUsers = browser.page.manageUsersScreen();
    const manageOrganization = browser.page.manageOrganizationPages();

    menu.expandMyAccountDropDown()
      .clickManageOrganization();

    manageOrganization
      .switchToUsersTab()
      .clickCreateNewUserButton()
      .enterUserEmailAddress(browser.globals.userEmailGenerated)
      .enterUserFirstName(firstName)
      .enterUserLastName(lastName)
      .clickSetPassword()
      .enterAndConfirmUserPassword(browser.globals.userPassword)
      .clickCreateUserButton();

    manageUsers.clickGoBackAfterCreatingOfUser();

    manageOrganization.assertUserIsPresentInListByEmail(browser.globals.userEmailGenerated);

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Change the user first name and last name in Account Settings': function (browser) {
    const menu = browser.page.topMenu();
    const accountSettings = browser.page.accountSettingsScreen();
    const apps = browser.page.appsPage();
    const signIn = browser.page.signInPage();

    signIn.setValueForEmail(browser.globals.userEmailGenerated)
      .clickContinueButtonForSignIn()
      .setValueForPassword(browser.globals.userPassword)
      .clickContinueButtonForSignIn()
      .enterConfirmationPasswordForAccountUpdating(browser.globals.userPassword)
      .setValueForPassword(browser.globals.userPassword)
      .clickContinueButtonForSignIn();

    apps.waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.userEmailGenerated)
      .clickAccountSettings();

    accountSettings
      .enterFirstNameAccountSettings(firstNameEdited)
      .enterLastNameAccountSettings(lastNameEdited)
      .clickSaveButtonAccountSettings();
  },

  'Check that new account data is displayed in account drop-down': function (browser) {
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .assertUserDetailsArePresent(firstNameEdited, lastNameEdited);
  },

  'Change the user password in Account Settings': function (browser) {
    const menu = browser.page.topMenu();
    const accountSettings = browser.page.accountSettingsScreen();

    menu.clickAccountSettings();

    accountSettings.enterAndConfirmPasswordAsUser(browser.globals.userPassword, password, password)
      .assertValueInEmailField(browser.globals.userEmailGenerated)
      .clickSaveButtonAccountSettings();

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Check that the the user is able to login with the new password': function (browser) {
    const menu = browser.page.topMenu();

    browser.login(browser.globals.userEmailGenerated, password);

    menu.expandMyAccountDropDown()
      .assertUserDetailsArePresent(firstNameEdited, lastNameEdited)
      .assertUserEmailIsPresentInAccountDropDown(browser.globals.userEmailGenerated);
  },

  'Check that user cannot change account details to empty values': function (browser) {
    const menu = browser.page.topMenu();
    const accountSettings = browser.page.accountSettingsScreen();

    menu.clickAccountSettings();

    accountSettings.enterFirstNameAccountSettings('')
      .enterLastNameAccountSettings('')
      .clickSaveButtonOnUserEditWithoutSuccess();
  },

  'Check that the previous user data is still displayed in account drop-down': function (browser) {
    const apps = browser.page.appsPage();
    const menu = browser.page.topMenu();

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .assertUserDetailsArePresent(firstNameEdited, lastNameEdited);
  },

  'Check that the user cannot change password with an empty value for the current password': function (browser) {
    const accountSettings = browser.page.accountSettingsScreen();
    const errorMessageWithEmptyCurrentPass = 'The current password is required in order to update your password.';
    const menu = browser.page.topMenu();

    menu.clickAccountSettings();

    accountSettings.enterAndConfirmPasswordAsUser('', password, password)
      .clickSaveButtonOnUserEditWithoutSuccess()
      .assertErrorMessageIsVisible(errorMessageWithEmptyCurrentPass);
  },

  'Check that the user cannot change password with a wrong current password': function (browser) {
    const accountSettings = browser.page.accountSettingsScreen();
    const errorMessageWithWrongCurrentPass = 'The current password is not valid. Please try again.';

    accountSettings
      .enterAndConfirmPasswordAsUser('test', password, password)
      .clickSaveButtonOnUserEditWithoutSuccess()
      .assertErrorMessageIsVisible(errorMessageWithWrongCurrentPass);
  },

  'Check that the user cannot change the password with a correct current password but different values in new password fields': function (browser) {
    const accountSettings = browser.page.accountSettingsScreen();
    const errorMessageWhenDifferentNewPass = "Passwords don't match, please enter again.";

    accountSettings
      .enterAndConfirmPasswordAsUser(password, browser.globals.userPassword, password)
      .clickSaveButtonOnUserEditWithoutSuccess()
      .assertErrorMessageIsVisible(errorMessageWhenDifferentNewPass);
  },

  'Check that the user cannot change the password with a correct current password but with an empty value in the password confirmation field': function (browser) {
    const accountSettings = browser.page.accountSettingsScreen();
    const errorMessageWhenDifferentNewPass = "Passwords don't match, please enter again.";

    accountSettings
      .enterAndConfirmPasswordAsUser(password, password, '')
      .clickSaveButtonOnUserEditWithoutSuccess()
      .assertErrorMessageIsVisible(errorMessageWhenDifferentNewPass);
  },

  'Check that the user is still able to login with the credentials': function (browser) {
    const apps = browser.page.appsPage();
    const menu = browser.page.topMenu();

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickLogout();

    browser.login(browser.globals.userEmailGenerated, password);

    menu.expandMyAccountDropDown()
      .clickLogout();
  },

  'Delete the user from the organization': function (browser) {
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
  }
};