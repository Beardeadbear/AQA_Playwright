const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screenLayouts = require('../../utils/constants/screenLayouts');
const appScreenDropdownMenuOptions = require('../../utils/constants/appScreenDropdownMenuOptions');
const screenLayoutTags = require('../../utils/constants/screenLayoutTags');
const values = require('../../utils/constants/values');
const screenName = casual.word;

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 13-reset-screen-layout`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK_DEFAULT);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new screen using Onboarding layout': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const editApp = browser.page.editAppScreen();

    appScreensLeftsidePanel
      .clickAddScreensButton()
      .selectScreenLayoutByName(screenLayouts.INTRO_ONBOARDING)
      .clickAddScreenButtonOnLayout()
      .enterScreenNameOnAppScreenModal(screenName)
      .clickConfirmButtonOnAppScreenModal()
      .assertScreenIsPresentByName(screenName)
      .checkTitleOfActiveScreen(screenName)

    editApp.checkScreenTemplateApplied(screenLayouts.INTRO_ONBOARDING.substring(screenLayouts.INTRO_ONBOARDING.lastIndexOf(values.SPACE) + 1).toUpperCase());
  },

  'Change the selected layout to a new one': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel
      .openMenuOptionsForScreen(screenName)
      .selectActionForAppScreen(appScreenDropdownMenuOptions.RESET_SCREEN_TEMPLATE)
      .chooseScreenLayoutTag(screenLayoutTags.MESSAGING_NOTIFICATIONS)
      .changeScreenLayout(screenLayouts.CHAT_MESSAGING);
  },

  'Check that the new layout is shown': function(browser){
    const editApp = browser.page.editAppScreen();

    editApp.checkScreenTemplateApplied(screenLayouts.CHAT_MESSAGING.substring(0, screenLayouts.CHAT_MESSAGING.indexOf(values.SPACE)).toUpperCase());
  },

  'Delete the created applications and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
