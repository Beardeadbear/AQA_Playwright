const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screenLayouts = require('../../utils/constants/screenLayouts');
const screenLayoutTags = require('../../utils/constants/screenLayoutTags');
const widgets = require('../../utils/constants/widgets');
const casual = require('casual');

const usersInfo = [{
  "name": casual.full_name,
  "email": casual.email.toLowerCase(),
  "password": casual.password,
  "company": casual.word,
  "position": casual.title
},
  {
    "name": casual.full_name,
    "email": casual.email.toLowerCase(),
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  }];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 07-sec-rule`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 07-sec-rule`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done,
        browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app, a data source with entries, add Login and Interactive Graphics screen layouts': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const editApp = browser.page.editAppScreen();

    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK_DEFAULT)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, usersInfo);

    appScreensLeftsidePanel
      .clickAddScreensButton()
      .selectScreenLayoutByName(screenLayouts.LOG_IN)
      .chooseScreenLayoutTag(screenLayoutTags.MEDIA_SCREENS)
      .selectScreenLayoutByName(screenLayouts.INTERACTIVE_GRAPHICS)
      .clickAddScreensButtonOnLayout()
      .assertScreenIsPresentByName(screenLayouts.LOG_IN)
      .assertScreenIsPresentByName(screenLayouts.INTERACTIVE_GRAPHICS)
      .checkTitleOfActiveScreen(screenLayouts.LOG_IN);

    editApp
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LOGIN)
      .openDetailsOfComponentByClickingOnIt(widgets.LOGIN);
  },

  'Connect the data source with users list to login component': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectFieldsForLoginFromDataSourceColumnNames(["email", "password"])
      .switchToFlWidgetFrameByNumber(2)
      .selectScreenForLinkingByName(screenLayouts.INTERACTIVE_GRAPHICS)
      .clickSaveAndCloseButton();
  },

  'Open the created data source and switch to the tab with security rules to edit the default security rule': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByUsingAppName('Map Markers', browser.globals.appNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName('Map Markers')
      .switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.clickEditButtonForSecurityRule();
  },

  'Select Logged in users for the app data source security rule': function(browser){
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    dataSourceSecurityRuleOverlay.clickLoggedInUsersButton()
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.clickSaveAndApplyButtonForDataSourceSecurityRule()
      .acceptApplyingChangesToDataSourceSecurityRules();
  },

  'Check data source security rule for not logged in users - no access': function(browser){
    const apps = browser.page.appsPage();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    appTopFixedNavigationBar.navigateToPreviewMode();

    appScreensLeftsidePanel.openScreenByName(screenLayouts.INTERACTIVE_GRAPHICS);

    preview.clickEnableSecurityButtonForPreview()
      .assertElementNotPresentOnPreviewScreen('@mapMarker');
  },

  'Check data source security rule for logged in users - they have access': function(browser){
    const preview = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screenLayouts.LOG_IN);

    preview.signInIntoLoginFormWithSecurityEnabled(usersInfo[0].email, usersInfo[0].password);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenLayouts.INTERACTIVE_GRAPHICS);

    preview.assertElementVisibleOnPreviewScreen('@mapMarker');
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};