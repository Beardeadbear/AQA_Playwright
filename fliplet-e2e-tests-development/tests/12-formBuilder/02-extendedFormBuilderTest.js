const casual = require('casual');
const formTemplates = require('../../utils/constants/formTemplates');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const widgets = require('../../utils/constants/widgets');
const fileName = 'icon.png';
const textInputFormFieldsAnswers = [casual.full_name, casual.email, (Math.floor(Math.random() * 80) + 20).toString(),
  casual.phone.replace(new RegExp('-', 'g'), ''), casual.url, casual.password, casual.description];
const textInputFieldEditValues = [casual.first_name, casual.first_name, casual.short_description];
const placeholderDropdownValue = [casual.word];
const confirmationMessageTitle = [casual.title];
const checkboxValue = [casual.city, casual.city];
const radioValue = [casual.country, casual.country];
const dropdownValue = [casual.card_type, casual.card_type];
const defaultStarRatingValue = (Math.floor(Math.random() * 5) + 1).toString();
const starRatingValue = (Math.floor(Math.random() * 5) + 1).toString();
const subject = casual.word.concat(casual.letter);
const formFieldsNames = [];
const loadedImageId = [];
const amountOfSetFormFields = [];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 02-extended-form`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 02-extended-form`;

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
    const formBuilderPage = browser.page.formBuilderPage();

    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.FORM_BUILDER)
      .switchToWidgetInstanceFrame();

    formBuilderPage.selectFormTemplateByName(formTemplates.FORM_BUILDER_NEW);
  },

  'Edit text input form fields': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.openEditFormFieldsModalDialog('Text input')
      .editFormFieldLabel(textInputFieldEditValues[0])
      .customizeFieldName()
      .chooseIfFormFieldNotOptional(true)
      .setDefaultValueForFormField(textInputFieldEditValues[1])
      .setPlaceholderValueForFormField(textInputFieldEditValues[2])
      .clickDoneButtonInModalDialog();
  },

  'Edit multiple options form fields - Checkboxes': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.openEditFormFieldsModalDialog('Checkboxes (multi-select)')
      .chooseIfFormFieldNotOptional(false)
      .setOptionsForMultipleFormField(checkboxValue)
      .setDefaultValueForFormField(checkboxValue[0])
      .clickDoneButtonInModalDialog();
  },

  'Edit multiple options form fields - Radios': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.openEditFormFieldsModalDialog('Radios (single-select)')
      .setOptionsForMultipleFormField(radioValue)
      .setDefaultValueForFormField(radioValue[0])
      .clickDoneButtonInModalDialog();
  },

  'Edit Dropdown form field': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.openEditFormFieldsModalDialog('Dropdown (single-select)')
      .setOptionsForMultipleFormField(dropdownValue)
      .setPlaceholderValueForDropdownField(placeholderDropdownValue)
      .setDefaultValueForFormField(dropdownValue[0])
      .clickDoneButtonInModalDialog();
  },

  'Edit Star rating form field': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.openEditFormFieldsModalDialog('Star rating')
      .setDefaultValueForStarRatingField(defaultStarRatingValue)
      .clickDoneButtonInModalDialog();
  },

  'Configure settings for form builder and create data source for it': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const formBuilderPage = browser.page.formBuilderPage();
    const dataSourceProvider = browser.page.dataSourceProvider();

    formBuilderPage.getFieldsNameFromForm(formFieldsNames);
    formBuilderPage.getNumberOfFormFields(amountOfSetFormFields);

    componentsScreen.switchToSettingsTab();

    dataSourceProvider.clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGenerated)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.tickCheckBoxByLabel('redirect_no');

    formBuilderPage.configureConformationMessage(confirmationMessageTitle)
      .clickAddToDataSourceCheckbox();

    dataSourceProvider
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.read.ACCESS)
      .checkDataSourceSecurityRulesAccessOperationsOnModal(dataSourceSecurityRulesOperations.write.ACCESS)
      .confirmDataSourceProviderModal()
      .clickOkButtonOnChangesAppliedAlert()
      .checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown();
  },

  'Configure a form builder to send email notification whenever a form is submitted': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();
    const componentsScreen = browser.page.componentsScreen();

    formBuilderPage.tickSendEmailsCheckbox()
      .openEmailConfigurationScreen()
      .enterEmailForSendingEmailsWhenFormIsSubmitted(browser.globals.gmailEmail)
      .enterEmailSubjectForSendingEmailsWhenFormIsSubmitted(subject);

    componentsScreen.clickSaveAndCloseButton();
    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview screen and check text input form fields': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const formBuilderPage = browser.page.formBuilderPage();

    appTopFixedNavigationBar.navigateToPreviewMode();

    formBuilderPage.checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame()
      .checkThatFormFieldWithEnteredNameIsPresentOnForm(textInputFieldEditValues[0])
      .checkThatFormFieldHasValue(textInputFieldEditValues[0], textInputFieldEditValues[1])
      .checkThatFormFieldHasPlaceholderOnForm(textInputFieldEditValues[0], textInputFieldEditValues[2])
      .checkThatItIsNotPossibleToSubmitFormWithoutFillingNotOptionalField(textInputFieldEditValues[0]);
  },

  'Check multiple input form fields on the preview screen': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.assertDefaultDropdownValueIsSelectedOnForm('Dropdown (single-select)', dropdownValue[0])
      .assertDefaultRadioValueIsSelectedOnForm('Radios (single-select)', radioValue[0])
      .assertDefaultCheckBoxValueIsSelectedOnForm('Checkboxes (multi-select)', checkboxValue[0])
      .assertDefaultStarRatingValueIsSelectedOnForm(defaultStarRatingValue)
      .checkThatDropdownFormFieldHasPlaceholderOnForm(placeholderDropdownValue);
  },

  'Click Clear button and assert default values are present in form fields': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.clickClearFormButton()
      .assertDefaultDropdownValueIsSelectedOnForm('Dropdown (single-select)', dropdownValue[0])
      .assertDefaultRadioValueIsSelectedOnForm('Radios (single-select)', radioValue[0])
      .assertDefaultCheckBoxValueIsSelectedOnForm('Checkboxes (multi-select)', checkboxValue[0])
      .assertDefaultStarRatingValueIsSelectedOnForm(defaultStarRatingValue)
      .checkThatDropdownFormFieldHasPlaceholderOnForm(placeholderDropdownValue);
  },

  'Check the form with invalid data': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.enterInvalidDataAndCheckIt('Email input', textInputFormFieldsAnswers[1].replace('@', ''),
      'The input is not a valid email address.')
      .enterInvalidDataAndCheckIt('Number input', casual.word,
      'Only integer digits are allowed.')
      .enterInvalidDataAndCheckIt('Telephone input', textInputFormFieldsAnswers[3].concat(casual.word),
      'Phone could contain ; , . ( ) - + SPACE * # and numbers.')
      .enterInvalidDataAndCheckIt('URL input', (textInputFormFieldsAnswers[4].match(/\/\/.{4}(.*)/)[1])
      .split(".").join(""), 'The input is not a valid URL.')
      .clickClearFormButton();
  },

  'Check the form with valid data': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.uncheckAllCheckboxesInMultiselectFormField('Checkboxes (multi-select)', checkboxValue[0])
      .enterValuesIntoForm(textInputFormFieldsAnswers)
      .selectValueFromFormDropdown('Dropdown (single-select)', dropdownValue[1])
      .chooseRadioInForm('Radios (single-select)', radioValue[1])
      .tickCheckboxInForm('Checkboxes (multi-select)', checkboxValue[1])
      .chooseStarRating(starRatingValue);
  },

  'Select an image for form and submit the form': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.clickChooseImageForForm()
      .selectAnImageForUploading(fileName)
      .clickSubmitFormButton()
      .assertThatFormHasBeenSuccessfullySubmitted(confirmationMessageTitle);
  },

  'Open data source and check that correct answers are present there': function (browser) {
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceEntries = [];

    dataSources.navigate()
      .waitForDataSourcesPageToBeLoaded();
    dataSources.clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated);
    dataSource.getFormValuesOfDataSourceWithDeleting(amountOfSetFormFields[0], dataSourceEntries);
    dataSource.getTextFromDataSourceCell(1, loadedImageId);

    browser.perform(() => {
      dataSource.assertCorrectDataFromSubmittedFormInDataSource(textInputFormFieldsAnswers.concat(dropdownValue[1], radioValue[1],
        checkboxValue[1], starRatingValue), dataSourceEntries);
    });
  },

  'Open data source and check that correct column names are present there': function (browser) {
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceFieldsTitles = [];

    dataSources.navigate()
      .waitForDataSourcesPageToBeLoaded();
    dataSources.clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated);
    dataSource.getFormFieldsNamesOfDataSourceWithDeleting(amountOfSetFormFields[0], dataSourceFieldsTitles);

    browser.perform(() => {
      dataSource.assertCorrectDataFromSubmittedFormInDataSource(formFieldsNames, dataSourceFieldsTitles)
    });
  },

  'Open file manager and check the chosen image after submitting is present in the app folder': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManagerById(loadedImageId.pop());
  },

  'Navigate to the data source to get its id for api request and get browserLogs of data source actions ': function (browser) {
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSources.navigate()
      .waitForDataSourcesPageToBeLoaded();
    dataSources.clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.switchToSettingsTab()
      .getDataSourceLogs(browser.globals.apiUri);
  },

  'Verify that the sent email data in browserLogs is matching configured email and subject': function (browser) {
    const emailPattern = `type":"to","email":"${browser.globals.gmailEmail}`;
    const subjectPattern = `subject":"${subject}`;

    browser
      .waitForElementVisible('body', browser.globals.smallWait)
      .assert.containsText('body', emailPattern)
      .assert.containsText('body', subjectPattern);
  },

  'Check if the email with form submitted information is received': function (browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.checkThatEmailIsPresentInGmailInbox(subject);
  },

  'Delete the created application and data source': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};