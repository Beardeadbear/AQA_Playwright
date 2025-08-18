const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const fileName = 'icon.png';
const newFileName = `${casual.word}-${casual.day_of_year}.png`;

module.exports = {

  '@reference': 'https://weboo.atlassian.net/browse/OD-121',
  '@reference': 'https://weboo.atlassian.net/browse/OD-112',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 06-file-manager-trash`;

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

  'Create an app, go to File manager and upload a file to the app': function(browser){
    const fileManager = browser.page.fileManagerPage();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
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
      .setNameForFileManager(newFileName)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(newFileName)
      .assertFileManagerItemIsNotPresentInList(fileName);
  },

  'Delete the uploaded file': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(newFileName)
      .tickCheckboxNearFileManagerItem(newFileName)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Restore the deleted file from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(newFileName)
      .tickCheckboxNearFileManagerItem(newFileName)
      .openActionMenuForSingleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(newFileName)
      .acceptFileManagerRestoreCompleteAlert()
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Assert that the restored file from Trash is present in the app': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(newFileName);
  },

  'Delete the uploaded file one more': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.tickCheckboxNearFileManagerItem(newFileName)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Go to Trash, restore the deleted file from Trash and click Go to folder button on the Restore complete alert': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(newFileName)
      .tickCheckboxNearFileManagerItem(newFileName)
      .openActionMenuForSingleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(newFileName)
      .clickGoToFolderOnFileManagerRestoreCompleteAlert();
  },

  /* bug https://weboo.atlassian.net/browse/ID-329
  'Assert that the app folder is open and the restored file from Trash is present there': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(newFileName);
  },
   */

  'Delete the uploaded file one more to remove it forever': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(newFileName)
      .tickCheckboxNearFileManagerItem(newFileName)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Remove the deleted file from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(newFileName)
      .tickCheckboxNearFileManagerItem(newFileName)
      .openActionMenuForSingleSelect()
      .selectDeleteForeverOptionFromActionMenu()
      .confirmFileManagerItemDeletion()
      .assertDeletionCompleteContainsCorrectFileManagerItemName(newFileName)
      .acceptFileManagerDeletionForeverAlert()
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Return to the app folder and check that the deleted forever file is not present there': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Delete the created app': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};