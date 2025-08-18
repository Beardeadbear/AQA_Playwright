const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const linkActions = require('../../utils/constants/linkActions');
const documentName = 'fliplet.pdf';
const lockPassword = '1234';
const mediaId = [];

module.exports = {
 '@disabled': (globals.smokeTest === 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 02-lock-screen`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Add Lock widget to the created app and check that it is present on preview screen': function (browser) {
    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.LOCK)
      .switchToWidgetInstanceFrame();
  },

  'Configure Lock widget - set link action and choose a document for it': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();

    componentsScreen.assertComponentConfigurationIsOpen('Configure lock component')
      .setLinkActionForComponent(1, linkActions.OPEN_A_DOCUMENT)
      .clickBrowseYourMediaLibraryButton();

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.docFolder)
      .assertCorrectFolderIsOpen(browser.globals.docFolder)
      .selectItemInFilePicker(documentName)
      .assertThatCorrectFileIsSelected(documentName)
      .getIdsOfSelectedFiles(mediaId)
      .clickSelectAndSaveButton();
  },

  'Check link action is set for Lock': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    browser.switchToWidgetInstanceFrame();

    componentsScreen.assertFileIsAddedForComponent(documentName);
    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview screen and check Lock widget': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LOCK)
      .switchToPreviewFrame();
  },

  'Set Lock incorrect password and check it': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.setLockPassword(lockPassword)
      .reenterLockPassword(lockPassword.replace(1, 0))
      .assertErrorVerificationInfoMessage('Passcodes did not match. Please try again.');
  },

  'Set Lock correct password and check the link action': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();
    const webApp = browser.page.webApplicationPages();

    previewAppScreen.setLockPassword(lockPassword)
      .reenterLockPassword(lockPassword)
      .checkLockComponentFunctionality();

    webApp.switchToOpenWindowByNumber(2)
    .checkDocumentIsOpen(mediaId[mediaId.length-1]);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
