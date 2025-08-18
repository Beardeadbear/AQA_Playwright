const casual = require('casual');
const globals = require('../../globals_path');
const invalidResources = ['invalid resource'];
const validResources =
  ['https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/css/bootstrap-datetimepicker.min.css', '\n',
    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/js/bootstrap-datetimepicker.min.js'];

module.exports = {
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 14-css-jss-add-on`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and enable CSS and JS resources add-on for app': function(browser) {
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appSettings = browser.page.appSettingsOverlay();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, 'Directory App');

    rightSideNavMenu.openAppSettingScreen();

    appSettings.switchToAddOnsScreen()
      .selectAddOnByName('CSS/JS resources');
    appSettings.enableAddOn();
  },

  'Try to save resources with an invalid resource link': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();

    appSettings.enterCssAndJsResources(invalidResources);
    appSettings.clickSaveButtonWithoutSuccessMessageAssertion();
    appSettings.switchToWidgetProviderFrame()
      .checkErrorMessageAlert('400 - error')
  },

  'Save resources with a valid resources link': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();

    appSettings.enterCssAndJsResources(validResources);
    appSettings.clickSaveButtonWithoutSuccessMessageAssertion();
    appSettings.checkIfSuccessMessageIsAppeared()
      .checkThatChangesHasBeenSuccessfullySaved('Saved! The files entered are now available in your app.');

    browser.frameParent();

    appSettings.closeSettingsOverlay();
  },

  'Assert that the resources are added to source code': function(browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertElementPresentOnPreviewScreen(`link[href="${validResources[0]}"]`);

    browser.frameParent();

    previewAppScreen.assertElementPresentOnPreviewScreen(`script[src="${validResources[2]}"]`);
  },

  'Disable  CSS and JS resources add-on and assert resources are not present': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.switchToAddOnsScreen()
      .selectAddOnByName('CSS/JS resources');
    appSettings.disableAddOn();
    appSettings.closeSettingsOverlay();
  },

  'Navigate to preview mode and assert that the resources are removed from source code': function(browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertElementNotPresentOnPreviewScreen(`link[href="${validResources[0]}"]`);

    browser.frameParent();

    previewAppScreen.assertElementNotPresentOnPreviewScreen(`script[src="${validResources[2]}"]`);
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};