const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const menuStyles = require('../../utils/constants/menuStyles');
const webApplicationsIcons = require('../../utils/constants/webApplicationsIcons');
const linkActions = require('../../utils/constants/linkActions');
const menuLinkIcon = [webApplicationsIcons.HEART, webApplicationsIcons.USER];
const menuLinksLabels = [casual.word.concat(casual.letter), casual.letter.concat(casual.word), casual.word.concat(casual.letter)];
const menuLocation = 'Left';
const videoFileName = 'stars.mp4';
const documentName = 'fliplet.pdf';
const screenNameForMenuLink = 'Second screen';
const mediaId = [];

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 01-slide-in-menu`;

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

  'Create a new app and select Slide In menu style for it': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);

    rightSideNavMenu.openMenuScreen();

    menuScreen.selectMenuStyleByName(menuStyles.SLIDE_IN)
      .assertMenuStyleIsSelectedByName(menuStyles.SLIDE_IN);
  },

  'Open menu setting by clicking menu component on the screen and select the left side fot menu location': function(browser){
    const menuScreen = browser.page.menuScreen();
    const componentsScreen = browser.page.componentsScreen();

    menuScreen.openMenuSettingByClickingMenuComponent(menuStyles.SLIDE_IN)
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

  'Configure the 1-st menu link - set link action and choose a screen to display for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const menuScreen = browser.page.menuScreen();

    componentsScreen.setLinkActionForComponent(1, linkActions.DISPLAY_ANOTHER_SCREEN)
      .selectScreenForLinkingByName(screenNameForMenuLink);

    menuScreen.collapseMenuLinkPanelByNumber(1);
  },

  'Edit the 2-nd menu link by selecting and then removing an icon': function(browser){
    const menuScreen = browser.page.menuScreen();
    const list = browser.page.listScreens();

    menuScreen.expandMenuLinkPanelByNumber(2)
      .changeMenuLinkLabel(2, menuLinksLabels[1])
      .openIconPickerConsoleForMenuLink(4);

    list.selectWebApplicationIconByName(menuLinkIcon[1]);

    menuScreen.clickSelectAndSaveButtonForMenuLinkIcons()
      .checkMenuLinkIconOnPanel(2, menuLinkIcon[1])
      .removeIconForMenuLink(2);
  },

  'Configure the 2-nd menu link - set link action and choose a document for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();
    const menuScreen = browser.page.menuScreen();

    componentsScreen.setLinkActionForComponent(2, linkActions.OPEN_A_DOCUMENT)
      .clickBrowseYourMediaLibraryButton()

    filePicker.selectOrganizationFolder(2)
      .openFolderInFilePicker(browser.globals.docFolder, 2)
      .assertCorrectFolderIsOpen(browser.globals.docFolder, 2)
      .selectItemInFilePicker(documentName, 2)
      .assertThatCorrectFileIsSelected(documentName, 2)
      .getIdsOfSelectedFiles(mediaId, 2);

    menuScreen.clickSaveButton()
      .clickSaveButton();
  },

  'Check menu style and location on preview screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();
    const menuScreen = browser.page.menuScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyles.SLIDE_IN);

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
      .checkMenuLinkIconOnScreen(1, menuLinkIcon[0]);

    previewAppScreen.clickMenuLinkByLabel(menuLinksLabels[0]);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenNameForMenuLink);
  },

  'Check the 2-nd menu link on preview screen': function(browser){
    const menuScreen = browser.page.menuScreen();
    const previewAppScreen = browser.page.previewAppScreen();
    const webApp = browser.page.webApplicationPages();

    previewAppScreen.openAppHamburgerMenu();

    menuScreen.assertMenuLinkIsPresentInMenuByLabel(menuLinksLabels[1])
      .checkMenuLinkWithoutIconOnScreen(2);

    previewAppScreen.clickMenuLinkByLabel(menuLinksLabels[1])

    webApp.switchToOpenWindowByNumber(2)
      .checkDocumentIsOpen(mediaId[mediaId.length - 1]);
  },

  'Return to edit mode and add one more menu link': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const webApp = browser.page.webApplicationPages();

    webApp.switchToOpenWindowByNumber(1);

    appTopFixedNavigationBar.navigateToEditMode();

    rightSideNavMenu.openMenuScreen();

    menuScreen.switchToTabName('Menu links')
      .addMenuLink()
      .expandMenuLinkPanelByNumber(3)
      .changeMenuLinkLabel(3, menuLinksLabels[2]);
  },

  'Configure the 3-nd menu link - set link action and choose a video for it': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const menuScreen = browser.page.menuScreen();
    const filePicker = browser.page.filePicker();

    componentsScreen.setLinkActionForComponent(1, linkActions.PLAY_A_VIDEO)
      .clickBrowseYourMediaLibraryForVideoButton();

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.videoFolder)
      .assertCorrectFolderIsOpen(browser.globals.videoFolder)
      .selectItemInFilePicker(videoFileName,)
      .assertThatCorrectFileIsSelected(videoFileName)
      .getIdsOfSelectedFiles(mediaId);

    menuScreen.clickSaveButton()
      .clickSaveButton();
  },

  'Check that the new link is added to menu on preview screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();
    const menuScreen = browser.page.menuScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyles.SLIDE_IN)
      .openAppHamburgerMenu();

    menuScreen.assertMenuLinkIsPresentInMenuByLabel(menuLinksLabels[0])
      .assertMenuLinkIsPresentInMenuByLabel(menuLinksLabels[1])
      .assertMenuLinkIsPresentInMenuByLabel(menuLinksLabels[2]);

    previewAppScreen.clickMenuLinkByLabel(menuLinksLabels[2])
      .assertCorrectVideoIsDisplayed(mediaId[mediaId.length - 1]);
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};