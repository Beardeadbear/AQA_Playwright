const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const appFolder = `${casual.word}-${casual.integer(from = 1000, to = 100000)} 04-app-folder-trash`;
const fileName = 'icon.png';
const newFileName = `${casual.word}-${casual.day_of_year}.png`;

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-121',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 04-file-manager-trash`;

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

  'Create an app, go to File manager and create a folder in the app': function(browser){
    const fileManager = browser.page.fileManagerPage();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK);

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .clickNewButton()
      .selectCreateNewFolderForFileManager(appFolder)
      .setNameForFileManager(appFolder)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(appFolder);
  },

  'Upload a file to the created folder': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.tickCheckboxNearFileManagerItem(appFolder)
      .openActionMenuForSingleSelect()
      .selectOpenOptionInActionMenu()
      .assertFolderIsOpen(appFolder)
      .assertThatFolderIsEmpty()
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
      .verifyItemIsPresentInFileManager(newFileName);
  },

  'Delete the created folder with the file': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(appFolder)
      .tickCheckboxNearFileManagerItem(appFolder)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(appFolder)
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Restore the deleted folder with the file from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(appFolder)
      .tickCheckboxNearFileManagerItem(appFolder)
      .openActionMenuForSingleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(appFolder)
      .acceptFileManagerRestoreCompleteAlert()
      .assertFileManagerItemIsNotPresentInList(appFolder)
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Assert that the restored folder from Trash is present in the app folder': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(appFolder);
  },

  'Open the restored folder from Trash and check that the file is restored as well': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFolderUsingDoubleClickByName(appFolder)
      .assertFolderIsOpen(appFolder)
      .verifyItemIsPresentInFileManager(newFileName);
  },

  'Delete the created folder with the file once more to click Go to folder after restore': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(appFolder)
      .tickCheckboxNearFileManagerItem(appFolder)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(appFolder)
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Restore the deleted folder with the file from Trash and click Go to folder button on the Restore complete alert': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(appFolder)
      .tickCheckboxNearFileManagerItem(appFolder)
      .openActionMenuForSingleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(appFolder)
      .clickGoToFolderOnFileManagerRestoreCompleteAlert();
  },
  /* bug https://weboo.atlassian.net/browse/ID-329
    'Assert that the app folder is open and the restored folder with the file from Trash is present there': function(browser){
      const fileManager = browser.page.fileManagerPage();

      fileManager.assertFolderIsOpen(browser.globals.appNameGenerated)
        .verifyItemIsPresentInFileManager(appFolder);
    },

    'Open the restored folder from Trash once more and check that the file is restored as well': function(browser){
      const fileManager = browser.page.fileManagerPage();

      fileManager.openFolderUsingDoubleClickByName(appFolder)
        .assertFolderIsOpen(appFolder)
        .verifyItemIsPresentInFileManager(newFileName);
    },
   */

  'Delete the created folder with the file to remove it forever': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(appFolder)
      .tickCheckboxNearFileManagerItem(appFolder)
      .openActionMenuForSingleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(appFolder)
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Remove the deleted folder with the file from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(appFolder)
      .tickCheckboxNearFileManagerItem(appFolder)
      .openActionMenuForSingleSelect()
      .selectDeleteForeverOptionFromActionMenu()
      .confirmFileManagerItemDeletion()
      .assertDeletionCompleteContainsCorrectFileManagerItemName(appFolder)
      .acceptFileManagerDeletionForeverAlert()
      .assertFileManagerItemIsNotPresentInList(appFolder)
      .assertFileManagerItemIsNotPresentInList(newFileName);
  },

  'Return to the organization folder and check that the deleted forever folder and the file are not present there ': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .assertFileManagerItemIsNotPresentInList(appFolder)
    // .assertFileManagerItemIsNotPresentInList(appSubFolder); bug https://weboo.atlassian.net/browse/ID-329
  },

  'Delete the created app': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};