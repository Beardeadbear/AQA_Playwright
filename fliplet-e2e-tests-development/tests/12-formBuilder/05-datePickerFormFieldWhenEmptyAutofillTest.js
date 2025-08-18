const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const widgets = require('../../utils/constants/widgets');
const formTemplates = require('../../utils/constants/formTemplates');
const publishingChannels = require('../../utils/constants/publishingChannels');
const currentDate = new Date().toJSON().slice(0, 10);
const nextDay = new Date(new Date().setDate(new Date().getDate() + 1)).toJSON().slice(0, 10);

module.exports = {

  '@disabled': (globals.smokeTest == 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-232',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 05-date-picker-form`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 05-date-picker-form`;

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

  'Select a form template with date picker field': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.selectFormTemplateByName(formTemplates.DATE_PICKER);
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

  'Change a value in the date picker form field to a different from the current one and submit the form': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage
      .checkThatFormFieldHasValue(formTemplates.DATE_PICKER, currentDate)
      .clickDatePickerFormFieldToChooseDate()
      .selectNextDayValueInCalendarDropdownDatePickerFormField()
      .checkThatFormFieldHasValue(formTemplates.DATE_PICKER, nextDay)
      .clickSubmitFormButton();
  },

  'Open the data source and check that submitted date picker value is correct': function(browser){
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertFormAnswerIsSavedToForm(nextDay);
  },

  'Publish the application and open it on the web': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publish = browser.page.publishScreen();
    const appsPage = browser.page.appsPage();

    appsPage
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    appTopFixedNavigationBar.navigateToPublishMode();

    publish
      .clickSelectButtonNearPublishingOptionByChannelName(publishingChannels.PUBLISH_TO_THE_WEB_VIA_A_URL)
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Check that the application is open on web and there is the screen with form': function(browser){
    const webApp = browser.page.webApplicationPages();

    webApp
      .checkPageTitle(`First screen - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.FORM_BUILDER);
  },

  'Submit the form without changing the date picker field value': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage
      .checkThatFormFieldHasValue(formTemplates.DATE_PICKER, currentDate)
      .clickSubmitFormButton();
  },

  'Open the data source and check that the new  submitted date picker value is correct': function(browser){
    const dataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    dataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertFormAnswerIsSavedToForm(currentDate);
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],
        browser.globals.emailForOrganizationTests);
  }
};