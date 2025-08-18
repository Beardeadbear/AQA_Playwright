const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const fileName = 'icon.png';
const appFolder = `${casual.word}-${casual.integer(from = 1000, to = 100000)} 08-org-multi-trash`;
const newFileName = `${casual.word}-${casual.day_of_year}-08-multi-trash.png`;

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),
  '@reference': 'https://weboo.atlassian.net/browse/OD-121',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 08-file-manager-trash`;

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

  'Upload a file to the app': function(browser){
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
      .setNameForFileManager(newFileName)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(newFileName);
  },

  'Delete the uploaded file and the folder from the app': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(newFileName)
      .verifyItemIsPresentInFileManager(appFolder)
      .tickCheckboxNearFileManagerItemForMultipleSelect(newFileName)
      .tickCheckboxNearFileManagerItemForMultipleSelect(appFolder)
      .openActionMenuForMultipleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(newFileName)
      .assertFileManagerItemIsNotPresentInList(appFolder);
  },

  'Restore the deleted file and folder from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(newFileName)
      .verifyItemIsPresentInFileManager(appFolder)
      .tickCheckboxNearFileManagerItemForMultipleSelect(newFileName)
      .tickCheckboxNearFileManagerItemForMultipleSelect(appFolder)
      .openActionMenuForMultipleSelect()
      .selectRestoreOptionFromActionMenu()
      .assertRestoreCompleteContainsCorrectFileManagerItemName(2)
      .acceptFileManagerRestoreCompleteAlert()
      .assertFileManagerItemIsNotPresentInList(newFileName)
      .assertFileManagerItemIsNotPresentInList(appFolder);
  },

  'Assert that the restored from Trash file and folder are present in the app': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .verifyItemIsPresentInFileManager(newFileName)
      .verifyItemIsPresentInFileManager(appFolder);
  },

  'Delete the uploaded file and the folder to remove them forever': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.tickCheckboxNearFileManagerItemForMultipleSelect(newFileName)
      .tickCheckboxNearFileManagerItemForMultipleSelect(appFolder)
      .openActionMenuForMultipleSelect()
      .selectDeleteOptionInActionMenu()
      .confirmFileManagerItemDeletion()
      .assertFileManagerItemIsNotPresentInList(newFileName)
      .assertFileManagerItemIsNotPresentInList(appFolder);
  },

  'Remove the deleted file and the folder from Trash': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.openFileManagerTrash()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen('Trash')
      .verifyItemIsPresentInFileManager(newFileName)
      .verifyItemIsPresentInFileManager(appFolder)
      .tickCheckboxNearFileManagerItemForMultipleSelect(newFileName)
      .tickCheckboxNearFileManagerItemForMultipleSelect(appFolder)
      .openActionMenuForMultipleSelect()
      .selectDeleteForeverOptionFromActionMenu()
      .confirmFileManagerItemDeletion()
      .assertDeletionCompleteContainsCorrectFileManagerItemName(2)
      .acceptFileManagerDeletionForeverAlert()
      .assertFileManagerItemIsNotPresentInList(newFileName)
      .assertFileManagerItemIsNotPresentInList(appFolder);
  },

  'Return to the app folder and check that the deleted forever file and folder are not present there': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .assertFileManagerItemIsNotPresentInList(newFileName)
      .assertFileManagerItemIsNotPresentInList(appFolder);
  },

  'Delete the created app': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};