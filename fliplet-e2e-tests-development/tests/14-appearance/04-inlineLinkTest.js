const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const screenWithInlineLink = 'Home';
const screenForRedirection = 'Directory';
const inlineLinkLabel = casual.word;
const inlineLinkComponentColour = '#F05865';
const inlineLinkFontSize = casual.integer(from = 20, to = 40).toString();

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 04-inline-link`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login()
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Crete a new application and add Text component': function (browser) {
    const editApp = browser.page.editAppScreen();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP);

    editApp.deleteComponentFromScreen(widgets.TEXT);

    browser.newDragAndDrop(widgets.TEXT)
      .checkThatComponentIsPresentOnPreviewScreen(widgets.TEXT);
  },

  'Add Inline link and congure it': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const editApp = browser.page.editAppScreen();

    editApp.openEditorToolbarForTextComponent();
    editApp.addInlineLinkToTextComponent();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.INLINE_LINK)
      .switchToWidgetInstanceFrame();

    componentsScreen.changeComponentLabel(inlineLinkLabel);
    componentsScreen.setLinkActionForComponent(1, 'Go back to previous screen');
    componentsScreen.clickSaveAndCloseButton();

    editApp.assertInlineLinkCorrectLabel(inlineLinkLabel);
  },

  'Change appearance color and font size text for Inline link': function(browser){
    const editApp = browser.page.editAppScreen();
    const appearanceScreen = browser.page.appearanceScreen();

    editApp.openEditAppearanceSettingForNestedComponent(widgets.INLINE_LINK);

    appearanceScreen.changeFontSizeForFieldByNameForComponentAppearance('Text', inlineLinkFontSize)
      .clickMobileIconInAppearance()
      .changeFontSizeForFieldByNameForComponentAppearance('Text Hover', inlineLinkFontSize)
      .clickMobileIconInAppearance()
      .openColorPickerForFieldByNameForComponentAppearance('Text')
      .enterColorForOpenedColorPicker(inlineLinkComponentColour)
      .clickMobileIconInAppearance();

    editApp.assertInlineLinkCorrectTextColor(inlineLinkComponentColour); //bug 5810
  },

  'Publish the application': function (browser) {
    const publish = browser.page.publishScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPublishMode();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');
    publish.clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish.clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Check Inline link appearance on web': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkPageTitle(`${screenWithInlineLink} - ${browser.globals.appNameGenerated}`)
      .checkInlineLink(inlineLinkLabel)
      .assertInlineLinkCorrectTextFontSize(inlineLinkFontSize)
      .assertInlineLinkCorrectTextColor(inlineLinkComponentColour);
  },

  'Check Inline link functionality on web': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openMenuItemByName(screenForRedirection)
      .checkPageTitle(`${screenForRedirection} - ${browser.globals.appNameGenerated}`)
      .openMenuItemByName(screenWithInlineLink)
      .clickElementOnWebAppScreen('@inlineLink')
      .checkPageTitle(`${screenForRedirection} - ${browser.globals.appNameGenerated}`);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};