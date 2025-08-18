const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const formTemplates = require('../../utils/constants/formTemplates');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const formTitleText = casual.title;
const formParagraphText = casual.short_description;
const richTextInputFieldEditValues = [casual.word.concat(casual.letter), casual.short_description, casual.letter.concat(casual.word)];
const formButtonsLabels = [casual.word, casual.word];
const richFormFieldEnteredValue = casual.short_description;

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 03-rich-form`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 03-rich-form`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done,
        browser.globals.emailForOrganizationTests)
      .deleteCookies()
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Add Form widget to app and check that it is present on the screen': function (browser) {
    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.FORM_BUILDER)
      .switchToWidgetInstanceFrame();
  },

  'Select form template and check form field deleting': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.selectFormTemplateByName(formTemplates.RICH_TEXT)
      .deleteFieldFromForm('Text input');
  },

  'Edit Formatting form field - Title': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.openFormattingFieldsModalDialog('Title')
      .editFormattingFieldText(formTitleText)
      .clickDoneButtonInModalDialog();
  },

  'Edit Formatting form field - Paragraph': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.openFormattingFieldsModalDialog('Paragraph')
      .editFormattingFieldText(formParagraphText)
      .clickDoneButtonInModalDialog();
  },

  'Edit Rich text form fields': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.openEditFormFieldsModalDialog(formTemplates.RICH_TEXT)
      .editFormFieldLabel(richTextInputFieldEditValues[0])
      .customizeFieldName()
      .setDefaultValueForFormField(richTextInputFieldEditValues[1])
      .setPlaceholderValueForFormField(richTextInputFieldEditValues[2])
      .selectValueFromDropdown('textarea-rows', 5)
      .clickDoneButtonInModalDialog();
  },

  'Edit form buttons': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.openButtonFieldModalDialog()
      .setNewNameForFormButton('Submit', formButtonsLabels[0])
      .setNewNameForFormButton('Clear', formButtonsLabels[1])
      .clickDoneButtonInModalDialog();
  },

  'Configure settings for form builder and create data source for it': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const formBuilderPage = browser.page.formBuilderPage();

    componentsScreen.switchToSettingsTab();

    dataSourceProvider.clickCreateNewDataSource()
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

  'Open preview screen and check formatting fields': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const formBuilderPage = browser.page.formBuilderPage();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame();

    formBuilderPage.checkFormElementContainsText('@titleFormattingFormField', formTitleText)
      .checkFormElementContainsText('@paragraphFormattingFormField', formParagraphText);
  },

  'Check Rich text form field': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.checkThatFormFieldWithEnteredNameIsPresentOnForm(richTextInputFieldEditValues[0])
      .checkThatFormFieldHasPlaceholderOnForm(richTextInputFieldEditValues[0], richTextInputFieldEditValues[2])
      .checkThatFormFieldHasValue(richTextInputFieldEditValues[0], richTextInputFieldEditValues[1]);
  },

  'Check form buttons and submit the form': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.checkFormElementContainsText('@formSubmitButton', formButtonsLabels[0])
      .checkFormElementContainsText('@clearFormButton', formButtonsLabels[1])
      .fillInRichFormField(richTextInputFieldEditValues[0], richFormFieldEnteredValue)
      .clickClearFormButton()
      .checkThatRichTextFormFieldHasText(richTextInputFieldEditValues[0], richTextInputFieldEditValues[1])
      .checkThatFormFieldHasValue(richTextInputFieldEditValues[0], richTextInputFieldEditValues[1])
      .clickSubmitFormButton()
      .assertThatFormHasBeenSuccessfullySubmitted('Thank you for submitting the form!');
  },

  'Open data source and check submitted rich text': function (browser) {
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertFormAnswerIsSavedToForm(richTextInputFieldEditValues[1])
      .assertColumnHasSpecifiedName(1, richTextInputFieldEditValues[0]);
  },

  'Navigate to the app to hide form clear button and rename submit button': function (browser) {
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const formBuilderPage = browser.page.formBuilderPage();
    const componentsScreen = browser.page.componentsScreen();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.FORM_BUILDER);

    formBuilderPage.openButtonFieldModalDialog()
      .setNewNameForFormButton('Submit', formButtonsLabels[1])
      .tickShowClearButtonForForm()
      .clickDoneButtonInModalDialog();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Publish the application': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publish = browser.page.publishScreen();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL')
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Check that the web application is open': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkPageTitle(`First screen - ${browser.globals.appNameGenerated}`);
  },

  'Check Rich text and formatting form fields on web': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.checkFormElementContainsText('@titleFormattingFormField', formTitleText)
      .checkFormElementContainsText('@paragraphFormattingFormField', formParagraphText)
      .checkThatFormFieldWithEnteredNameIsPresentOnForm(richTextInputFieldEditValues[0])
      .checkThatFormFieldHasPlaceholderOnForm(richTextInputFieldEditValues[0], richTextInputFieldEditValues[2])
      .checkThatFormFieldHasValue(richTextInputFieldEditValues[0], richTextInputFieldEditValues[1]);
  },

  'Fill in the form on web and check form buttons': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.fillInRichFormField(richTextInputFieldEditValues[0], richFormFieldEnteredValue)
      .checkFormElementContainsText('@formSubmitButton', formButtonsLabels[1])
      .assertClearButtonIsNotPresent()
      .clickSubmitFormButton()
      .assertThatFormHasBeenSuccessfullySubmitted('Thank you for submitting the form!');
  },

  'Open data source and check a new submitted rich text': function (browser) {
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertFormAnswerIsSavedToForm(richFormFieldEnteredValue)
      .assertColumnHasSpecifiedName(1, richTextInputFieldEditValues[0]);
  },

  'Delete the created application and data source': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};