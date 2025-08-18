const elementAttributes = require('../utils/constants/elementAttributes');
const values = require('../utils/constants/values');
const util = require('util');
const fileManagerItem = '.file-name';
const itemInFileManagerList = '//div[@class="file-name"]/span[starts-with(text(), "%s")]';
const applicationTitleInFileManagerLeftsidePanel = '//div[@class="list-text-holder"]/span[text()="%s"]';
const fileManagerItemId = '//div[@class="file-cell folder-result-cell file-id-cell"]/span[text()="%s"]';
const rowInFilesTableWithFileManagerItem = '//div[@class="file-name"]/span[starts-with(text(), "%s")]/ancestor::div[starts-with(@class,"file-row")]';
const checkboxNearItemInFileManagerTable = '//div[@class="file-name"]/span[starts-with(text(), "%s")]/ancestor::div[starts-with(@class,"file-row")]//label/span';

const commands = {
  waitForFileManagerPageToBeLoaded: function(){
    this
      .api.frame(null)
      .switchToWidgetProviderFrame();

        this
            .expect.section('@fileManagerLeftsidePanelWithAppsList').to.be.visible.before(this.api.globals.longWait);
        this
            .expect.section('@fileManagerItemsList').to.be.visible.before(this.api.globals.longWait);
        this
            .expect.section('@fileManagerRightsidePanelWithDropdownMenu').to.be.visible.before(this.api.globals.longWait);

        return this;
    },

    waitForAllFilesToBeLoaded: function () {
        this
            .waitForAjaxCompleted()
            .api.pause(3000)
            .elements('css selector', fileManagerItem, function (result) {
                if (result.value.length > 0)
                    this.assertAmountOfElementsVisible(fileManagerItem, result.value.length);
                else {
                    this.logTestInfo('There is not any item in the current File Manager folder.')
                }
            });

        return this;
    },

    clickNewButton: function () {
        this
            .api.pause(5000);

        return this
            .waitForElementVisible('@newButton', this.api.globals.smallWait)
            .click('@newButton')
            .waitForElementVisible('@activeMenuForCreatingNewItem', this.api.globals.smallWait)
            .waitForAjaxCompleted();
    },

    selectCreateNewFolderForFileManager: function () {
        this
            .waitForElementVisible('@createNewFolder', this.api.globals.smallWait)
            .click('@createNewFolder')
            .api.frame(null);

        return this
            .waitForElementVisible('@inputFieldInFileManagerModal', this.api.globals.smallWait);
    },

    setNameForFileManager: function (folderName) {
        this
            .waitForElementVisible('@inputFieldInFileManagerModal', this.api.globals.smallWait)
            .clearValue('@inputFieldInFileManagerModal')
            .setValue('@inputFieldInFileManagerModal', folderName)
            .api.pause(1000);

        return this;
    },

    confirmCreatingForFileManager: function () {
        return this
            .waitForElementVisible('@confirmButtonInFileManagerModal', this.api.globals.smallWait)
            .click('@confirmButtonInFileManagerModal')
            .waitForElementNotPresent('@confirmButtonInFileManagerModal', this.api.globals.smallWait)
            .switchToWidgetProviderFrame();
    },

    verifyItemIsPresentInFileManager: function (fileManagerItemName) {
        this
            .api.useXpath()
            .waitForElementVisible(util.format(itemInFileManagerList, fileManagerItemName), this.api.globals.longWait)
            .useCss();

        return this;
    },

    verifyItemIsPresentInFileManagerById: function (fileId) {
        this
            .api.useXpath()
            .waitForElementVisible(util.format(fileManagerItemId, fileId), this.api.globals.mediumWait)
            .useCss();

        return this;
    },

    openFolderUsingDoubleClickByName: function (fileManagerItemName) {
        this
            .api.useXpath()
            .waitForElementVisible(util.format(itemInFileManagerList, fileManagerItemName), this.api.globals.smallWait)
            .useCss()
            .element('xpath', util.format(itemInFileManagerList, fileManagerItemName), function (result) {
                this
                    .moveTo(result.value.ELEMENT)
                    .doubleClick();
            });

        return this;
    },

    assertThatFolderIsEmpty: function () {
        return this
            .waitForElementPresent('@emptyFolderContent', this.api.globals.smallWait)
            .assert.visible('@emptyFolderContent', 'The folder is empty.');
    },

    assertFileManagerItemIsNotPresentInList: function (fileManagerItemName) {
        this
            .api.useXpath()
            .assert.elementNotPresent(util.format(itemInFileManagerList, fileManagerItemName),
            `The item with name ${fileManagerItemName} is not present in File Manager.`)
            .useCss();

        return this;
    },

    selectAppFromListByTitle: function (applicationName) {
        this
            .api.pause(3000)
            .useXpath()
            .waitForElementVisible(util.format(applicationTitleInFileManagerLeftsidePanel, applicationName), this.api.globals.smallWait)
            .useCss()
            .element('xpath', util.format(applicationTitleInFileManagerLeftsidePanel, applicationName), (elements) => {
                this.api
                    .moveTo(elements.value.ELEMENT)
                    .mouseButtonClick(0)
            });

        return this;
    },

    assertFolderIsOpen: function (folderName) {
        return this
            .assert.containsText('@currentFolderTitle', folderName, `The folder ${folderName} is open.`)
    },

    tickCheckboxNearFileManagerItem: function (fileManagerItemName) {
        this
            .api.useXpath()
            .waitForElementVisible(util.format(rowInFilesTableWithFileManagerItem, fileManagerItemName), this.api.globals.tinyWait)
            .click(util.format(rowInFilesTableWithFileManagerItem, fileManagerItemName))
            .assert.attributeContains(util.format(rowInFilesTableWithFileManagerItem, fileManagerItemName), elementAttributes.CLASS,
            values.ACTIVE)
            .useCss();

        return this;
    },

    tickCheckboxNearFileManagerItemForMultipleSelect: function (fileManagerItemName) {
        this
            .api.useXpath()
            .waitForElementVisible(util.format(itemInFileManagerList, fileManagerItemName), this.api.globals.tinyWait)
            .moveToElement(util.format(itemInFileManagerList, fileManagerItemName), 1, 1)
            .waitForElementPresent(util.format(checkboxNearItemInFileManagerTable, fileManagerItemName), this.api.globals.tinyWait)
            .click(util.format(checkboxNearItemInFileManagerTable, fileManagerItemName))
            .assert.attributeContains(util.format(rowInFilesTableWithFileManagerItem, fileManagerItemName), elementAttributes.CLASS,
            values.ACTIVE)
            .useCss();

        return this;
    },

    openActionMenuForSingleSelect: function () {
        return this
            .waitForElementVisible('@actionButtonForSingleSelect', this.api.globals.smallWait)
            .click('@actionButtonForSingleSelect')
            .waitForElementVisible('@actionDropdownMenuForSingleSelect', this.api.globals.smallWait);
    },

    openActionMenuForMultipleSelect: function () {
        return this
            .waitForElementVisible('@actionButtonForMultipleSelect', this.api.globals.smallWait)
            .click('@actionButtonForMultipleSelect')
            .waitForElementVisible('@actionDropdownMenuForMultipleSelect', this.api.globals.smallWait);
    },

    selectOpenOptionInActionMenu: function () {
        return this
            .waitForElementVisible('@openItemInActionMenu', this.api.globals.smallWait)
            .click('@openItemInActionMenu');
    },

    selectRenameOptionInActionMenu: function () {
        this
            .waitForElementVisible('@renameItemInActionMenu', this.api.globals.smallWait)
            .click('@renameItemInActionMenu')
            .api.frame(null);

        return this
            .waitForElementVisible('@inputFieldInFileManagerModal', this.api.globals.smallWait);
    },

    selectDeleteOptionInActionMenu: function () {
        return this
            .waitForElementVisible('@deleteItemInActionMenu', this.api.globals.smallWait)
            .click('@deleteItemInActionMenu');
    },

    selectDeleteForeverOptionFromActionMenu: function () {
        return this
            .waitForElementVisible('@deleteForeverItemInActionDropdown', this.api.globals.smallWait)
            .click('@deleteForeverItemInActionDropdown');
    },

    selectRestoreOptionFromActionMenu: function () {
        return this
            .waitForElementVisible('@restoreItemInActionDropdown', this.api.globals.smallWait)
            .click('@restoreItemInActionDropdown');
    },

  confirmFileManagerItemDeletion: function(){
      this
          .api.frame(null);
      this
          .api.pause(1000);
      return this
          .click('@confirmButtonInFileManagerModal')
  },

    confirmMoveToTrashItem: function(){
        this
            .api.pause(1000);
        return this
            .click('@confirmButtonInFileManagerModal')
            .switchToWidgetProviderFrame();
  },

    tickSelectAllCheckbox: function () {
        return this
            .waitForElementVisible('@selectAllItemsCheckbox', this.api.globals.smallWait)
            .click('@selectAllItemsCheckbox');
    },

    selectUploadNewFile: function () {
        return this
            .waitForElementVisible('@uploadNewFile', this.api.globals.smallWait)
            .click('@uploadNewFile');
    },

    selectFileForUploading: function (fileManagerItemName, done) {
        this
            .waitForElementPresent('@inputFileUpload', this.api.globals.mediumWait)
            .setValue('@inputFileUpload', `/files/files/${fileManagerItemName}`)
            .waitForElementNotPresent('@uploadFileProgressBar', this.api.globals.longWait);

        this
            .checkIfFileUploaded(fileManagerItemName, () => {
                done();
            });

        return this;
    },

    checkThatSelectedImageIsOpen: function (fileName) {
        this
            .api.pause(1000);

        return this
            .switchToOpenedWindow()
            .waitForElementVisible('@openImage', this.api.globals.smallWait)
            .assert.attributeContains('@openImage', elementAttributes.SRC, fileName);
    },

    openFileManagerTrash: function () {
        return this
            .waitForElementVisible('@trashButton', this.api.globals.smallWait)
            .click('@trashButton')
            .assert.attributeContains('@trashButton', elementAttributes.CLASS, values.ACTIVE);
    },

  acceptFileManagerDeletionForeverAlert: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@okButtonOnDeletionFromTrashAlert', this.api.globals.smallWait)
      .click('@okButtonOnDeletionFromTrashAlert')
      .waitForElementNotPresent('@okButtonOnDeletionFromTrashAlert', this.api.globals.smallWait)
      .switchToWidgetProviderFrame();
  },

  acceptFileManagerRestoreCompleteAlert: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@okButtonOnRestoreCompleteAlert', this.api.globals.smallWait)
      .click('@okButtonOnRestoreCompleteAlert')
      .waitForElementNotPresent('@okButtonOnRestoreCompleteAlert', this.api.globals.smallWait)
      .switchToWidgetProviderFrame();
  },

  clickGoToFolderOnFileManagerRestoreCompleteAlert: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@gotoFolderButtonOnRestoreCompleteAlert', this.api.globals.smallWait)
      .click('@gotoFolderButtonOnRestoreCompleteAlert')
      .waitForElementNotPresent('@gotoFolderButtonOnRestoreCompleteAlert', this.api.globals.smallWait)
      .switchToWidgetProviderFrame();
  },

  assertRestoreCompleteContainsCorrectFileManagerItemName: function(fileManagerItemName){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@fileManagerItemNameInRestoreCompleteAlert', this.api.globals.smallWait)
      .assert.containsText('@fileManagerItemNameInRestoreCompleteAlert', fileManagerItemName)
      .switchToWidgetProviderFrame();
  },

  assertDeletionCompleteContainsCorrectFileManagerItemName: function(fileManagerItemName){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@fileManagerItemNameInDeletionCompleteAlert', this.api.globals.smallWait)
      .assert.containsText('@fileManagerItemNameInDeletionCompleteAlert', fileManagerItemName)
      .switchToWidgetProviderFrame();
  },

    checkIfFileUploaded: function (fileName) {
        const itemInFileManagerList = `//div[@class="file-name"]/span[starts-with(text(), "${fileName}")]`;
        const resultDisplaying = [];

        this
            .waitForElementPresentWithoutErrorsXpath(itemInFileManagerList, 10000, resultDisplaying)
            .api.perform(function () {
            if (resultDisplaying[0] === false) { // check if file doesn't exist
                this.api.element('css selector', '.new-menu.active', function (result) {
                    if (result.status !== 0) { //check if Action dropdown menu is open
                        this
                            .waitForElementVisible('.btn-primary.new-btn', this.globals.smallWait)
                            .click('.btn-primary.new-btn')
                    }
                })
                    .waitForElementVisible('#choose-file', this.api.globals.smallWait)
                    .click('#choose-file')
                    .waitForElementPresent('input#file_upload', this.api.globals.mediumWait)
                    .pause(1500)
                    .setValue('input#file_upload', `/files/files/${fileName}`);
            }
        });

        return this
            .waitForElementNotPresent('@uploadFileProgressBar', this.api.globals.longWait);
    }
};

