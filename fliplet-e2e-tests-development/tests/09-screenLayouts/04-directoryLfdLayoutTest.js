const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screenLayouts = require('../../utils/constants/screenLayouts');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const screenLayoutTags = require('../../utils/constants/screenLayoutTags');
const casual = require('casual');
const filter = [{
  option: "Location",
  value: "London",
  level: "Location"
},
  {
    option: "Title",
    value: "Consultant",
    level: "Role"
  },
];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 04-directory-layout`;

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

  'Create a new app and add a screen with LFD Directory layout': function(browser){
    const editApp = browser.page.editAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK_DEFAULT);

    appScreensLeftsidePanel
      .clickAddScreensButton()
      .chooseScreenLayoutTag(screenLayoutTags.LISTS)
      .selectScreenLayoutByName(screenLayouts.LIST_DIRECTORY)
      .clickAddScreenButtonOnLayout()
      .enterScreenNameOnAppScreenModal(listFromDataSourceLayouts.DIRECTORY)
      .clickConfirmButtonOnAppScreenModal()
      .assertScreenIsPresentByName(listFromDataSourceLayouts.DIRECTORY)
      .checkTitleOfActiveScreen(listFromDataSourceLayouts.DIRECTORY);

    editApp
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);
  },

  'Enable displaying filters as full screen overlay': function(browser){
    const list = browser.page.listScreens();
    const componentsScreen = browser.page.componentsScreen();

    list
      .clickDisplayFiltersAsFullScreenOverlay()
      .addValueInInputFieldForDataSourceColumnNameInFilteringBlock(filter[1].option)

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview screen and check that LFD is present': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();
  },

  'Open LFD filters overlay and expand the first filter option': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .openFilterOverlayForLFD()
      .expandFilterOptionByLabel(filter[0].option);
  },

  'Select a value for the first filter': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen.selectFilterByTitle(filter[0].option, filter[0].value);
  },

  'Apply filters and check the active filter': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickApplyButtonInFiltersOverlay()
      .assertActiveFilterIsPresentInLfd(filter[0].value);
  },

  'Check that the shown list items correspond the first filter': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen.assertListItemsContainText(filter[0].level, filter[0].value);
  },

  'Unselect values for the first filter': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen.clickActiveFilterToDismissIt(filter[0].value);
  },

  'Open LFD filters overlay and expand the second filter option': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .openFilterOverlayForLFD()
      .expandFilterOptionByLabel(filter[1].option);
  },

  'Select a value for the second filter': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen.selectFilterByTitle(filter[1].option, filter[1].value);
  },

  'Apply filters and check the active filters': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen
      .clickApplyButtonInFiltersOverlay()
      .assertActiveFilterIsPresentInLfd(filter[1].value);
  },

  'Check that the shown list items correspond the second filter': function(browser){
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen.assertListItemsContainText(filter[1].level, filter[1].value);
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};
