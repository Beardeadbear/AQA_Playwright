const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 07-developer-options-lfd`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Check Editing of HTML, CSS, JS components code': function (browser) {
    const editApp = browser.page.editAppScreen();
    const list = browser.page.listScreens();
    const preview = browser.page.previewAppScreen();
    const htmlClass = '-added-html';
    const numberOfPxForCss = '50';
    const jsText = 'This is custom js';

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP);
    browser.newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.AGENDA);

    browser.pause(5000);

    // add custom HTML, CSS and JS

    list.clickEditComponentsCode();
    list.clickIWantToEditCheckbox('enable-templates');
    list.changeHtmlInDeveloperOptions(htmlClass);
    list.switchToAnotherTabSettings('css')
      .clickIWantToEditCheckbox('enable-css');
    list.changeCssInDeveloperOptions(numberOfPxForCss);
    list.switchToAnotherTabSettings('javascript')
      .clickIWantToEditCheckbox('enable-javascript');
    list.changeJsInDeveloperOptions(jsText);
    list.switchToAnotherTabSettings('css');
    list.clickSaveAndCloseButtonList();

    //navigating to preview screen and asserting HTML, CSS and JS are applied

    browser
      .pause(1000)
      .acceptAlert()
      .pause(500);

    editApp.clickPreviewMenuItemWithAlert();

    browser.pause(1500);

    preview.assertTextInAlertContainsInsertedJs(jsText);
    preview.assertElementPresentOnPreviewScreen(`.agenda-list-card-holder${htmlClass}`);
    preview.assertElementOnPreviewScreenHasCssValue('.new-agenda-list-container .agenda-list-controls', 'height', `${numberOfPxForCss}px`);
  },

  'Reset HTML of component code': function (browser) {
    const preview = browser.page.previewAppScreen();
    const editApp = browser.page.editAppScreen();
    const list = browser.page.listScreens();
    const htmlClass = '-added-html';

    //return to edit screen and reset HTML

    browser.frame(null);

    preview.clickEditMenuSimple();

    browser
      .pause(1000)
      .acceptAlert()
      .waitForAjaxCompleted()
      .pause(1000);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    list.clickEditComponentsCode();
    list.clickResetHtml();
    list.clickSaveAndCloseButtonList();

    browser
      .pause(1000)
      .acceptAlert();

    // assert HTML of element doesn't contain inserted before

    editApp.clickPreviewMenuItemWithAlert();

    browser
      .acceptAlert()
      .assert.elementNotPresent(`.agenda-list-card-holder${htmlClass}`);
  },

  'Deleting created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};