const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.word} ${casual.letter} 04-manage-users-to-duplicate`;
    browser.globals.appNameDuplicated = `${casual.word} ${casual.letter} 04-manage-users-duplicated`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.appNameDuplicated], done,
        browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new application and open Manage users': function (browser) {
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    apps.navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown()
      .clickManageOrganization();
  },

  'Duplicate the application from organization screen': function (browser) {
    const manageOrganization = browser.page.manageOrganizationPages();

    manageOrganization.switchToUsersTab()
      .switchToAppsTab()
  //    .expandActionsForAppByName(browser.globals.appNameGenerated)
  //     .duplicateApplicationFromMenu(browser.globals.appNameDuplicated) disabled due to bug https://weboo.atlassian.net/browse/ID-734
  //     .assertApplicationIsPresentInListByName(browser.globals.appNameDuplicated);
   },

  'Delete the duplicated application from organization screen': function (browser) {
    const manageOrganization = browser.page.manageOrganizationPages();

    manageOrganization.expandActionsForAppByName(browser.globals.appNameGenerated)
      .selectDeleteActionFromMenu()
      .assertApplicationIsNotPresentInListByName(browser.globals.appNameGenerated);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated, browser.globals.appNameDuplicated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.appNameDuplicated],
        browser.globals.emailForOrganizationTests);
  }
};