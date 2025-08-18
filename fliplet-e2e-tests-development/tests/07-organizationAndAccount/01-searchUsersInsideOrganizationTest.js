const casual = require('casual');
const globals = require('../../globals_path');
const firstName = globals.firstName;
const lastName = globals.lastName;

module.exports = {
  before: function (browser) {
    browser.globals.userEmailGenerated = process.env.FLIPLET_E2E_EMAIL.replace('@',
      `+${casual.integer(from = 1000, to = 100000)}${casual.word.substr(0, 6)}@`);

    browser.login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Open Manage users': function (browser) {
    const menu = browser.page.topMenu();

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

  'Search for users inside organization using their first name': function (browser) {
    const menu = browser.page.topMenu();
    const manageOrganization = browser.page.manageOrganizationPages();
    const appsPage = browser.page.appsPage();

    appsPage.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickManageOrganization();

    manageOrganization.switchToUsersTab()
      .enterSearchTerm(firstName)
      .assertAllFoundUsersMatchTheSearchTerm(firstName);
  },

  'Search for users inside organization using their last name': function(browser){
    const manageOrganization = browser.page.manageOrganizationPages();

    browser.refresh();

    manageOrganization.switchToUsersTab()
      .enterSearchTerm(lastName)
      .assertAllFoundUsersMatchTheSearchTerm(lastName);
  },

  'Search for users inside organization using their email': function(browser){
    const manageOrganization = browser.page.manageOrganizationPages();

    browser.refresh();

    manageOrganization.switchToUsersTab()
      .enterSearchTerm(browser.globals.email)
      .assertAllFoundUsersMatchTheSearchTerm(browser.globals.email);
  },

  'Delete the user from organization': function (browser) {
    const menu = browser.page.topMenu();
    const manageOrganization = browser.page.manageOrganizationPages();

    menu.expandMyAccountDropDown()
      .clickLogout();

    browser.login(browser.globals.emailForOrganizationTests);

    menu.expandMyAccountDropDown()
    .clickManageOrganization();

    manageOrganization.switchToUsersTab()
      .clickEditButtonNearUserByEmail(browser.globals.userEmailGenerated)
      .clickDeleteUserButton()
      .switchToUsersTab()
      .assertUserIsNotPresentInListByEmail(browser.globals.userEmailGenerated);
  },
};