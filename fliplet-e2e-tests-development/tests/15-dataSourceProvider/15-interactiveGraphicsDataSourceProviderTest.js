const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const markerTitle = 'Add markers';
const imageName = 'map.png';
const mapName = casual.word;
const markerName = casual.word;
const entries = [
  {
    'Name': casual.word,
    'Map name': mapName,
    'Marker style': 'Marker 1',
    'Position X': Math.floor(Math.random() * 150) + 50,
    'Position Y': Math.floor(Math.random() * 100) + 50
  },
  {
    'Name': casual.word,
    'Map name': mapName,
    'Marker style': 'Marker 1',
    'Position X': Math.floor(Math.random() * 150) + 250,
    'Position Y': Math.floor(Math.random() * 100) + 150
  }
];

module.exports = {

  '@disabled': (globals.smokeTest ==='true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-1',
  '@reference': 'https://weboo.atlassian.net/browse/OD-277',
  '@reference': 'https://weboo.atlassian.net/browse/OD-283',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 14-map-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 14-map-ds-provider`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app, data source and add Interactive Graphics component to the app screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, entries)
      .newDragAndDrop(widgets.INTERACTIVE_GRAPHICS)
      .waitForWidgetInterfaceNewDnd(widgets.INTERACTIVE_GRAPHICS)
      .switchToWidgetInstanceFrame();
  },

  'Add a map to the Interactive Graphics': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .clickAddNewMapButton()
      .setNameForMapUsingBackspace(mapName, 1);
  },

  'Select an image for the map from File manager': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();

    componentsScreen.clickSelectAnImageForMap();

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imageName)
      .assertThatCorrectFileIsSelected(imageName)
      .clickSelectAndSaveButton();
  },

  'Add a marker to the map': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    browser.switchToWidgetInstanceFrame();

    componentsScreen
      .clickMarkMapsButton()
      .checkSectionHeaderTitle(markerTitle)
      .addNewMarkerVerification(1)
      .setMarkerName(markerName, 1)
      .clickSaveAndCloseButton();
  },

  'Navigate to preview screen and assert that all changes are applied': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.INTERACTIVE_GRAPHICS)
      .switchToPreviewFrame();

    previewAppScreen
      .assertMarkerNameHolderIsNotDisplayed()
      .clickMarkerOnMap(markerName)
      .checkActiveMarker(markerName);
  },

  'Return to edit mode to change data source for the map': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const editApp = browser.page.editAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.INTERACTIVE_GRAPHICS);

    componentsScreen
      .clickMarkMapsButton()
      .checkSectionHeaderTitle(markerTitle);
  },

  'Change the data source for the map and click Use these settings': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    componentsScreen.switchToAnotherDataSourceInInteractiveGraphicsConfigurations();

    dataSourceProvider
      .checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.appNameGenerated)
      .clickChangeDataSourceLink()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.appNameGenerated)
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen
      .acceptChangingDataSourceAlert()
      .clickUseTheseSettingsButton();
  },

  'Click Switch to another data source link again and check that data source provider is available': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    componentsScreen.switchToAnotherDataSourceInInteractiveGraphicsConfigurations();

    dataSourceProvider.checkThatCorrectDataSourceIsSelectedForComponent(browser.globals.dataSourceNameGenerated);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview screen to check the map data from the changed data source': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.INTERACTIVE_GRAPHICS)
      .switchToPreviewFrame();

    previewAppScreen
      .assertMarkerNameHolderIsNotDisplayed()
      .clickMarkerOnMap(entries[0].Name)
      .checkActiveMarker(entries[0].Name)
      .clickMarkerOnMap(entries[1].Name)
      .checkActiveMarker(entries[1].Name);
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};