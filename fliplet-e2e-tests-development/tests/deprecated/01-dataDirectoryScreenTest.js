const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screenName = casual.word;
const columns = ['Name', 'Tags', 'Images'];
const names = ['Rita Craft', 'Alia Hagans'].sort();
const unsortedNames = ['Jule Vazquez', 'Vina Shofner', 'Theodore Mincks'];
const tags = [casual.word, casual.word];
const imageNames = ['colonel-meow.JPG', 'parrots_thumb.jpg'];

module.exports = {
  '@disabled': true, //this feature has been deprecated and removed.
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 18-data-directory`;
    browser.globals.newDataSourceNameGenerated = `${casual.title} 18-directory`;
    browser.globals.existingDataSourceNameGenerated = `${casual.title} 18-existing`;

    const dataSource = browser.page.singleDataSourcePage();

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.existingDataSourceNameGenerated, browser.globals.newDataSourceNameGenerated], done)
      .resizeWindow(1600, 1200)
      .login()
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.EVENT_TEMPLATE)
      .createDataSource(browser.globals.existingDataSourceNameGenerated);

    dataSource.addColumnBeforeSelectedOne(1);
    dataSource.clickSaveChangesButtonOnEntriesScreen();
    dataSource.assertColumnHasSpecifiedName(1, 'Column (1)');
    dataSource.changeDataSourceColumnNames(columns);
    dataSource.changeValuesInDataSourceCells(2, [names[0], tags[0], imageNames[0]]);
    dataSource.changeValuesInDataSourceCells(3, [names[1], tags[1], imageNames[1]]);

    browser.pause(500);

    dataSource.clickSaveChangesButtonOnEntriesScreen();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new screen using Data Directory layout': function(browser){
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const screenLayout = 'Data Directory';

    apps
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    editApp
      .clickAddScreensButton()
      .selectScreenLayoutByName('Data Directory');

    editApp.enterScreenName(screenName);
    editApp.assertScreenLayoutsOverlayIsClosed(screenLayout);
  },

  'Create a new data source for data directory': function (browser) {
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const dataSource = browser.page.singleDataSourcePage();
    const preview = browser.page.previewAppScreen();
    const dataDirectory = browser.page.dataDirectoryScreen();
    const firstUserName = `1st ${casual.full_name}`;
    const secondUserName = `2nd ${casual.full_name}`;

    editApp.openDataDirectoryConfigurations();

    //start creating new data source

    browser.pause(500);

    dataDirectory.selectOptionForNewDataSourceCreation(browser.globals.newDataSourceNameGenerated);

    browser.pause(1500);

    dataDirectory
      .clickEditDataSourceLink()
      .switchToOpenedDataSourceOverlay();

    //add some data to it and save changes

    dataSource.changeValuesInDataSourceCells(2, [firstUserName]);
    dataSource.changeValuesInDataSourceCells(3, [secondUserName]);
    dataSource.clickSaveChangesButtonOnEntriesWindowFromAppDetails();

    browser
      .waitForElementNotPresent('#overlay-content-0', browser.globals.smallWait)
      .pause(3500);

    componentsScreen.clickSaveAndCloseButton();

    //switching to preview and check if data directory screen has data from data source

    editApp.clickPreviewMenuItem();

    browser
      .switchToPreviewFrame()
      .waitForElementVisible('.list-default.directory-entries.list-index-enabled', browser.globals.smallWait);

    preview.assertEntryInDataDirectoryContainsText(1, firstUserName);
    preview.assertEntryInDataDirectoryContainsText(2, secondUserName);
  },

  'Use existing data source for data directory': function (browser) {
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const preview = browser.page.previewAppScreen();
    const dataDirectory = browser.page.dataDirectoryScreen();

    browser.frame(null);

    preview.clickEditMenu();

    browser.switchToPreviewFrame();

    //selecting existing data source for data directory

    editApp.openDataDirectoryConfigurations();

    browser.pause(1500);

    dataDirectory.selectDataSourceForDataDirectoryByName(browser.globals.existingDataSourceNameGenerated);

    componentsScreen.clickSaveAndCloseButton();

    //checking data from existing data source is displayed

    editApp.clickPreviewMenuItem();

    browser
      .switchToPreviewFrame()
      .waitForElementVisible('.list-default.directory-entries', browser.globals.smallWait);

    preview.assertEntryInDataDirectoryContainsText(1, names[0]);
    preview.assertEntryInDataDirectoryContainsText(2, names[1]);
  },

  'Check tags are displayed in directory screen': function(browser){
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const preview = browser.page.previewAppScreen();
    const dataDirectory = browser.page.dataDirectoryScreen();

    browser.frame(null);

    preview.clickEditMenu();

    browser.switchToPreviewFrame();

    editApp.openDataDirectoryConfigurations();

    dataDirectory.waitForNavTabsToBeClickable(browser.globals.existingDataSourceNameGenerated);

    browser.pause(1000);

    dataDirectory.switchToListNavigationTab();

    browser.pause(1000);

    dataDirectory.tickShowTagsCheckbox();

    browser
      .waitForElementVisible('#data-tags-fields-select', browser.globals.smallWait)
      .selectValueFromDropdown('data-tags-fields-select', columns[1]);

    browser.pause(1000);

    componentsScreen.clickSaveAndCloseButton();

    editApp.clickPreviewMenuItem();

    browser.switchToPreviewFrame();

    preview.checkAllTagsFromDataSourceAreDisplayed(tags);
  },

  'Check changing order of data display on screen': function(browser){
    const allDataSources = browser.page.allDataSourcesPage();
    const dataSource = browser.page.singleDataSourcePage();
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const preview = browser.page.previewAppScreen();
    const dataDirectory = browser.page.dataDirectoryScreen();

    allDataSources
      .navigate()
      .waitForDataSourcesPageToBeLoaded();

    browser.pause(5000);

    allDataSources.clickDataSourceByName(browser.globals.existingDataSourceNameGenerated);

    dataSource.changeValuesInDataSourceCells(5, [unsortedNames[0]]);
    dataSource.changeValuesInDataSourceCells(6, [unsortedNames[1]]);
    dataSource.changeValuesInDataSourceCells(7, [unsortedNames[2]]);
    dataSource.clickSaveChangesButtonOnEntriesScreen();

    apps
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    editApp.switchToScreenByNameAndRefresh(screenName);

    browser.switchToPreviewFrame();

    editApp.openDataDirectoryConfigurations();

    dataDirectory.waitForNavTabsToBeClickable(browser.globals.existingDataSourceNameGenerated);
    dataDirectory
      .switchToListNavigationTab()
      .switchOrderDisplayToAsLoaded();

    browser.pause(1000);

    componentsScreen.clickSaveAndCloseButton();

    editApp.clickPreviewMenuItem();

    browser
      .switchToPreviewFrame()
      .waitForElementVisible('.list-default.directory-entries', browser.globals.smallWait);

    preview.assertEntryInDataDirectoryContainsText(1, names[0]);
    preview.assertEntryInDataDirectoryContainsText(2, names[1]);
    preview.assertEntryInDataDirectoryContainsText(3, unsortedNames[0]);
    preview.assertEntryInDataDirectoryContainsText(4, unsortedNames[1]);
    preview.assertEntryInDataDirectoryContainsText(5, unsortedNames[2]);
  },

  'Check thumbnails can be added to data entries': function(browser){
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const preview = browser.page.previewAppScreen();
    const dataDirectory = browser.page.dataDirectoryScreen();

    browser.frame(null);

    preview.clickEditMenu();

    browser.switchToPreviewFrame();

    editApp.openDataDirectoryConfigurations();

    dataDirectory.waitForNavTabsToBeClickable(browser.globals.existingDataSourceNameGenerated);
    dataDirectory
      .switchToAdvancedNavigationTab()
      .expandEnableDirectoryThubmnailsAccordeon()
      .enableDirectoryThumbnails()
      .selectValueFromDropdown('data-thumbnail-fields-select', columns[2])
      .enableShowingThumbnailsInMainList()
      .enableShowingThumbnailsOnDetails()
      .clickBrowseYourFolderLibraryButton();

    browser
      .frame(null)
      .switchToWidgetInstanceFrame()
      .switchToFLWidgetProviderFrame('select#drop-down-file-source')
      .pause(2000);

    dataDirectory.startBrowsingFoldersInOrganizationFolder();
    browser.pause(3000);
    dataDirectory.clickFolderWithThumbnailsByName(browser.globals.imageFolder);

    componentsScreen.clickSelectAndSaveButton();
    componentsScreen.clickSaveAndCloseButton();

    editApp.clickPreviewMenuItem();

    browser.switchToPreviewFrame();

    preview.assertThumbnailsAreDisplayedAndCorrectImagesAreUsed((names.length + unsortedNames.length), imageNames);
  },

  'Deleting created applications and data sources': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.existingDataSourceNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.newDataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.existingDataSourceNameGenerated, browser.globals.newDataSourceNameGenerated]);
  }
};
