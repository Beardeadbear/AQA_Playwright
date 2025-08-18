const util = require('util');
const dataSourceOptionInDropdown = '//select[@class="hidden-select form-control"]//option[@value][contains(text(),"%s")]';

const commands = {
  clickShowAllDataSources: function(){
    this
      .switchTodDataSourceProviderFrame()
      .waitForElementPresent('@showAllCheckboxInput', this.api.globals.smallWait)
      .waitForElementVisible('@showAllCheckboxLabel', this.api.globals.smallWait)
      .click('@showAllCheckboxLabel')
      .expect.element('@showAllCheckboxInput').to.be.selected.before(this.api.globals.longWait);

    this
      .api.frameParent();

    return this;
  },

  uncheckShowAllDataSources: function(){
    this
      .switchTodDataSourceProviderFrame()
      .waitForElementPresent('@showAllCheckboxInput', this.api.globals.smallWait)
      .waitForElementVisible('@showAllCheckboxLabel', this.api.globals.smallWait)
      .click('@showAllCheckboxLabel')
      .expect.element('@showAllCheckboxInput').to.not.be.selected.before(this.api.globals.longWait);

    this
      .api.frameParent();

    return this;
  },

  selectDataSourceInDropdownList: function(dataSourceName, isLfdManagement=false){
    this
      .switchTodDataSourceProviderFrame(isLfdManagement)
      .waitForElementVisible('@dataSourceProviderDropdownField', this.api.globals.smallWait)
      .click('@dataSourceProviderDropdownField')
      .api.useXpath()
      .waitForElementPresent(util.format(dataSourceOptionInDropdown, dataSourceName), this.api.globals.longWait)
      .click(util.format(dataSourceOptionInDropdown, dataSourceName))
      .useCss();

    this
      .assert.visible('@viewDataSourceButton', `Data source ${dataSourceName} has been selected in data source provider.`)
      .api.frameParent();

    return this;
  },

  assertThatDataSourceIsNotPresentInDataSourceProvider: function(dataSourceName){
    this
      .switchTodDataSourceProviderFrame()
      .waitForElementVisible('@dataSourceProviderDropdownField', this.api.globals.smallWait)
      .click('@dataSourceProviderDropdownField')
      .api.useXpath()
      .waitForElementNotPresent(util.format(dataSourceOptionInDropdown, dataSourceName), this.api.globals.longWait)
      .useCss();

    this
      .click('@dataSourceProviderDropdownField')
      .api.frameParent();

    return this;
  },

  assertThatDataSourceIsShownInDataSourceProvider: function(dataSourceName){
    this
      .switchTodDataSourceProviderFrame()
      .waitForElementVisible('@dataSourceProviderDropdownField', this.api.globals.smallWait)
      .click('@dataSourceProviderDropdownField')
      .api.useXpath()
      .waitForElementPresent(util.format(dataSourceOptionInDropdown, dataSourceName), this.api.globals.longWait)
      .useCss();

    this
      .click('@dataSourceProviderDropdownField')
      .api.frameParent();

    return this;
  },

  clickCreateNewDataSource: function(){
    this
      .switchTodDataSourceProviderFrame()
      .waitForElementVisible('@createNewDataSourceLink', this.api.globals.smallWait)
      .api.pause(2000);

    this
      .click('@createNewDataSourceLink')
      .api.frame(null);

    return this
      .waitForElementVisible('@dataSourceNameInputFieldInCreateNewDataSourceModal', this.api.globals.mediumWait);
  },

  enterNameForDataSource: function(dataSourceName){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@dataSourceNameInputFieldInCreateNewDataSourceModal', this.api.globals.smallWait)
      .clearValue('@dataSourceNameInputFieldInCreateNewDataSourceModal')
      .setValue('@dataSourceNameInputFieldInCreateNewDataSourceModal', dataSourceName);
  },

  confirmDataSourceProviderModal: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@confirmButtonInDataSourceProviderModal', this.api.globals.smallWait)
      .click('@confirmButtonInDataSourceProviderModal')
      .waitForElementNotPresent('@confirmButtonInDataSourceProviderModal', this.api.globals.mediumWait)
      .switchToWidgetInstanceFrame();
  },

  cancelDataSourceProviderModal: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@cancelButtonInDataSourceProviderModal', this.api.globals.smallWait)
      .click('@cancelButtonInDataSourceProviderModal')
      .waitForElementNotPresent('@cancelButtonInDataSourceProviderModal', this.api.globals.mediumWait)
      .switchToWidgetInstanceFrame();
  },

  checkThatCorrectDataSourceIsSelectedInDropdownList: function(dataSourceName, isLfdManagement=false){
    this
      .switchTodDataSourceProviderFrame(isLfdManagement)
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceOptionInDropdown, dataSourceName), this.api.globals.smallWait)
      .expect.element(util.format(dataSourceOptionInDropdown, dataSourceName)).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss()
      .frameParent();

    return this;
  },

  checkThatNoDataSourceSelectedInDropdownList: function(){
    this
      .switchTodDataSourceProviderFrame()
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceOptionInDropdown, '-- Select data source'), this.api.globals.smallWait)
      .expect.element(util.format(dataSourceOptionInDropdown, '-- Select data source')).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss()
      .frameParent();

    return this;
  },

  checkThatCorrectDataSourceIsSelectedForComponent: function(dataSourceName){
    this
      .switchTodDataSourceProviderFrame()
      .waitForElementVisible('@selectedDataSourceNameHolder', this.api.globals.smallWait)
      .assert.containsText('@selectedDataSourceNameHolder', dataSourceName, 'The correct data source is selected for the component.')
      .api.frameParent();

    return this;
  },

  clickConfigureSecurityRules: function(){
    this
      .switchTodDataSourceProviderFrame()
      .waitForElementVisible('@configureSecurityRulesButton', this.api.globals.longWait)
      .click('@configureSecurityRulesButton')
      .api.frame(null);

    return this;
  },

  clickOkButtonOnChangesAppliedAlert: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@okButtonOnChangesAppliedAlert', this.api.globals.longWait)
      .click('@okButtonOnChangesAppliedAlert')
      .waitForElementNotPresent('@okButtonOnChangesAppliedAlert', this.api.globals.longWait)
      .switchToWidgetInstanceFrame();
  },

  checkThatSecurityRulesAreAddedToDataSourceSettingsMessageIsShown: function(){
    this
      .switchTodDataSourceProviderFrame()
      .assert.visible('@securityRulesAddedSuccessAlert', 'Security rules are added to data source settings.')
      .api.frameParent();

    return this;
  },

  checkThatSecurityRulesMissingWarningMessageIsShown: function(){
    this
      .switchTodDataSourceProviderFrame()
      .assert.visible('@securityRulesMissingWarningMessage', 'This data source is missing security rules warning message is shown.')
      .api.frameParent();

    return this;
  },

  checkThatSecurityRulesMissingWarningMessageIsNotShown: function(){
    this
      .switchTodDataSourceProviderFrame()
      .assert.elementNotPresent('@securityRulesMissingWarningMessage', 'This data source is missing security rules warning message is not displayed.')
      .api.frameParent();

    return this;
  },

  clickChangeDataSourceLink: function(){
    this
      .switchTodDataSourceProviderFrame()
      .click('@changeLinkForSelectingAnotherFromSelectedDataSource')
      .waitForElementVisible('@dataSourceProviderDropdownField', this.api.globals.mediumWait)
      .api.frameParent();

    return this;
  },

  getDataSourceIdFromSelectedDataSourceInProvider: function(dataSourceId){
    this
      .switchTodDataSourceProviderFrame()
      .waitForElementVisible('@selectedDataSourceCodeHolder', this.api.globals.smallWait)
      .getText('@selectedDataSourceCodeHolder', (text) => dataSourceId.unshift(text.value))
      .api.frameParent();

    return this;
  },

  clickViewDataSource: function(){
    this
      .switchTodDataSourceProviderFrame()
      .click('@viewDataSourceButton')
      .api.frame(null);

    return this;
  },

  checkDataSourceSecurityRulesAccessOperationsOnModal: function(securityRulesAccessOperation){
    this
      .api.frame(null);

    this
      .waitForElementVisible('@dataSourceSecurityRulesAccessOperationsOnModal', this.api.globals.smallWait)
      .assert.containsText('@dataSourceSecurityRulesAccessOperationsOnModal', securityRulesAccessOperation,
      `The data source security operation for the feature is correct ${securityRulesAccessOperation}.`);

    return this;
  }
};

