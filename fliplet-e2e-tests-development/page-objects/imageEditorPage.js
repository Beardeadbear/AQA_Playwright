const commands = {
  checkThatImageEditorIsOpen: function () {
    return this
      .switchToFlWidgetFrameByNumber(2)
      .waitForElementVisible('@imageEditorHolder', this.api.globals.mediumWait)
      .assert.visible('@imageCanvas')
      .assert.visible('@imageDimensionsHolder');
  },

  clickEditOptionButton: function (editOption) {
    const editorOptionButtonLocator = `#${editOption.toLowerCase()}EditButton`;
    const editorOptionFormLocator = `.image-editor-${editOption.toLowerCase()} .form-horizontal`;
    const cancelButtonLocator = `#cancel${editOption}`;

    return this
      .waitForElementVisible(editorOptionButtonLocator, this.api.globals.smallWait)
      .click(editorOptionButtonLocator)
      .waitForElementVisible(editorOptionFormLocator, this.api.globals.smallWait)
      .assert.visible(cancelButtonLocator);
  },

  clickApplyChanges: function (editOption) {
    const applyButtonLocator = `#apply${editOption}`;
    const imageEditorHiddenOptionBlockLocator = `//div[@class='image-editor-${editOption}'][@style='display: none;']`;
    const resultDisplaying = [];

     this
      .waitForElementVisible(applyButtonLocator, this.api.globals.smallWait)
      .moveToElement(applyButtonLocator, 10, 10)
      .click(applyButtonLocator)
      .waitForElementPresentWithoutErrorsXpath(imageEditorHiddenOptionBlockLocator, 2000, resultDisplaying)
      .api.perform(function() {
        if (resultDisplaying[0] == false) {
          this.api.click(applyButtonLocator)
        }
      })
       .waitForElementNotVisible(applyButtonLocator, this.api.globals.smallWait);

     this
      .waitForElementNotVisible('@spinnerLoaderOnCanvas', 15000)
      .waitForElementVisible('@imageCanvas', this.api.globals.longWait)
      .api.pause(1000);

    return this
  },

  clickCancelChanges: function (editOption) {
    const cancelButtonLocator = `#cancel${editOption}`;

    return this
      .waitForElementVisible(cancelButtonLocator, this.api.globals.smallWait)
      .moveToElement(cancelButtonLocator, 10, 10)
      .click(cancelButtonLocator)
      .waitForElementNotVisible(cancelButtonLocator, this.api.globals.smallWait);
  },

  clickSaveChangeButton: function () {
    return this
      .waitForElementVisible('@saveChangeButton', this.api.globals.smallWait)
      .click('@saveChangeButton')
      .waitForElementNotVisible('@saveChangeButton', this.api.globals.longWait)
      .waitForElementNotVisible('@spinnerLoaderOnCanvas', 15000)
      .waitForElementVisible('@imageCanvas', this.api.globals.longWait);
  },

  getCanvasCurrentDimension: function (canvasDimension, done) {
    return this
      .waitForElementNotVisible('@spinnerLoaderOnCanvas', 15000)
      .waitForElementVisible('@imageCanvas', this.api.globals.longWait)
      .getAttribute('@imageCanvas', 'width', (width) => canvasDimension.push(width.value))
      .getAttribute('@imageCanvas', 'height', (height) => canvasDimension.push(height.value))
      .checkDisplayedDimensions(canvasDimension, function () {
        done();
      });
  },

  checkCanvasCurrentDimension: function (canvasDimension){
    this
      .waitForElementNotVisible('@spinnerLoaderOnCanvas', 15000)
      .waitForElementVisible('@imageCanvas', this.api.globals.longWait)
      .expect.element('@imageCanvas').to.have.attribute('width', `Canvas width equals expected value ${canvasDimension[0]}`)
      .equal(canvasDimension[0]).before(this.api.globals.mediumWait);

    this
      .expect.element('@imageCanvas').to.have.attribute('height', `Canvas height equals expected value ${canvasDimension[1]}`)
      .equal(canvasDimension[1]).before(this.api.globals.mediumWait);

    return this;
  },

  checkDisplayedDimensions: function (canvasDimension) {
   return this
      .waitForElementVisible('@imageDimensionsHolder', this.api.globals.smallWait)
      .getText('@imageDimensionsHolder', (displayedDimensions) => {
        this
          .assert.equal(displayedDimensions.value, `${canvasDimension[0]} × ${canvasDimension[1]}`,
          `Dimensions are ${canvasDimension[0]} × ${canvasDimension[1]}`);
      });
  },

  cropImageBySelectionCropOptionFromDropdown: function (cropOption) {
    return this
      .selectValueFromDropdown('aspectRatio', cropOption);
  },

  setResizeDimensionsValues: function (resizeDimensions) {
    return this
      .waitForElementVisible('@resizeWidthValueInput', this.api.globals.smallWait)
      .clearValue('@resizeWidthValueInput')
      .setValue('@resizeWidthValueInput', resizeDimensions[0])
      .clearValue('@resizeHeightValueInput')
      .setValue('@resizeHeightValueInput', resizeDimensions[1]);
  },

  setResizeDimensionsValuesByMeasure: function (measure, resizeDimension, firstIntegerOfMeasureValue) {
    const inputFiledForMeasureLocator = `.image-editor-resize input.form-control#${measure}`;

    this
      .api.waitForElementVisible(inputFiledForMeasureLocator, this.api.globals.smallWait)
      .click(inputFiledForMeasureLocator)
      .getValue(inputFiledForMeasureLocator, (initialValue) => {
        for (let i = 0; i < initialValue.value.length-1; i++) {
          this.api.keys([this.api.Keys.BACK_SPACE])
        }
      })
      .keys([resizeDimension])
      .pause(500)
      .getValue(inputFiledForMeasureLocator, (resizedValue) => firstIntegerOfMeasureValue.push(resizedValue.value.charAt(0)));

    return this;
  },

  assertSquareCropIsApplied: function (displayedDimensions) {
    return this
      .assert.ok(displayedDimensions[0] == displayedDimensions[1], `The crop is applied to image: width ${displayedDimensions[0]} 
      equals height ${displayedDimensions[1]}`);
  },

  assertResizeIsApplied: function (actualDimensions, resizeDimensions) {
    return this
          .assert.ok(actualDimensions[0] == resizeDimensions[0], `The resize is applied to image: width ${actualDimensions[0]} 
      equals ${resizeDimensions[0]}`)
          .assert.ok(actualDimensions[1] == resizeDimensions[1], `The resize is applied to image: height ${actualDimensions[1]} 
      equals ${resizeDimensions[1]}`);
  },

  assertRotateIsApplied: function(canvasDimensionBeforeRotation, canvasDimensionAfterRotation) {
    return this
      .assert.ok(canvasDimensionBeforeRotation[1] == canvasDimensionAfterRotation[0], `The rotate is applied to image: width 
      ${canvasDimensionBeforeRotation[1]} equals ${canvasDimensionAfterRotation[0]}`)
      .assert.ok(canvasDimensionBeforeRotation[0] == canvasDimensionAfterRotation[1], `The rotate is applied to image: height 
      ${canvasDimensionBeforeRotation[0]} equals ${canvasDimensionAfterRotation[1]}`);
  },

  unlockAspectRatio: function () {
    return this
      .waitForElementVisible('@lockAspectRatioCheckbox', this.api.globals.smallWait)
      .click('@lockAspectRatioCheckbox')
      .waitForElementVisible('#ratio-warning', this.api.globals.mediumWait);
  },

  clickRotateLeft: function(){
    return this
      .waitForElementVisible('@rotateLeft', this.api.globals.smallWait)
      .click('@rotateLeft');
  },

  assertThatEditedImageIsAddedToAppFilesAndSelected: function(imageName, initialImageId, amountOfExpectedEditedImages){
    const imageTitleLocator = `//*[@class='image-title'][contains(text(),'${imageName.substring(0, imageName.indexOf('.'))}')]`;
    const selectedInitialImageHolderLocator = `//*[contains(text(),'${imageName}')]/ancestor::node()/div[contains(@class,'selected')]
    [@data-file-id="${initialImageId}"]`;

    return this
      .switchToFLWidgetProviderFrame('#app')
      .api.useXpath()
      .waitForElementVisible(imageTitleLocator, this.api.globals.smallWait)
      .assertAmountOfElementsPresentXpath(imageTitleLocator, amountOfExpectedEditedImages)
      .assert.elementNotPresent(selectedInitialImageHolderLocator)
      .useCss();
  },
};

module.exports = {
  commands: [commands],
  elements: {
    imageEditorHolder: {
      selector: '.image-editor'
    },
    imageCanvas: {
      selector: '#editCanvasWrapper canvas'
    },
    imageDimensionsHolder: {
      selector: '.image-editor-main .dimensions'
    },
    resizeWidthValueInput: {
      selector: '.image-editor-resize input.form-control#width'
    },
    resizeHeightValueInput: {
      selector: '.image-editor-resize input.form-control#height'
    },
    saveChangeButton: {
      selector: '#saveImageChanges'
    },
    lockAspectRatioCheckbox: {
      selector: '.image-editor-resize span.check'
    },
    rotateLeft: {
      selector: '#rotateLeft'
    },
    rotateRight: {
      selector: '#rotateRight'
    },
    spinnerLoaderOnCanvas: {
      selector: '#loader .spinner-overlay'
    }
  }
};