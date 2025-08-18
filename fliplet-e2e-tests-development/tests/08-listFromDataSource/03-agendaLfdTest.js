const casual = require('casual');
const globals = require('../../globals_path');
const moment = require('moment');
const widgets = require('../../utils/constants/widgets');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const dataSourceSecurityRulesOperations = require('../../utils/constants/dataSourceSecurityRulesOperations');
const formTemplates = require('../../utils/constants/formTemplates');
const date = moment().add(1, 'month').format('YYYY-MM-DD');

// Default Agenda data source in rare case has different order of columns, for test to work properly values are duplicated
const firstElement = [casual.title, date, '09:00', '13:00', date, '09:00', '13:00', casual.word];
const totalTitle = [firstElement[0]];
const screensTitles = {
  screenWithAgenda: 'First screen',
  screenWithForm: 'Second screen',
};

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 03-lfd-agenda`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 03-lfd-agenda`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app and add Agenda lfd component': function (browser) {
    const list = browser.page.listScreens();

    browser.createApplicationWithCondition(browser.globals.appNameGenerated);
    browser.dragAndDropWithCondition(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.AGENDA);
  },

  'Create and connect a data source for the Agenda': function (browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider.clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGenerated)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Add to the created for the LFD component data source security rules': function (browser) {
    const list = browser.page.listScreens();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const secureRulesTabInAppDataScreen = browser.page.secureRulesTabInAppDataScreen();
    const dataSourceSecurityRuleOverlay = browser.page.dataSourceSecurityRuleOverlay();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt('Edit Data Sources');

    dataSource.switchToSecurityRuleTab();

    secureRulesTabInAppDataScreen.clickAddNewSecurityRuleButton()
      .selectCreateNewRuleInPreconfiguredRulesDropdownMenu();

    dataSourceSecurityRuleOverlay.selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.read.OPERATION)
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.write.OPERATION)
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.delete.OPERATION)
      .selectOperationForDataSourceSecurityRule(dataSourceSecurityRulesOperations.update.OPERATION)
      .clickAddRuleButton();

    secureRulesTabInAppDataScreen.clickSaveAndApplyButtonForDataSourceSecurityRule();

    list.confirmDataChangesInModalWindow();
    },

  'Check Data View settings match to expected': function (browser) {
    const dataView = browser.page.dataViewScreen();
    const list = browser.page.listScreens();
    const summaryFieldsArray = ['Session starting time', 'Session ending time', 'Primary text', 'Secondary text'];
    const summaryColumnsArray = ['Start Time', 'End Time', 'Title', 'Location'];

    list.clickDataViewSettings();

    dataView.assertDefaultsDataViewSettingsMatchToExpected('Agenda', summaryFieldsArray, summaryColumnsArray);
    dataView.clickBackToSettingsButton();
  },

  'Change entries in agenda data source': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt('Edit Data Sources');

    dataSource.changeValuesInDataSourceCells(7, firstElement);

    dataSourceManagerOverlay.clickSaveButtonInDataSourceManagerOverlay();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview screen and assert agenda items can be booked': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const preview = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE);
    preview.assertElementPresentOnPreviewScreen('.agenda-list-day-holder');
    preview.clickBookmarkIconNearElementByItemTitle(totalTitle);
    preview.clickMyAgendaButton();
    preview.assertOnlyBookedItemsAreVisible(1, totalTitle);
  },

  'Navigate to data sources directory and check that bookmark appeared in data source': function (browser) {
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();

    allDataSources.navigate()
      .waitForDataSourcesPageToBeLoaded()
      .clickDataSourceByName(`${browser.globals.appNameGenerated} - Bookmarks`);

    dataSource.assertCorrectDataSourceIsOpenedByName(`${browser.globals.appNameGenerated} - Bookmarks`)
      .assertColumnNamesAreNotDefault()
      .assertDataInFirsLineIsNotDefault();
  },

  'Switch to the app second screen and add Form for Agenda editing': function (browser) {
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const componentsScreen = browser.page.componentsScreen();
    const apps = browser.page.appsPage();
    const formBuilderPage = browser.page.formBuilderPage();
    const dataSourceProvider = browser.page.dataSourceProvider();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithForm);

    browser.dragAndDropWithCondition(widgets.FORM_BUILDER)
      .switchToWidgetInstanceFrame();

    formBuilderPage.selectFormTemplateByName(formTemplates.NEW_LIST_ITEM);

    componentsScreen.switchToSettingsTab();

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    formBuilderPage.clickAddToDataSourceCheckbox();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Configure access to Editing, Adding and Removing of entries in Entry management block': function (browser) {
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithAgenda);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_FROM_DATA_SOURCE);

    list
      .expandEntryManagementBlock()
      .enableAllowUserToAddListItemsOptionInEntryManagement()
      .selectScreenWithFormInEntryManagement(2, screensTitles.screenWithForm)
      .enableAllowUserToEditListItemsOptionInEntryManagement()
      .selectScreenWithFormInEntryManagement(3, screensTitles.screenWithForm)
      .enableAllowUserToDeleteListItemsOptionInEntryManagement();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Check removing, adding and editing of entries on preview screen': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const preview = browser.page.previewAppScreen();
    const formBuilderPage = browser.page.formBuilderPage();
    const titleForNewEntity = `${casual.title} added`;
    const dateForNewEntity = date;
    const startTime = `10:00`;
    const endTime = `12:00`;
    const editedTitle = `${casual.title} edited`;

    appTopFixedNavigationBar.navigateToPreviewMode();

    preview.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE)
      .switchToPreviewFrame();
    preview.openDetailsOfListItem(1, 'agenda-item-session-location');
    preview.clickAndConfirmDeleteEntityButton();

    browser.waitForElementNotPresent(`//h2[text()="${firstElement[0]}"]`, browser.globals.mediumWait);

    preview.clickAddEntityIcon();

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screensTitles.screenWithForm);

    formBuilderPage.switchToPreviewFrame()
      .enterValuesIntoForm([titleForNewEntity, dateForNewEntity, startTime, endTime])
      .clickSubmitFormButton()
      .assertThatFormHasBeenSuccessfullySubmitted('Thank you for submitting the form!');

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithAgenda);

    preview.assertElementPresentOnPreviewScreenXpath(`//h2[@class="agenda-item-title"][text()="${titleForNewEntity}"]`);
    preview.openDetailsOfListItem(2, 'agenda-item-info-holder');
    preview.clickEditEntityIcon();

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screensTitles.screenWithForm);

    formBuilderPage.switchToPreviewFrame()
      .enterValuesIntoForm([editedTitle])
      .clickSubmitFormButton()
      .assertThatFormHasBeenSuccessfullySubmitted('Thank you for submitting the form!');

    appScreensLeftsidePanel.openScreenByName(screensTitles.screenWithAgenda);

    preview.assertElementPresentOnPreviewScreenXpath(`//h2[@class="agenda-item-title"][contains(text(),"${editedTitle}")]`);
  },

  'Delete the created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated],browser.globals.emailForOrganizationTests);
  }
};