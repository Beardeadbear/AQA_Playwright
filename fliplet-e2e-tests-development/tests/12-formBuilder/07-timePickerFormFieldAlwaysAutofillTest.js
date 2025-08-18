const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const widgets = require('../../utils/constants/widgets');
const formTemplates = require('../../utils/constants/formTemplates');
const currentTime = [];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-244',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 07-time-picker-form`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 07-time-picker-form`;

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

  'Create a new application and add Form widget to the screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .newDragAndDrop(widgets.FORM_BUILDER)
      .waitForWidgetInterfaceNewDnd(widgets.FORM_BUILDER)
      .switchToWidgetInstanceFrame();
  },

  'Select a form template with time picker field': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.selectFormTemplateByName(formTemplates.TIME_PICKER);
  },

  'Edit time picker field configurations by choosing Always autofill with current time': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage
      .openEditFormFieldsModalDialog(formTemplates.TIME_PICKER)
      .chooseAlwaysAutofillWithCurrentDateRadioOptionInDatePickerFormFieldConfigurations()
      .clickDoneButtonInModalDialog();
  },

  'Configure the form builder settings by creating and connecting data source to it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const formBuilderPage = browser.page.formBuilderPage();
    const dataSourceProvider = browser.page.dataSourceProvider();

    componentsScreen.switchToSettingsTab();

    dataSourceProvider
      .clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGenerated)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    formBuilderPage.clickAddToDataSourceCheckbox();

    dataSourceProvider
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.read.ACCESS)
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.write.ACCESS)
      .confirmDataSourceProviderModal()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview mode and check that the form is present on the screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame();
  },

  'Submit the form without changing time picker field value': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage
      .checkThatTmePickerFieldHasValue(currentTime)
      .clickSubmitFormButton();
  },

  'Open the data source and check that the submitted time picker value is correct': function(browser){
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertFormAnswerIsSavedToForm(currentTime.pop());
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};