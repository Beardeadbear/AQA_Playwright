const globals = require('../../globals_path');
const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screensTitles = {
  screenForGlobalsDevOptions: "First screen",
  screenForDevOptions: 'Second screen'
};
const headingSize = '5';
const htmlElement = 'p';
const screenColour = 'rgba(255, 0, 0, 1)';
const appColour = 'rgba(255, 218, 185, 1)';
const screenFontFamily = '"Comic Sans MS", cursive, sans-serif';
const appFontFamily = '"Courier New", Courier, monospace';
const dependencies = ['fliplet-communicate', 'fliplet-media'];
const screenScript = `document.getElementsByTagName("${htmlElement}")[0].style.backgroundColor = "${screenColour}";`;
const appScript = `document.getElementsByTagName("${htmlElement}")[0].style.backgroundColor = "${appColour}";`;

module.exports = {
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 08-dev-options`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Edit screen HTML - changing heading size of the title': function(browser) {
    const devOptions = browser.page.developerOptionsScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_APP);

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenForDevOptions);

    rightSideNavMenu.openDeveloperOptionsScreen();

    devOptions.changeHeadingSizeOfTitle(headingSize)
      .clickSaveAndRunButtonAfterImplementedChanges();
  },

  'Assert that editing screen HTML is implemented on preview mode': function(browser){
    const previewApp = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp.assertElementPresentOnPreviewScreen(`.col-sm-12 h${headingSize}`);
  },

  'Add a custom CSS and JS to the screen': function(browser){
    const devOptions = browser.page.developerOptionsScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openDeveloperOptionsScreen();

    devOptions.enterScreenCss(`${htmlElement} {font-family: ${screenFontFamily};}`)
      .enterScreenJavaScript(screenScript)
      .clickSaveAndRunButtonAfterImplementedChanges();
  },

  'Check that edited screen has properties set in developer options on preview mode': function(browser) {
    const previewApp = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp.assetFontAndBackgroundColorOfTextComponent(screenFontFamily, screenColour);
  },

  'Add a custom JS and CSS on the global app settings': function(browser){
    const devOptions = browser.page.developerOptionsScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openDeveloperOptionsScreen();

    devOptions.switchToGlobalSettings()
      .enterGlobalParameterValue('CSS/SCSS ', `${htmlElement} {font-family: ${appFontFamily};}`)
      .enterGlobalParameterValue('JavaScript', appScript)
      .clickSaveAndRunButtonAfterImplementedChanges();
    },

  'Check on preview mode that the other screen has applied global settings': function(browser) {
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenForGlobalsDevOptions);

    previewApp.assetFontAndBackgroundColorOfTextComponent(appFontFamily,appColour);
  },

  'Add new dependencies to a screen': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const devOptions = browser.page.developerOptionsScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenForDevOptions);

    rightSideNavMenu.openDeveloperOptionsScreen();

    devOptions.enterScreenDependencies(dependencies);
  },

  'Check that screen dependencies are added to page scripts': function(browser) {
    const previewApp = browser.page.previewAppScreen();

    previewApp.assertElementPresentOnPreviewScreen(`script[src*="${dependencies[0]}"]`);

    browser.frame(null);

    previewApp.assertElementPresentOnPreviewScreen(`script[src*="${dependencies[1]}"]`);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};