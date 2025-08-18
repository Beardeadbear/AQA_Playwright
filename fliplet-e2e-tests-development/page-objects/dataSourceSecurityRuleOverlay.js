const util = require('util');
const operationCheckbox = '//label[@for="chk-%s"]'; //select, insert, delete, update
const filterOptionDropdownValue = '(//select[@class ="hidden-select form-control"]/option[text()="%s"])[%d]';
const filterItemInputField = '(//input[@placeholder ="%s" or @class="token-input"])[%d]'; //Field name, Value

const commands = {
  clickSpecificAppsButton: function () {
    this
      .api.pause(2000);

    return this
      .waitForElementVisible('@specificAppsButton', this.api.globals.longWait)
      .click('@specificAppsButton')
      .assert.attributeContains('@specificAppsButton', 'class', 'selected');
  },

  clickLoggedInUsersButton: function () {
    this
      .api.pause(2000);

    return this
      .waitForElementVisible('@loggedInUsersButton', this.api.globals.longWait)
      .click('@loggedInUsersButton')
      .assert.attributeContains('@loggedInUsersButton', 'class', 'selected');
  },

  clickSpecificUsersButton: function () {
    this
      .api.pause(2000);

    return this
      .waitForElementVisible('@specificUsersButton', this.api.globals.longWait)
      .click('@specificUsersButton')
      .assert.attributeContains('@specificUsersButton', 'class', 'selected');
  },

  selectApplicationForSecurityRule: function(appId) {
    const checkboxLocator = `//label[@for="chk-${appId}"]`;

    this
      .api.useXpath()
      .waitForElementVisible(checkboxLocator, this.api.globals.smallWait)
      .click(checkboxLocator)
      .expect.element(checkboxLocator+`/parent::div/input`).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  clickAddRuleButton: function () {
    return this
      .waitForElementVisible('@addRuleButton', this.api.globals.longWait)
      .click('@addRuleButton')
      .waitForElementNotVisible('.modal-content', this.api.globals.mediumWait);
  },

  defineOperationType: function(operationType){
    let operation;

    switch (operationType) {
      case 'write':
        operation = 'insert';
        break;
      case 'read':
        operation = 'select';
        break;
      case 'update':
        operation = 'update';
        break;
      case 'delete':
        operation = 'delete';
        break;
    }

    return operation;
    },

  selectOperationForDataSourceSecurityRule: function(operationType, done){
    let operation = this
      .defineOperationType(operationType,() => {
        done();
      });

    this
      .api.pause(2000)
      .useXpath()
      .waitForElementVisible(util.format(operationCheckbox, operation), this.api.globals.smallWait)
      .click(util.format(operationCheckbox, operation))
      .expect.element(util.format(operationCheckbox, operation)+`/parent::div/input`).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  unselectOperationForDataSourceSecurityRule: function(operationType, done){
    let operation = this
      .defineOperationType(operationType,() => {
        done();
      });

    this
      .api.useXpath()
      .waitForElementVisible(util.format(operationCheckbox, operation), this.api.globals.smallWait)
      .click(util.format(operationCheckbox, operation))
      .expect.element(util.format(operationCheckbox, operation)+`/parent::div/input`).to.not.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  configureFilterFoDataSourceSecurityRule: function (fieldName, filterOption, value, numberOfFilter) {
    this.api.useXpath()
      .waitForElementPresent(util.format(filterOptionDropdownValue, filterOption, numberOfFilter || 1), this.api.globals.smallWait)
      .click(util.format(filterOptionDropdownValue, filterOption, numberOfFilter || 1))
      .expect.element(util.format(filterOptionDropdownValue, filterOption, numberOfFilter || 1)).to.be.selected
      .before(this.api.globals.smallWait);

    this
      .waitForElementVisible(util.format(filterItemInputField, 'Field name', numberOfFilter || 1), this.api.globals.longWait)
      .clearValue(util.format(filterItemInputField, 'Field name', numberOfFilter || 1))
      .setValue(util.format(filterItemInputField, 'Field name', numberOfFilter || 1), fieldName);

    this
      .waitForElementVisible(util.format(filterItemInputField, 'Value', numberOfFilter || 1), this.api.globals.longWait)
      .clearValue(util.format(filterItemInputField, 'Value', numberOfFilter || 1))
      .setValue(util.format(filterItemInputField, 'Value', numberOfFilter || 1), value)
      .api.useCss();

    return this;
  }
};

module.exports = {
  commands: [commands],
  elements: {
    specificAppsButton: {
      selector: 'button[data-apps=filter]'
    },
    addRuleButton: {
      selector: 'button[data-save-rule]'
    },
    loggedInUsersButton: {
      selector: 'button[data-allow=loggedIn]'
    },
    specificUsersButton: {
      selector: 'button[data-allow=filter]'
    }
  }
};