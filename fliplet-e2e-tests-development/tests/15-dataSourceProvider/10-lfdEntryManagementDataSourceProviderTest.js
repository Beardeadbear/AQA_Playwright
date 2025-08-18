const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const listFromDataSourceLayoutNames = require('../../utils/constants/listFromDataSourceLayoutNames');
const formTemplates = require('../../utils/constants/formTemplates');
const whoCanEditListItemsOptions = require('../../utils/constants/whoCanEditListItemsOptions');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screenLayouts = require('../../utils/constants/screenLayouts');
const globals = require('../../globals_path');
const screensTitles = {
  screenWithLfd: 'First screen',
  screenWithForm: 'Second screen',
  screenWithLogin: 'Log in'
};
const usersInfo = [
  {
    "name": casual.full_name,
    "Email": casual.email,
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  },
  {
    "name": casual.full_name,
    "Email": casual.email,
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  },
  {
    "name": casual.full_name,
    "Email": casual.email,
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  }
];
const formAnswer = casual.title;

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-271',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 10-lfd-entry-management-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 10-lfd-entry-management-ds-provider`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done,
        browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and app data source with security rules': function(browser){
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

    componentsScreen.selectFieldsForLoginFromDataSourceColumnNames([Object.keys(usersInfo[0])[1], Object.keys(usersInfo[0])[2]]);
  },

  'Select the screen with LFD component for Login redirection': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .switchToFlWidgetFrameByNumber(2)
      .selectScreenForLinkingByName(screensTitles.screenWithLfd)
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

  'Select a form template for Directory entry management': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();

    formBuilderPage.selectFormTemplateByName(formTemplates.DIRECTORY_FORM_TEMPLATE);
  },

  'Configure the form builder settings by connecting the created app data source to it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    componentsScreen.switchToSettingsTab();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Enable Update existing entries in a data source and save': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();
    const componentsScreen = browser.page.componentsScreen();

    formBuilderPage.clickEditDataSourceEntriesCheckbox();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Add Directory LFD component to the second screen and select Directory layout': function(browser){
    const list = browser.page.listScreens();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLfd);

    browser
      .newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.DIRECTORY);
  },

  'Connect the created data source to Directory': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Configure access for Editing entries in Entry management by selection the option that users can edit their own list items': function(browser){
    const list = browser.page.listScreens();

    list
      .expandEntryManagementBlock()
      .enableAllowUserToEditListItemsOptionInEntryManagement()
      .selectScreenWithFormInEntryManagement(3, screensTitles.screenWithForm)
      .chooseOptionForWhoCanEditListItems(whoCanEditListItemsOptions.USERS_CAN_EDIT_THEIR_OWN_LIST_ITEMS)
      .selectFieldWherePostAuthorsEmailIsStored(Object.keys(usersInfo[0])[1]);
  },

  'Connect the created data source Entry management data source provider and save': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated, true)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated, true);
  },

  'Select user email and name required data fields to configure Entry management': function(browser){
    const list = browser.page.listScreens();

    list
      .addValueInInputFieldForNameDataSourceColumnInEntryManagement(Object.keys(usersInfo[0])[0])
      .selectUserEmailDataFieldInEntryManagement(Object.keys(usersInfo[0])[1]);
  },

  'Open Data view settings, map data view fields and return to Settings': function(browser){
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();

    list.clickDataViewSettings();

    dataView
      .selectDataViewValue(1, Object.keys(usersInfo[0])[0])
      .selectDataViewValue(2, Object.keys(usersInfo[0])[3])
      .selectDataViewValue(3, Object.keys(usersInfo[0])[4])
      .clickBackToSettingsButton();
  },

  'Check that the selected data source is shown in data source provider after returning from Data view settings and save': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();

    dataSourceProvider.checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview mode and open the screen with Login': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const preview = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.clickEnableSecurityButtonForPreview()

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLogin);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LOGIN);
  },

  'Login and check that the screen with LFD is open': function(browser){
    const preview = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    preview.signInIntoLoginFormWithSecurityEnabled(usersInfo[1].Email, usersInfo[1].password);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screensTitles.screenWithLfd);

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();
  },

  'Check Directory LFD and click Edit button to change the user data': function(browser){
    const preview = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    preview
      .checkThatDirectoryItemHasDataByTitle(usersInfo[1].name, usersInfo[1].position)
      .openListItemDetailsByTitle(listFromDataSourceLayoutNames.DIRECTORY, usersInfo[1].name)
      .clickEditEntityIcon();

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screensTitles.screenWithForm);
  },

  'Check that user is redirected to the screen with form and submit the form': function(browser){
    const formBuilderPage = browser.page.formBuilderPage();
    const preview = browser.page.previewAppScreen();

    preview
      .checkThatComponentIsPresentOnPreviewScreen(widgets.FORM_BUILDER)
      .switchToPreviewFrame();

    formBuilderPage
      .enterValuesIntoForm([formAnswer])
      .clickSubmitFormButton();
  },

  'Open the screen with LFD again and check that the changes have been applied to the list item': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const preview = browser.page.previewAppScreen();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithLfd);

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();

    preview.checkThatDirectoryItemHasDataByTitle(usersInfo[1].name, formAnswer);
  },

  'Delete the created applications and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};