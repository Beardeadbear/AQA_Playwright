const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const textTitle = casual.title;
const text = casual.title;

module.exports = {
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 03-edit`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Adding text to title and paragraph on app screen': function(browser){
    const editApp = browser.page.editAppScreen();
    const previewApp = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    editApp.changeTitleOfTextOnAppScreen(textTitle);
    editApp.assertThatAllChangesAreSavedAlertIsDisplayed()
    editApp.changeTextOnAppScreen(text)
    editApp.assertThatAllChangesAreSavedAlertIsDisplayed();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.switchToPreviewFrame();

    previewApp.expect.element('@titleText').text.to.contain(textTitle);
    previewApp.expect.element('@bodyText').text.to.contain(text);
  },

  'Editing text of title and paragraph on app screen': function(browser){
    const editApp = browser.page.editAppScreen();
    const previewApp = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.changeWordInTitleToItalic()
    editApp.assertThatAllChangesAreSavedAlertIsDisplayed()
    editApp.changeWordInTextToStrikethrough()
    editApp.assertThatAllChangesAreSavedAlertIsDisplayed();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.switchToPreviewFrame();

    previewApp.waitForElementVisible('@titleText', browser.globals.smallWait);

    browser
      .assert.visible('.col-sm-12>section>h3>em')
      .assert.cssProperty('.col-sm-12>section>p>span', 'text-decoration', 'line-through solid rgb(51, 51, 51)');
  },

  'Deleting created applications': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};