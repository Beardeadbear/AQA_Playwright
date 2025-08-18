const elementAttributes = require('../utils/constants/elementAttributes');
const values = require('../utils/constants/values');
const util = require('util');
const dataSourceTitleInList = '//td[@class="data-source-name"]/span[text()="%s"]';
const dataSourceIdLocatorInDataSourcesListByName = '//td[@class="data-source-name"]/span[text()="%s"]/parent::td/parent::tr/td[@class="data-source-id"]';
const dataSourceTitleInTrashedList = '//tr[@class="data-source"]/td[text()="%s"]';
const actionsButtonForDataSource = '//td/span[text()="%s"]/parent::td/following-sibling::td//button[contains(@class,"dropdown")]';
const actionsButtonForTrashedDataSource = '//td[text()="%s"]/parent::tr//button[contains(@class,"dropdown")]';
const editOptionInActionsDropdown = '//td/span[text()="%s"]/parent::td/following-sibling::td//a[text()="Edit"]';
const deleteOptionInActionsDropdown = '//td/span[text()="%s"]/parent::td/following-sibling::td//span[text()="Delete"]';
const deleteForeverOptionInActionsDropdown = '//td[text()="%s"]/parent::tr//span[@class="remove-item"]';
const restoreForeverOptionInActionsDropdown = '//td[text()="%s"]/parent::tr//a[text()="Restore"]';
const dataSourceTitleInRestoreCompleteAlert = '//div[@class="bootbox-body"][contains(text(),"%s")]';

