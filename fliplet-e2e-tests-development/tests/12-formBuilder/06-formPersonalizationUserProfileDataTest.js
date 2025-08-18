const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const defaultValueTypes = require('../../utils/constants/defaultValueTypes');
const screenLayouts = require('../../utils/constants/screenLayouts');
const widgets = require('../../utils/constants/widgets');
const formTemplates = require('../../utils/constants/formTemplates');
const values = require('../../utils/constants/values');
const textFieldValues = {
  filedLabel: 'Enter your first question',
  fieldName: 'Question 1'
}
const screensTitles = {
  screenWithForm: 'First screen',
  screenWithLogin: 'Log in'
};
const usersInfo = [
  {
    "Email": casual.email,
    "Password": casual.password,
    "Title": casual.word
  },
  {
    "Email": casual.email,
    "Password": casual.password,
    "Title": casual.word
  }
];

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-177',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 06-form-personalization`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 06-form-personalization`;

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

  'Create a new app and app data source': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, usersInfo);
  },

  'Add Login screen layout': function(browser){
    const editApp = browser.page.editAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

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

  'Connect the data source with users list to Login': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectFieldsForLoginFromDataSourceColumnNames([Object.keys(usersInfo[0])[0], Object.keys(usersInfo[0])[1]]);
  },

  'Select the screen with LFD component for Login redirection': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .switchToFlWidgetFrameByNumber(2)
      .selectScreenForLinkingByName(screensTitles.screenWithForm)
      .clickSaveAndCloseButton();
  },

  'Add Form component to the first screen': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithForm);

    browser
      .newDragAndDrop(widgets.FORM_BUILDER)
      .waitForWidgetInterfaceNewDnd(widgets.FORM_BUILDER)
      .switchToWidgetInstanceFrame();
  },

  'Select a form template with a default text field': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.selectFormTemplateByName(formTemplates.BLANK);
  },

  'Edit the form field by choosing User profile data for default type value': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage
      .openEditFormFieldsModalDialog(textFieldValues.filedLabel)
      .selectOptionInDefaultValueTypeDropdown(defaultValueTypes.USER_PROFILE_DATA)
      .checkThatCorrectOptionIsSelectedInDefaultValueTypeDropdownList(defaultValueTypes.USER_PROFILE_DATA);
  },

  'Enter a default key for type value and save': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();
    const componentsScreen = browser.page.componentsScreen();

    formBuilderPage
      .enterDefaultKeyInInputFieldForValueType(Object.keys(usersInfo[0])[2])
      .clickDoneButtonInModalDialog();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview mode and check that the form is present on the screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame();
  },

  'Check that the default value is absent for the configured field': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.checkThatFormFieldHasValue(textFieldValues.fieldName, values.EMPTY_STRING);
  },

  'Open the screen with Login': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const preview = browser.page.previewAppScreen();

    preview.clickEnableSecurityButtonForPreview()

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLogin);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LOGIN);
  },

  'Login and check that the screen with Form is open': function(browser){
    const preview = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    preview.signInIntoLoginFormWithSecurityEnabled(usersInfo[1].Email, usersInfo[1].Password);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screensTitles.screenWithForm);

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame();
  },

  'Check the default value on preview screen': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.checkThatFormFieldHasValue(textFieldValues.fieldName, usersInfo[1].Title)
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};