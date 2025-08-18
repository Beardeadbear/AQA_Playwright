const globals = require('../../globals_path');
const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const bodyHexColour ='#17cd92';
const textHexColour = '#131010';
const fontSize = '20px';

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 01-change-theme`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app, change the theme background color and foreground text color of theme': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();
    const previewApp = browser.page.previewAppScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    rightSideNavMenu.openAppearanceScreen();

    appearanceScreen.selectThemeByName('Bootstrap');
    appearanceScreen.clickApplyChangesButton();
    appearanceScreen.switchToWidgetProviderFrame()
      .clickGroupOfSettingsByName('General layouts');
    appearanceScreen.changeBodyBackgroundColor(bodyHexColour)
      .changeFontColor(textHexColour)
      .clickApplyChangesButton();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp.switchToPreviewFrame()
      .assertAppBodyHasCorrectColour('background-color',bodyHexColour)
      .assertAppBodyHasCorrectColour('color',textHexColour);
  },

  'Change the font for body text': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();
    const previewApp = browser.page.previewAppScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openAppearanceScreen();

    appearanceScreen.changeFontSize(fontSize)
      .clickApplyChangesButton();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp.switchToPreviewFrame()
      .waitForElementVisible('@appBody', browser.globals.smallWait)
      .assert.cssProperty('@appBody', 'font-size', fontSize);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};