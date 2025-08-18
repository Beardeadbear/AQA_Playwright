const casual = require('casual');

module.exports = {
  before: function(browser){
    browser.globals.organizationFolderGenerated = `${casual.word}-${casual.integer(from = 1000, to = 100000)} 01-org-folder`;
    browser.globals.organizationSubfolderGenerated = `${casual.word}-${casual.integer(from = 1000, to = 100000)} 01-org-sub-folder`;

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

  'Create a sub-folder in the organization folder': function(browser){
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

  'Delete the file manager item': function(browser){
    browser
      .deleteFileManagerItem(browser.globals.organizationFolderGenerated);
  }
};