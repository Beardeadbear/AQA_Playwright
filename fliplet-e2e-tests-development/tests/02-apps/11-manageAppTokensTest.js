const globals = require('../../globals_path');
const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const newTokenName = globals.tokenName;
const tokenName = 'Web app';

module.exports = {
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 11-token`;
    browser.globals.tokenValue = [];

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .resizeWindow(1600, 1200)
      .login()
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.EVENT_TEMPLATE);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Check that app token is present in app settings after generation': function(browser){
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appSettings = browser.page.appSettingsOverlay();

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');

    publish
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish
      .clickSeeEmbedCodeButton()
      .getApplicationToken(browser.globals.tokenValue);

    publish.closePublishOverlay();
    publish.openEditMenu();

    rightSideNavMenu.openAppSettingScreen();

    appSettings
      .verifySettingsScreenIsOpened()
      .switchToAppTokensTab();

    appSettings.assertTokenValueByTokenName(tokenName, browser.globals.tokenValue);
  },

  'Change name of an app token': function (browser) {
    const appSettings = browser.page.appSettingsOverlay();

    browser.pause(2500);

    appSettings.clickEditButtonNearTokenByName(tokenName);

    appSettings.enterNewTokenName(newTokenName);

    browser.pause(1500);

    appSettings
      .clickSaveButtonForToken()
      .assertTokenValueByTokenName(newTokenName, browser.globals.tokenValue);
  },

  'Remove application token': function(browser){
    // ToDo: add verification that it's not possible to interact with app using this token
    const appSettings = browser.page.appSettingsOverlay();

    appSettings.clickEditButtonNearTokenByName(newTokenName);
    appSettings.deleteCreatedToken();
    appSettings.assertTokenIsNotPresentInListByName(newTokenName);
  },

  'Deleting created applications': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};