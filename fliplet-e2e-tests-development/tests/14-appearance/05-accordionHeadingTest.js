const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const accordionLabel = casual.word;
const imageTitles = [casual.word, casual.word, casual.word];
const imageNames = ['colonel-meow.JPG','images.jpg','parrots_thumb.jpg'];
const backgroundHexColour = '#9FDA3F';
const backgroundWhenOpenHexColour = '#EDE56B';
const linkOfImage = [];

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 05-accordion`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login()
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Crete a new application and add accordion component': function (browser) {
    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);
    browser.newDragAndDrop(widgets.ACCORDION_HEADING)
      .waitForWidgetInterfaceNewDnd(widgets.ACCORDION_HEADING)
      .switchToWidgetInstanceFrame();
  },

  'Configure Accordion heading': function (browser) {
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen.changeComponentLabel(accordionLabel);
    componentsScreen.clickSaveAndCloseButton();
  },

  'Add gallery component to Accordion': function (browser) {
    const editApp = browser.page.editAppScreen();

    editApp.expandAccordionHeadingForComponentAdding()
      .newDragAndDropAccordion(widgets.GALLERY)
      .checkThatComponentIsPresentOnPreviewScreen(widgets.GALLERY)
      .switchToWidgetInstanceFrame();
  },

  'Select images for gallery component and add titles for images': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const filePicker = browser.page.filePicker();

    componentsScreen.clickAddImagesButton();

    filePicker.selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectMultipleItemsInFilePicker(imageNames)
      .getIdsOfSelectedFiles(linkOfImage)
      .assertCorrectAmountOfSelectedItemsInFilePicker(imageNames.length)
      .clickSelectAndSaveButton();

    componentsScreen.assertCorrectQtyOfImagesDisplayedInGallery(imageNames.length)
      .changeTitlesForGalleryImages(imageTitles)
      .clickSaveAndCloseButton();
  },

  'Change appearance setting for Accordion - Background color': function (browser) {
    const appearanceScreen = browser.page.appearanceScreen();
    const editApp = browser.page.editAppScreen();

    editApp.openEditAppearanceSettingForComponent(widgets.ACCORDION_HEADING);

    appearanceScreen.openColorPickerForFieldByName('Background');
    appearanceScreen.enterColorForOpenedColorPicker(backgroundHexColour);
    appearanceScreen.clickMobileIconInAppearance();
    appearanceScreen.checkColorValueOfComponent('Background', backgroundHexColour)
  },

  'Change appearance setting for Accordion - Background color when open': function (browser) {
    const appearanceScreen = browser.page.appearanceScreen();

    appearanceScreen.openColorPickerForFieldByName('Background when open');
    appearanceScreen.enterColorForOpenedColorPicker(backgroundWhenOpenHexColour);
    appearanceScreen.clickMobileIconInAppearance();
    appearanceScreen.checkColorValueOfComponent('Background when open', backgroundWhenOpenHexColour);
  },

  'Navigate to preview mode to check accordion before expanding' : function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertElementVisibleOnPreviewScreen('@accordionHeading')
      .assertElementNotVisibleOnPreviewScreen('@imageGallery')
      .checkHeadingBackgroundColor(backgroundHexColour)
      .expandAccordion();
    previewAppScreen.assertCorrectImagesAreAddedToGallery(imageNames, linkOfImage)
      .checkAccordionHeadingTitle(accordionLabel);
  },

  'Check accordion after expanding and the nested gallery component' : function(browser){
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.checkGalleryFunctionality(linkOfImage, imageTitles)
      .checkHeadingBackgroundColor(backgroundWhenOpenHexColour)
      .collapseAccordion()
      .checkHeadingBackgroundColor(backgroundHexColour)
      .assertElementNotVisibleOnPreviewScreen('@imageGallery');
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};