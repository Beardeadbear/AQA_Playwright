const casual = require('casual');
const globals = require('../../globals_path');
const fileName = 'icon.png';

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-121',

  before: function(browser){
    browser.globals.organizationFolderGenerated = `${casual.word}-${casual.integer(from = 1000, to = 100000)} 07-org-multi-trash`;
    browser.globals.organizationFileGenerated = `${casual.word}-${casual.day_of_year}-07-multi-trash.png`;

    browser.login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a folder in the organisation': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .clickNewButton()
      .selectCreateNewFolderForFileManager()
      .setNameForFileManager(browser.globals.organizationFolderGenerated)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated);
  },

  'Upload a file to the organisation': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.selectUploadNewFile()
      .selectFileForUploading(fileName)
      .verifyItemIsPresentInFileManager(fileName);
  },

  'Rename the uploaded file': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.tickCheckboxNearFileManagerItem(fileName)
      .openActionMenuForSingleSelect()
      .selectRenameOptionInActionMenu()
      .setNameForFileManager(browser.globals.organizationFileGenerated)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated);
  },

  'Delete the uploaded file and the folder': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated)
      .tickCheckboxNearFileManagerItemForMultipleSelect(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItemForMultipleSelect(browser.globals.organizationFolderGenerated)
      .openActionMenuForMultipleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated);
  },

  'Restore the deleted file and folder from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated)
      .tickCheckboxNearFileManagerItemForMultipleSelect(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItemForMultipleSelect(browser.globals.organizationFolderGenerated)
      .openActionMenuForMultipleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(2)
      .acceptFileManagerRestoreCompleteAlert()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated);
  },

  'Assert that the restored from Trash file and folder are present in the organization': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated);
  },

  'Delete the uploaded file and the folder to remove them forever': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.tickCheckboxNearFileManagerItemForMultipleSelect(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItemForMultipleSelect(browser.globals.organizationFolderGenerated)
      .openActionMenuForMultipleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated);
  },

  'Remove the deleted file and the folder from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated)
      .tickCheckboxNearFileManagerItemForMultipleSelect(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItemForMultipleSelect(browser.globals.organizationFolderGenerated)
      .openActionMenuForMultipleSelect()
      .selectDeleteForeverOptionFromActionMenu()
      .confirmFileManagerItemDeletion()
      .assertDeletionCompleteContainsCorrectFileManagerItemName(2)
      .acceptFileManagerDeletionForeverAlert()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated);
  },

  'Return to the organization folder and check that the deleted forever file and folder are not present there': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated);
  }
};