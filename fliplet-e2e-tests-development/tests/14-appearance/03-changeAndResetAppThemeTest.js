const casual = require('casual');
const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const listFromDataSourceLayouts = require('../../utils/constants/listFromDataSourceLayouts');
const appearanceSettings = require('../../utils/constants/appearanceSettings');
const elementProperties = require('../../utils/constants/elementProperties');
const screenTitles = ['First screen', 'Second screen'];
const backgroundHexColour = casual.rgb_hex;
const editBackgroundHexColour = casual.rgb_hex;
const width = casual.integer(from = 50, to = 90).toString();
const defaultPropertiesFirstLfd = [];
const defaultPropertiesSecondLfd = [];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 03-change-theme`;

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

  'Create a new app and add New Feed LDF component to the app screen': function (browser) {
    const editApp = browser.page.editAppScreen();
    const list = browser.page.listScreens();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);

    appScreensLeftsidePanel.openScreenByName(screenTitles[1]);

    browser.newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.FEED);

    editApp.assertCorrectLfdLayoutIsPresentOnScreen(listFromDataSourceLayouts.FEED);
  },

  'Get initial property of New Feed LFD component': function (browser) {
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen.getListItemContentCssProperty(elementProperties.WIDTH, defaultPropertiesSecondLfd)
      .getListItemContentCssProperty(elementProperties.BACKGROUND_COLOR, defaultPropertiesSecondLfd);
  },

  'Add Directory LFD component to the first screen': function (browser) {
    const list = browser.page.listScreens();
    const editApp = browser.page.editAppScreen();
    const apps = browser.page.appsPage();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    browser.newDragAndDrop(widgets.LIST_FROM_DATA_SOURCE)
      .waitForWidgetInterfaceNewDnd(widgets.LIST_FROM_DATA_SOURCE)
      .switchToWidgetInstanceFrame();

    list.selectListFromDataSourceLayoutByTitle(listFromDataSourceLayouts.DIRECTORY);

    editApp.assertCorrectLfdLayoutIsPresentOnScreen(listFromDataSourceLayouts.DIRECTORY);
  },

  'Get initial properties of Directory LFD component': function (browser) {
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();

    lfdPreviewScreen.getListItemContentCssProperty(elementProperties.WIDTH, defaultPropertiesFirstLfd)
      .getListItemContentCssProperty(elementProperties.BACKGROUND_COLOR, defaultPropertiesFirstLfd);
  },

  'Open Directory LFD appearance settings to change the background color': function (browser) {
    const appearanceScreen = browser.page.appearanceScreen();
    const editApp = browser.page.editAppScreen();

    editApp.openEditAppearanceSettingForComponent(widgets.LIST_FROM_DATA_SOURCE);

    appearanceScreen.openColorPickerForFieldByName(appearanceSettings.LIST_ITEM_BACKGROUND);
    appearanceScreen.enterColorForOpenedColorPicker(backgroundHexColour);
    appearanceScreen.clickMobileIconInAppearance();
    appearanceScreen.checkColorValueOfComponent(appearanceSettings.LIST_ITEM_BACKGROUND, backgroundHexColour)
  },

  'Change the width for Directory LFD component': function (browser) {
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.openEditingOfInputField(appearanceSettings.WIDTH);
    appearanceScreen.enterValueForOpenedAppearanceField(width, appearanceSettings.WIDTH);
    appearanceScreen.clickMobileIconInAppearance();
    appearanceScreen.checkWidthValueOfComponent(appearanceSettings.WIDTH, width)
  },

  'Apply styles to theme': function (browser) {
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.clickApplyStylesToThemeAndConfirm();
  },

  'Open preview screen and check New Feed LFD component styles': function (browser) {
    const appearanceScreen = browser.page.appearanceScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appTopFixedNavigationBar.navigateToPreviewMode();

    appScreensLeftsidePanel.openScreenByName(screenTitles[1]);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE);

    appearanceScreen.compareAppliedThemeFontColorSettingsWithPreview(backgroundHexColour)
      .compareAppliedThemeWidthSettingsWithPreview(width, defaultPropertiesSecondLfd[defaultPropertiesSecondLfd.length - 2]);
  },

  'Change style for component again': function (browser) {
    const editApp = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const apps = browser.page.appsPage();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    appScreensLeftsidePanel.openScreenByName(screenTitles[1]);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE);

    editApp.openEditAppearanceSettingForLfd();

    appearanceScreen.openColorPickerForFieldByName(appearanceSettings.LIST_ITEM_BACKGROUND);
    appearanceScreen.enterColorForOpenedColorPicker(editBackgroundHexColour);
    appearanceScreen.clickMobileIconInAppearance();
    appearanceScreen.checkColorValueOfComponent(appearanceSettings.LIST_ITEM_BACKGROUND, editBackgroundHexColour);

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE);

    appearanceScreen.compareAppliedThemeFontColorSettingsWithPreview(editBackgroundHexColour)
      .compareAppliedThemeWidthSettingsWithPreview(width, defaultPropertiesSecondLfd[defaultPropertiesSecondLfd.length - 2]);
  },

  'Reset to theme styles and check it': function (browser) {
    const editApp = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const apps = browser.page.appsPage();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    apps.navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    appScreensLeftsidePanel.openScreenByName(screenTitles[1]);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE);

    editApp.openEditAppearanceSettingForLfd();

    appearanceScreen.clickResetToThemeStyles();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE);

    appearanceScreen.compareAppliedThemeFontColorSettingsWithPreview(backgroundHexColour)
      .compareAppliedThemeWidthSettingsWithPreview(width, defaultPropertiesSecondLfd[defaultPropertiesSecondLfd.length - 2]);
  },

  'Reset theme to Fliplet default and assert changes in the Directory LFD': function (browser) {
    const appearanceScreen = browser.page.appearanceScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const lfdPreviewScreen = browser.page.lfdPreviewScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appTopFixedNavigationBar.navigateToEditMode();

    appScreensLeftsidePanel.openScreenByName(screenTitles[0]);

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE);

    rightSideNavMenu.openAppearanceScreen();

    appearanceScreen.clickResetToFlipletDefaultThemeStyles();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LIST_FROM_DATA_SOURCE);

    lfdPreviewScreen.checkListItemContentCssProperty(elementProperties.BACKGROUND_COLOR, defaultPropertiesFirstLfd[defaultPropertiesFirstLfd.length - 1])
      .compareWidthValueOfListItems(defaultPropertiesFirstLfd[defaultPropertiesFirstLfd.length - 2])
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};