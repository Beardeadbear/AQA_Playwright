const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const numberToDisplay = 2;

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-166',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 14-lfd-featured-limit`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 14-lfd-featured-limit`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and add Simple List LFD component': function(browser){
    const list = browser.page.listScreens();

    browser
      .createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEATURED_LIST);
  },

  'Configure rule for number of cards to display and save': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();

    list.enterNumberInItemsToShowField(numberToDisplay);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview to check the LFD entries': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();
  },

  'Check that the number of LFD entries equals the expected one': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen.checkAmountOfLfdEntriesShown(numberToDisplay)
  },

  'Delete the created applications and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};