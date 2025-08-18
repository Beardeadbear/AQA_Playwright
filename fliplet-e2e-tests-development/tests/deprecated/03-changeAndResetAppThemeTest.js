const globals = require('../../globals_path');
const casual = require('casual');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const dynamicListsComponent = 'com.fliplet.dynamic-lists';
const screenTitles = ['First screen', 'Second screen'];
const backgroundHexColour =casual.rgb_hex;
const editBackgroundHexColour = casual.rgb_hex;
const width = casual.integer(from = 50, to = 90).toString();
const defaultProperties = [];

module.exports = {
  '@disabled': true,
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 39-change-theme`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Add New Feed LFD component to the first screen of the app': function(browser){
    const list = browser.page.listScreens();
    const componentsScreen = browser.page.componentsScreen();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, 'Client Support');
    browser.dragAndDrop(dynamicListsComponent)
      .waitForWidgetInterface(dynamicListsComponent)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEED);

    componentsScreen.clickSaveAndCloseButton();

    browser.checkThatComponentIsPresentOnPreviewScreen(dynamicListsComponent);

    list.getListItemContentCssProperty('width', defaultProperties);
    list.getListItemContentCssProperty('background-color',defaultProperties);
  },

  'Update appearance settings': function(browser) {
    const appearanceScreen = browser.page.appearanceScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    rightSideNavMenu.openAppearanceScreen();

    appearanceScreen.selectThemeByName('Bootstrap');
    appearanceScreen.clickUpgradeAppearanceNow();
  },

  'Change the background color for certain component': function(browser) {
    const editApp = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();

    editApp.switchToScreenByNameAndRefresh(screenTitles[0]);
    editApp.openAppearanceSettingsForComponent(dynamicListsComponent);

    appearanceScreen.openColorPickerForFieldByName('Background');
    appearanceScreen.enterColorForOpenedColorPicker(backgroundHexColour);
    appearanceScreen.clickMobileIconInAppearance(); // saving previously made changes
    appearanceScreen.checkColorValueOfComponent('Background', backgroundHexColour)
  },

  'Change the width of component to another value': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.openEditingOfInputField('Width');
    appearanceScreen.enterValueForOpenedAppearanceField(width, 'Width');
    appearanceScreen.clickMobileIconInAppearance(); // saving previously made changes
    appearanceScreen.checkWidthValueOfComponent('Width', width)
  },

  'Apply styles to theme': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.clickApplyStylesToThemeAndConfirm();
  },

  'Add the same second component to check that theme works for the same component as well': function(browser){
    const list = browser.page.listScreens();
    const componentsScreen = browser.page.componentsScreen();
    const editApp = browser.page.editAppScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    editApp.switchToScreenByNameAndRefresh(screenTitles[1]);

    rightSideNavMenu.openComponentsScreen();

    browser.dragAndDrop(dynamicListsComponent)
      .waitForWidgetInterface(dynamicListsComponent)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.DIRECTORY);

    componentsScreen.clickSaveAndCloseButton();

    browser.checkThatComponentIsPresentOnPreviewScreen(dynamicListsComponent);
  },

  'Open preview screen and check component styles': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(dynamicListsComponent);

    appearanceScreen.compareAppliedThemeSettingsWithPreview(backgroundHexColour, width);
  },

  'Change style for component again to check the theme reset': function(browser){
    const editApp = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.switchToScreenByNameAndRefresh(screenTitles[1]);
    editApp.openAppearanceSettingsForComponent(dynamicListsComponent);

    appearanceScreen.openColorPickerForFieldByName('Background');
    appearanceScreen.enterColorForOpenedColorPicker(editBackgroundHexColour);
    appearanceScreen.clickMobileIconInAppearance(); // saving previously made changes
    appearanceScreen.checkColorValueOfComponent('Background', editBackgroundHexColour);

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(dynamicListsComponent);

    appearanceScreen.compareAppliedThemeSettingsWithPreview(editBackgroundHexColour, width); // check that new style is applied
  },

  'Check reset to theme styles': function(browser){
    const editApp = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.switchToScreenByNameAndRefresh(screenTitles[1]);
    editApp.openAppearanceSettingsForComponent(dynamicListsComponent);

    appearanceScreen.clickResetToThemeStyles();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(dynamicListsComponent);

    appearanceScreen.compareAppliedThemeSettingsWithPreview(backgroundHexColour, width);
  },

  'Check reset theme to Fliplet default and assert changes in the first LFD': function(browser){
    const editApp = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const list = browser.page.listScreens();

    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp.switchToScreenByNameAndRefresh(screenTitles[0]);

    rightSideNavMenu.openAppearanceScreen();

    appearanceScreen.clickResetToFlipletDefaultThemeStyles();

    appTopFixedNavigationBar.navigateToPreviewMode();

    list.checkListItemContentCssProperty('width', defaultProperties[0])
      .checkListItemContentCssProperty('background-color', defaultProperties[1]);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};