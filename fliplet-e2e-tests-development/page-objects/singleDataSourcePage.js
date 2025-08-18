const util = require('util');
const userInUserPermissionListByName = '//td[text()="%s"]/parent::tr';

const commands = {
  switchToEntriesTab: function(){
    return this
      .waitForElementVisible('@entriesTab', this.api.globals.longWait)
      .click('@entriesTab');
  },

  switchToRolesTab: function(){
    return this
      .waitForElementVisible('@accessRolesTab', this.api.globals.longWait)
      .click('@accessRolesTab');
  },

  switchToSettingsTab: function(){
    return this
      .waitForElementVisible('@settingsTab', 30000)
      .click('@settingsTab')
      .waitForElementVisible('@nameField', this.api.globals.longWait);
  },

  switchToSecurityRuleTab: function() {
    return this
      .waitForElementVisible('@securityRulesTab', this.api.globals.longWait)
      .click('@securityRulesTab')
      .assert.attributeContains('@securityRulesTab', 'aria-expanded', 'true');
  },

  clickBackToDataSourcesButton: function(){
    this
      .waitForElementVisible('@backToDataSourcesButton', this.api.globals.longWait)
      .click('@backToDataSourcesButton')
      .api.pause(2000)
      .waitForElementNotVisible('.spinner-holder .spinner-overlay', 30000)
      .waitForElementVisible('.btn.btn-primary[data-create-source]', this.api.globals.longWait);

    return this;
  },

  clickDeleteButton: function(){
    return this
      .waitForElementVisible('@deleteButton', this.api.globals.smallWait)
      .click('@deleteButton')
      .api.pause(1000)
      .frame(null)
      .acceptModalWindow()
      .switchToWidgetProviderFrame();
  },

  getDataSourceLogs: function(uri){
    return this
      .waitForElementVisible('@dataSourceIdInSettingsTab', this.api.globals.smallWait)
      .getText('@dataSourceIdInSettingsTab', (result) => {
        this.api.url(`${uri}/v1/data-sources/${result.value}/logs`)
      });
  },

  getDataSourceIdFromSettings: function(dataSourceId){
    return this
      .waitForElementVisible('@dataSourceIdInSettingsTab', this.api.globals.smallWait)
      .getText('@dataSourceIdInSettingsTab', (text) => dataSourceId.unshift(text.value));
  },

  clickAddNewRoleButton: function(){
    return this
      .waitForElementVisible('@addRoleButton', this.api.globals.smallWait)
      .click('@addRoleButton');
  },

  enterUserIdForPermission: function(userId, userPermission){
    const modalTitleLocator = '.modal-title';
    const userIdInputFieldOnModalLocator = '.bootbox-input.bootbox-input-text.form-control';
    const confirmButtonOnModalLocator = 'button[data-bb-handler="confirm"]';

    this
      .api.frame(null)
      .waitForElementVisible(userIdInputFieldOnModalLocator, this.api.globals.smallWait)
      .waitForElementVisible(confirmButtonOnModalLocator, this.api.globals.smallWait)
      .assert.containsText(modalTitleLocator, 'Enter the user ID')
      .pause(1000)
      .setValue(userIdInputFieldOnModalLocator, userId)
      .click(confirmButtonOnModalLocator)
      .pause(1000)
      .assert.containsText(modalTitleLocator, 'Set the permission')
      .assert.valueContains(userIdInputFieldOnModalLocator, userPermission)
      .click(confirmButtonOnModalLocator)
      .waitForElementNotPresent(userIdInputFieldOnModalLocator, this.api.globals.smallWait)
      .waitForElementNotPresent(confirmButtonOnModalLocator, this.api.globals.smallWait)
      .switchToWidgetProviderFrame();

    return this;
  },

  getAmountOfUsersInPermissionListBeforeAddingNewUser: function(amountOfUsersInPermissionList){
    this
      .waitForElementVisible('@revokeRoleButton', this.api.globals.smallWait)
      .api.elements('css selector', '.btn.btn-danger[data-revoke-role]', function (result) {
      amountOfUsersInPermissionList.push(result.value.length);
    });
    return amountOfUsersInPermissionList;
  },

  assertUserIsAddedToPermissionList: function(userId, previousAmountOfUsersInPermissionList) {
    return this
      .waitForElementVisible(`.btn.btn-danger[data-revoke-role="${userId}"]`, this.api.globals.smallWait)
      .assertAmountOfElementsVisible('@revokeRoleButton', previousAmountOfUsersInPermissionList + 1);
  },

  assertUserIsAddedToPermissionListByName: function(userName){
    this
      .api.useXpath()
      .waitForElementPresent(util.format(userInUserPermissionListByName, userName), this.api.globals.longWait)
      .assert.visible(util.format(userInUserPermissionListByName, userName), `User with name ${userName} is present in Users permission list.`)
      .useCss();

    return this;
  },

  clickRevokeRoleButtonByEmail: function(email){
    return this
      .waitForElementVisible('@revokeRoleButton', this.api.globals.smallWait)
      .api.useXpath()
      .click(`//tr/td[text()="${email}"]/following-sibling::td[2]/button`)
      .frame(null)
      .useCss()
      .acceptModalWindow()
      .switchToWidgetProviderFrame()
      .useXpath()
      .waitForElementNotPresent(`//tr/td[text()="${email}"]/following-sibling::td[2]/button`, this.api.globals.smallWait)
      .useCss();
  },

  assertCorrectDataSourceIsOpenedByName: function(dataSourceName){
    this
      .waitForElementVisible('@dataSourceName', this.api.globals.longWait)
      .assert.containsText('@dataSourceName', dataSourceName, `The data source ${dataSourceName} is open.`)
      .api.pause(1500)
      .resizeWindow(800, 800)// to prevent issue with blank data source, as after page scroll data appears
      .pause(1500)
      .resizeWindow(1600, 1200); // to prevent issue with blank data source, as after page scroll data appears

    this
      .waitForElementVisible('@accessRolesTab', this.api.globals.longWait)
      .click('@accessRolesTab')
      .waitForElementVisible('@entriesTab', this.api.globals.longWait)
      .click('@entriesTab')
      .waitForElementVisible('@dataSourceTableCell', this.api.globals.longWait)
      .waitForElementVisible('@firstTableCell', this.api.globals.longWait);

    return this;
  },

  assertOnlyCurrentUserHaveAccessToDataSource: function(email){
    return this
      .waitForElementVisible('#users > .table >tbody > tr >td:nth-child(2)', this.api.globals.smallWait)
      .api.elements('css selector', '#users > .table >tbody > tr >td:nth-child(2)', (result) => {
        for(let i = 1; i <= result.value.length; i++){
          this
            .api.useXpath()
            .expect.element(`.//*[@id="users"]/table/tbody/tr[${i}]/td[2]`).text.to.equal(email).after(2000);
        }
      })
      .useCss();
  },

  changeDataSourceName: function(name){
    return this
      .clearValue('@nameField')
      .setValue('@nameField', name);
  },

  clickSaveChangesButtonOnSettingsScreen: function(){
    return this
      .waitForElementVisible('@saveChangesButtonSettings', this.api.globals.longWait)
      .click('@saveChangesButtonSettings')
      .waitForElementVisible('#hot .wtSpreader tbody', this.api.globals.smallWait);
  },

  clickShowBypassCodeButton: function(){
    return this
      .waitForElementVisible('@showBypassCodeButton', this.api.globals.smallWait)
      .click('@showBypassCodeButton')
      .waitForElementVisible('@bypassCode', this.api.globals.smallWait);
  },

  /**  @param {Array} names - new column names   */
  changeDataSourceColumnNames: function(names){
    this
      .api.pause(2000)
      .waitForElementVisible('.nav.nav-tabs[role="tablist"]', this.api.globals.mediumWait)
      .resizeWindow(800, 800) // to prevent issue with blank data source, as after page scroll data appears
      .resizeWindow(1600, 1200) // to prevent issue with blank data source, as after page scroll data appears
      .waitForElementVisible('.ht_clone_top.handsontable .wtSpreader tbody', this.api.globals.longWait)
      .elements('css selector', '.relative .colHeader.columnSorting', (result) => { // wait for all columns to be visible
        for (let i = 1; i <= result.value.length; i++){
          this.api
            .useXpath()
            .waitForElementVisible(`(//span[@class="colHeader columnSorting"])[${i}]`,this.api.globals.mediumWait)
            .useCss();
        }
      })
      .elements('css selector', '.ht_clone_top.handsontable .wtSpreader tbody tr td', (result) => { // changing of columns names
        for(let k = 0; k < names.length; k++){
          let valueLength = 0;
          this.api
            .elementIdText(result.value[k].ELEMENT, (text)=>{
              valueLength = text.value.length;
            })
            .moveTo(result.value[k].ELEMENT)
            .doubleClick(()=>{
              for (let i = 0; i < valueLength; i++){
                this.api.keys([this.api.Keys.BACK_SPACE])
              }
            })
            .keys([names[k]])
            .click('#hot .wtSpreader tbody tr:nth-child(2) td');
        }
      });

    return this;
  },

  /**  @param {Array} names - names of columns stored in array  */
  assertDataSourceColumnNamesAreCorrect: function(names){
    this.api.execute(function(){
      window.scrollBy(0, 20);
    });
    for(let k = 0; k < names.length; k++){
      this.assert.containsText(`.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(${k+1})`, names[k]);
    }
    return this;
  },

  getFormFieldsNamesOfDataSourceWithDeleting: function (formFieldsNames, dataSourceFieldsTitles) {
    this
      .api.pause(1000)
      .waitForElementPresent('.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(1)', this.api.globals.smallWait, function () {
        for (let i = 0; i < formFieldsNames; i++) {
          this.element('css selector', `.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(1)`, (result) => {
            this.elementIdText(result.value.ELEMENT, (text) => dataSourceFieldsTitles.push(text.value))
              .elementIdClick(result.value.ELEMENT)
              .click('.mce-ico.mce-i-tabledeletecol')
              .pause(500);
          });
        }
        return dataSourceFieldsTitles;
      });
  },

  getFormValuesOfDataSourceWithDeleting: function (formFieldsNames, dataSourceEntries) {
    this
      .api.pause(1000)
      .waitForElementPresent('.ht_master.handsontable', this.api.globals.smallWait, function () {
        for (let i = 0; i < formFieldsNames; i++) {
          this.elements('xpath', `.//div[@id="hot"]/div[@class="ht_master handsontable"]//tr[2]/td`, (result) => {
            this.elementIdText(result.value[0].ELEMENT, (text) => dataSourceEntries.push(text.value))
              .elementIdClick(result.value[0].ELEMENT)
              .click('.mce-ico.mce-i-tabledeletecol')
              .pause(500);
          });
        }
        return dataSourceEntries;
      });
  },

  /** @param {number} line - line in data source that need to be changed
   * @param {Array} values - array of new data that need to be inserted in line instead of old one
   * @param {boolean} ignore - if true, entered value will be asserted ingoring spaces, in use for email values in Data Sources
   * */
  changeValuesInDataSourceCells: function(line, values, ignore) {
    let ignoreSpaces = '';

    this
      .waitForElementVisible('.nav.nav-tabs[role="tablist"]', this.api.globals.mediumWait)
      .api.pause(1000)
      .resizeWindow(800, 800) // to prevent issue with blank data source, as after page scroll data appears
      .resizeWindow(1600, 1200) // to prevent issue with blank data source, as after page scroll data appears
      .waitForElementVisible(`#hot .wtSpreader tbody tr:nth-child(${line}) td`, this.api.globals.longWait)
      .pause(1000)
      .elements('css selector', `#hot .wtSpreader tbody tr:nth-child(${line}) td`, (result) => {
        for (let k = 0; k < values.length; k++) {
          let valueLength = 0;
          this.api
            .pause(1000)
            .elementIdText(result.value[k].ELEMENT, (textInRow) => {
              valueLength = textInRow.value.length;
            })
            .moveTo(result.value[k].ELEMENT)
            .doubleClick(() => {
              for (let i = 0; i < valueLength; i++) {
                this.api.keys([this.api.Keys.BACK_SPACE])
              }
            })
            .keys([values[k]])
            .moveToElement(`#hot .wtSpreader tbody tr:nth-child(${line+1}) td`, 0, 0)
            .click(`#hot .wtSpreader tbody tr:nth-child(${line+1}) td`)
            .perform(function(){
              if (ignore) {
                values[k] = values[k].replace(/\s+/g,"");

                this.api
                  .useXpath()
                  .waitForElementVisible(`//td/div[text()="${values[k]}"]`, this.api.globals.mediumWait)
                  .useCss();
              } else {
                this.api
                  .useXpath()
                  .waitForElementVisible(`//td/div[text()="${values[k]}"]`, this.api.globals.mediumWait)
                  .useCss();
              }
            })
        }
        this.api.pause(1000)
      });

    return this;
  },

  changeValuesInDataSourceCellsInLines: function(lineToStart, values, ignore, done){
    for(let i = 0; i < values.length; i++){
      this.changeValuesInDataSourceCells(lineToStart+i ,values[i],() => {
        done();
      });
    }
  },

  /** @param {number} line - line in data source that need to be changed
   * @param {Array} values - array of new data that need to be inserted in line instead of old one */
  assertCellsInLineContainSpecifiedValues: function (line, values) {
    return this
      .api.pause(2000)
      .waitForElementVisible('.nav.nav-tabs[role="tablist"]', this.api.globals.mediumWait)
      .resizeWindow(800, 800) // to prevent issue with blank data source, as after page scroll data appears
      .resizeWindow(1600, 1200) // to prevent issue with blank data source, as after page scroll data appears
      .perform(function() {
        for (let i = 0; i < values.length; i++) {
          this.api.useXpath()
            .assert.containsText(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[${line}]/td[${i + 1}]`, values[i])
            .useCss();
        }
      })
  },

  /* Sometimes WebDriver saves data in Data Source too fast, as result endless "Saving..." appears and data is not saved,
if this happens, added "if" to method will select empty place and trigger "Save" button to be visible again,
then changes will be saved second time */

  clickSaveChangesButtonOnEntriesScreen: function() {
    this
      .waitForElementVisible('.editing-data-source-name', this.api.globals.smallWait)
      .waitForElementVisible('@saveChangesButtonEntries', this.api.globals.smallWait)
      .api.pause(2500)
      .waitForAjaxCompleted()
      .click('.save-btn button')
      .waitForElementNotVisible('.save-btn button', this.api.globals.mediumWait)
      .pause(3000)
      .element('xpath', '//div[@class="data-save-updated"][contains(text(),"saved")]', function(result){
        if (result.status !== 0) { // checking if "All data is saved" message appeared
          this
            .element('css selector', '#hot .wtSpreader tbody tr:nth-child(10) td', function(result) {
              this
                .moveTo(result.value.ELEMENT) // preventing issue with endless loader on "Save" button
                .doubleClick() // preventing issue with endless loader on "Save" button
                .keys([this.Keys.BACK_SPACE]) // preventing issue with endless loader on "Save" button
                .keys([this.Keys.ENTER]) // preventing issue with endless loader on "Save" button
                .mouseButtonClick(0); // preventing issue with endless loader on "Save" button
            })
            .waitForElementVisible('.save-btn button', this.globals.smallWait)
            .waitForAjaxCompleted()
            .click('.save-btn button')
            .useXpath()
            .waitForElementVisible('//div[@class="data-save-updated"][contains(text(),"saved")]', this.globals.mediumWait)
        } else  {
          this
            .useXpath()
            .waitForElementVisible('//div[@class="data-save-updated"][contains(text(),"saved")]', this.globals.mediumWait)
        }
      })
      .useCss()
      .pause(1500);

    return this;
  },

  /** @param {String} additionalText - new text that is added to email subject in definition */
  changeEmailSubjectInDataSourceDefinition: function (additionalText) {
    return this
      .waitForElementVisible('@subjectJsonValueElement', this.api.globals.tinyWait)
      .click('@subjectJsonValueElement', function () {
        this.keys([additionalText])
      })
  },

  //due to applied changes in the component interface
  // changeEmailSubjectInDataSourceDefinition: function(additionalText){
  //   return this
  //     .getValue('#definition', function(text){
  //       let newText = {};
  //       Object.assign(newText, JSON.parse(text.value));
  //       newText.validation.email.template.subject = `${newText.validation.email.template.subject} ${additionalText}`;
  //       this
  //         .click('#definition')
  //         .keys([this.Keys.CONTROL,'\u0061', this.Keys.DELETE])
  //         .keys([this.Keys.NULL])
  //         .setValue('#definition', JSON.stringify(newText));
  //     });
  // },

  /** @param {number} row - a row number (on the left) after which new row will be inserted*/
  insertRowAfterSelectedOne: function(row){
    return this
      .waitForElementVisible(`#hot .wtSpreader tbody tr:nth-child(${row}) td`, this.api.globals.smallWait)
      .click(`#hot .wtSpreader tbody tr:nth-child(${row}) td`)
      .waitForElementVisible('@insertRowAfterButton', this.api.globals.smallWait)
      .click('@insertRowAfterButton');
  },

  /** @param {number} row - a row number (on the left) before which new row will be inserted*/
  insertRowBeforeSelectedOne: function(row){
    return this
      .waitForElementVisible(`#hot .wtSpreader tbody tr:nth-child(${row}) td`, this.api.globals.smallWait)
      .click(`#hot .wtSpreader tbody tr:nth-child(${row}) td`)
      .waitForElementVisible('@insertRowBeforeButton', this.api.globals.smallWait)
      .click('@insertRowBeforeButton');
  },

  /** @param {Array} firstCell - [line(row) number, cell number]
   * @param {Array}secondCell - [line(row) number, cell number]  */
  copyValueFromOneCellOntoAnother: function(firstCell, secondCell){
    return this
      .api.useXpath()
      .click(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[${firstCell[0]}]/td[${firstCell[1]}]`)
      .useCss()
      .waitForElementVisible('.btn.btn-default.action-copy', this.api.globals.smallWait)
      .click('.btn.btn-default.action-copy')
      .useXpath()
      .click(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[${secondCell[0]}]/td[${secondCell[1]}]`)
      .keys([this.api.Keys.CONTROL,'\u0056'])//using Keys, as 'Paste' button is not working yet
      .keys([this.api.Keys.NULL])
      .useCss();
  },

  /** @param {Array} firstCell - [line(row) number, cell number]
   * @param {Array}secondCell - [line(row) number, cell number]  */
  cutTextFromOneCellToPasteInAnother: function(firstCell, secondCell){
    return this
      .api.useXpath()
      .click(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[${firstCell[0]}]/td[${firstCell[1]}]`)
      .useCss()
      .waitForElementVisible('.btn.btn-default.action-cut', this.api.globals.smallWait)
      .click('.btn.btn-default.action-cut')
      .useXpath()
      .click(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[${secondCell[0]}]/td[${secondCell[1]}]`)
      .keys([this.api.Keys.CONTROL,'\u0056'])  //using Keys, as 'Paste' button is not working yet
      .keys([this.api.Keys.NULL])
      .useCss();
  },

  /** @param {Array} firstCell - [line(row) number, cell number]
   * @param {Array}secondCell - [line(row) number, cell number]  */
  assertTextInSecondCellIsTheSameAsInFirstCell: function(firstCell, secondCell){
    return this
      .api.element('xpath', `//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[${firstCell[0]}]/td[${firstCell[1]}]`,
        (result) => {
          this
            .api.elementIdText(result.value.ELEMENT, (text) => {
            this
              .api.useXpath()
              .expect.element(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[${secondCell[0]}]/td[${secondCell[1]}]`)
              .text.to.equal(text.value);
          })
        })
  },

  /** @param {Array} entryData - array with text data, where each row is an element in array */
  removeAllEntriesInDataSourceExceptLast: function(entryData){
    this
      .api.elements('css selector', '.relative .rowHeader', (elements) => {
        for (let i = 1; i < entryData.length+1; i++) {
          this
            .api.elementIdClick(elements.value[i].ELEMENT)
            .click('.mce-ico.mce-i-tabledeleterow')
            .pause(1000);
        }
      });

    return this;
  },

  /**  @param {number} column - number of selected column  */
  addColumnBeforeSelectedOne: function(column){
    return this
      .waitForElementVisible(`.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(${column|1})`, this.api.globals.longWait)
      .click(`.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(${column|1})`)
      .waitForElementVisible('.mce-ico.mce-i-tableinsertcolbefore', this.api.globals.mediumWait)
      .click('.mce-ico.mce-i-tableinsertcolbefore');
  },

  addColumnsBeforeSelectedOne: function(amountOfColumns, column, done){
    for(let i = 0; i < amountOfColumns; i++){
      this.addColumnBeforeSelectedOne(column,() => {
        done();
      });
    }
  },

  /**  @param {number} column - number of selected column  */
  addColumnAfterSelectedOne: function(column){
    return this
      .waitForElementVisible(`.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(${column})`, this.api.globals.mediumWait)
      .click(`.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(${column})`)
      .waitForElementVisible('.mce-ico.mce-i-tableinsertcolafter', this.api.globals.mediumWait)
      .click('.mce-ico.mce-i-tableinsertcolafter');
  },

  /**  @param {number} column - number of selected column
   * @param {String} name - name of column  */
  assertColumnHasSpecifiedName: function(column, name){
    return this
      .waitForElementVisible(`.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(${column})`, this.api.globals.smallWait)
      .expect.element(`.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(${column})`).text.to.equal(name);
  },

  /** @param {Array} names - array with column names */
  removeColumnsByNames: function(names){
    for(let i = 0; i < names.length; i++){
      this
        .api.useXpath()
        .click(`//div[@class="ht_clone_top handsontable"]//div[@class="wtSpreader"]//tbody//td[text()="${names[i]}"]`)
        .useCss()
        .click('.mce-ico.mce-i-tabledeletecol')
        .pause(1000);
    }
    return this;
  },

  /** @param {Array} names - array with column names */
  assertColumnsWithDefinedNamesAreNotPresent: function(names){
    for(let i = 0; i < names.length; i++) {
      this
        .assert.elementNotPresent(`//div[@class="ht_clone_top handsontable"]//div[@class="wtSpreader"]//tbody//td/div[text()="${names[i]}"]`);
    }
    return this;
  },

  /** @param{Array} entries - empty array where text of all entries matching criteria will be added*/
  getTextOfDataSourceEntries: function (entries, numberOfRows) {
    this.api.perform(function () {
        for (let i = 2; i < numberOfRows+1; i++) {
          this.api.getText(`#hot .wtSpreader tbody tr:nth-child(${i}) td:first-of-type div`, function (text) {
            entries.push(text.value);
          })
        }
      });

    return this;
  },

  assertFormAnswerIsSavedToForm: function(answer){
    return this
      .waitForElementVisible('@firstTableCell', this.api.globals.smallWait)
      .assert.containsText('@firstTableCell', answer);
  },

  assertCorrectDataFromSubmittedFormInDataSource: function (fieldsNames, arr) {
    return this
      .api.perform(() => {
        for (let i = 0; i < fieldsNames.length; i++) {
          this.assert.ok(arr.includes(fieldsNames[i]),
            `${arr} include '${fieldsNames[i]}'`)
        }
      })
  },

  /* Sometimes WebDriver saves data in Data Source too fast, as result endless "Saving..." appears and data is not saved,
  if this happens, added "if" to method will select empty place and trigger "Save" button to be visible again,
  then changes will be saved second time */

  clickSaveChangesButtonOnEntriesWindowFromAppDetails: function() {
    return this
      .waitForElementVisible('.editing-data-source-name', this.api.globals.smallWait)
      .waitForElementVisible('@saveChangesButtonEntries', this.api.globals.smallWait)
      .waitForAjaxCompleted()
      .api.pause(1500)
      .click('.save-btn button')
      .pause(7000)
      .element('css selector', '.data-save-updated', function(result){
        if (result.status === 0) { // testing if modal window with data source still present
          this
            .element('css selector', '#hot .wtSpreader tbody tr:nth-child(10) td', function(result) {
              this
                .moveTo(result.value.ELEMENT) // preventing issue with endless loader on "Save" button
                .doubleClick() // preventing issue with endless loader on "Save" button
                .keys([this.Keys.BACK_SPACE]) // preventing issue with endless loader on "Save" button
                .keys([this.Keys.ENTER]) // preventing issue with endless loader on "Save" button
                .mouseButtonClick(0); // preventing issue with endless loader on "Save" button
            })
            .pause(1000)
            .element('css selector', '.save-btn button', function(result){ // assuring that "Save" button still present
              if (result.status === 0) {
                this
                  .waitForElementVisible('.save-btn button', this.globals.smallWait)
                  .click('.save-btn button')
                  .waitForElementNotPresent('.controls-wrapper', this.globals.longWait);
              } else {
                this.waitForElementNotPresent('.controls-wrapper', this.globals.smallWait)
              }
            })
        } else  {
          this.waitForElementNotPresent('.controls-wrapper', this.globals.smallWait)
        }
      })
      .pause(1000);
  },

  assertColumnNamesAreNotDefault: function(){
    this.expect.element(`.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(1)`).text.to.not.equal('Column 1')
      .before(this.api.globals.mediumWait);
    this.expect.element(`.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(2)`).text.to.not.equal('Column 2')
      .before(this.api.globals.mediumWait);
    return this;
  },

  assertDataInFirsLineIsNotDefault: function() {
    this.api.useXpath();
    this.expect.element(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[2]/td[1]`).text.to.not.equal('demo data');
    this.expect.element(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[2]/td[2]`).text.to.not.equal('demo data');
    return this.api.useCss();
  },

  assertSpecifiedValuesInDataSource: function (qtyOfColumns, values) {
    this
      .api.pause(2000)
      .waitForElementVisible('.nav.nav-tabs[role="tablist"]', this.api.globals.mediumWait)
      .resizeWindow(800, 800) // to prevent issue with blank data source, as after page scroll data appears
      .resizeWindow(1600, 1200) // to prevent issue with blank data source, as after page scroll data appears
      .perform(function() {
        for (let i = 0; i < qtyOfColumns; i++) {
          this.api.useXpath()
            .assert.visible(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody//td[${i + 1}]/div[contains(text(), '${values[i]}')]`)
            .useCss();
        }
      });

    return this;
  },

  getTextFromDataSourceCell: function(cellNumber, dataFromCell) {
    const dataSourceCellLocator = `//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[2]/td[${cellNumber}]`;

    this
      .api.useXpath()
      .waitForElementVisible(dataSourceCellLocator, this.api.globals.mediumWait)
      .getText(dataSourceCellLocator, (text) => dataFromCell.push(text.value.toString()))
      .useCss();

    return dataFromCell;
  }
};

module.exports = {
  commands: [commands],
  elements: {
    entriesTab: {
      selector: 'a[aria-controls="entries"]'
    },
    accessRolesTab: {
      selector: 'a[aria-controls="roles"]'
    },
    settingsTab: {
      selector: 'a[aria-controls="settings"]'
    },
    securityRulesTab: {
      selector: 'a[aria-controls="access-rules"]'
    },
    nameField: {
      selector: '#name'
    },
    backToDataSourcesButton: {
      selector: '//div[@class="header"]/a[text()="See all data sources"] | //div[@class="header"]/a[text()="See all my app\'s data sources"]',
      locateStrategy: 'xpath'
    },
    deleteButton: {
      selector: '.btn.text-danger'
    },
    addRoleButton: {
      selector: './/*[@id="roles"]/button',
      locateStrategy: 'xpath'
    },
    revokeRoleButton: {
      selector: '.btn.btn-danger[data-revoke-role]'
    },
    dataSourceName: {
      selector: '.editing-data-source-name'
    },
    saveChangesButtonSettings: {
      selector: '.settings-btns.active'
    },
    showBypassCodeButton: {
      selector: '#get-backdoor'
    },
    bypassCode: {
      selector: '#backdoor'
    },
    saveChangesButtonEntries: {
      selector: '.save-btn button'
    },
    insertRowAfterButton: {
      selector: '.mce-ico.mce-i-tableinsertrowafter'
    },
    insertRowBeforeButton: {
      selector: '.mce-ico.mce-i-tableinsertrowbefore'
    },
    firstTableCell: {
      selector: './/div[@id="hot"]/div[@class="ht_master handsontable"]//tr[2]/td',
      locateStrategy: 'xpath'
    },
    subjectJsonValueElement: {
      selector: '//span[contains(text(), "subject")]/following-sibling::span',
      locateStrategy: 'xpath'
    },
    columnName: {
      selector: '.ht_clone_top.handsontable .wtSpreader tbody tr td:nth-of-type(1)'
    },
    verificationHiddenCode: {
      selector: '.backdoor-code  p.help-block code:nth-of-type(2)'
    },
    dataSourceTableCell: {
      selector: '.relative .rowHeader'
    },
    dataSourceIdInSettingsTab: {
      selector: '#id'
    }
  }
};