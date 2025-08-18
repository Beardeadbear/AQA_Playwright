const util = require('util');
const elementAttributes = require('../utils/constants/elementAttributes');
const itemTitle = '//div[@class="image-title"][text()="%s"]';
const itemImageHolder = '//div[@class="image-title"][text()="%s"]/preceding-sibling::div';

const commands = {
  selectOrganizationFolder: function(frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .api.pause(2000);

    this
      .waitForElementVisible('@fileSourceDropdown', this.api.globals.smallWait)
      .waitForElementPresent('@organizationFolderInBrowseFilesDropdown', this.api.globals.smallWait)
      .click('@fileSourceDropdown')
      .api.pause(2000);

    this
      .waitForElementVisible('@organizationFolderInBrowseFilesDropdown', this.api.globals.smallWait)
      .click('@organizationFolderInBrowseFilesDropdown')
      .expect.element('@organizationFolderInBrowseFilesDropdown').to.be.selected.before(this.api.globals.longWait);

    this
      .api.frame(null);

    return this;
  },

  selectItemInFilePicker: function(itemName, frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .api.useXpath()
      .waitForElementVisible(util.format(itemImageHolder, itemName), this.api.globals.longWait)
      .pause(2000)
      .element('xpath', util.format(itemImageHolder, itemName), function(result){
        this
          .moveTo(result.value.ELEMENT)
          .mouseButtonClick(0);
      })
      .useCss()
      .frame(null);

    return this;
  },

  enterFolderNameInFilePicker: function(folderName){
    return this
      .waitForElementVisible('@folderNameInputFieldInCreateNewFolderModal', this.api.globals.smallWait)
      .setValue('@folderNameInputFieldInCreateNewFolderModal', folderName);
  },

  confirmFolderCreationInFilePicker: function(){
    return this
      .waitForElementVisible('@confirmButtonInCreateNewFolderModal', this.api.globals.smallWait)
      .click('@confirmButtonInCreateNewFolderModal')
      .waitForElementNotPresent('@confirmButtonInCreateNewFolderModal', this.api.globals.smallWait);
  },

  clickCreateFolderButton: function(frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .waitForElementVisible('@createNewFolderButton', this.api.globals.mediumWait)
      .api.pause(2000);

    this
      .moveToElement('@createNewFolderButton', 1, 1)
      .click('@createNewFolderButton')
      .api.frame(null);

    return this
      .waitForElementVisible('@confirmButtonInCreateNewFolderModal', this.api.globals.mediumWait);
  },

  assertItemIsPresentInFilePicker: function(itemName, frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .api.useXpath()
      .waitForElementVisible(util.format(itemTitle, itemName), this.api.globals.longWait)
      .waitForElementVisible(util.format(itemImageHolder, itemName), this.api.globals.longWait)
      .useCss()
      .frame(null);

    return this;
  },

  openFolderInFilePicker: function(itemName, frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .api.useXpath()
      .waitForElementVisible(util.format(itemImageHolder, itemName), this.api.globals.longWait)
      .moveToElement(util.format(itemImageHolder, itemName), 5, 5, function(){
        this.doubleClick();
      })
      .useCss();

    this
      .waitForElementVisible('@backButton', this.api.globals.smallWait)
      .api.frame(null);

    return this;
  },

  assertCorrectFolderIsOpen: function(folderName, frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .waitForElementVisible('@currentImageTitleHolder', this.api.globals.mediumWait)
      .assert.containsText('@currentImageTitleHolder', folderName, `The correct folder ${folderName} is open.`)
      .api.frame(null);

    return this;
  },

  clickSelectFilesButton: function(frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .waitForElementVisible('@selectFilesLink', this.api.globals.mediumWait)
      .click('@selectFilesLink')
      .api.frame(null);

    return this;
  },

  selectFileForUploading: function(fileName, frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .waitForElementPresent('@fileUploadInput', this.api.globals.mediumWait)
      .setValue('@fileUploadInput', `/files/files/${fileName}`)
      .waitForElementNotVisible('@uploadingProgressBar', this.api.globals.longWait)
      .api.frame(null);

    return this;
  },

  selectMultipleItemsInFilePicker: function(name, frameNumber = 1, done){
    this
      .api.perform(() => {
      for(let i = 0; i < name.length; i ++){
        this.selectItemInFilePicker(name[i], frameNumber, () => {
          done();
        });
      }
    });

    return this;
  },

  getIdsOfSelectedFiles: function(ids, frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .waitForElementPresent('@selectedImageHolder', this.api.globals.smallWait)
      .api.elements('css selector', 'div.image.selected', function(result){
      for(let i = 0; i < result.value.length; i ++){
        this.elementIdAttribute(result.value[i].ELEMENT, elementAttributes.DATA_FILE_ID, function(id){
          ids.push(id.value);
        })
      }
    })
      .logTestInfo(ids)
      .frame(null);

    return this;
  },

  assertThatCorrectFileIsSelected: function(itemName, frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .waitForElementPresent('@selectedImageTitle', this.api.globals.mediumWait)
      .assert.containsText('@selectedImageTitle', itemName, `The correct file ${itemName} is selected.`)
      .api.frame(null);

    return this;
  },

  clickSelectAndSaveButton: function(){
    const selectButtonLocator = '(//a[text()="Select" or text()="Select & Save" or text()= "Save"])[last()]';
    const saveAndCloseButtonLocator = '//a[text()="Save & Close"]';
    const resultDisplaying = [];

    this
      .api.frame(null)
      .useXpath()
      .pause(1000)
      .waitForElementVisible(selectButtonLocator, this.api.globals.smallWait)
      .click(selectButtonLocator)
      .waitForElementPresentWithoutErrorsXpath(saveAndCloseButtonLocator, 5000, resultDisplaying)
      .perform(function(){
        if(resultDisplaying[0] == false){
          this.api.click(selectButtonLocator);
        }
      })
      .waitForElementPresent(saveAndCloseButtonLocator, this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  assertCorrectAmountOfSelectedItemsInFilePicker: function(selectedFilesAmount){
    return this
      .waitForElementVisible('@selectedFilesInfo', this.api.globals.smallWait)
      .assert.containsText('@selectedFilesInfo', `${selectedFilesAmount} files selected`,
        `Amount of the selected files is correct ${selectedFilesAmount}.`);
  },

  openAppFolderWithFiles: function(frameNumber = 1){
    this
      .switchToFilePickerFrame(frameNumber)
      .waitForElementPresent('@appFolderLocator', this.api.globals.smallWait)
      .api.pause(1500);

    this
      .click('@appFolderLocator')
      .expect.element('@appFolderLocator').to.be.selected.before(this.api.globals.longWait);

    this
      .api.frame(null);

    return this;
  }
};

module.exports = {
  commands: [commands],
  elements: {
    folderNameInputFieldInCreateNewFolderModal: {
      selector: '//h4[@class="modal-title"][text()="Please enter a folder name"]/ancestor::div//div[@class="bootbox-body"]//input',
      locateStrategy: 'xpath'
    },
    confirmButtonInCreateNewFolderModal: {
      selector: '//h4[@class="modal-title"][text()="Please enter a folder name"]/parent::div/parent::div//button[@data-bb-handler="confirm"]',
      locateStrategy: 'xpath'
    },
    createNewFolderButton: {
      selector: '.btn.btn-link.add-folder-btn i'
    },
    currentImageTitleHolder: {
      selector: '.gallery-tool .helper'
    },
    backButton: {
      selector: '.gallery-tool .back-btn '
    },
    selectFilesLink: {
      selector: 'a.actionUploadFile'
    },
    fileUploadInput: {
      selector: 'input#upload-file'
    },
    selectedImageTitle: {
      selector: 'div.image.selected .image-title'
    },
    selectedImageHolder: {
      selector: 'div.image.selected'
    },
    selectButton: {
      selector: '//a[text()="Select"]',
      locateStrategy: 'xpath'
    },
    uploadingProgressBar: {
      selector: '#uploading-wrapper p'
    },
    fileSourceDropdown: {
      selector: 'select#drop-down-file-source'
    },
    organizationFolderInBrowseFilesDropdown: {
      selector: '//select[@id="drop-down-file-source"]//option[starts-with(@value, "org")]',
      locateStrategy: 'xpath'
    },
    selectedFilesInfo: {
      selector: 'p.info'
    },
    appFolderLocator: {
      selector: '//select[@id="drop-down-file-source"]//option[starts-with(@value, "app")]',
      locateStrategy: 'xpath'
    },
  }
};