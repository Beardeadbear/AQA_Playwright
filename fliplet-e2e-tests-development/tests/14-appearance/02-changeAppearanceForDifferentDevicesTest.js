const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const highlightColor = '#45D91C';
const textColorMobile = '#7D1515';
const textColorTablet = '#051DDF';
const textColorDesktop = '#FB0760';

module.exports = {
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 02-app-themes`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create an app, add a primary button component onto the app screen': function(browser) {
    const componentsScreen = browser.page.componentsScreen();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT)
      .dragAndDrop(widgets.PRIMARY_BUTTON)
      .waitForWidgetInterface(widgets.PRIMARY_BUTTON)
      .switchToWidgetInstanceFrame();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Update appearance settings': function(browser) {
    const appearanceScreen = browser.page.appearanceScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    rightSideNavMenu.openAppearanceScreen();

    appearanceScreen.selectThemeByName('Bootstrap');
    appearanceScreen.clickUpgradeAppearanceNow();
  },

  'Make changes in quick settings': function(browser) {
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.openColorPickerForFieldByName('Highlight color');
    appearanceScreen.enterColorForOpenedColorPicker(highlightColor);

    browser.click('.col-xs-12.control-label.quick-settings-title'); // saving changes
  },

  'Open Primary button appearance settings and make changes for mobile': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.expandTabInAppearanceSettings('Primary button');
    appearanceScreen.openColorPickerForFieldByName('Text');
    appearanceScreen.enterColorForOpenedColorPicker(textColorMobile);
    appearanceScreen.clickMobileIconInAppearance(); // saving previously made changes
  },

  'Make changes for tablet': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.clickTabletIconInAppearance();
    appearanceScreen.openColorPickerForFieldByName('Text');
    appearanceScreen.enterColorForOpenedColorPicker(textColorTablet);
    appearanceScreen.clickTabletIconInAppearance(); // saving previously made changes
  },

  'Make changes for desktop': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.clickDesktopIconInAppearance();
    appearanceScreen.openColorPickerForFieldByName('Text');
    appearanceScreen.enterColorForOpenedColorPicker(textColorDesktop);
    appearanceScreen.clickDesktopIconInAppearance(); // saving previously made changes
  },

  'Check styles on preview screen for desktop': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .switchToPreviewFrame()
      .assertElementPropertyHasCorrectColor("input[data-primary-button-id]", "color", textColorDesktop)
      .assertElementPropertyHasCorrectColor("input[data-primary-button-id]", "background-color", highlightColor);
  },

  'Check styles on preview screen for tablet': function(browser){
    const preview = browser.page.previewAppScreen();

    preview.openPreviewForDeviceByName('Tablet');

    browser
      .switchToPreviewFrame()
      .assertElementPropertyHasCorrectColor("input[data-primary-button-id]", "color", textColorTablet)
      .assertElementPropertyHasCorrectColor("input[data-primary-button-id]", "background-color", highlightColor);
  },

  'Check styles on preview screen for mobile': function(browser){
    const preview = browser.page.previewAppScreen();

    preview.openPreviewForDeviceByName('Mobile');

    browser
      .switchToPreviewFrame()
      .assertElementPropertyHasCorrectColor("input[data-primary-button-id]", "color", textColorMobile)
      .assertElementPropertyHasCorrectColor("input[data-primary-button-id]", "background-color", highlightColor);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};