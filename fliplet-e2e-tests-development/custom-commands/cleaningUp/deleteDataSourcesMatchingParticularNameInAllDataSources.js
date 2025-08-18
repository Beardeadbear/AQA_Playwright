/* Custom command
 * opens Data Source Manager,
 * gets names of all data sources that correspond the specified value,
 * deletes all found data sources.
 * @param {String} dataSourceName - data source name
 */
exports.command = function(dataSourceName){
  const allDataSources = this.page.allDataSourcesPage();
  const dataSourceTitle = `.//*[@class='data-source-name']/span[contains(text(), '${dataSourceName}')]`;
  let dataSourcesNames = [];
  const amountOfDataSourceWithTheSameName = [];

  //Opening Data Source Manager
  allDataSources.navigate()
    .waitForDataSourcesPageToBeLoaded();

  //Getting names of all data sources that correspond the specified value
  this.elements('xpath', dataSourceTitle, (result) => {
    for(let i = 0; i < result.value.length; i ++){
      this
        .elementIdText(result.value[i].ELEMENT, (text) => {
          dataSourcesNames[i] = text.value;
        });
    }
  });

  //Deleting found data sources
  this.perform(() => {
    for(let k = 0; k < dataSourcesNames.length; k ++){
      allDataSources.getAmountOfDataSourceWithTheSameName(dataSourcesNames[k], amountOfDataSourceWithTheSameName);
      allDataSources.clickActionsButtonForDataSource(dataSourcesNames[k])
        .selectDeleteOptionInDataSourceActionsDropdown(dataSourcesNames[k])
        .acceptDeleteDataSourceModal()
        .waitForDataSourcesPageToBeLoaded();

      this.perform(() => {
        allDataSources.assertDataSourceHasBeenRemovedFromList(dataSourcesNames[k],
          amountOfDataSourceWithTheSameName.pop());
      });
    }
  });
};