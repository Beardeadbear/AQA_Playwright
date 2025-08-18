const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const linkActions = require('../../utils/constants/linkActions');
const screenTitles = {
  firstScreen: 'First screen',
  secondScreen: 'Second screen',
};
const listItems = {
  firstPanel: {
    dataId: [],
    title: casual.word,
    description: casual.title,
    background: casual.rgb_hex
  },
  secondPanel: {
    dataId: [],
    title: casual.word,
    description: casual.title,
    background: 'venue.jpg',
    documentNameForLinkAction: 'fliplet.pdf',
    documentIdForLinkAction: [],
    imageId: []
  }
}

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 13-grid`;

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

  'Create a new app and add Grid component to the app screen': function(browser){
    browser
      .createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.GRID)
      .switchToWidgetInstanceFrame();
  },

  'Add the 1-st panel to the component': function(browser){
    const list = browser.page.listScreens();

    list
      .clickAddNewItemButton()
      .getDataIdOfExpandedListItem(listItems.firstPanel.dataId);
  },

  'Enter title and description for the 1-st panel': function(browser){
    const list = browser.page.listScreens();

    list
      .changeListItemTitle(listItems.firstPanel.dataId[0], listItems.firstPanel.title)
      .changeListItemDescription(listItems.firstPanel.dataId[0], listItems.firstPanel.description);
  },

  'Select a link action for the 1-st panel': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .setLinkActionForComponent(1, linkActions.DISPLAY_ANOTHER_SCREEN)
      .selectScreenForLinkingByName(screenTitles.secondScreen)
  },

  'Choose a color for the 1-st panel and collapse it': function(browser){
    const list = browser.page.listScreens();

    list
      .changeImageAreaColor(listItems.firstPanel.dataId[0], listItems.firstPanel.background)
      .collapseListItem(listItems.firstPanel.dataId[0]);
  },

  'Add the 2-nd panel to the component': function(browser){
    const list = browser.page.listScreens();

    list
      .clickAddNewItemButton()
      .getDataIdOfExpandedListItem(listItems.secondPanel.dataId);
  },

  'Enter title and description for the 2-nd panel': function(browser){
    const list = browser.page.listScreens();

    list
      .changeListItemTitle(listItems.secondPanel.dataId[0], listItems.secondPanel.title)
      .changeListItemDescription(listItems.secondPanel.dataId[0], listItems.secondPanel.description);
  },

  'Select an image for the 2-nd panel in file picker and save it': function(browser){
    const filePicker = browser.page.filePicker();
    const list = browser.page.listScreens();

    list.clickAddImageButton(listItems.secondPanel.dataId[0]);

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(listItems.secondPanel.background)
      .assertThatCorrectFileIsSelected(listItems.secondPanel.background)
      .getIdsOfSelectedFiles(listItems.secondPanel.imageId)
      .clickSelectAndSaveButton();

    list.checkThatImageHasBeenSelectedForListItemBackground(listItems.secondPanel.dataId[0]);
  },

  'Select a link action for the 2-nd panel': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .setLinkActionForComponent(2, linkActions.OPEN_A_DOCUMENT)
      .clickBrowseYourMediaLibraryButton()
  },

  'Choose a document for the 2-nd panel link action in file picker and save it': function(browser){
    const filePicker = browser.page.filePicker();
    const list = browser.page.listScreens();

    filePicker
      .selectOrganizationFolder(2)
      .openFolderInFilePicker(browser.globals.docFolder, 2)
      .assertCorrectFolderIsOpen(browser.globals.docFolder, 2)
      .selectItemInFilePicker(listItems.secondPanel.documentNameForLinkAction, 2)
      .assertThatCorrectFileIsSelected(listItems.secondPanel.documentNameForLinkAction, 2)
      .getIdsOfSelectedFiles(listItems.secondPanel.documentIdForLinkAction, 2)
      .clickSelectAndSaveButton();

    list.checkThatCorrectFileIsSelectedForListItemLinkAction(listItems.secondPanel.documentNameForLinkAction, 2);
  },

  'Save the panels settings': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to the preview screen to assert that all changes are applied': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.GRID)
      .switchToPreviewFrame();
  },

  'Check the 1-st metro panel on the preview screen': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    previewAppScreen
      .assertCorrectColorIsUsedForPanelByDataId(listItems.firstPanel.dataId[0], listItems.firstPanel.background)
      .clickLinkedIconForListItem(listItems.firstPanel.dataId[0]);

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenTitles.secondScreen);
  },

  'Check the 2-nd metro panel on the preview screen': function(browser){
    const previewAppScreen = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const webApp = browser.page.webApplicationPages();

    appScreensLeftsidePanel.openScreenByName(screenTitles.firstScreen);

    browser
      .checkThatComponentIsPresentOnPreviewScreen(widgets.GRID)
      .switchToPreviewFrame();

    previewAppScreen
      .assertCorrectImageIsUsedForPanelByDataId(listItems.secondPanel.dataId[0], listItems.secondPanel.imageId[0])
      .clickLinkedIconForListItem(listItems.secondPanel.dataId[0]);

    webApp
      .switchToOpenWindowByNumber(2)
      .checkDocumentIsOpen(listItems.secondPanel.documentIdForLinkAction[0]);
  },

  'Delete the created application': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};