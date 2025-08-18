/* Custom command
 * deletes items in File manager and then in Trash,
 * @param {String} fileManagerItemName
 */
exports.command = function(fileManagerItem){
  const fileManagerPage = this.page.fileManagerPage();

  fileManagerPage.navigate()
    .waitForFileManagerPageToBeLoaded()
    .waitForAllFilesToBeLoaded()
    .assertFolderIsOpen(this.globals.organizationName)
    .verifyItemIsPresentInFileManager(fileManagerItem)
    .tickCheckboxNearFileManagerItem(fileManagerItem)
    .openActionMenuForSingleSelect()
    .selectDeleteOptionInActionMenu()
    .confirmFileManagerItemDeletion()
    .confirmMoveToTrashItem()
    .assertFileManagerItemIsNotPresentInList(fileManagerItem)
    .openFileManagerTrash()
    .waitForAllFilesToBeLoaded()
    .assertFolderIsOpen('Trash')
    .verifyItemIsPresentInFileManager(fileManagerItem)
    .tickCheckboxNearFileManagerItem(fileManagerItem)
    .openActionMenuForSingleSelect()
    .selectDeleteForeverOptionFromActionMenu()
    .confirmFileManagerItemDeletion()
    .acceptFileManagerDeletionForeverAlert()
    .assertFileManagerItemIsNotPresentInList(fileManagerItem);
};
