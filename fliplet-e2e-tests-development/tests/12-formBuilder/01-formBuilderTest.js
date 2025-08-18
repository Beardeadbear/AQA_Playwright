const casual = require('casual');
const formTemplates = require('../../utils/constants/formTemplates');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const widgets = require('../../utils/constants/widgets');
const formName = casual.title;
const firstAnswer = casual.word;
const secondAnswer = casual.word;
const submissionInfoValueForEmail = casual.title;

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 01-form`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 01-form`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done,
        browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Drop the form builder component to app and check that it is present on the screen': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();

    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.FORM_BUILDER)
      .switchToWidgetInstanceFrame();

    formBuilderPage.selectFormTemplateByName(formTemplates.BLANK);
  },

  'Set a name for form component and create new data source connecting to this form': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const formBuilderPage = browser.page.formBuilderPage();
    const dataSourceProvider = browser.page.dataSourceProvider();

    componentsScreen.switchToSettingsTab();

    formBuilderPage.setFormName(formName);

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

  'Open preview screen and fill in the form': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const formBuilderPage = browser.page.formBuilderPage();

    appTopFixedNavigationBar.navigateToPreviewMode();

    formBuilderPage.checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame()
      .enterValuesIntoForm([firstAnswer])
      .clickSubmitFormButton()
      .assertThatFormHasBeenSuccessfullySubmitted('Thank you for submitting the form!');
  },

  'Open the connected data source and check that the answer is saved': function (browser) {
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertFormAnswerIsSavedToForm(firstAnswer);
  },

  'Configure a form builder to send emails when new entries are added': function (browser) {
    const formBuilderPage = browser.page.formBuilderPage();
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.FORM_BUILDER);

    componentsScreen.switchToSettingsTab();

    formBuilderPage.tickSendEmailsCheckbox()
      .openEmailConfigurationScreen()
      .editBodyOfEmail(submissionInfoValueForEmail);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open preview screen again and fill in the form': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const formBuilderPage = browser.page.formBuilderPage();

    appTopFixedNavigationBar.navigateToPreviewMode();

    formBuilderPage.checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame()
      .enterValuesIntoForm([secondAnswer])
      .clickSubmitFormButton()
      .assertThatFormHasBeenSuccessfullySubmitted('Thank you for submitting the form!');
  },

  'Navigate to the data source to get its id for api request and get browserLogs of data source actions ': function (browser) {
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.switchToSettingsTab()
      .getDataSourceLogs(browser.globals.apiUri);
  },

  'Verify that the sent email data in browserLogs is matching configured email': function (browser) {
    const emailPattern = `type":"to","email":"${browser.globals.emailForOrganizationTests}`;
    const subjectPattern = `subject":"Form entries from \\"${formName}\\" form`;
    const answerPattern = `Enter your first question: ${secondAnswer}`;

    browser
      .waitForElementVisible('body', browser.globals.smallWait)
      .assert.containsText('body', emailPattern)
      .assert.containsText('body', subjectPattern)
      .assert.containsText('body', answerPattern)
      .assert.containsText('body', submissionInfoValueForEmail);
  },

  'Delete the created application and data source': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};