const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const linkActions = require('../../utils/constants/linkActions');
const appearanceSettings = require('../../utils/constants/appearanceSettings');
const elementProperties = require('../../utils/constants/elementProperties');
const primaryButtonLabel = casual.word;
const screenTitle = 'Second screen'
const appearanceSettingsForButton = {
  backgroundColor: casual.rgb_hex,
  textColor: casual.rgb_hex
};

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 21-widget-management`;

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

  'Create a new app and drop Primary Button widget onto the screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .newDragAndDrop(widgets.PRIMARY_BUTTON)
      .waitForWidgetInterfaceNewDnd(widgets.PRIMARY_BUTTON)
      .switchToWidgetInstanceFrame();
  },

  'Edit Primary Button - set label for it and link action to display another screen': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .changeComponentLabel(primaryButtonLabel)
      .setLinkActionForComponent(1, linkActions.OPEN_THE_ABOUT_THIS_APP_OVERLAY)
      .clickSaveAndCloseButton();
  },

  'Change appearance settings for the button': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();
    const editApp = browser.page.editAppScreen();

    editApp.openEditAppearanceSettingForComponent(widgets.PRIMARY_BUTTON);

    appearanceScreen
      .openColorPickerForFieldByName(appearanceSettings.BACKGROUND)
      .enterColorForOpenedColorPicker(appearanceSettingsForButton.backgroundColor)
      .clickMobileIconInAppearance()
      .checkColorValueOfComponent(appearanceSettings.BACKGROUND, appearanceSettingsForButton.backgroundColor)
      .openColorPickerForFieldByName(appearanceSettings.TEXT)
      .enterColorForOpenedColorPicker(appearanceSettingsForButton.textColor)
      .clickMobileIconInAppearance()
      .checkColorValueOfComponent(appearanceSettings.TEXT, appearanceSettingsForButton.textColor);
  },

  'Open preview screen and check that the button label and link action are correct': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();
    const webApp = browser.page.webApplicationPages();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp
      .checkThatComponentIsPresentOnPreviewScreen(widgets.PRIMARY_BUTTON)
      .switchToPreviewFrame()
      .clickButtonComponentByValue(primaryButtonLabel);

    webApp
      .checkAboutThisAppOverlay()
      .closeAboutThisAppOverlay();
  },

  'Check the button appearance settings': function(browser){
    const previewApp = browser.page.previewAppScreen();

    previewApp
      .checkPrimaryButtonAppearanceSettingsColor(elementProperties.BACKGROUND_COLOR, appearanceSettingsForButton.backgroundColor)
      .checkPrimaryButtonAppearanceSettingsColor(elementProperties.COLOR, appearanceSettingsForButton.textColor);
  },

  'Return to edit mode and duplicate the button into the same screen': function(browser){
    const editApp = browser.page.editAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp
      .openWidgetCopyMenuForComponent(widgets.PRIMARY_BUTTON)
      .clickDuplicateButtonInWidgetCopyMenu()
      .checkAmountOfComponents(widgets.PRIMARY_BUTTON, 2);
  },

  'Delete the initial component and check that it is not present on the screen': function(browser){
    const editApp = browser.page.editAppScreen();

    editApp.deleteComponentFromScreen(widgets.PRIMARY_BUTTON);
  },

  'Open preview screen and check that the copied button label and link action are correct': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();
    const webApp = browser.page.webApplicationPages();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp
      .checkThatComponentIsPresentOnPreviewScreen(widgets.PRIMARY_BUTTON)
      .switchToPreviewFrame()
      .clickButtonComponentByValue(primaryButtonLabel);

    webApp
      .checkAboutThisAppOverlay()
      .closeAboutThisAppOverlay();
  },

  'Check the copied button appearance settings': function(browser){
    const previewApp = browser.page.previewAppScreen();

    previewApp
      .checkPrimaryButtonAppearanceSettingsColor(elementProperties.BACKGROUND_COLOR, appearanceSettingsForButton.backgroundColor)
      .checkPrimaryButtonAppearanceSettingsColor(elementProperties.COLOR, appearanceSettingsForButton.textColor);
  },

  'Return to edit mode and duplicate the button into the another screen': function(browser){
    const editApp = browser.page.editAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editApp
      .openWidgetCopyMenuForComponent(widgets.PRIMARY_BUTTON)
      .selectDuplicateToAnotherScreenInWidgetCopyMenu()
      .chooseScreenForWidgetDuplicatingInDropdownMenu(screenTitle)
      .clickDuplicateButtonInWidgetCopyMenu();
  },

  'Open the another screen and check that the component is present there': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const editApp = browser.page.editAppScreen();

    appScreensLeftsidePanel.openScreenByName(screenTitle)

    editApp.checkAmountOfComponents(widgets.PRIMARY_BUTTON, 1);
  },

  'Open preview screen and check that the copied to another screen button label and link action are correct': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();
    const webApp = browser.page.webApplicationPages();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp
      .checkThatComponentIsPresentOnPreviewScreen(widgets.PRIMARY_BUTTON)
      .switchToPreviewFrame()
      .clickButtonComponentByValue(primaryButtonLabel);

    webApp
      .checkAboutThisAppOverlay()
      .closeAboutThisAppOverlay();
  },

  'Check the copied to another screen button appearance settings': function(browser){
    const previewApp = browser.page.previewAppScreen();

    previewApp
      .checkPrimaryButtonAppearanceSettingsColor(elementProperties.BACKGROUND_COLOR, appearanceSettingsForButton.backgroundColor)
      .checkPrimaryButtonAppearanceSettingsColor(elementProperties.COLOR, appearanceSettingsForButton.textColor);
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};