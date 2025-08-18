const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const widgets = require('../../utils/constants/widgets');
const formTemplates = require('../../utils/constants/formTemplates');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const formAnswer = [casual.city];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-200',
  '@reference': 'https://weboo.atlassian.net/browse/OD-282',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 09-form-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 09-form-ds-provider`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done,
        browser.globals.emailForOrganizationTests)
      .deleteCookies()
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new application, create a new app data source with no security rules, add Form widget to the screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createAppDataSourceViaApiWithNoSecurityRules(browser.globals.dataSourceNameGenerated, [])
      .newDragAndDrop(widgets.FORM_BUILDER)
      .waitForWidgetInterfaceNewDnd(widgets.FORM_BUILDER)
      .switchToWidgetInstanceFrame();
  },

  'Select a form template': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.selectFormTemplateByName(formTemplates.BLANK);
  },

  'Configure the form builder settings by connecting the created app data source to it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    componentsScreen.switchToSettingsTab();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatSecurityRulesMissingWarningMessageIsShown();
  },

  'Click Configure data source security rules in data source provider': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickConfigureSecurityRules()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();
  },

  'Enable Add new submissions to a data source to check that Security rules Missing warning message is shown and save': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();

    formBuilderPage.clickAddToDataSourceCheckbox();

    dataSourceProvider
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.write.ACCESS)
      .cancelDataSourceProviderModal()
      .checkThatSecurityRulesMissingWarningMessageIsShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open the form settings and check that Security rules Missing warning message is still shown': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const editApp = browser.page.editAppScreen();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.FORM_BUILDER);

    componentsScreen.switchToSettingsTab();

    dataSourceProvider
      .checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated)
      .checkThatSecurityRulesMissingWarningMessageIsShown();
  },

  'Click Configure data source security rules in data source provider for Add new submissions': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickConfigureSecurityRules()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();
  },

  'Open the data source settings and check Write security rule is added': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource.switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.checkThatSecurityRuleWithSpecificAccessOperationIsInTheList(dataSourceSecurityRulesOperations.write.OPERATION);

    dataSourceManagerOverlay.closeDataSourceManagerOverLay();
  },

  'Enable Update existing entries in a data source to check that Security rules Missing warning message is shown and save': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();

    formBuilderPage.clickEditDataSourceEntriesCheckbox();

    dataSourceProvider
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.update.ACCESS)
      .cancelDataSourceProviderModal()
      .checkThatSecurityRulesMissingWarningMessageIsShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open the form settings again and check that Security rules Missing warning message is still shown': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const editApp = browser.page.editAppScreen();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.FORM_BUILDER);

    componentsScreen.switchToSettingsTab();

    dataSourceProvider
      .checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated)
      .checkThatSecurityRulesMissingWarningMessageIsShown();
  },

  'Click Configure data source security rules in data source provider for Update existing entries': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .clickConfigureSecurityRules()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();
  },

  'Open the data source settings and check Update security rule is added': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();
    const componentsScreen = browser.page.componentsScreen();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource.switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.checkThatSecurityRuleWithSpecificAccessOperationIsInTheList(dataSourceSecurityRulesOperations.update.OPERATION);

    dataSourceManagerOverlay.closeDataSourceManagerOverLay();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview mode and check that the form is present on the screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.clickEnableSecurityButtonForPreview();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame();
  },

  'Check that user is able to submit the form': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage
      .enterValuesIntoForm(formAnswer)
      .clickSubmitFormButton();
  },

  'Open the data source and check that the submitted value is saved': function(browser){
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertFormAnswerIsSavedToForm(formAnswer);
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};