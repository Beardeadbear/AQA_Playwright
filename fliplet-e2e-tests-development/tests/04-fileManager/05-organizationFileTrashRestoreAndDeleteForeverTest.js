const casual = require('casual');
const globals = require('../../globals_path');
const fileName = 'icon.png';

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-121',
  '@reference': 'https://weboo.atlassian.net/browse/OD-112',

  before: function(browser){
    browser.globals.organizationFileGenerated = `${casual.word}-${casual.day_of_year}-05-trash.png`;

    browser.login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Upload a file to the organisation': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .clickNewButton()
      .selectUploadNewFile()
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

  'Delete the uploaded file': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFileGenerated)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated);
  },

  'Restore the deleted file from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFileGenerated)
      .openActionMenuForSingleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(browser.globals.organizationFileGenerated)
      .acceptFileManagerRestoreCompleteAlert()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated);
  },

  'Assert that the restored file from Trash is present in the organization': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated);
  },

  'Delete the uploaded file one more to click Go to folder after the file restore': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFileGenerated)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated);
  },

  'Go to Trash, restore the deleted file from Trash and click Go to folder button on the Restore complete alert': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFileGenerated)
      .openActionMenuForSingleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(browser.globals.organizationFileGenerated)
      .clickGoToFolderOnFileManagerRestoreCompleteAlert();
  },

  /* bug https://weboo.atlassian.net/browse/ID-329
  'Assert that the organization folder is open and the restored file from Trash is present there': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated);
  },
  */

  'Delete the uploaded file to delete it forever': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFileGenerated)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated);
  },

  'Remove the deleted file from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(browser.globals.organizationFileGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFileGenerated)
      .openActionMenuForSingleSelect()
      .selectDeleteForeverOptionFromActionMenu()
      .confirmFileManagerItemDeletion()
      .assertDeletionCompleteContainsCorrectFileManagerItemName(browser.globals.organizationFileGenerated)
      .acceptFileManagerDeletionForeverAlert()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated);
  },

  'Return to the organization folder and check that the deleted forever file is not present there': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFileGenerated);
  }
};