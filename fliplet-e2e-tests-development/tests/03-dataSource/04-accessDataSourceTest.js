const casual = require('casual');
const invalidUsrId = '01234';
const userId = '66427';
const userPermission = 'crudq';
const amountOfUsersInPermissionList = [];

module.exports ={
  // TODO: The test suite needs to be refactored.
  before: function (browser, done) {
    browser.globals.dataSourceNameGenerated = `${casual.title} 04-access`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.dataSourceNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create new access role with invalid id': function (browser) {
    const dataSource = browser.page.singleDataSourcePage();

    browser.createDataSource(browser.globals.dataSourceNameGenerated);

    dataSource.switchToRolesTab();
    dataSource.getAmountOfUsersInPermissionListBeforeAddingNewUser(amountOfUsersInPermissionList);
    dataSource.clickAddNewRoleButton();
    dataSource.enterUserIdForPermission(invalidUsrId, userPermission);
    dataSource.assertOnlyCurrentUserHaveAccessToDataSource(browser.globals.email); // bug #6046
  },

  'Create new access role with valid id': function(browser){
    const menu = browser.page.topMenu();
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSource.clickAddNewRoleButton();
    dataSource.enterUserIdForPermission(userId, userPermission);
    dataSource.assertUserIsAddedToPermissionList(userId, amountOfUsersInPermissionList[amountOfUsersInPermissionList.length-1]);
    dataSource.clickBackToDataSourcesButton();

    browser.frameParent();

    menu.expandMyAccountDropDown();
    menu.clickLogout();

    browser.login(browser.globals.email2);

    menu.clickManageAppData();

    allDataSources.waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    browser.frameParent();

    menu.expandMyAccountDropDown();
    menu.clickLogout();
  },

  'Revoke an access role': function(browser){
    const menu = browser.page.topMenu();
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    browser.login();

    menu.clickManageAppData();

    allDataSources.waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .switchToRolesTab()
      .clickRevokeRoleButtonByEmail(browser.globals.email2);

    dataSource.clickBackToDataSourcesButton();

    browser.frameParent();

    menu.expandMyAccountDropDown();
    menu.clickLogout();

    browser.login(browser.globals.email2);

    menu.clickManageAppData();

    allDataSources.waitForDataSourcesPageToBeLoaded()
      .assertDataSourceIsNotPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated);

    browser.frameParent();

    menu.expandMyAccountDropDown();
    menu.clickLogout();

    browser.login();
  },

  'Deleting created data sources': function(browser){
    browser
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.dataSourceNameGenerated]);
  }
};