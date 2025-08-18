const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');
const globals = require('../../globals_path');
const fontsName = 'leighton.ttf';
const htmlElement = 'p';
const appFontFamily = 'leighton';

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 19-custom-fonts`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Upload custom fonts for the app and apply uploaded font style to "p" element': function(browser) {
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appSettings = browser.page.appSettingsOverlay();
    const filePicker = browser.page.filePicker();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    rightSideNavMenu.openAppSettingScreen();

    appSettings.switchToCustomFontsScreen();

    filePicker.clickSelectFilesButton()
      .selectFileForUploading(fontsName)
      .assertItemIsPresentInFilePicker(appFontFamily);

    appSettings.closeSettingsOverlay();
  },

  'Apply uploaded font style to "p" element': function(browser) {
    const devOptions = browser.page.developerOptionsScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    rightSideNavMenu .openDeveloperOptionsScreen();

    devOptions.switchToGlobalSettings()
      .enterGlobalParameterValue('CSS/SCSS ',`${htmlElement} {font-family: ${appFontFamily};}`)
      .clickSaveAndRunButtonAfterImplementedChanges();
  },

  'Check that uploaded font is applied to "p" element on preview screen': function(browser) {
    const editApp = browser.page.editAppScreen();
    const preview = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    editApp.checkFontOfTextComponent(appFontFamily);

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.assertUploadedCustomFontAppearedOnPreview(appFontFamily);
  },

  'Remove the custom font from the app settings': function(browser) {
    const appSettings = browser.page.appSettingsOverlay();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.switchToCustomFontsScreen();
    appSettings.openDetailsOfCustomFont();
    appSettings.clickDeleteFileButton();
    appSettings.closeSettingsOverlay();
  },

  'Check that the uploaded font is not applied after removing': function(browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.assertUploadedFontIsDisappearedInDeveloperCode();
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};