const commands = {
  clickCreateDataSourceButton: function(){
    this
      .waitForElementVisible('@createDataSourceButton', this.api.globals.mediumWait)
      .click('@createDataSourceButton')
      .api.frame(null);

    return this
      .waitForElementVisible('@dataSourceNameInputFieldInModal', this.api.globals.longWait);
  },

  searchForDataSourceByName: function(appName){
    this
      .waitForElementVisible('@searchField', this.api.globals.smallWait)
      .clearValue('@searchField')
      .setValue('@searchField', appName)
      .api.pause(3000);

    return this;
  },

  clickDataSourceByName: function(name){
    const sourceLocator = `.//*[@class='data-source-name']/span[text()='${name}']`;

    this
      .api.useXpath()
      .pause(2000)
      .windowMaximize()
      .execute(function(){
        window.scrollBy(0, 20);
      })
      .waitForElementVisible(sourceLocator, this.api.globals.longWait)
      .click(sourceLocator)
      .waitForElementVisible('.//*[@class="nav nav-tabs"]', this.api.globals.longWait)
      .useCss()
      .pause(2000);

    return this;
  },

  clickDataSourceByUsingAppName: function(dataSourceName, usingAppName){
    const sourceLocator = `//td[contains(text(),'${usingAppName}')]/preceding-sibling::td/span[contains(text(),'${dataSourceName}')]`;
    const navTabsLocator = './/*[@class="nav nav-tabs"]';

    return this
      .api.useXpath()
      .pause(2000)
      .windowMaximize()
      .execute(function(){
        window.scrollBy(0, 20);
      })
      .waitForElementVisible(sourceLocator, this.api.globals.smallWait)
      .click(sourceLocator)
      .waitForElementVisible(navTabsLocator, this.api.globals.mediumWait)
      .useCss()
      .pause(2000);
  },

  clickEditButtonNearDataSourceName: function(name){
    return this
      .waitForElementVisible('@dataSourcesList', this.api.globals.longWait)
      .api.element('xpath', `//td/span[text()="${name}"]/parent::td/following-sibling::td/button`, (result) => {
        this.api.elementIdLocation(result.value.ELEMENT, (location) => {
          this
            .api.execute(function(location){
            let x = location.value.x;
            let y = location.value.y - 150;
            window.scrollTo(x, y);
          }, [location])
            .elementIdClick(result.value.ELEMENT);
        })
          .windowMaximize()
          .pause(4000);
      });
  },

  clickActionsButtonForDataSource: function(dataSourceName){
    this
      .api.useXpath()
      .waitForElementPresent(util.format(actionsButtonForDataSource, dataSourceName), this.api.globals.longWait)
      .moveToElement(util.format(actionsButtonForDataSource, dataSourceName), 0, 0)
      .waitForElementVisible(util.format(actionsButtonForDataSource, dataSourceName), this.api.globals.longWait)
      .click(util.format(actionsButtonForDataSource, dataSourceName))
      .assert.attributeContains(util.format(actionsButtonForDataSource, dataSourceName), elementAttributes.ARIA_EXPANDED, values.TRUE)
      .useCss();

    return this;
  },

  clickActionsButtonForTrashedDataSource: function(dataSourceName){
    this
      .api.useXpath()
      .waitForElementPresent(util.format(actionsButtonForTrashedDataSource, dataSourceName), this.api.globals.longWait)
      .moveToElement(util.format(actionsButtonForTrashedDataSource, dataSourceName), 0, 0)
      .waitForElementVisible(util.format(actionsButtonForTrashedDataSource, dataSourceName), this.api.globals.longWait)
      .click(util.format(actionsButtonForTrashedDataSource, dataSourceName))
      .assert.attributeContains(util.format(actionsButtonForTrashedDataSource, dataSourceName), elementAttributes.ARIA_EXPANDED, values.TRUE)
      .useCss();

    return this;
  },

  selectDeleteOptionInDataSourceActionsDropdown: function(dataSourceName){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(deleteOptionInActionsDropdown, dataSourceName), this.api.globals.longWait)
      .click(util.format(deleteOptionInActionsDropdown, dataSourceName))
      .useCss();

    return this;
  },

  acceptDeleteDataSourceModal: function(){
    this
      .api.pause(1000)
      .frame(null)
      .acceptModalWindow()
      .switchToWidgetProviderFrame();

    return this;
  },

  selectEditOptionInDataSourceActionsDropdown: function(dataSourceName){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(editOptionInActionsDropdown, dataSourceName), this.api.globals.longWait)
      .click(util.format(editOptionInActionsDropdown, dataSourceName))
      .waitForElementNotVisible(util.format(editOptionInActionsDropdown, dataSourceName), this.api.globals.longWait)
      .useCss();

    return this;
  },

  clickTrashButton: function(){
    return this
      .waitForElementVisible('@trashButton', this.api.globals.smallWait)
      .click('@trashButton')
      .assert.attributeContains('@trashButton', elementAttributes.CLASS, values.ACTIVE, 'Trash button is selected.')
      .waitForElementNotVisible('@loadingDataSpinner', this.api.globals.longWait)
      .waitForElementVisible('@trashedDataSourcesList', this.api.globals.longWait);
  },

  clickAllButtonInDataSourceManager: function(){
    return this
      .waitForElementVisible('@allButton', this.api.globals.smallWait)
      .click('@allButton')
      .assert.attributeContains('@allButton', elementAttributes.CLASS, values.ACTIVE, 'Trash button is selected.')
      .waitForElementNotVisible('@loadingDataSpinner', this.api.globals.longWait);
  },

  selectDeleteForeverOptionInDataSourceActionsDropdown: function(dataSourceName){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(deleteForeverOptionInActionsDropdown, dataSourceName), this.api.globals.longWait)
      .click(util.format(deleteForeverOptionInActionsDropdown, dataSourceName))
      .useCss()
      .frame(null);

    return this
      .waitForElementVisible('@dataSourceNameInputFieldInModal', this.api.globals.longWait);
  },

  selectRestoreOptionInDataSourceActionsDropdown: function(dataSourceName){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(restoreForeverOptionInActionsDropdown, dataSourceName), this.api.globals.longWait)
      .click(util.format(restoreForeverOptionInActionsDropdown, dataSourceName))
      .frame(null)
      .waitForElementVisible(util.format(dataSourceTitleInRestoreCompleteAlert, dataSourceName), this.api.globals.longWait)
      .useCss();

    return this;
  },

  setValueInDataSourceModal: function(dataSourceName){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@dataSourceNameInputFieldInModal', this.api.globals.smallWait)
      .setValue('@dataSourceNameInputFieldInModal', dataSourceName);
  },

  clickConfirmButtonInDataSourceModal: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@confirmButtonInDataSourceModal', this.api.globals.smallWait)
      .click('@confirmButtonInDataSourceModal')
      .waitForElementNotPresent('@confirmButtonInDataSourceModal', this.api.globals.longWait)
      .switchToWidgetProviderFrame();
  },

  clickCancelButtonInDataSourceModal: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@cancelButtonInDataSourceModal', this.api.globals.smallWait)
      .click('@cancelButtonInDataSourceModal')
      .waitForElementNotPresent('@cancelButtonInDataSourceModal', this.api.globals.longWait)
      .switchToWidgetProviderFrame();
  },

  acceptDeletionCompleteAlert: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@okButtonOnDeletionCompleteAlert', this.api.globals.longWait)
      .click('@okButtonOnDeletionCompleteAlert')
      .waitForElementNotPresent('@okButtonOnDeletionCompleteAlert', this.api.globals.longWait)
      .switchToWidgetProviderFrame();
  },

  acceptYouMustEnterDataSourceNameAlert: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@okButtonOnEmptyDataSourceNameAlert', this.api.globals.longWait)
      .click('@okButtonOnEmptyDataSourceNameAlert')
      .waitForElementNotPresent('@okButtonOnEmptyDataSourceNameAlert', this.api.globals.longWait)
      .switchToWidgetProviderFrame();
  },

  acceptIncorrectDatSourceNameForDeletionAlert: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@okButtonOnIncorrectDataSourceNameForDeletionAlert', this.api.globals.longWait)
      .click('@okButtonOnIncorrectDataSourceNameForDeletionAlert')
      .waitForElementNotPresent('@okButtonOnIncorrectDataSourceNameForDeletionAlert', this.api.globals.longWait)
      .switchToWidgetProviderFrame();
  },

  acceptDatSourceRestoreCompleteAlert: function(){
    return this
      .waitForElementVisible('@okButtonOnDataSourceRestoreCompleteAlert', this.api.globals.longWait)
      .click('@okButtonOnDataSourceRestoreCompleteAlert')
      .waitForElementNotPresent('@okButtonOnDataSourceRestoreCompleteAlert', this.api.globals.longWait)
      .switchToWidgetProviderFrame();
  },

  assertAllFoundDataSourcesMatchSearchQuery: function(query){
    this
      .api.elements('css selector', '.data-source', (result) => {
        for(let i = 0; i < result.value.length; i ++){
          let elementCSS = '.data-source:nth-child(' + (i + 1) + ')';
          this.assert.containsText(elementCSS, query, 'All data sources shown in the list correspond the search query.');
        }
      });

    return this;
  },

  assertDataSourceIsNotPresentInDataSourceManagerListByName: function(dataSourceName){
    this
      .api.useXpath()
      .assert.elementNotPresent(util.format(dataSourceTitleInList, dataSourceName),
      `The data source with name ${dataSourceName} is not present in the list.`)
      .useCss();

    return this;
  },

  assertDataSourceHasBeenRemovedFromList: function(dataSourceName, amountOfDataSourcesWithTheSameName){
    if(amountOfDataSourcesWithTheSameName > 1){
      this
        .logTestInfo(`Initial amount of data sources with name ${dataSourceName} is ${amountOfDataSourcesWithTheSameName}.`)
        .api.pause(2000)
        .elements('xpath', util.format(dataSourceTitleInList, dataSourceName), (result) => {
          this.assert.equal(result.value.length, amountOfDataSourcesWithTheSameName - 1,
            `One of data sources with name ${dataSourceName} has been removed.`);
          return this;
        });
    } else{
      return this
        .assertDataSourceIsNotPresentInDataSourceManagerListByName(dataSourceName);
    }
  },

  assertDataSourceHasBeenRemovedFromTrash: function(dataSourceName, amountOfDataSourcesWithTheSameName){
    if(amountOfDataSourcesWithTheSameName > 1){
      this
        .logTestInfo(`Initial amount of data sources in Trash with name ${dataSourceName} is ${amountOfDataSourcesWithTheSameName}.`)
        .api.pause(2000)
        .elements('xpath', util.format(dataSourceTitleInTrashedList, dataSourceName), (result) => {
          this.assert.equal(result.value.length, amountOfDataSourcesWithTheSameName - 1,
            `One of data sources with name ${dataSourceName} has been removed form Trash.`);
          return this;
        });
    } else{
      return this
        .assertDataSourceIsNotPresentInTrashedListByName(dataSourceName);
    }
  },

  assertDataSourceIsPresentInListByAppName: function(appName){
    const dataSourceTitleLocator = `//td[contains(text(),'${appName}')]/preceding-sibling::td/span`;

    this
      .api.useXpath()
      .assert.elementPresent(dataSourceTitleLocator, `Data source of app ${appName} is present in the list.`)
      .useCss();

    return this;
  },

  assertDataSourceIsNotPresentInTrashedListByName: function(dataSourceName){
    this
      .api.useXpath()
      .waitForElementNotPresent(util.format(dataSourceTitleInTrashedList, dataSourceName), this.api.globals.longWait)
      .useCss()
      .logTestInfo(`The data source with name ${dataSourceName} is not present in Trash.`);

    return this;
  },

  assertDataSourceIsPresentInTrashedListByName: function(dataSourceName){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceTitleInTrashedList, dataSourceName), this.api.globals.longWait)
      .useCss()
      .logTestInfo(`The data source with name ${dataSourceName} is present in Trash.`);

    return this;
  },

  assertDataSourceIsPresentInDataSourceManagerListByName: function(dataSourceName){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceTitleInList, dataSourceName), this.api.globals.longWait)
      .useCss()
      .logTestInfo(`The data source with name ${dataSourceName} is present in Data Source Manager list.`);

    return this;
  },

  getDataSourceIdThatPresentInDataSourceManagerListByName: function(dataSourceName, dataSourceId){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceIdLocatorInDataSourcesListByName, dataSourceName), this.api.globals.smallWait)
      .getText(util.format(dataSourceIdLocatorInDataSourcesListByName, dataSourceName), (text) => dataSourceId.unshift(text.value))
      .useCss();

    return this;
  },

  getAmountOfDataSourceWithTheSameName: function(dataSourceName, amountOfDataSourcesWithTheSameName){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceTitleInList, dataSourceName), this.api.globals.longWait)
      .useCss()
      .elements('xpath', util.format(dataSourceTitleInList, dataSourceName), (result) => {
        amountOfDataSourcesWithTheSameName.push(result.value.length);
      });

    return amountOfDataSourcesWithTheSameName;
  },

  getAmountOfDataSourceWithTheSameNameInTrash: function(dataSourceName, amountOfDataSourcesWithTheSameName){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceTitleInTrashedList, dataSourceName), this.api.globals.longWait)
      .useCss()
      .elements('xpath', util.format(dataSourceTitleInTrashedList, dataSourceName), (result) => {
        amountOfDataSourcesWithTheSameName.push(result.value.length);
      });

    return amountOfDataSourcesWithTheSameName;
  },

  waitForDataSourcesPageToBeLoaded: function(){
    const resultDisplaying = [];

    this
      .api.frame(null)
      .switchToWidgetProviderFrame()
      .waitForElementPresentWithoutErrors('#contents[class=""] .btn.btn-primary', this.api.globals.longWait, resultDisplaying)
      .perform(function(){
        if(resultDisplaying[0] == true){ // if button is present
          this.api
            .waitForElementVisible('#contents .btn.btn-primary', this.api.globals.longWait)
            .waitForElementVisible('.col-sm-4 input', this.api.globals.longWait)
            .waitForElementVisible('#data-sources', this.api.globals.longWait)
            .waitForElementNotVisible('.spinner-holder .spinner-overlay', this.api.globals.longWait);
        } else{ // if button is not present because of issue in loading
          this
            .api.refresh()
            .switchToWidgetProviderFrame()
            .waitForElementVisible('#contents .btn.btn-primary', this.api.globals.longWait)
            .waitForElementVisible('.col-sm-4 input', this.api.globals.longWait)
            .waitForElementVisible('#data-sources', this.api.globals.longWait)
            .waitForElementNotVisible('.spinner-holder .spinner-overlay', this.api.globals.longWait);
        }
      });

    return this
      .waitForElementVisible('@createDataSourceButton', 15000);
  }
};

