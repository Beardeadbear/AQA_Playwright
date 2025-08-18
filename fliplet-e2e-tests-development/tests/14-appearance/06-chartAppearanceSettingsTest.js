const globals = require('../../globals_path');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const themeAppearanceComponents = require('../../utils/constants/themeAppearanceComponents');
const casual = require('casual');
const entries = [
  {
    'Name': casual.word,
    'Value': Math.floor(Math.random() * 10) + 21,
  },
  {
    'Name': casual.word,
    'Value': Math.floor(Math.random() * 10) + 11,
  },
  {
    'Name': casual.word,
    'Value': Math.floor(Math.random() * 10) + 1
  }
];
const colors = [
  {
    'Name': 'Chart color 1',
    'Theme value': casual.rgb_hex,
    'Custom value': casual.rgb_hex
  },
  {
    'Name': 'Chart color 2',
    'Theme value': casual.rgb_hex,
    'Custom value': casual.rgb_hex
  },
  {
    'Name': 'Chart color 3',
    'Theme value': casual.rgb_hex,
    'Custom value': casual.rgb_hex
  }
];
const columns = Object.keys(entries[0]);

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/ID-394',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 05-chart-appearance`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 05-chart-appearance`;

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

  'Create an app, data sources for data visualization widgets and add Pie Chart to the screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .createDataSourceViaApi(browser.globals.dataSourceNameGenerated, entries)
      .newDragAndDrop(widgets.CHART_PIE)
      .waitForWidgetInterfaceNewDnd(widgets.CHART_PIE)
      .switchToWidgetInstanceFrame()
      .switchToFLWidgetProviderFrame('#app');
  },

  'Select a data source in data source provider for Pie Chart': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Configure Pie Chart by selecting values for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .selectTheColumnFromDataSourceForValue(columns[0], 1)
      .selectTheColumnFromDataSourceForValue(columns[1], 2)
      .clickSaveAndCloseButton();
  },

  'Open Theme Appearance settings and switch to Chart settings': function(browser) {
    const appearanceScreen = browser.page.appearanceScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    rightSideNavMenu.openAppearanceScreen();

    appearanceScreen.openComponentSettings(themeAppearanceComponents.CHART);
  },

  'Make changes in Chart theme settings - select new colors for its sections': function(browser) {
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen
      .openColorPickerForFieldByName(colors[0].Name)
      .enterColorForOpenedColorPicker(colors[0]["Theme value"])
      .clickMobileIconInAppearance()
      .checkColorFieldInAppearanceSettings(colors[0].Name, colors[0]["Theme value"])
      .openColorPickerForFieldByName(colors[1].Name)
      .enterColorForOpenedColorPicker(colors[1]["Theme value"])
      .clickMobileIconInAppearance()
      .checkColorFieldInAppearanceSettings(colors[1].Name, colors[1]["Theme value"])
      .openColorPickerForFieldByName(colors[2].Name)
      .enterColorForOpenedColorPicker(colors[2]["Theme value"])
      .clickMobileIconInAppearance()
      .checkColorFieldInAppearanceSettings(colors[2].Name, colors[2]["Theme value"]);
    },

  'Check Pie Chart theme colors on the screen': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_PIE)
      .switchToPreviewFrame();

    previewAppScreen.assertChartSectionCorrectColors(colors.map(entry => entry['Theme value']));
  },

  'Open the preview screen and check Pie Chart theme colors': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_PIE)
      .switchToPreviewFrame();

    previewAppScreen.assertChartSectionCorrectColors(colors.map(entry => entry['Theme value']));
  },

  'Go back to edit mode and change appearance setting for Pie Chart sections': function(browser){
    const appearanceScreen = browser.page.appearanceScreen();
    const editAppScreen = browser.page.editAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    editAppScreen.openEditAppearanceSettingForComponent(widgets.CHART_PIE);

    appearanceScreen
      .openColorPickerForFieldByName(colors[0].Name)
      .enterColorForOpenedColorPicker(colors[0]["Custom value"])
      .clickMobileIconInAppearance()
      .checkColorFieldInAppearanceSettings(colors[0].Name, colors[0]["Custom value"])
      .openColorPickerForFieldByName(colors[1].Name)
      .enterColorForOpenedColorPicker(colors[1]["Custom value"])
      .clickMobileIconInAppearance()
      .checkColorFieldInAppearanceSettings(colors[1].Name, colors[1]["Custom value"])
      .openColorPickerForFieldByName(colors[2].Name)
      .enterColorForOpenedColorPicker(colors[2]["Custom value"])
      .clickMobileIconInAppearance()
      .checkColorFieldInAppearanceSettings(colors[2].Name, colors[2]["Custom value"]);
  },

  'Check Pie Chart custom colors on the screen': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_PIE)
      .switchToPreviewFrame();

    previewAppScreen.assertChartSectionCorrectColors(colors.map(entry => entry['Custom value']));
  },

  'Open the preview screen and check Pie Chart colors': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_PIE)
      .switchToPreviewFrame();

    previewAppScreen.assertChartSectionCorrectColors(colors.map(entry => entry['Custom value']))
  },

  'Navigate to edit mode, open the second screen and add Donut Chart there': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    appScreensLeftsidePanel.openScreenByName("Second screen");

    browser
      .newDragAndDrop(widgets.CHART_DONUT)
      .waitForWidgetInterfaceNewDnd(widgets.CHART_DONUT)
      .switchToWidgetInstanceFrame()
      .switchToFLWidgetProviderFrame('#app');
  },

  'Select a data source in data source provider for Donut Chart': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();

    dataSourceProvider
      .selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);
  },

  'Configure Donut Chart by selecting values for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .selectTheColumnFromDataSourceForValue(columns[0], 1)
      .selectTheColumnFromDataSourceForValue(columns[1], 2)
      .clickSaveAndCloseButton();
  },

  'Check Donut Chart theme colors on the screen': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_DONUT)
      .switchToPreviewFrame();

    previewAppScreen.assertChartSectionCorrectColors(colors.map(entry => entry['Theme value']));
  },

  'Open the preview screen and check Donut Chart theme colors': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.CHART_DONUT)
      .switchToPreviewFrame();

    previewAppScreen.assertChartSectionCorrectColors(colors.map(entry => entry['Theme value']))
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};