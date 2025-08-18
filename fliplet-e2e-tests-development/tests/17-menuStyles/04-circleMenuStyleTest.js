const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const menuStyles = require('../../utils/constants/menuStyles');
const webApplicationsIcons = require('../../utils/constants/webApplicationsIcons');
const linkActions = require('../../utils/constants/linkActions');
const menuLinksLabels = [casual.word.concat(casual.letter), casual.letter.concat(casual.word)];
const menuLinkIcon = [webApplicationsIcons.ENVELOPE, webApplicationsIcons.PENCIL];
const menuLocation = 'Left';
const screenNamesForMenuLink = {
  firstScreen: 'First screen',
  secondScreen: 'Second screen',
};

module.exports = {

  '@reference': 'https://weboo.atlassian.net/browse/OD-227',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 04-circle-menu`;

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

  'Create a new app and select Circle menu style for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);

    rightSideNavMenu.openMenuScreen();

    menuScreen.selectMenuStyleByName(menuStyles.CIRCLE)
      .assertMenuStyleIsSelectedByName(menuStyles.CIRCLE);
  },

  'Open menu setting by clicking menu component on the screen and select the left side fot menu location': function(browser){
    const menuScreen = browser.page.menuScreen();
    const componentsScreen = browser.page.componentsScreen();

    menuScreen.openMenuSettingByClickingMenuComponent(menuStyles.CIRCLE)
      .selectWhereDoYouWantTheMenuButtonToBeDisplayed(menuLocation);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open Menu links tab': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    rightSideNavMenu.openMenuScreen();

    menuScreen.switchToTabName('Menu links');
  },

  'Select Custom menu option for the menu links': function(browser){
    const menuScreen = browser.page.menuScreen();

    menuScreen.selectMenuOptionInMenuLinksTab('Custom menu');
  },

  'Check that menu links can be removed': function(browser){
    const menuScreen = browser.page.menuScreen();

    menuScreen.deleteMenuLinkByTitle(screenNamesForMenuLink.firstScreen)
      .deleteMenuLinkByTitle(screenNamesForMenuLink.secondScreen);
  },

  'Add and edit the 1-st menu link by selection an icon for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const list = browser.page.listScreens();

    menuScreen.addMenuLink()
      .expandMenuLinkPanelByNumber(1)
      .changeMenuLinkLabel(1, menuLinksLabels[0])
      .openIconPickerConsoleForMenuLink(2);

    list.selectWebApplicationIconByName(menuLinkIcon[0]);

    menuScreen.clickSelectAndSaveButtonForMenuLinkIcons()
      .checkMenuLinkIconOnPanel(1, menuLinkIcon[0]);
  },

  'Configure the 1-st menu link by setting link action and choosing a screen to display for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const menuScreen = browser.page.menuScreen();

    componentsScreen.setLinkActionForComponent(1, linkActions.DISPLAY_ANOTHER_SCREEN)
      .selectScreenForLinkingByName(screenNamesForMenuLink.secondScreen);

    menuScreen.collapseMenuLinkPanelByNumber(1);
  },

  'Add and edit the 2-nd menu link by selection an icon for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const list = browser.page.listScreens();

    menuScreen.addMenuLink()
      .expandMenuLinkPanelByNumber(2)
      .changeMenuLinkLabel(2, menuLinksLabels[1])
      .openIconPickerConsoleForMenuLink(4);

    list.selectWebApplicationIconByName(menuLinkIcon[1]);

    menuScreen.clickSelectAndSaveButtonForMenuLinkIcons()
      .checkMenuLinkIconOnPanel(2, menuLinkIcon[1]);
  },

  'Configure the 2-nd menu link by setting link action and choosing a screen to display for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const menuScreen = browser.page.menuScreen();

    componentsScreen.setLinkActionForComponent(2, linkActions.DISPLAY_ANOTHER_SCREEN)
      .selectScreenForLinkingByName(screenNamesForMenuLink.firstScreen);

    menuScreen.clickSaveButton();
  },

  'Check menu style and location on preview screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();
    const menuScreen = browser.page.menuScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyles.CIRCLE);

    menuScreen.assertLocationOfMenuIcon(menuLocation);
  },

  'Check ability to close menu overlay': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.openAppHamburgerMenu()
      .closeAppHamburgerMenu();
  },

  'Check that the deleted menu links are not present in menu': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.openAppHamburgerMenu();

    menuScreen.checkThatCircleMenuHasNoLabel(screenNamesForMenuLink.firstScreen)
      .checkThatCircleMenuHasNoLabel(screenNamesForMenuLink.secondScreen);
  },

  'Check the 1-st menu link on preview screen': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    menuScreen.assertCircleMenuLinkHasLabel(1, menuLinksLabels[0])
      .checkMenuLinkIconOnScreen(1, menuLinkIcon[0])

    previewAppScreen.clickCircleMenuLinkByNumber(1);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenNamesForMenuLink.secondScreen);
  },

  'Check the 2-nd menu link on preview screen': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    previewAppScreen.openAppHamburgerMenu();

    menuScreen.assertCircleMenuLinkHasLabel(2, menuLinksLabels[1])
      .checkMenuLinkIconOnScreen(2, menuLinkIcon[1])

    previewAppScreen.clickCircleMenuLinkByNumber(2);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenNamesForMenuLink.firstScreen);
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};