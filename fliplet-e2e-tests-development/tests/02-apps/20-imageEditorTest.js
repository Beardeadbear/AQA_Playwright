const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const componentsConfigurationsTabs = require('../../utils/constants/componentsConfigurationsTabs');
const imageEditorOptions = require('../../utils/constants/imageEditorOptions');
const values = require('../../utils/constants/values');
const imageName = 'imageEditor.jpg';
const linkOfInitialImage = [];
const linkOfEditedImage =[];

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 20-image-editor`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app and select an image for Image component': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const editApp = browser.page.editAppScreen();
    const filePicker = browser.page.filePicker();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.IMAGE);

    filePicker
      .selectOrganizationFolder()
      .openFolderInFilePicker(browser.globals.imageFolder)
      .assertCorrectFolderIsOpen(browser.globals.imageFolder)
      .selectItemInFilePicker(imageName)
      .assertThatCorrectFileIsSelected(imageName)
      .getIdsOfSelectedFiles(linkOfInitialImage)

    componentsScreen.clickSaveAndCloseButton();
  },

  'Open Image Editor Tab': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const imageEditPage = browser.page.imageEditorPage();
    const editApp = browser.page.editAppScreen();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.IMAGE);

    componentsScreen.switchToTabName(componentsConfigurationsTabs.IMAGE_EDITOR);

    imageEditPage.checkThatImageEditorIsOpen();
  },

  'Crop the image and check the applied changes': function (browser) {
    const imageEditPage = browser.page.imageEditorPage();
    const canvasDimension = [];

    imageEditPage
      .clickEditOptionButton(imageEditorOptions.CROP)
      .cropImageBySelectionCropOptionFromDropdown(values.SQUARE)
      .clickApplyChanges(imageEditorOptions.CROP)
      .clickSaveChangeButton()
      .getCanvasCurrentDimension(canvasDimension);

    browser.perform(() => {
      imageEditPage.assertSquareCropIsApplied(canvasDimension);
    });
  },

  'Resize the image and check the applied changes': function (browser) {
    const imageEditPage = browser.page.imageEditorPage();
    const resizeDimensions = [(casual.integer(from = 10, to = 50)).toString(), (casual.integer(from = 51, to = 99)).toString()];
    const canvasDimension = [];
    const firstIntegerMeasureValue =[];

    imageEditPage
      .clickEditOptionButton(imageEditorOptions.RESIZE)
      .unlockAspectRatio()
      .setResizeDimensionsValuesByMeasure(values.WIDTH, resizeDimensions[0], firstIntegerMeasureValue)
      .setResizeDimensionsValuesByMeasure(values.HEIGHT, resizeDimensions[1], firstIntegerMeasureValue)
      .clickApplyChanges(imageEditorOptions.RESIZE)
      .clickSaveChangeButton()
      .getCanvasCurrentDimension(canvasDimension);

    browser.perform(() => {
      imageEditPage.assertResizeIsApplied([firstIntegerMeasureValue[0].concat(resizeDimensions[0]),
        firstIntegerMeasureValue[1].concat(resizeDimensions[1])], canvasDimension);
    });
  },

  'Check changes canceling': function (browser) {
    const imageEditPage = browser.page.imageEditorPage();
    const canvasDimensionAfterCanceling = [];
    const resizeDimensionForCanceling = [casual.integer(from = 150, to = 200), casual.integer(from = 250, to = 300)];
    const canvasDimensionBeforeCanceling = [];

    imageEditPage
      .getCanvasCurrentDimension(canvasDimensionBeforeCanceling)
      .clickEditOptionButton(imageEditorOptions.RESIZE)
      .unlockAspectRatio()
      .setResizeDimensionsValues(resizeDimensionForCanceling)
      .checkCanvasCurrentDimension(resizeDimensionForCanceling)
      .clickCancelChanges(imageEditorOptions.RESIZE)
      .getCanvasCurrentDimension(canvasDimensionAfterCanceling);

    browser.perform(() => {
      imageEditPage.assertResizeIsApplied(canvasDimensionBeforeCanceling ,canvasDimensionAfterCanceling);
    });
  },

  'Rotate the image and check the applied changes': function (browser) {
    const imageEditPage = browser.page.imageEditorPage();
    const canvasDimensionBeforeRotation = [];
    const canvasDimensionAfterRotation = [];

    imageEditPage
      .getCanvasCurrentDimension(canvasDimensionBeforeRotation)
      .clickEditOptionButton(imageEditorOptions.ROTATE)
      .clickRotateLeft()
      .clickApplyChanges(imageEditorOptions.ROTATE)
      .clickSaveChangeButton()
      .getCanvasCurrentDimension(canvasDimensionAfterRotation);

    browser.perform(() => {
      imageEditPage.assertRotateIsApplied(canvasDimensionBeforeRotation, canvasDimensionAfterRotation);
    });
  },

  'Save changes and get id of the edited image' : function(browser){
    const componentsScreen = browser.page.componentsScreen();
    const editApp = browser.page.editAppScreen();
    const filePicker = browser.page.filePicker();
    const imageEditPage = browser.page.imageEditorPage();

    componentsScreen.clickSaveAndCloseButton();

    editApp.openDetailsOfComponentByClickingOnIt(widgets.IMAGE);

    imageEditPage.assertThatEditedImageIsAddedToAppFilesAndSelected(imageName, linkOfInitialImage[linkOfInitialImage.length-1], 3);

    filePicker.getIdsOfSelectedFiles(linkOfEditedImage);
  },

  'Open preview screen and check the edited image': function (browser) {
    const previewApp = browser.page.previewAppScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewApp.assertImageOnPreviewScreen(linkOfEditedImage[linkOfEditedImage.length-1]);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};