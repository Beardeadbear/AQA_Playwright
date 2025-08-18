const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const menuStyles = require('../../utils/constants/menuStyles');
const webApplicationsIcons = require('../../utils/constants/webApplicationsIcons');
const linkActions = require('../../utils/constants/linkActions');
const menuLinkIcon = {
  envelope: webApplicationsIcons.HEART,
  pencil: webApplicationsIcons.PENCIL,
  trash: webApplicationsIcons.STAR
};
const initialScreenNames = {
  homeScreen: 'Home',
  directoryScreen: 'Directory',
  blogScreen: 'Blog',
  contactScreen: 'Contact'
};
const newScreenNames = {
  getInTouchScreen: 'Get in touch',
  blogScreen: casual.word.concat(casual.letter),
  usersScreen: casual.letter.concat(casual.word)
}

module.exports = {

  '@reference': 'https://weboo.atlassian.net/browse/ID-475',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 05-bottom-menu`;

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

  'Create a new app and select Bottom Icon Bar menu style for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP);

    rightSideNavMenu.openMenuScreen();

    menuScreen.assertMenuStyleIsSelectedByName(menuStyles.BOTTOM_ICON_BAR);
  },

  'Open Menu links tab': function(browser){
    const menuScreen = browser.page.menuScreen();

    menuScreen.switchToTabName('Menu links');
  },

  'Select Custom menu option for the menu links': function(browser){
    const menuScreen = browser.page.menuScreen();

    menuScreen.selectMenuOptionInMenuLinksTab('Custom menu');
  },

  'Check that menu links can be removed': function(browser){
    const menuScreen = browser.page.menuScreen();

    menuScreen.deleteMenuLinkByTitle(initialScreenNames.contactScreen);
  },

  'Edit the existed menu link by selection an icon for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const list = browser.page.listScreens();

    menuScreen.expandMenuLinkPanelByNumber(3)
      .changeMenuLinkLabel(3, newScreenNames.blogScreen)
      .openIconPickerConsoleForMenuLink(5);

    list.selectWebApplicationIconByName(menuLinkIcon.pencil);

    menuScreen.clickSelectAndSaveButtonForMenuLinkIcons()
      .checkMenuLinkIconOnPanel(3, menuLinkIcon.pencil)
      .collapseMenuLinkPanelByNumber(3);
  },

  'Add and edit a new menu link by selection an icon for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const list = browser.page.listScreens();

    menuScreen.addMenuLink()
      .expandMenuLinkPanelByNumber(4)
      .changeMenuLinkLabel(4, newScreenNames.getInTouchScreen)
      .openIconPickerConsoleForMenuLink(8);

    list.selectWebApplicationIconByName(menuLinkIcon.envelope);

    menuScreen.clickSelectAndSaveButtonForMenuLinkIcons()
      .checkMenuLinkIconOnPanel(4, menuLinkIcon.envelope);
  },

  'Configure the new menu link by setting link action and choosing a screen to display for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const menuScreen = browser.page.menuScreen();

    componentsScreen.setLinkActionForComponent(2, linkActions.DISPLAY_ANOTHER_SCREEN)
      .selectScreenForLinkingByName(newScreenNames.getInTouchScreen);

    menuScreen.clickSaveButton();
  },

  'Open preview mode and check menu style': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyles.BOTTOM_ICON_BAR);
  },

  'Check the menu links after changes': function(browser){
    const menuScreen = browser.page.menuScreen();

    menuScreen.assertBottomIconBarMenuHasLinkWithLabel(initialScreenNames.homeScreen)
      .assertBottomIconBarMenuHasLinkWithLabel(initialScreenNames.directoryScreen)
      .assertBottomIconBarMenuHasLinkWithLabel(newScreenNames.blogScreen)
      .assertBottomIconBarMenuHasLinkWithLabel(newScreenNames.getInTouchScreen)
      .assertBottomIconBarMenuHasNoLinkWithLabel(initialScreenNames.contactScreen);
  },

  'Check the edited menu link on preview screen': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    menuScreen.checkThatMenuLinkInBottomIconBarMenuHasCorrectIcon(newScreenNames.blogScreen, menuLinkIcon.pencil);

    previewAppScreen.clickBottomIConBarMenuLinkByLabel(newScreenNames.blogScreen);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(initialScreenNames.blogScreen);
  },

  'Check the added menu link on preview screen': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    menuScreen.checkThatMenuLinkInBottomIconBarMenuHasCorrectIcon(newScreenNames.getInTouchScreen, menuLinkIcon.envelope);

    previewAppScreen.clickBottomIConBarMenuLinkByLabel(newScreenNames.getInTouchScreen);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(newScreenNames.getInTouchScreen);
  },

  'Return to edit mode and add two more menu link': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openMenuScreen();

    menuScreen.switchToTabName('Menu links')
      .addMenuLink()
      .addMenuLink();
  },

  'Edit the new menu link by selection an icon for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const list = browser.page.listScreens();

    menuScreen.expandMenuLinkPanelByNumber(5)
      .changeMenuLinkLabel(5, newScreenNames.usersScreen)
      .openIconPickerConsoleForMenuLink(10);

    list.selectWebApplicationIconByName(menuLinkIcon.trash);

    menuScreen.clickSelectAndSaveButtonForMenuLinkIcons()
      .checkMenuLinkIconOnPanel(5, menuLinkIcon.trash);
  },

  'Configure the added menu link by setting link action and choosing a screen to display for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const menuScreen = browser.page.menuScreen();

    componentsScreen.setLinkActionForComponent(1, linkActions.DISPLAY_ANOTHER_SCREEN)
      .selectScreenForLinkingByName(initialScreenNames.directoryScreen);

    menuScreen.clickSaveButton();
  },

  'Open preview mode again after changes and check menu style': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyles.BOTTOM_ICON_BAR);
  },

  'Check ability to expand and collapse Bottom Icon Bar menu': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.clickMoreButtonToExpandBottomIConBarMenu()
      .clickHideButtonToExpandBottomIConBarMenu();
  },

  'Expand menu and check the menu links after adding new ones': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.clickMoreButtonToExpandBottomIConBarMenu();

    menuScreen.assertBottomIconBarMenuHasLinkWithLabel(initialScreenNames.homeScreen)
      .assertBottomIconBarMenuHasLinkWithLabel(initialScreenNames.directoryScreen)
      .assertBottomIconBarMenuHasLinkWithLabel(newScreenNames.blogScreen)
      .assertBottomIconBarMenuHasLinkWithLabel(newScreenNames.getInTouchScreen)
      .assertBottomIconBarMenuHasLinkWithLabel(newScreenNames.usersScreen);
  },

  'Click and check the added menu link after the menu expanding': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    menuScreen.checkThatMenuLinkInBottomIconBarMenuHasCorrectIcon(newScreenNames.usersScreen, menuLinkIcon.trash);

    previewAppScreen.clickBottomIConBarMenuLinkByLabel(newScreenNames.usersScreen);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(initialScreenNames.directoryScreen);
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};