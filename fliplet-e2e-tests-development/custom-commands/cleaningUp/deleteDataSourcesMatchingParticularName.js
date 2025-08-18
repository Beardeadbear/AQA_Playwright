exports.command = function (dataSourceName) {
  const allDataSources = this.page.allDataSourcesPage();
  const dataSource = this.page.singleDataSourcePage();
  const locator = `.//*[@class='data-source-name']/span[contains(text(), '${dataSourceName}')]`;
  let names = [];

  allDataSources
    .navigate()
    .waitForDataSourcesPageToBeLoaded();

  allDataSources.waitForElementVisible('@createDataSourceButton', this.globals.mediumWait);

  //Getting all the names of data sources that were created during tests

  this
    .elements('xpath', locator, (result) => {
      for (let i = 0; i < result.value.length; i++) {
        this
          .elementIdText(result.value[i].ELEMENT, (text) => {
            names[i] = text.value;
          })
      }
    });

  //Deleting found data sources

  this.useCss(() => {
    for (let k = 0; k < names.length; k++){

      allDataSources.clickDataSourceByName(names[k]);

      dataSource
        .switchToSettingsTab()
        .clickDeleteButton();
    }
  });

  this
    .useXpath()
    .expect.element(locator).to.not.be.present.after(this.globals.tinyWait);
  this.useCss();

  allDataSources.waitForDataSourcesPageToBeLoaded();
};