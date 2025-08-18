const widgets = require('../../utils/constants/widgets');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const screenLayouts = require('../../utils/constants/screenLayouts');
const casual = require('casual');
const dataSourceColumns = ['Email', 'Password'];
const screensTitles = {
  logInScreen: 'Log in',
  singUpScreen: 'Sign up',
};
const userDataForSignUp = {
  "Email": casual.email,
  "Password": casual.password
}

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-247',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 06-connect-app-ds`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 06-connect-app-ds`;

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

  'Create a new app and a new organization data source': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK_DEFAULT)
      .createOrgDataSourceViaApiWithNoSecurityRules(browser.globals.dataSourceNameGenerated, [], browser.globals.organizationId);
  },

  'Add Login and Sign up screens': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel
      .clickAddScreensButton()
      .selectScreenLayoutByName(screenLayouts.LOG_IN)
      .selectScreenLayoutByName(screenLayouts.SIGN_UP)
      .clickAddScreensButtonOnLayout()
      .assertScreenIsPresentByName(screensTitles.logInScreen)
      .assertScreenIsPresentByName(screensTitles.singUpScreen)
      .checkTitleOfActiveScreen(screensTitles.logInScreen);
  },

  'Open Login configurations and connect the created organization data source to it': function(browser){
    const editApp = browser.page.editAppScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LOGIN);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LOGIN);

    dataSourceProvider
      .assertThatDataSourceIsNotPresentInDataSourceProvider(browser.globals.dataSourceNameGenerated)
      .clickShowAllDataSources()
      .assertThatDataSourceIsShownInDataSourceProvider(browser.globals.dataSourceNameGenerated)
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Click View data source and edit the data source columns names': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .changeDataSourceColumnNames(dataSourceColumns);

    dataSourceManagerOverlay.clickSaveButtonInDataSourceManagerOverlayOpenFromDataSourceProvider();
  },

  'Set data source columns names for Login': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .switchToWidgetInstanceFrame()
      .selectFieldsForLoginFromDataSourceColumnNames(dataSourceColumns)
      .clickSaveAndCloseButton();
  },

  'Switch to Sign up screen and open the form configuration ': function(browser){
    const editAppScreen = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screenLayouts.SIGN_UP);

    editAppScreen.openDetailsOfComponentByClickingOnIt(widgets.FORM_BUILDER);

    componentsScreen.switchToSettingsTab();
  },

  'Check that the connected data source to Login is present in Apps data sources list': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const formBuilderPage = browser.page.formBuilderPage();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .assertThatDataSourceIsShownInDataSourceProvider(browser.globals.dataSourceNameGenerated)
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated)

    formBuilderPage.clickAddToDataSourceCheckbox();

    dataSourceProvider
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.read.ACCESS)
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.write.ACCESS)
      .confirmDataSourceProviderModal()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview mode and submit Sign up form': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const formBuilderPage = browser.page.formBuilderPage();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame();

    formBuilderPage
      .enterValuesIntoForm([userDataForSignUp.Email, userDataForSignUp.Password])
      .clickSubmitFormButton()
      .assertThatFormHasBeenSuccessfullySubmitted('Thank you for submitting the form!');
  },

  'Login as a user to the app': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const previewAppScreen = browser.page.previewAppScreen();

    appScreensLeftsidePanel.openScreenByName(screensTitles.logInScreen);

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LOGIN)
      .switchToPreviewFrame();

    previewAppScreen.signInIntoLoginForm(userDataForSignUp.Email, userDataForSignUp.Password);
  },

  'Open App data source overlay in Edit mode and check that the created and connected to the widgets is present there': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openAppDataScreen();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt(browser.globals.appNameGenerated);

    allDataSources
      .assertDataSourceIsPresentInDataSourceManagerListByName(browser.globals.dataSourceNameGenerated)
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertDataSourceColumnNamesAreCorrect(dataSourceColumns)
      .assertCellsInLineContainSpecifiedValues(4, [userDataForSignUp.Email, userDataForSignUp.Password]);
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};