const casual = require('casual');

module.exports = {

  '@reference': 'https://weboo.atlassian.net/browse/OD-121',

  before: function(browser){
    browser.globals.organizationFolderGenerated = `${casual.word}-${casual.integer(from = 1000, to = 100000)} 03-org-folder-trash`;
    browser.globals.organizationSubfolderGenerated = `${casual.word}-${casual.integer(from = 1000, to = 100000)} 03-org-sub-folder-trash`;

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

  'Create a subfolder in the organization folder': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFolderUsingDoubleClickByName(browser.globals.organizationFolderGenerated)
      .assertFolderIsOpen(browser.globals.organizationFolderGenerated)
      .assertThatFolderIsEmpty()
      .clickNewButton()
      .selectCreateNewFolderForFileManager()
      .setNameForFileManager(browser.globals.organizationSubfolderGenerated)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(browser.globals.organizationSubfolderGenerated);
  },

  'Delete the created folder with subfolder': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFolderGenerated)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated);
  },

  'Restore the deleted folder from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFolderGenerated)
      .openActionMenuForSingleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(browser.globals.organizationFolderGenerated)
      .acceptFileManagerRestoreCompleteAlert()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationSubfolderGenerated);
  },

  'Assert that the restored folder from Trash is present in the organization': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated);
  },

  'Open the restored folder from Trash and check that the sub-folder is restored as well': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFolderUsingDoubleClickByName(browser.globals.organizationFolderGenerated)
      .assertFolderIsOpen(browser.globals.organizationFolderGenerated)
      .verifyItemIsPresentInFileManager(browser.globals.organizationSubfolderGenerated);
  },

  'Delete the created folder with the file once more to click Go to folder after restore': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFolderGenerated)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated);
  },

  'Restore the deleted folder with the file from Trash and click Go to folder button on the Restore complete alert': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFolderGenerated)
      .openActionMenuForSingleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(browser.globals.organizationFolderGenerated)
      .clickGoToFolderOnFileManagerRestoreCompleteAlert();
  },

  'Assert that the organization folder is open and the restored folder with the file from Trash is present there': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated);
  },

  'Open the restored folder from Trash for the second time and check that the file is restored as well': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFolderUsingDoubleClickByName(browser.globals.organizationFolderGenerated)
      .assertFolderIsOpen(browser.globals.organizationFolderGenerated)
      .verifyItemIsPresentInFileManager(browser.globals.organizationSubfolderGenerated);
  },

  'Delete the created folder with the file once more to remove it forever': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFolderGenerated)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated);
  },

  'Remove the deleted folder with subfolder from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(browser.globals.organizationFolderGenerated)
      .tickCheckboxNearFileManagerItem(browser.globals.organizationFolderGenerated)
      .openActionMenuForSingleSelect()
      .selectDeleteForeverOptionFromActionMenu()
      .confirmFileManagerItemDeletion()
      .assertDeletionCompleteContainsCorrectFileManagerItemName(browser.globals.organizationFolderGenerated)
      .acceptFileManagerDeletionForeverAlert()
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationSubfolderGenerated);
  },

  'Return to the organization folder and check that the deleted forever folder and subfolder are not present there ': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .assertFileManagerItemIsNotPresentInList(browser.globals.organizationFolderGenerated)
    // .assertFileManagerItemIsNotPresentInList(browser.globals.organizationSubfolderGenerated); bug https://weboo.atlassian.net/browse/ID-329
  }
};