const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const screenName = 'First screen';
const linkedScreen = 'Second screen';

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 11-lists`;

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

  'Add a list component with no images': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const componentsScreen = browser.page.componentsScreen();
    const list = browser.page.listScreens();
    const preview = browser.page.previewAppScreen();
    const itemTitle = casual.word;
    const itemDescription = casual.text;
    const dataId = [];

    //dropping list component

    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.LIST_NO_IMAGES)
      .switchToWidgetInstanceFrame();

    //starting new list creation, obtaining dataId property that is used in ids of child elements

    list
      .clickAddNewItemButton()
      .getDataIdOfExpandedListItem(dataId);

    //Adding a name and description to item, configuring it to lead to another screen after clicking

    browser
      .perform(()=> {
        list
          .changeListItemTitle(dataId[0], itemTitle)
          .changeListItemDescription(dataId[0], itemDescription);
      });

    componentsScreen.setLinkActionForComponent(1, 'Display another screen');
    componentsScreen.selectScreenForLinkingByName(linkedScreen);
    componentsScreen.clickSaveAndCloseButton();

    //navigating to preview screen and asserting that all changes are saved and applied

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .waitForAjaxCompleted()
      .switchToPreviewFrame()
      .perform(()=> {
        preview.checkSimpleListTitleAndDescriptionOfListItemByDataId(dataId[0], itemTitle, itemDescription);
        preview.clickSimpleListItemByDataId(dataId[0]);
      })
      .expect.element('.nav-title > span').text.to.equal(linkedScreen).after(5000);
  },

  'Add a list component with small thumbnails': function(browser){
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const componentsScreen = browser.page.componentsScreen();
    const filePicker =  browser.page.filePicker()
    const list = browser.page.listScreens();
    const preview = browser.page.previewAppScreen();
    const markerStyleOverlay = browser.page.markerStyleOverlay();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const itemTitle = [casual.word, casual.word];
    const itemDescription = [casual.text, casual.text];
    const imageAreaColour = casual.rgb_hex;
    const imageName = 'colonel-meow.JPG';
    const iconName = 'Pencil Square';
    const size = "small";
    const dataId =[];
    const imageId =[];

    appTopFixedNavigationBar.navigateToEditMode();

    appScreensLeftsidePanel.openScreenByName(screenName);

    //dropping list component

    browser.dragAndDropWithCondition(widgets.LIST_SMALL_THUMBNAILS)
      .switchToWidgetInstanceFrame();

    //starting new list item creation, obtaining dataId property that is used in ids of child elements

    list
      .clickAddNewItemButton()
      .getDataIdOfExpandedListItem(dataId);

    //changing list item properties

    browser.perform(()=>{
      list
        .changeListItemTitle(dataId[0], itemTitle[0])
        .changeListItemDescription(dataId[0], itemDescription[0])
        .clickAddImageButton(dataId[0]);
    });

    //adding an image from existing folder and saving changes of this list item

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imageName)
      .assertThatCorrectFileIsSelected(imageName)
      .getIdsOfSelectedFiles(imageId)
      .clickSelectAndSaveButton();

    browser.switchToWidgetInstanceFrame();

    //collapsing first list item settings

    browser
      .perform(()=> list.collapseListItem(dataId[0]))
      .pause(2000);

    //starting new list item creation, obtaining dataId property that is used in ids of child elements

    list
      .clickAddNewItemButton()
      .getDataIdOfExpandedListItem(dataId);

    //selecting an icon for second list item

    browser.perform(()=> {
      list.clickSelectAnIconButton(dataId[1]);
      browser.switchToFLWidgetProviderFrame('div#fa');
      list.selectWebApplicationIconByName(iconName);
    });
    markerStyleOverlay.clickSelectAndSaveButtonForIcons();

    //changing list item properties

    browser.perform(()=>{
      list
        .switchToWidgetInstanceFrame()
        .changeListItemTitle(dataId[1], itemTitle[1])
        .changeListItemDescription(dataId[1], itemDescription[1])
    });
    componentsScreen.clickSaveAndCloseButton();

    //navigating to preview screen and asserting that all changes are saved and applied

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .switchToPreviewFrame()
      .perform(()=> {
        preview.checkThumbnailsListTitleOfItemByDataId(dataId[0], size, itemTitle[0]);
        preview.checkThumbnailsListDescriptionOfItemByDataId(dataId[0], size, itemDescription[0]);
        preview.checkThumbnailsListTitleOfItemByDataId(dataId[1], size, itemTitle[1]);
        preview.checkThumbnailsListDescriptionOfItemByDataId(dataId[1], size, itemDescription[1]);
        preview
          .assertCorrectImageIsUsedAsThumbnailByDataId(dataId[0], size, imageId[0])
          .assertCorrectImageIconIsUsedByDataId(dataId[1], size, iconName);
      });
  },

  'Add a list component with large thumbnails': function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const filePicker = browser.page.filePicker();
    const list = browser.page.listScreens();
    const preview = browser.page.previewAppScreen();
    const itemTitle = [casual.word, casual.word];
    const itemDescription = [casual.text, casual.text];
    const imageName = 'parrots_thumb.jpg';
    const size = "large";
    const dataId =[];
    const imageId = [];

    //return to edit screen

    appTopFixedNavigationBar.navigateToEditMode();

    //dropping list component

    browser.dragAndDropWithCondition(widgets.LIST_LARGE_THUMBNAILS)
      .switchToWidgetInstanceFrame();

    //starting new list item creation, obtaining dataId property that is used in ids of child elements

    list
      .clickAddNewItemButton()
      .getDataIdOfExpandedListItem(dataId);

    //changing list item properties

    browser.perform(()=> {
      list
        .changeListItemTitle(dataId[0], itemTitle[0])
        .changeListItemDescription(dataId[0], itemDescription[0])
        .clickAddImageButton(dataId[0]);
    });

    //adding an image from existing folder and saving changes of this list item

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imageName)
      .assertThatCorrectFileIsSelected(imageName)
      .getIdsOfSelectedFiles(imageId)
      .clickSelectAndSaveButton();

    componentsScreen.clickSaveAndCloseButton();

    //navigating to preview screen and asserting that all changes are saved and applied

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .switchToPreviewFrame()
      .perform(()=>{
        preview.checkThumbnailsListTitleOfItemByDataId(dataId[0], size, itemTitle[0]);
        preview.checkThumbnailsListDescriptionOfItemByDataId(dataId[0], size, itemDescription[0]);
        preview.assertCorrectImageIsUsedAsThumbnailByDataId(dataId[0], size, imageId[0]);
      });
  },

  'Add a list component with panels': function(browser){
    const editApp = browser.page.editAppScreen();
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();
    const list = browser.page.listScreens();
    const preview = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const itemTitle = [casual.word, casual.word];
    const imageNames = ['colonel-meow.JPG', 'parrots_thumb.jpg'];
    const dataId =[];
    const imageIds = [];

    //return to edit screen

    appTopFixedNavigationBar.navigateToEditMode();

    //dropping list component

    browser.dragAndDropWithCondition(widgets.LIST_PANELS)
      .switchToWidgetInstanceFrame();

    //starting new list item creation, obtaining dataId property that is used in ids of child elements

    list
      .clickAddNewItemButton()
      .getDataIdOfExpandedListItem(dataId);

    //changing list item properties

    browser.perform(()=> {
      list
        .changeListItemTitle(dataId[0], itemTitle[0])
        .clickAddImageButton(dataId[0]);
    });

    //adding an image from existing folder and saving changes of this list item

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imageNames[0])
      .assertThatCorrectFileIsSelected(imageNames[0])
      .getIdsOfSelectedFiles(imageIds)
      .clickSelectAndSaveButton();

    browser.switchToWidgetInstanceFrame();

    componentsScreen.setLinkActionForComponent(1, 'Open the about this app overlay');

    //collapsing first list item settings

    browser
      .frameParent()
      .perform(()=> list.collapseListItem(dataId[0]))
      .pause(4000);

    componentsScreen.clickSaveAndCloseButton();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LIST_PANELS);

    //starting new list item creation, obtaining dataId property that is used in ids of child elements

    list
      .clickAddNewItemButton()
      .getDataIdOfExpandedListItem(dataId);

    //changing list item properties

    browser.perform(()=> {
      list
        .changeListItemTitle(dataId[1], itemTitle[1])
        .clickAddImageButton(dataId[1]);
    })
      .switchToFLWidgetProviderFrame('.drop-zone-container');

    //adding an image from existing folder and saving changes of this list item

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imageNames[1])
      .assertThatCorrectFileIsSelected(imageNames[1])
      .getIdsOfSelectedFiles(imageIds)
      .clickSelectAndSaveButton();

    componentsScreen.clickSaveAndCloseButton();

    //navigating to preview screen and asserting that all changes are saved and applied

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser
      .switchToPreviewFrame()
      .pause(2500)
      .perform(()=>{
        preview
          .assertCorrectImageIsUsedForPanelByDataId(dataId[0], imageIds[0])
          .assertCorrectImageIsUsedForPanelByDataId(dataId[1], imageIds[1])
          .clickPanelImageByDataId(dataId[0])
          .assertAppInfoOverlayIsOpened();
      });
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};