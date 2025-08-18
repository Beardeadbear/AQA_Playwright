const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const appFolder = `${casual.word}-${casual.integer(from = 1000, to = 100000)} 02-app-folder`;
const appSubFolder = `${casual.word}-${casual.integer(from = 1000, to = 100000)} 02-app-sub-folder`;
const fileName = 'icon.png';

module.exports = {
  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.title} 02-file-manager`;

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

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    fileManager.navigate()
      .waitForFileManagerPageToBeLoaded()
      .waitForAllFilesToBeLoaded()
      .assertFolderIsOpen(browser.globals.organizationName)
      .selectAppFromListByTitle(browser.globals.appNameGenerated)
      .assertFolderIsOpen(browser.globals.appNameGenerated)
      .assertThatFolderIsEmpty()
      .clickNewButton()
      .selectCreateNewFolderForFileManager(appFolder)
      .setNameForFileManager(appFolder)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(appFolder);
  },

  'Create a sub-folder in the app folder': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.tickCheckboxNearFileManagerItem(appFolder)
      .openActionMenuForSingleSelect()
      .selectOpenOptionInActionMenu()
      .assertFolderIsOpen(appFolder)
      .assertThatFolderIsEmpty()
      .clickNewButton()
      .selectCreateNewFolderForFileManager(appSubFolder)
      .setNameForFileManager(appSubFolder)
      .confirmCreatingForFileManager()
      .verifyItemIsPresentInFileManager(appSubFolder);
  },

  'Upload a file to the created sub-folder': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.tickCheckboxNearFileManagerItem(appSubFolder)
      .openActionMenuForSingleSelect()
      .selectOpenOptionInActionMenu()
      .assertFolderIsOpen(appSubFolder)
      .assertThatFolderIsEmpty()
      .clickNewButton()
      .selectUploadNewFile()
      .selectFileForUploading(fileName)
      .verifyItemIsPresentInFileManager(fileName);
  },

  'Check the uploaded file': function(browser){
    const fileManager = browser.page.fileManagerPage();

    fileManager.tickCheckboxNearFileManagerItem(fileName)
      .openActionMenuForSingleSelect()
      .selectOpenOptionInActionMenu()
      .checkThatSelectedImageIsOpen(fileName);
  },

  'Delete the created app': function(browser){ // File manager items (files and folder) that were created under applications are deleted with them
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};