module.exports = {
  url: function(){
    return this.api.launchUrl + '/data-sources';
  },
  commands: [commands],
  elements: {
    createDataSourceButton: {
      selector: '#contents .btn.btn-primary'
    },
    searchField: {
      selector: './/input[@type="search"]',
      locateStrategy: 'xpath'
    },
    dataSourcesList: {
      selector: '#data-sources'
    },
    trashedDataSourcesList: {
      selector: '#trash-sources'
    },
    trashButton: {
      selector: '.btn-round.spaced.btn'
    },
    allButton: {
      selector: 'button[data-show-alive-source]'
    },
    dataSourceNameInputFieldInModal: {
      selector: '.bootbox-input.bootbox-input-text.form-control'
    },
    confirmButtonInDataSourceModal: {
      selector: 'button[data-bb-handler=confirm]'
    },
    cancelButtonInDataSourceModal: {
      selector: 'button[data-bb-handler=cancel]'
    },
    okButtonOnDeletionCompleteAlert: {
      selector: '//div[text()="Item deleted permanently."]/parent::div/parent::div//button',
      locateStrategy: 'xpath'
    },
    okButtonOnEmptyDataSourceNameAlert: {
      selector: '//div[text()="You must enter a data source name"]/parent::div/parent::div//button',
      locateStrategy: 'xpath'
    },
    okButtonOnIncorrectDataSourceNameForDeletionAlert: {
      selector: '//div[text()="Data source name is incorrect"]/parent::div/parent::div//button',
      locateStrategy: 'xpath'
    },
    okButtonOnDataSourceRestoreCompleteAlert: {
      selector: '//h4[text()="Restore complete"]/parent::div/parent::div//button',
      locateStrategy: 'xpath'
    },
    loadingDataSpinner: {
      selector: '.loader-holder p'
    }
  }
};