module.exports = {
    url: function () {
        return this.api.launchUrl + '/file-manager';
    },
    commands: [commands],
    sections: {
        fileManagerLeftsidePanelWithAppsList: {
            selector: '.file-manager-leftside'
        },
        fileManagerItemsList: {
            selector: '.file-table'
        },
        fileManagerRightsidePanelWithDropdownMenu: {
            selector: '.file-manager-rightside'
        }
    },
    elements: {
        newButton: {
            selector: '.btn-primary.new-btn'
        },
        createNewFolder: {
            selector: '.new-menu.active li:nth-child(1)'
        },
        emptyFolderContent: {
            selector: '.empty-state.active'
        },
        uploadNewFile: {
            selector: '#choose-file'
        },
        activeMenuForCreatingNewItem: {
            selector: '.new-menu.active'
        },
        actionButtonForSingleSelect: {
            selector: '.item-actions .single-item  button'
        },
        actionButtonForMultipleSelect: {
            selector: '.item-actions .multiple-item  button'
        },
        actionDropdownMenuForSingleSelect: {
            selector: '.item-actions .single-item .dropdown-menu'
        },
        actionDropdownMenuForMultipleSelect: {
            selector: '.item-actions .multiple-item .dropdown-menu'
        },
        openItemInActionMenu: {
            selector: '.btn-group.open .dropdown-menu a[open-action]'
        },
        renameItemInActionMenu: {
            selector: '.btn-group.open .dropdown-menu a[rename-action]'
        },
        trashButton: {
            selector: '.trash-holder.list-holder .list-text-holder span'
        },
        currentFolderTitle: {
            selector: '(//div[@class="current-folder-title"]//a)[last()]',
            locateStrategy: 'xpath'
        },
        selectAllItemsCheckbox: {
            selector: 'label[for="select_all"] .check'
        },
        deleteItemInActionMenu: {
            selector: '.btn-group.open .dropdown-menu [delete-action]'
        },
        restoreItemInActionDropdown: {
            selector: '.btn-group.open .dropdown-menu a[restore-action]'
        },
        deleteForeverItemInActionDropdown: {
            selector: '.btn-group.open .dropdown-menu [file-remove-trash]'
        },
        gotoFolderButtonOnRestoreCompleteAlert: {
            selector: '//h4[@class="modal-title"][text()="Restore complete"]/ancestor::div//button[@data-bb-handler="cancel"]',
            locateStrategy: 'xpath'
        },
        okButtonOnRestoreCompleteAlert: {
            selector: '//h4[@class="modal-title"][text()="Restore complete"]/ancestor::div//button[text()="OK"]',
            locateStrategy: 'xpath'
        },
        okButtonOnDeletionFromTrashAlert: {
            selector: '//*[@class="modal-title"][text()="Deletion complete"]/ancestor::div//button[@data-bb-handler="ok"]',
            locateStrategy: 'xpath'
        },
        confirmButtonInFileManagerModal: {
            selector: 'button[data-bb-handler=confirm]'
        },
        cancelButtonInFileManagerModal: {
            selector: 'button[data-bb-handler=cancel]'
        },
        inputFieldInFileManagerModal: {
            selector: '.bootbox-input.bootbox-input-text.form-control'
        },
        inputFileUpload: {
            selector: 'input#file_upload'
        },
        openImage: {
            selector: 'img'
        },
        uploadFileProgressBar: {
            selector: 'div[class="progress"]'
        },
        fileManagerItemNameInRestoreCompleteAlert: {
            selector: '//h4[@class="modal-title"][text()="Restore complete"]/ancestor::div//div[@class="bootbox-body"]',
            locateStrategy: 'xpath'
        },
        fileManagerItemNameInDeletionCompleteAlert: {
            selector: '//h4[@class="modal-title"][text()="Deletion complete"]/ancestor::div//div[@class="bootbox-body"]',
            locateStrategy: 'xpath'
        },
    }
};
