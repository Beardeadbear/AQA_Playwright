const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const menuStyles = require('../../utils/constants/menuStyles');
const webApplicationsIcons = require('../../utils/constants/webApplicationsIcons');
const linkActions = require('../../utils/constants/linkActions');
const menuLinksLabels = [casual.word.concat(casual.letter), casual.letter.concat(casual.word), casual.word.concat(casual.letter)];
const menuLinkIcon = [webApplicationsIcons.CHECK, webApplicationsIcons.STAR, webApplicationsIcons.SEARCH];
const menuLocation = 'Left';
const screenNameForMenuLink = 'Second screen';

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 03-overlay-menu`;

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

  'Create a new app and select Overlay menu style for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);

    rightSideNavMenu.openMenuScreen();

    menuScreen.selectMenuStyleByName(menuStyles.OVERLAY)
      .assertMenuStyleIsSelectedByName(menuStyles.OVERLAY);
  },

  'Open menu setting by clicking menu component on the screen and select the left side fot menu location': function(browser){
    const menuScreen = browser.page.menuScreen();
    const componentsScreen = browser.page.componentsScreen();

    menuScreen.openMenuSettingByClickingMenuComponent(menuStyles.OVERLAY)
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

  'Configure the 2-nd menu link by setting link action and choosing About this app for to show for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const menuScreen = browser.page.menuScreen();

    componentsScreen.setLinkActionForComponent(2, linkActions.OPEN_THE_ABOUT_THIS_APP_OVERLAY);

    menuScreen.clickSaveButton();
  },

  'Check menu style and location on preview screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();
    const menuScreen = browser.page.menuScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyles.OVERLAY);

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

    previewAppScreen.clickMenuLinkByLabel(menuLinksLabels[1])
      .assertAppInfoOverlayIsOpened();
  },

  'Return to edit mode and edit the 2-nd menu link': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const list = browser.page.listScreens();
    const componentsScreen = browser.page.componentsScreen();

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openMenuScreen();

    menuScreen.switchToTabName('Menu links')
      .expandMenuLinkPanelByNumber(2)
      .changeMenuLinkLabel(2, menuLinksLabels[2])
      .openIconPickerConsoleForMenuLink(3);

    list.selectWebApplicationIconByName(menuLinkIcon[2]);

    menuScreen.clickSelectAndSaveButtonForMenuLinkIcons()
      .checkMenuLinkIconOnPanel(2, menuLinkIcon[2]);

    componentsScreen.setLinkActionForComponent(1, linkActions.DISPLAY_ANOTHER_SCREEN)
      .selectScreenForLinkingByName(screenNameForMenuLink);

    menuScreen.clickSaveButton();
  },

  'Check that the 2-nd menu link is edited on preview screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();
    const menuScreen = browser.page.menuScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyles.OVERLAY)
      .openAppHamburgerMenu();

    menuScreen.assertMenuLinkIsPresentInMenuByLabel(menuLinksLabels[0])
      .assertMenuLinkIsNotPresentInMenuByLabel(menuLinksLabels[1])
      .assertMenuLinkIsPresentInMenuByLabel(menuLinksLabels[2])
      .checkMenuLinkIconOnScreen(2, menuLinkIcon[2]);

    previewAppScreen.clickMenuLinkByLabel(menuLinksLabels[2]);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenNameForMenuLink);
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};