const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const mapName = 'I am Map';
const imageName = 'icon.png';
const markerName = 'My marker';
const iconNameSelected = 'Plus';

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 12-interactive-map`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Add Interactive Graphics component to the app screen': function (browser) {
    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.INTERACTIVE_GRAPHICS)
      .switchToWidgetInstanceFrame();
  },

  'Check it is impossible to add markers when there is no map': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const noMapError = 'You need to add at least one map before continuing.';

    componentsScreen
      .clickMarkMapsButton()
      .assertErrorInComponentsScreen(noMapError);
  },

  'Save Interactive Graphics without added map': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const errorAboutNoMaps = 'You need to add at least one map to save and close.';

    componentsScreen
      .clickSaveAndCloseButtonWithWrongData()
      .assertErrorInComponentsScreen(errorAboutNoMaps);
  },

  'Add map to the component': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.clickAddNewMapButton();
  },

  'Save Interactive Graphics without images in map': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const errorAboutNoImageInMap = 'You need to select an image for each map you have created to save and close.';

    componentsScreen
      .clickSaveAndCloseButtonWithWrongData()
      .assertErrorInComponentsScreen(errorAboutNoImageInMap);
  },

  'Set name for map': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.setNameForMapUsingBackspace(mapName, 1);
  },

  'Create more than 1 map': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .clickAddNewMapButton()
      .setNameForMapUsingBackspace(mapName + 2, 2);
  },

  'Select image for the map from file manager': function (browser) {
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

  'Select image for the map from file manager for the second map': function (browser) {
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

  'Check that it is impossible to add markers when there are 2 maps with the same name': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const errorAboutSameMapsNames = 'Maps must have different names';

    browser.switchToWidgetInstanceFrame();

    componentsScreen
      .clickAddNewMapButton()
      .setNameForMapUsingBackspace(mapName + 2, 3)
      .clickMarkMapsButton()
      .assertErrorInMapComponents(errorAboutSameMapsNames);
  },

  'Remove a map': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.removeMap(3);
  },

  'Add a marker to the maps': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const markerTitle = 'Add markers';

    componentsScreen
      .clickMarkMapsButton()
      .checkSectionHeaderTitle(markerTitle)
      .addNewMarkerVerification(1)
      .checkSelectedMapNameInMarkerSection(mapName)
      .selectMapInDropDown(mapName + 2)
      .checkSelectedMapNameInMarkerSection(mapName+ 2)
      .setMarkerName(markerName, 1)
      .checkMarketName(markerName, 1);
  },

  'Add one more marker to the maps': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .addNewMarkerVerification(2)
      .setMarkerName(markerName + 2, 2)
      .checkMarketName(markerName + 2, 2)
  },

  'Remove one marker': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.removeMarker(2)
  },

   'Add styles to markers and verify marker icon': function (browser) {
     const componentsScreen = browser.page.componentsScreen();
     const markerStyleOverlay = browser.page.markerStyleOverlay();
     const list = browser.page.listScreens();
     const headerText = 'Marker styles';
     const iconNamePrevious = 'Circle';

     componentsScreen.openMarkerMenu(1);

     markerStyleOverlay
       .checkThatMarkerStyleOverlayIsOpen(headerText)
       .checkAbilityToAddAndDeleteNewStyles(2)
       .openMarkerStyleConsole()
       .assertIconImage(iconNamePrevious)
       .openIconPickerConsole();

     list.selectWebApplicationIconByName(iconNameSelected);

     markerStyleOverlay.clickSelectAndSaveButtonForIcons();

     browser.switchToWidgetInstanceFrame();

     markerStyleOverlay
       .assertIconImage(iconNameSelected)
       .closeMarkerStyleOverlay();

     componentsScreen
       .assertIconStyleOnMarkerHolder(iconNameSelected)
       .assertMarkerIconOnMap(iconNameSelected)
       .clickSaveAndCloseButton();
   },

   'Navigate to preview screen and assert that all changes are applied': function (browser) {
     const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
     const previewAppScreen = browser.page.previewAppScreen();

     appTopFixedNavigationBar.navigateToPreviewMode();

     browser
       .checkThatComponentIsPresentOnPreviewScreen(widgets.INTERACTIVE_GRAPHICS)
       .switchToPreviewFrame();

     previewAppScreen
       .checkDisplayedMapName(mapName)
       .assertMarkerNameHolderIsNotDisplayed()
       .switchToAnotherMap(mapName + 2)
       .checkDisplayedMapName(mapName + 2)
       .assertMarkerNameHolderIsNotDisplayed()
       .clickMarkerOnMap(markerName)
       .checkActiveMarker(markerName)
       .checkDisplayedMarkerIcon(markerName, iconNameSelected.toLowerCase());
   },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};