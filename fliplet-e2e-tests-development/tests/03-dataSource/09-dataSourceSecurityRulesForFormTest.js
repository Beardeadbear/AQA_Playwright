const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screenLayouts = require('../../utils/constants/screenLayouts');
const widgets = require('../../utils/constants/widgets');
const formTemplates = require('../../utils/constants/formTemplates');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const casual = require('casual');

const screensTitles = {
  screenWithForm: 'First screen',
  protectedScreen: 'Second screen'
};

const usersInfo = [
  {
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
  }
];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 09-sec-rule`;
    browser.globals.dataSourceNameGeneratedForLogin = `${casual.title} 09-sec-rule`;
    browser.globals.dataSourceNameGeneratedForForm = `${casual.title} 09-sec-rule`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGeneratedForLogin,
        browser.globals.dataSourceNameGeneratedForForm], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app, a data source with entries, add Login screen layout': function(browser){
    const editApp = browser.page.editAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGeneratedForLogin, usersInfo);

    appScreensLeftsidePanel
      .clickAddScreensButton()
      .selectScreenLayoutByName(screenLayouts.LOG_IN)
      .clickAddScreenButtonOnLayout()
      .enterScreenNameOnAppScreenModal(screenLayouts.LOG_IN)
      .clickConfirmButtonOnAppScreenModal()
      .assertScreenIsPresentByName(screenLayouts.LOG_IN)
      .checkTitleOfActiveScreen(screenLayouts.LOG_IN);

    editApp
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LOGIN)
      .openDetailsOfComponentByClickingOnIt(widgets.LOGIN);
  },

  'Connect the data source with users list to login component': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGeneratedForLogin)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGeneratedForLogin);

    componentsScreen.selectFieldsForLoginFromDataSourceColumnNames(["email", "password"])
      .switchToFlWidgetFrameByNumber(2)
      .selectScreenForLinkingByName(screensTitles.screenWithForm)
      .clickSaveAndCloseButton();
  },

  'Add form builder to the app screen': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithForm);

    browser.newDragAndDrop(widgets.FORM_BUILDER)
      .waitForWidgetInterfaceNewDnd(widgets.FORM_BUILDER)
      .switchToWidgetInstanceFrame();
  },

  'Configure the form and connect the created data source to it': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    formBuilderPage.selectFormTemplateByName(formTemplates.BLANK);

    componentsScreen.switchToSettingsTab();

    dataSourceProvider.clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGeneratedForForm)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGeneratedForForm)
      .checkThatSecurityRulesMissingWarningMessageIsShown();

    formBuilderPage.clickAddToDataSourceCheckbox();

    dataSourceProvider
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.read.ACCESS)
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.write.ACCESS)
      .cancelDataSourceProviderModal()
      .checkThatSecurityRulesMissingWarningMessageIsShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open the created data source and switch to the tab with security rules to create a new security rule': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGeneratedForForm);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGeneratedForForm)
      .switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();
  },

  'Select Logged in users for the app data source security rule - only they can write data': function(browser){
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    dataSourceSecurityRuleOverlay.clickLoggedInUsersButton()
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.write.OPERATION)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.clickSaveAndApplyButtonForDataSourceSecurityRule()
      .acceptApplyingChangesToDataSourceSecurityRules();
  },

  'Check data source security rule for not logged in users - no access to submit a form': function(browser){
    const apps = browser.page.appsPage();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();
    const formBuilderPage = browser.page.formBuilderPage();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    apps
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    appTopFixedNavigationBar.navigateToPreviewMode();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithForm);

    preview
      .clickEnableSecurityButtonForPreview()
      .checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame();

    formBuilderPage
      .enterValuesIntoForm([casual.word])
      .clickSubmitFormButton()
      .assertDataSourceSecurityRulesDoNotAllowToWriteDataToFormMessage()
      .checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER);
  },

  'Check data source security rule for logged in users - they have access to submit a form': function(browser){
    const preview = browser.page.previewAppScreen();
    const formBuilderPage = browser.page.formBuilderPage();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screenLayouts.LOG_IN);

    preview
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LOGIN)
      .signInIntoLoginFormWithSecurityEnabled(usersInfo[0].email, usersInfo[0].password);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screensTitles.screenWithForm);

    preview
      .checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame();

    formBuilderPage
      .enterValuesIntoForm([casual.word])
      .clickSubmitFormButton()
      .assertThatFormHasBeenSuccessfullySubmitted('Thank you for submitting the form!');
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGeneratedForForm)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGeneratedForLogin)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGeneratedForForm,
        browser.globals.dataSourceNameGeneratedForLogin,], browser.globals.emailForOrganizationTests);
  }
};