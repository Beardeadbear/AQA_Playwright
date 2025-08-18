const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const appScreenDropdownMenuOptions = require('../../utils/constants/appScreenDropdownMenuOptions');
const casual = require('casual');
const screenTitle ={
  initial: 'Second screen',
  renamed: 'New screen',
  duplicated: `Copy of New screen`
}

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 04-screens`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  "Check that a screen can be renamed": function (browser) {
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel
      .openMenuOptionsForScreen(screenTitle.initial)
      .selectActionForAppScreen(appScreenDropdownMenuOptions.RENAME)
      .enterScreenNameOnAppScreenModal(screenTitle.renamed)
      .clickConfirmButtonOnAppScreenModal()
      .assertScreenIsPresentInAppScreenList(screenTitle.renamed)
      .assertScreenIsNotPresentInAppScreenList(screenTitle.initial);
  },

  "Check that a screen can be duplicated": function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel
      .openMenuOptionsForScreen(screenTitle.renamed)
      .selectActionForAppScreen(appScreenDropdownMenuOptions.DUPLICATE)
      .assertScreenIsPresentInAppScreenList(screenTitle.duplicated)
      .checkTitleOfActiveScreen(screenTitle.duplicated);
  },

  "Check that a screen can be deleted": function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel
      .openMenuOptionsForScreen(screenTitle.renamed)
      .selectActionForAppScreen(appScreenDropdownMenuOptions.DELETE)
      .confirmAppScreenDeletion()
      .assertScreenIsNotPresentInAppScreenList(screenTitle.renamed);
  },

  'Delete the created applications': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};