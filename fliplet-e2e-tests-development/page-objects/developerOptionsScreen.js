const util = require('util');
const dataSourceTitleInDropdownMenuOnReferencesModal = '//li[@data-select]//div[@class="option__title"][text()="%s"]';
const dataSourceTitleInReferencesListOnModal ='//ul[@class="data-source-resources"]//div[@class="dependency-title"][text()="%s"]';
const deleteDataSourceButtonInReferencesListOnModal ='//ul[@class="data-source-resources"]//div[@class="dependency-title"]' +
  '[text()="%s"]/ancestor::li//div[@class="delete-controls"]';

const commands = {
  enterScreenCss: function(css){
    this
      .api.useXpath()
      .waitForElementVisible('(//div[@class="CodeMirror-code"])[1]', this.api.globals.smallWait)
      .element('xpath', '(//div[@class="CodeMirror-code"])[1]', (result) => {
        this
          .api.moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT)
          .keys([css])
          .keys([this.api.Keys.NULL]);
      })
      .pause(1000)
      .useCss();

    return this;
  },

  enterScreenJavaScript: function(js){
    this
      .api.useXpath()
      .waitForElementVisible('(//div[@class="CodeMirror-code"])[3]', this.api.globals.smallWait)
      .waitForElementVisible('//*[@class=" CodeMirror-line "]//span[contains(text(), "dependencies")]', this.api.globals.smallWait)
      .pause(1000)
      .element('xpath', '//*[@class=" CodeMirror-line "]//span[contains(text(), "dependencies")]', (result) => {
        this
          .api.moveTo(result.value.ELEMENT, 0, 0)
          .mouseButtonClick(0)
          .keys([this.api.Keys.ENTER,js])
          .keys([this.api.Keys.NULL]);
      })
      .pause(1000)
      .useCss();

    return this;
  },

  /** Command for changing html in developer options*/
  changeHeadingSizeOfTitle: function(size){
    this
      .waitForElementVisible('pre.CodeMirror-line span.cm-tag', this.api.globals.smallWait)
      .api.pause(5000)
      .elements('css selector', 'pre.CodeMirror-line span.cm-tag', (result)=> {
        this
          .api.elementIdClick(result.value[13].ELEMENT)
          .keys([this.api.Keys.ARROW_RIGHT, this.api.Keys.BACK_SPACE, size]);
      })
      .waitForElementVisible('pre.CodeMirror-line span.cm-tag.cm-error', this.api.globals.smallWait)
      .elements('css selector', 'pre.CodeMirror-line span.cm-tag.cm-error', (result) => {
        this
          .api.elementIdClick(result.value[0].ELEMENT)
          .keys([this.api.Keys.ARROW_RIGHT, this.api.Keys.BACK_SPACE, size]);
      });

    return this;
  },

  /** @param{Array}dependencies - array with all dependencies added for app*/
  enterScreenDependencies: function(dependencies){
    return this
      .waitForElementVisible('.fl-icon-download-cloud.fa-fw', this.api.globals.longWait)
      .waitForElementVisible('.CodeMirror-scroll', this.api.globals.smallWait)
      .api.pause(1500)
      .click('.fl-icon-download-cloud.fa-fw')
      .waitForElementVisible('.form-group.dependencies-group .multiselect', this.api.globals.smallWait)
      .perform(function(){
        for (let i = 0; i < dependencies.length; i++){
          this
            .api.waitForElementVisible('.multiselect input',this.api.globals.smallWait )
            .click('.multiselect input')
            .keys([dependencies[i],this.api.Keys.ENTER])
            .useXpath()
            .waitForElementVisible(`//span[text()="${dependencies[i]}"]`, this.api.globals.longWait)
            .useCss();
        }
      })
      .waitForElementVisible('.modal-footer .btn.btn-primary', this.api.globals.smallWait)
      .click('.modal-footer .btn.btn-primary')
      .waitForElementNotPresent('.form-group.dependencies-group', this.api.globals.smallWait)
      .pause(3000)
  },

  clickSaveAndRunButton: function(){
    return this
      .waitForElementVisible('@saveAndRunButton', this.api.globals.smallWait)
      .api.element('css selector', '.footer-holder .btn.btn-primary', (result) => {
        this
          .api.moveTo(result.value.ELEMENT)
          .mouseButtonClick(0);
      })
      .pause(1000)
      .isVisible('.side-view.app-developer .fade-transition.alert.alert-success', function(displaying){
        if(displaying.value !== true){
          this.click('.footer-holder .btn.btn-primary')
        }
      })
      .waitForElementVisible('.side-view.app-developer .fade-transition.alert.alert-success', this.api.globals.mediumWait);
  },

  clickSaveAndRunButtonAfterImplementedChanges: function(){
    const resultDisplaying = [];
    const unsavedChangesMessageLocator = '.unsaved-changes';
    const saveAndRunButtonLocator = '.footer-holder .btn.btn-primary';

    this
      .waitForElementVisible(unsavedChangesMessageLocator, this.api.globals.mediumWait)
      .waitForElementVisible(saveAndRunButtonLocator, this.api.globals.smallWait)
      .api.pause(2000)
      .click(saveAndRunButtonLocator)
      .waitForElementNotPresentWithoutErrors(unsavedChangesMessageLocator, this.api.globals.mediumWait, resultDisplaying)
      .perform(function () {
        if (resultDisplaying[0] == false) {
          this.api.click(saveAndRunButtonLocator)
        }
      })
      .waitForElementNotPresent(unsavedChangesMessageLocator, this.api.globals.mediumWait)
      .pause(1000);

    return this;
  },

  switchToGlobalSettings: function(){
    this
      .api.pause(3000)
      .useXpath()
      .waitForElementVisible('//ul[@role="tablist"]//a[text()="Global"]', this.api.globals.smallWait)
      .click('//ul[@role="tablist"]//a[text()="Global"]')
      .waitForElementVisible('(//label[@class ="devtools-label clearfix"])[4]', this.api.globals.smallWait)
      .useCss()
      .pause(2000);

    return this;
  },

  enterGlobalParameterValue: function(parameter, value){
    const codeMirrorLocator =`//div[@class='tab-pane active fadein-transition']//div[text()='${parameter}']/ancestor::div[@class='col-xs-6']//div[@class="CodeMirror-code"]`;

    this
      .api.useXpath()
      .waitForElementVisible(codeMirrorLocator, this.api.globals.smallWait)
      .element('xpath', codeMirrorLocator, (result) => {
        this
          .api.moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT)
          .keys([value]);
      })
      .pause(1000)
      .useCss();

    return this;
  },

  enterHTMLToDeveloperOptions: function(html){
    return this
      .api.useXpath()
      .waitForElementVisible('(//pre[@class=" CodeMirror-line "])[11]', this.api.globals.smallWait)
      .element('xpath', '(//pre[@class=" CodeMirror-line "])[11]', (result) => {
        this
          .api.moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT)
          .keys([this.api.Keys.ENTER])
          .keys([html]);
      })
      .pause(1000)
      .useCss();
  },

  clickAddButtonToOpenReferencesDropdownMenu: function(){
    return this
      .waitForElementVisible('@addButton', this.api.globals.mediumWait)
      .click('@addButton')
      .waitForElementVisible('@dataSourcesLinkInReferencesDropdownMenu', this.api.globals.smallWait);
  },

  clickDataSourceLinkToOpenReferences: function(){
    return this
      .waitForElementVisible('@dataSourcesLinkInReferencesDropdownMenu', this.api.globals.mediumWait)
      .click('@dataSourcesLinkInReferencesDropdownMenu')
      .waitForElementNotVisible('@dataSourcesLinkInReferencesDropdownMenu', this.api.globals.smallWait)
      .waitForElementVisible('@saveButtonOnReferencesModal', this.api.globals.smallWait);
  },

  selectDataSourceInDropdownMenuOnReferencesModal: function(dataSourceTitle){
    this
      .waitForElementVisible('@dataSourceDropdownMenuOnReferencesModal', this.api.globals.mediumWait)
      .click('@dataSourceDropdownMenuOnReferencesModal')
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceTitleInDropdownMenuOnReferencesModal, dataSourceTitle), this.api.globals.smallWait)
      .click(util.format(dataSourceTitleInDropdownMenuOnReferencesModal, dataSourceTitle))
      .waitForElementNotVisible(util.format(dataSourceTitleInDropdownMenuOnReferencesModal, dataSourceTitle), this.api.globals.smallWait)
      .useCss();

    return this;
  },

  assertDataSourceIsPresentInReferencesListOnModal: function(dataSourceTitle){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(dataSourceTitleInReferencesListOnModal, dataSourceTitle), this.api.globals.smallWait)
      .useCss();

    return this;
  },

  assertDataSourceIsNotPresentInReferencesListOnModal: function(dataSourceTitle){
    this
      .api.useXpath()
      .waitForElementNotPresent(util.format(dataSourceTitleInReferencesListOnModal, dataSourceTitle), this.api.globals.smallWait)
      .useCss();

    return this;
  },

  deleteDataSourceFromReferencesOnModal: function(dataSourceTitle){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(deleteDataSourceButtonInReferencesListOnModal, dataSourceTitle), this.api.globals.smallWait)
      .click(util.format(deleteDataSourceButtonInReferencesListOnModal, dataSourceTitle))
      .waitForElementNotPresent(util.format(deleteDataSourceButtonInReferencesListOnModal, dataSourceTitle), this.api.globals.smallWait)
      .useCss();

    return this;
  },

  clickSaveButtonOnDataSourceReferencesModal: function (){
    return this
      .waitForElementVisible('@saveButtonOnReferencesModal', this.api.globals.mediumWait)
      .click('@saveButtonOnReferencesModal')
      .waitForElementNotPresent('@saveButtonOnReferencesModal', this.api.globals.smallWait);
  }
};

module.exports = {
  commands: [commands],
  elements: {
    saveAndRunButton: {
      selector: '.footer-holder .btn.btn-primary'
    },
    addButton: {
      selector: '.dev-tool.settings-btn.dropdown-toggle'
    },
    dataSourcesLinkInReferencesDropdownMenu: {
      selector: '.fa.fa-table.fa-fw'
    },
    dataSourceDropdownMenuOnReferencesModal: {
      selector: '//h4[text()="Data source references"]/parent::div/parent::div//div[@class="multiselect"]',
      locateStrategy: 'xpath'
    },
    saveButtonOnReferencesModal: {
      selector: '//h4[text()="Data source references"]/parent::div/parent::div//button[@data-bb-handler="confirm"]',
      locateStrategy: 'xpath'
    },
    lastAddedDataSourceInDataSourceReferencesListOnModal: {
      selector: '(//ul[@class="data-source-resources"]//div[@class="dependency-title"])[last()]',
      locateStrategy: 'xpath'
    }
  }
};