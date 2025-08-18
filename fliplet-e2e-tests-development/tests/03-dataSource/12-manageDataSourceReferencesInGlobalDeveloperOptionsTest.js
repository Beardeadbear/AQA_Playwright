const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');

module.exports = {

  '@disabled': (globals.smokeTest == 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/ID-446',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 12-ds-dev-options`;
    browser.globals.firstDataSourceNameGenerated = `${casual.title} 12-ds-dev-options`;
    browser.globals.secondDataSourceNameGenerated = `${casual.title} 12-ds-dev-options`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.firstDataSourceNameGenerated,
        browser.globals.secondDataSourceNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and organization and data sources': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.firstDataSourceNameGenerated, [])
      .createDataSourceViaApiUsingOrganizationId(browser.globals.secondDataSourceNameGenerated, [], browser.globals.organizationId);
  },

  'Open Developer options and switch to Global': function(browser){
    const devOptions = browser.page.developerOptionsScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    rightSideNavMenu.openDeveloperOptionsScreen();

    devOptions.switchToGlobalSettings();
  },

  'Add the created data source to the references': function(browser){
    const devOptions = browser.page.developerOptionsScreen();

    devOptions
      .clickAddButtonToOpenReferencesDropdownMenu()
      .clickDataSourceLinkToOpenReferences()
      .selectDataSourceInDropdownMenuOnReferencesModal(browser.globals.firstDataSourceNameGenerated)
      .assertDataSourceIsPresentInReferencesListOnModal(browser.globals.firstDataSourceNameGenerated)
      .selectDataSourceInDropdownMenuOnReferencesModal(browser.globals.secondDataSourceNameGenerated)
      .assertDataSourceIsPresentInReferencesListOnModal(browser.globals.secondDataSourceNameGenerated)
      .clickSaveButtonOnDataSourceReferencesModal()
      .clickSaveAndRunButton();
  },

  'Open the references again and check that the added data sources are in the list': function(browser){
    const devOptions = browser.page.developerOptionsScreen();

    devOptions
      .clickAddButtonToOpenReferencesDropdownMenu()
      .clickDataSourceLinkToOpenReferences()
      .assertDataSourceIsPresentInReferencesListOnModal(browser.globals.firstDataSourceNameGenerated)
      .assertDataSourceIsPresentInReferencesListOnModal(browser.globals.secondDataSourceNameGenerated);
  },

  'Remove one of the data source from the references': function(browser){
    const devOptions = browser.page.developerOptionsScreen();

    devOptions
      .deleteDataSourceFromReferencesOnModal(browser.globals.secondDataSourceNameGenerated)
      .assertDataSourceIsPresentInReferencesListOnModal(browser.globals.firstDataSourceNameGenerated)
      .assertDataSourceIsNotPresentInReferencesListOnModal(browser.globals.secondDataSourceNameGenerated)
      .clickSaveButtonOnDataSourceReferencesModal()
      .clickSaveAndRunButton();
  },

  'Open the references again and check that the deleted data source is not present in the references list': function(browser){
    const devOptions = browser.page.developerOptionsScreen();

    devOptions
      .clickAddButtonToOpenReferencesDropdownMenu()
      .clickDataSourceLinkToOpenReferences()
      .assertDataSourceIsPresentInReferencesListOnModal(browser.globals.firstDataSourceNameGenerated)
      .assertDataSourceIsNotPresentInReferencesListOnModal(browser.globals.secondDataSourceNameGenerated);
  },

  'Navigate to Data source manager and delete the data sources that is used in the references': function(browser){
    browser.deleteDataSourcesMatchingParticularName(browser.globals.firstDataSourceNameGenerated);
  },

  'Open Developer options of the app again and switch to Global': function(browser){
    const devOptions = browser.page.developerOptionsScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appsPage = browser.page.appsPage();

    appsPage
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    rightSideNavMenu.openDeveloperOptionsScreen();

    devOptions.switchToGlobalSettings();
  },

  'Open the references and check that the deleted data source from the manager is not present in the references list': function(browser){
    const devOptions = browser.page.developerOptionsScreen();

    devOptions
      .clickAddButtonToOpenReferencesDropdownMenu()
      .clickDataSourceLinkToOpenReferences()
      .assertDataSourceIsNotPresentInReferencesListOnModal(browser.globals.firstDataSourceNameGenerated)
      .assertDataSourceIsNotPresentInReferencesListOnModal(browser.globals.secondDataSourceNameGenerated);
  },

  'Add the second created data source to the references again and save': function(browser){
    const devOptions = browser.page.developerOptionsScreen();

    devOptions
      .selectDataSourceInDropdownMenuOnReferencesModal(browser.globals.secondDataSourceNameGenerated)
      .assertDataSourceIsPresentInReferencesListOnModal(browser.globals.secondDataSourceNameGenerated)
      .clickSaveButtonOnDataSourceReferencesModal()
      .clickSaveAndRunButton();
  },

  'Open the references and check that added and saved data source is in the list': function(browser){
    const devOptions = browser.page.developerOptionsScreen();

    devOptions
      .clickAddButtonToOpenReferencesDropdownMenu()
      .clickDataSourceLinkToOpenReferences()
      .assertDataSourceIsPresentInReferencesListOnModal(browser.globals.secondDataSourceNameGenerated)
      .assertDataSourceIsNotPresentInReferencesListOnModal(browser.globals.firstDataSourceNameGenerated);
  },

  'Delete the created application and data sources': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.firstDataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.secondDataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.firstDataSourceNameGenerated, browser.globals.secondDataSourceNameGenerated]);
  }
};