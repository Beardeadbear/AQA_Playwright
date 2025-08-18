const elementAttributes = require('../utils/constants/elementAttributes');
const values = require('../utils/constants/values');
const util = require('util');
const dataSourceSecurityRuleInTheList = '//td[@class="align-baseline"][text()="%s"]/..';
const deleteSecurityRuleButton = '(//button[text()="Delete"])[%d]';
const editSecurityRuleButton = '(//div[@id="access-rules-list"]//button[text()="Edit"])[%d]';
const userCanSecurityRulesTableCell = '//div[@id="access-rules-list"]//tbody/tr/td[@class="align-baseline"][3][contains(text(), "%s")]';
const toggleSwitchForEnablingSecurityRule = '//td[@class="align-baseline"][text()="%s"]/../td[1]/a';

const commands = {
  clickAddNewSecurityRuleButton: function(){
    this
      .api.pause(2000);

    return this
      .waitForElementVisible('@addNewRuleButton', this.api.globals.longWait)
      .click('@addNewRuleButton')
      .assert.visible('@preconfiguredRulesDropdownMenu', this.api.globals.smallWait);
  },

  selectCreateNewRuleInPreconfiguredRulesDropdownMenu: function(){
    return this
      .waitForElementVisible('@addNewRuleOptionInPreconfiguredRulesDropdownMenu', this.api.globals.longWait)
      .click('@addNewRuleOptionInPreconfiguredRulesDropdownMenu')
      .waitForElementVisible('@securityRulesOptionsDropdown', this.api.globals.smallWait);
  },

  clickSaveAndApplyButtonForDataSourceSecurityRule: function(){
    return this
      .waitForElementVisible('@saveAndApplyButtonSecurityRuleTab', this.api.globals.longWait)
      .click('@saveAndApplyButtonSecurityRuleTab');
  },

  acceptApplyingChangesToDataSourceSecurityRules: function(){
    this
      .api.frameParent();

    return this
      .waitForElementVisible('@okButtonOnModalToApplyChangesToSecurityRules', this.api.globals.mediumWait)
      .click('@okButtonOnModalToApplyChangesToSecurityRules')
      .waitForElementNotPresent('@okButtonOnModalToApplyChangesToSecurityRules', this.api.globals.mediumWait)
      .switchToWidgetProviderFrame()
      .assert.attributeContains('@saveAndApplyButtonSecurityRuleTab', elementAttributes.CLASS, values.HIDDEN);
  },

  getInitialAmountOfDataSourceSecurityRulesBeforeAddingNewOne: function(amountOfSecurityRules){
    this
      .api.elements('css selector', 'tr[data-rule-index]', function(result){
      return amountOfSecurityRules.push(result.value.length);
    });
  },

  assertSecurityRuleIsAdded: function(previousAmountOfSecurityRules){
    return this
      .waitForElementVisible('@securityRuleInTable', this.api.globals.smallWait)
      .assertAmountOfElementsVisible('@securityRuleInTable', parseInt(previousAmountOfSecurityRules) + 1);
  },

  assertSecurityRuleIsRemoved: function(previousAmountOfSecurityRules){
    return this
      .waitForElementVisible('@securityRuleInTable', this.api.globals.smallWait)
      .assertAmountOfElementsVisible('@securityRuleInTable', parseInt(previousAmountOfSecurityRules) - 1);
  },

  deleteSecurityRule: function(numberOfSecurityRule = 1){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(deleteSecurityRuleButton, numberOfSecurityRule), this.api.globals.smallWait)
      .click(util.format(deleteSecurityRuleButton, numberOfSecurityRule))
      .useCss();

    return this;
  },

  clickEditButtonForSecurityRule: function(numberOfSecurityRule = 1){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(editSecurityRuleButton, numberOfSecurityRule), this.api.globals.longWait)
      .click(util.format(editSecurityRuleButton, numberOfSecurityRule))
      .useCss();

    return this;
  },

  checkThatDataSourceHasNoSecurityRule: function(){
    this
      .waitForElementPresent('@emptySecurityRulesListInfoMessage', this.api.globals.mediumWait)
      .expect.element('@emptySecurityRulesListInfoMessage')
      .to.have.attribute(elementAttributes.CLASS).which.does.not.contains(values.HIDDEN).before(this.api.globals.tinyWait);

    return this;
  },

  checkThatSecurityRuleWithSpecificAccessOperationIsInTheList: function(operation){
    this
      .api.useXpath()
      .assert.visible(util.format(userCanSecurityRulesTableCell, operation.charAt(0).toUpperCase().concat(operation.slice(1))), `Security rule with ${operation} access operation has been added.`)
      .useCss();

    return this;
  },

  disableSecurityRuleInTheList: function(securityRuleOperation){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(toggleSwitchForEnablingSecurityRule, securityRuleOperation.charAt(0).toUpperCase().concat(securityRuleOperation.slice(1))),
        this.api.globals.longWait)
      .click(util.format(toggleSwitchForEnablingSecurityRule, securityRuleOperation.charAt(0).toUpperCase().concat(securityRuleOperation.slice(1))))
      .assert.attributeEquals(util.format(dataSourceSecurityRuleInTheList, securityRuleOperation.charAt(0).toUpperCase().concat(securityRuleOperation.slice(1))),
      elementAttributes.CLASS, values.DISABLED, `The security rule with ${securityRuleOperation} operation is disabled.`)
      .useCss();

    return this;
  },

  assertThatSecurityRuleIsEnabled: function(securityRuleOperation){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceSecurityRuleInTheList, securityRuleOperation.charAt(0).toUpperCase().concat(securityRuleOperation.slice(1))),
        this.api.globals.longWait)
      .assert.attributeEquals(util.format(dataSourceSecurityRuleInTheList, securityRuleOperation.charAt(0).toUpperCase().concat(securityRuleOperation.slice(1))),
      elementAttributes.CLASS, values.ENABLED, `The security rule with ${securityRuleOperation} operation is enabled.`)
      .useCss();

    return this;
  }
};

module.exports = {
  commands: [commands],
  elements: {
    addNewRuleButton: {
      selector: '#add-rules-dropdown'
    },
    preconfiguredRulesDropdownMenu: {
      selector: '.dropdown-menu.preconfigured-rules'
    },
    addNewRuleOptionInPreconfiguredRulesDropdownMenu: {
      selector: '#add-rule'
    },
    saveAndApplyButtonSecurityRuleTab: {
      selector: '#save-rules'
    },
    okButtonOnModalToApplyChangesToSecurityRules: {
      selector: '.modal-footer [data-bb-handler="ok"]'
    },
    securityRuleInTable: {
      selector: 'tr[data-rule-index]'
    },
    securityRulesOptionsDropdown: {
      selector: '.modal-dialog'
    },
    emptySecurityRulesListInfoMessage: {
      selector: '.empty-data-source-rules'
    }
  }
};