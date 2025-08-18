/* Custom command
 * opens Data Source Manager and switches to Trash,
 * gets names of all data sources that correspond the specified value in Trash,
 * deletes all found data sources in Trash.
 * @param {String} dataSourceName - data source name
 */
exports.command = function(dataSourceName){
  const allDataSources = this.page.allDataSourcesPage();
  const dataSourceTitleInTrash = `//tr[@class='data-source']/td[@class="data-source-name"][contains(text(), '${dataSourceName}')]`;
  let dataSourcesNames = [];
  const amountOfDataSourceInTrashWithTheSameName = [];

  //Opening Data Source Manager and switching to Trash
  allDataSources.navigate()
    .waitForDataSourcesPageToBeLoaded()
    .clickTrashButton();

  //Getting names of all data sources that correspond the specified value in Trash
  this.elements('xpath', dataSourceTitleInTrash, (result) => {
    for(let i = 0; i < result.value.length; i ++){
      this
        .elementIdText(result.value[i].ELEMENT, (text) => {
          dataSourcesNames[i] = text.value;
        });
    }
  });

  //Deleting all found data sources in Trash
  this.perform(() => {
    for(let k = 0; k < dataSourcesNames.length; k ++){
      allDataSources.getAmountOfDataSourceWithTheSameNameInTrash(dataSourcesNames[k], amountOfDataSourceInTrashWithTheSameName);
      allDataSources.clickActionsButtonForTrashedDataSource(dataSourcesNames[k])
        .selectDeleteForeverOptionInDataSourceActionsDropdown(dataSourcesNames[k])
        .setValueInDataSourceModal(dataSourcesNames[k])
        .clickConfirmButtonInDataSourceModal()
        .acceptDeletionCompleteAlert();

      this.perform(() => {
        allDataSources.assertDataSourceHasBeenRemovedFromTrash(dataSourcesNames[k],
          amountOfDataSourceInTrashWithTheSameName.pop());
      })
    }
  });
}