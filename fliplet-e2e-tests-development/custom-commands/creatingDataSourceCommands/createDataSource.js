exports.command = function (dataSourceName) {
  const allDataSources = this.page.allDataSourcesPage();
  const dataSource = this.page.singleDataSourcePage();

  allDataSources.navigate()
    .waitForDataSourcesPageToBeLoaded()
    .clickCreateDataSourceButton()
    .setValueInDataSourceModal(dataSourceName)
    .clickConfirmButtonInDataSourceModal();

  dataSource.assertCorrectDataSourceIsOpenedByName(dataSourceName);
};