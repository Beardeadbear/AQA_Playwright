const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const menuStyles = require('../../utils/constants/menuStyles');
const webApplicationsIcons = require('../../utils/constants/webApplicationsIcons');
const linkActions = require('../../utils/constants/linkActions');
const menuLinksLabels = [casual.word.concat(casual.letter), casual.letter.concat(casual.word)];
const menuLinkIcon = [webApplicationsIcons.PLUS, webApplicationsIcons.MINUS];
const menuLocation = 'Left';
const screenNameForMenuLink = 'Second screen';
const urlForMenuLink = 'https://fliplet.com/';

module.exports = {

  '@reference': 'https://weboo.atlassian.net/browse/OD-220',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 02-push-in-menu`;

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

  'Create a new app and select Push In menu style for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);

    rightSideNavMenu.openMenuScreen();

    menuScreen.assertMenuStyleIsSelectedByName(menuStyles.PUSH_IN);
  },

  'Open menu setting by clicking menu component on the screen and select the left side fot menu location': function(browser){
    const menuScreen = browser.page.menuScreen();
    const componentsScreen = browser.page.componentsScreen();

    menuScreen.openMenuSettingByClickingMenuComponent(menuStyles.PUSH_IN)
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

  'Check that menu links can be added and removed': function(browser){
    const menuScreen = browser.page.menuScreen();

    menuScreen.deleteMenuLinkByTitle(screenNameForMenuLink)
      .addMenuLink();
  },

  'Edit the 1-st menu link by selection an icon for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const list = browser.page.listScreens();

    menuScreen.expandMenuLinkPanelByNumber(1)
      .changeMenuLinkLabel(1, menuLinksLabels[0])
      .openIconPickerConsoleForMenuLink(1);

    list.selectWebApplicationIconByName(menuLinkIcon[0]);

    menuScreen.clickSelectAndSaveButtonForMenuLinkIcons()
      .checkMenuLinkIconOnPanel(1, menuLinkIcon[0]);
  },

  'Configure the 1-st menu link by setting link action and choosing a screen to display for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const menuScreen = browser.page.menuScreen();

    componentsScreen.setLinkActionForComponent(1, linkActions.DISPLAY_ANOTHER_SCREEN)
      .selectScreenForLinkingByName(screenNameForMenuLink);

    menuScreen.collapseMenuLinkPanelByNumber(1);
  },

  'Edit the 2-nd menu link by selection an icon for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const list = browser.page.listScreens();

    menuScreen.expandMenuLinkPanelByNumber(2)
      .changeMenuLinkLabel(2, menuLinksLabels[1])
      .openIconPickerConsoleForMenuLink(4);

    list.selectWebApplicationIconByName(menuLinkIcon[1]);

    menuScreen.clickSelectAndSaveButtonForMenuLinkIcons()
      .checkMenuLinkIconOnPanel(2, menuLinkIcon[1]);
  },

  'Configure the 2-nd menu link by setting link action and choosing Open a web page for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const menuScreen = browser.page.menuScreen();

    componentsScreen.setLinkActionForComponent(2, linkActions.OPEN_A_WEB_PAGE)
      .setValueInWebPageInputFieldForLinkAction(urlForMenuLink, urlForMenuLink);

    menuScreen.clickSaveButton();
  },

  'Check menu style and location on preview screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();
    const menuScreen = browser.page.menuScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyles.PUSH_IN);

    menuScreen.assertLocationOfMenuIcon(menuLocation);
  },

  'Check ability to close menu overlay': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.openAppHamburgerMenu()
      .closeAppHamburgerMenu();
  },

  'Check that the deleted menu link is not present in menu': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.openAppHamburgerMenu();

    menuScreen.assertMenuLinkIsNotPresentInMenuByLabel(screenNameForMenuLink);
  },

  'Check the 1-st menu link on preview screen': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    menuScreen.assertMenuLinkIsPresentInMenuByLabel(menuLinksLabels[0])
      .checkMenuLinkIconOnScreen(1, menuLinkIcon[0])

    previewAppScreen.clickMenuLinkByLabel(menuLinksLabels[0]);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenNameForMenuLink);
  },

  'Check the 2-nd menu link on preview screen': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();
    const menuScreen = browser.page.menuScreen();

    previewAppScreen.openAppHamburgerMenu();

    menuScreen.assertMenuLinkIsPresentInMenuByLabel(menuLinksLabels[1])
      .checkMenuLinkIconOnScreen(2, menuLinkIcon[1]);

    previewAppScreen.clickMenuLinkByLabel(menuLinksLabels[1]);
  },

  'Check URL open after clicking the 2-nd menu link': function(browser){
    const webApp = browser.page.webApplicationPages();

    webApp.switchToOpenWindowByNumber(2)
      .checkPageURl(urlForMenuLink)
      .checkPageTitle('Fliplet');
  },

  'Return to edit mode and delete the 2-nd menu link': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const webApp = browser.page.webApplicationPages();

    webApp.switchToOpenWindowByNumber(1);

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openMenuScreen();

    menuScreen.switchToTabName('Menu links')
      .deleteMenuLinkByTitle(menuLinksLabels[1])
      .clickSaveButton();
  },

  'Check that the 2-nd menu link is removed on preview screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();
    const menuScreen = browser.page.menuScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyles.PUSH_IN)
      .openAppHamburgerMenu();

    menuScreen.assertMenuLinkIsPresentInMenuByLabel(menuLinksLabels[0])
      .assertMenuLinkIsNotPresentInMenuByLabel(menuLinksLabels[1]);
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};