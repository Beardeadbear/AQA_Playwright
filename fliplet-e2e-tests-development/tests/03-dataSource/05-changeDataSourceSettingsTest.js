const globals = require('../../globals_path');
const casual = require('casual');
const emailVerificationComponent ='com.fliplet.email-validation';
let verificationCode;
const bypassEmail = {
  code: '',
  email: casual.email
};

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 05-data-change`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 05-data-change`;
    browser.globals.dataSourceNewNameGenerated = `${casual.title} 05-new-data`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.dataSourceNewNameGenerated], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

 'Change data source name': function (browser) {
    const dataSource = browser.page.singleDataSourcePage();

   browser.createAppUsingTemplate(browser.globals.appNameGenerated, 'Client Support');
   browser.createDataSource(browser.globals.dataSourceNameGenerated);

    dataSource
      .switchToSettingsTab()
      .changeDataSourceName(browser.globals.dataSourceNewNameGenerated)
      .clickSaveChangesButtonOnSettingsScreen()
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNewNameGenerated);
  },

  'Get Bypass validation code and use it to access without email verification': function(browser) {
    const dataSource = browser.page.singleDataSourcePage();
    const apps = browser.page.appsPage();
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const columnNames = ['Email'];

    //Getting a bypass code for data source

    dataSource.changeDataSourceColumnNames(columnNames);
    dataSource.clickSaveChangesButtonOnEntriesScreen();
    dataSource.switchToSettingsTab()
      .clickShowBypassCodeButton();

    //adding emails with bypass code to datasource

    dataSource.getText('@verificationHiddenCode', function(verificationCodeValue){
      verificationCode = verificationCodeValue.value;
    });

    browser.getText('#backdoor', function (text) {
      bypassEmail.code = text.value;

      dataSource.switchToEntriesTab();
      dataSource.changeValuesInDataSourceCells(2, [`${text.value}${bypassEmail.email}`]);
      dataSource.clickSaveChangesButtonOnEntriesScreen();
    });

    //adding an email verification component to apps screen

    apps
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    browser.dragAndDrop(emailVerificationComponent)
      .waitForWidgetInterface(emailVerificationComponent)
      .switchToWidgetInstanceFrame()
      .switchToFLWidgetProviderFrame('.form-horizontal')
      .switchToFLWidgetProviderFrame('.form-group');

    dataSourceProvider.clickShowAllDataSources()
      .selectDataSourceInDropdownList(browser.globals.dataSourceNewNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNewNameGenerated);

    componentsScreen.selectTheColumnFromDataSourceForValue(columnNames[0], 1);

    componentsScreen.clickSaveAndCloseButton();

    browser.waitForElementVisible('.widget-category', browser.globals.smallWait);
  },

  'Test whether user is able to bypass verification email using code' : function(browser){
    const previewApp = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.switchToPreviewFrame();

    previewApp
      .enterEmailForVerificationComponent(`${bypassEmail.code}${bypassEmail.email}`)
      .enterCodeFromVerificationEmail(verificationCode)
      .assertSuccessfulVerificationInfoMessage('You have been verified and you can now proceed.');
  },

  'Change data source definition and verify change is reflected in application': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const componentScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    allDataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(browser.globals.dataSourceNewNameGenerated);

    //editing a value in data source definition text area

    dataSource
      .switchToSettingsTab()
      .changeEmailSubjectInDataSourceDefinition(browser.globals.editedSubject);
    dataSource.clickSaveChangesButtonOnSettingsScreen();

    //open the app connected  a data source

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    editApp.openDetailsOfComponentByClickingOnIt(emailVerificationComponent);

    browser
      .switchToFLWidgetProviderFrame('.form-horizontal')
      .switchToFLWidgetProviderFrame('.form-group');

    //Check that header of email verification letter is changed and reflects value set in data source

    dataSourceProvider.checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNewNameGenerated);

    componentScreen.openEmailTemplateInFormDetails();
    componentScreen.verifyEmailSubjectOfTemplateContainsAddedText(browser.globals.editedSubject);
  },

  'Delete the created data sources and application': function(browser){
    browser
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNewNameGenerated)
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated,
        browser.globals.dataSourceNewNameGenerated], browser.globals.emailForOrganizationTests);
  }
};