module.exports = {
  commands: [commands],
  elements: {
    showAllCheckboxInput: {
      selector: 'input#showAll',
    },
    showAllCheckboxLabel: {
      selector: 'label[for=showAll]'
    },
    dataSourceProviderDropdownField: {
      selector: '[for=data-source-select]'
    },
    createNewDataSourceLink: {
      selector: 'a.create-data-source'
    },
    dataSourceNameInputFieldInCreateNewDataSourceModal: {
      selector: '.bootbox-input.bootbox-input-text.form-control'
    },
    confirmButtonInDataSourceProviderModal: {
      selector: 'button[data-bb-handler="confirm"]'
    },
    cancelButtonInDataSourceProviderModal: {
      selector: 'button[data-bb-handler="cancel"]'
    },
    selectedDataSourceNameHolder: {
      selector: '//section[@class="data-source-selector"]//div[@class="selected-data-source info"]/span',
      locateStrategy: 'xpath'
    },
    selectedDataSourceCodeHolder: {
      selector: '//section[@class="data-source-selector"]//div[@class="selected-data-source info"]/code',
      locateStrategy: 'xpath'
    },
    configureSecurityRulesButton: {
      selector: '.btn.btn-primary.btn-security'
    },
    okButtonOnChangesAppliedAlert: {
      selector: 'button[data-bb-handler="ok"]'
    },
    securityRulesAddedSuccessAlert: {
      selector: '.security-notify .alert.alert-success'
    },
    securityRulesMissingWarningMessage: {
      selector: '.security-notify .alert.alert-warning'
    },
    viewDataSourceButton: {
      selector: '.btn-view-data-source'
    },
    changeLinkForSelectingAnotherFromSelectedDataSource: {
      selector: 'a.change-data-source.selected-data-source.action'
    },
    dataSourceSecurityRulesAccessOperationsOnModal: {
      selector: '.bootbox-body code'
    }
  }
};