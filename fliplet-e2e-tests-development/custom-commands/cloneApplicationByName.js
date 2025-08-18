const appScreenDropdownMenuOptions = require('../utils/constants/appScreenDropdownMenuOptions');

exports.command = function(existingAppName, newAppName){
  const appsPage = this.page.appsPage();

  appsPage
    .navigate()
    .waitForAppsPageToBeLoaded()
    .expandOptionsForAppByName(existingAppName)
    .selectOptionByTitle(existingAppName, appScreenDropdownMenuOptions.DUPLICATE)
    .duplicateApplicationByName(newAppName)
    .waitForAppsPageToBeLoaded()
    .assertApplicationIsPresentInListByName(newAppName);
};