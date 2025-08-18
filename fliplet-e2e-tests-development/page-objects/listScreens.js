const elementAttributes = require('../utils/constants/elementAttributes');
const values = require('../utils/constants/values');
const util = require('util');
const whoCanEditListItemsOptionTitle = '//span[text()="%s"]';
const panelTitleInputField = '#list-item-title-%s';
const panelDescriptionInputField = '#list-item-desc-%s';
const panelColorInputField = '#list-item-color-%s';
const listItemPanel = 'h4[data-target="#collapse-%s"]';
const addImageButtonForListItem = '#collapse-%s .btn.btn-default.list-item-set-image.add-image';
const removeButtonFroListItemImageButton = '#collapse-%s .btn.btn-link.text-danger.image-remove';
const allowUsersOptionInEntryManagement = '//div[@id="permissions-accordion"]//span[@class="check"]/parent::label[@for="%s_entry"]';
const selectedUserNameDataFieldInEntryManagement ='//div[@class="user-name-fields"]//span[@class="token-label"][text()="%s"]';
const selectedDatSourceColumnNameInSortingListByUser = '//div[@class="sort-fields"]//span[@class="token-label"][text()="%s"]';
const selectedDatSourceColumnNameInSearching = '//div[@class="search-fields"]//span[@class="token-label"][text()="%s"]';
const selectedDatSourceColumnNameInFiltering = '//div[@class="filter-fields"]//span[@class="token-label"][text()="%s"]';
const dataSourceFieldInCustomFilterDropdown = '.panel-collapse.collapse.in select[name*="select-data-field"] option[value="%s"]';
const loginOptionInCustomFilterDropdown = '.panel-collapse.collapse.in option[value="%s"]';

const commands = {
  clickAddNewItemButton: function () {
    return this
      .waitForElementVisible('@addNewItemButton', this.api.globals.smallWait)
      .click('@addNewItemButton')
      .waitForElementVisible('@listPanel', this.api.globals.smallWait);
  },

  getDataIdOfExpandedListItem: function (arr) {
    return this
      .getAttribute('@collapsedActivePanel', elementAttributes.ID, (id) => arr.push(id.value.split("-")[1]));
    },

  changeListItemTitle: function (dataId, listItemTitle) {
    return this
      .waitForElementVisible(util.format(panelTitleInputField, dataId), this.api.globals.tinyWait)
      .clearValue(util.format(panelTitleInputField, dataId))
      .setValue(util.format(panelTitleInputField, dataId), listItemTitle);
  },

  changeListItemDescription: function (dataId, listItemDescription) {
    return this
      .waitForElementVisible(util.format(panelDescriptionInputField, dataId), this.api.globals.tinyWait)
      .clearValue(util.format(panelDescriptionInputField, dataId))
      .setValue(util.format(panelDescriptionInputField, dataId), listItemDescription);
  },

  changeImageAreaColor: function (dataId, listItemColor) {
    return this
      .waitForElementVisible(util.format(panelColorInputField, dataId), this.api.globals.tinyWait)
      .clearValue(util.format(panelColorInputField, dataId))
      .setValue(util.format(panelColorInputField, dataId), listItemColor);
  },

  clickSelectAnIconButton: function (dataId) {
    const iframeDisplaying = [];
    const locator = `#collapse-${dataId} .btn.btn-default.list-item-set-icon.add-icon`;

    return this
      .waitForElementVisible(locator, this.api.globals.smallWait)
      .moveToElement(locator, 0, 0)
      .api.pause(2000)
      .clickElementAndCheckExpectedElement(locator, '.fl-widget-provider[data-package="com.fliplet.icon-selector"]')
      .waitForElementPresentWithoutErrors('.fl-widget-provider[data-package="com.fliplet.icon-selector"]', this.api.globals.tinyWait,
        iframeDisplaying)
      .perform(function() { // for case when frame with icons is not opened but "replace icon" button appears
        if (iframeDisplaying[0] == false) { // if iframe is not present
          this.api
            .useXpath()
            .click('(//div[@class="btn btn-default list-item-set-icon add-icon"])[2]') // click on "replace icon" button
            .useCss();
        }
      });
  },

  selectWebApplicationIconByName: function (name) {
    const locator = `//span[text()="${name}"]//ancestor::`;

    return this
      .api.useXpath()
      .waitForElementVisible(`${locator}div[@class="holder"]`, this.api.globals.tinyWait)
      .pause(1000)
      .moveToElement(`${locator}div[@class="holder"]`, 0, 0)
      .click(`${locator}div[@class="holder"]`)
      .waitForElementPresent(`${locator}li[@class="icon-item selected"]`, this.api.globals.tinyWait)
      .useCss();
  },

  collapseListItem: function (dataId) {
    this
      .waitForElementPresent(util.format(listItemPanel, dataId), this.api.globals.smallWait)
      .waitForElementVisible(util.format(listItemPanel, dataId), this.api.globals.smallWait)
      .moveToElement(util.format(listItemPanel, dataId), 0, 0)
      .click(util.format(listItemPanel, dataId))
      .api.pause(4000)
      .isVisible(util.format(panelTitleInputField, dataId),function(displaying) {
        if (displaying.value !== false){
          this
            .moveToElement(util.format(listItemPanel, dataId), 0, 0)
            .click(util.format(listItemPanel, dataId));
        }
      })
      .waitForElementNotVisible(util.format(panelTitleInputField, dataId), this.api.globals.tinyWait);

    return this;
  },

  clickAddImageButton: function (dataId) {
    return this
      .waitForElementVisible(util.format(addImageButtonForListItem, dataId), this.api.globals.tinyWait)
      .moveToElement(util.format(addImageButtonForListItem, dataId), 1 ,1)
      .click(util.format(addImageButtonForListItem, dataId));
  },

  checkThatCorrectFileIsSelectedForListItemLinkAction: function (fileName, frameNumber =1) {
    this
      .switchToWidgetInstanceFrame()
      .switchToFlWidgetFrameByNumber(frameNumber)
      .waitForElementVisible('@fileHolderNameForListItemPanel', this.api.globals.tinyWait)
      .assert.containsText('@fileHolderNameForListItemPanel', fileName, 'The correct file is selected for the list item link action.')
      .api.frameParent();

    return this;
  },

  checkThatImageHasBeenSelectedForListItemBackground: function (dataId) {
    return this
      .switchToWidgetInstanceFrame()
      .waitForElementVisible(util.format(removeButtonFroListItemImageButton, dataId), this.api.globals.tinyWait)
      .assert.visible(util.format(removeButtonFroListItemImageButton, dataId), 'The image is selected for list item background.');
  },

  selectListFromDataSourceLayoutByTitle: function (lfdLayout) {
    const lfdLayoutSelectedAreaLocator = `[data-layout=${lfdLayout}] > div > .selected-screen`;
    const lfdLayoutOnScreenLocator = `[data-dynamic-lists-layout=${lfdLayout}]`;
    const resultDisplaying = [];

    this
      .waitForAjaxCompleted()
      .waitForElementNotVisible('@loadingSpinner', this.api.globals.smallWait)
      .assertAmountOfElementsPresent('.static-img', 5)
      .waitForElementPresent(lfdLayoutSelectedAreaLocator, this.api.globals.longWait)
      .api.element('css selector', lfdLayoutSelectedAreaLocator, function (result) {
      this
        .moveTo(result.value.ELEMENT)
        .doubleClick();
    })
      .frameParent()
      .switchToPreviewFrame()
      .waitForElementPresentWithoutErrors(lfdLayoutOnScreenLocator, 20000, resultDisplaying)
      .perform(function () {
        if (resultDisplaying[0] === false) {
          this.api
            .frameParent()
            .switchToWidgetInstanceFrame()
            .waitForElementPresent(lfdLayoutSelectedAreaLocator, this.api.globals.longWait)
            .element('css selector', lfdLayoutSelectedAreaLocator, function (result) {
              this
                .moveTo(result.value.ELEMENT)
                .doubleClick();
            })
        }
      })
      .frameParent()
      .switchToWidgetInstanceFrame();

    return this
      .waitForElementNotVisible('@loadingSpinner', this.api.globals.longWait)
      .waitForElementVisible('@dataViewSettingsButton', this.api.globals.longWait);
  },

  expandSortingOptionsForList: function () {
    return this
      .waitForElementVisible('@sortingAccordionHeading', this.api.globals.smallWait)
      .click('@sortingAccordionHeading')
      .waitForElementVisible('@dataFieldNameDropdownInSorting', this.api.globals.smallWait);
  },

  changeSortOrderToDescending: function () {
    return this
      .waitForElementPresent('@descendingOptionInSorting', this.api.globals.smallWait)
      .click('@descendingOptionInSorting')
      .waitForElementVisible('@descendingOptionInSorting', this.api.globals.smallWait);
  },

  clickDataViewSettings: function () {
    const dataViewSettingsButtonLocator = '.btn.btn-default[data-relations-fields]';
    const dataViewSettingsTitleLocator = '[class*="no-mobile tablet"]';
    const resultDisplaying = [];

    this
      .api.pause(1000)
      .waitForElementVisible(dataViewSettingsButtonLocator, this.api.globals.longWait)
      .click(dataViewSettingsButtonLocator)
      .waitForElementPresentWithoutErrors(dataViewSettingsTitleLocator, 5000, resultDisplaying)
      .perform( function() {
        if (resultDisplaying[0] == false) {
          this.api.click(dataViewSettingsButtonLocator);
        }
      })
      .waitForElementPresent(dataViewSettingsTitleLocator, this.api.globals.mediumWait)
      .waitForElementVisible('.original-row.clearfix', this.api.globals.mediumWait)
      .pause(2500);

    return this;
  },

  selectImageFolderOnDataView: function (folder) {
    this
      .api.useXpath()
      .waitForElementVisible(`//div[@class="image-type-select clearfix"]//select`, this.api.globals.smallWait)
      .getAttribute(`//div[@class="image-type-select clearfix"]//select`, 'id', function (result) {
        this
          .selectValueFromDropdownByText(result.value, folder)
          .useXpath()
          .waitForElementVisible(`//select[@id='${result.value}']/option[text()='${folder}']`, this.globals.smallWait);
      })
      .useCss();

    return this;
  },

  clickSelectFolderButton: function () {
    const selectFolderButtonLocator = `//div[@class="rTableCell select field picker-provider-button"]/div[@class="btn btn-default file-picker-btn"]`;
    const filePickerProviderLocator ='//*[@data-package="com.fliplet.file-picker"]';
    const resultDisplaying = [];

    this
      .api.useXpath()
      .waitForElementVisible(selectFolderButtonLocator, this.api.globals.smallWait)
      .pause(2000)
      .click(selectFolderButtonLocator)
      .waitForElementPresentWithoutErrorsXpath(filePickerProviderLocator, 5000, resultDisplaying)
      .perform( function() {
        if (resultDisplaying[0] == false) {
          this.api.click(selectFolderButtonLocator);
        }
      })
      .waitForElementVisible(filePickerProviderLocator, this.api.globals.mediumWait)
      .useCss()
      .switchToFLWidgetProviderFrame('select#drop-down-file-source')
      .waitForElementVisible('.image-library', this.api.globals.mediumWait)
      .pause(2000);

    return this;
  },

  enterNumberInItemsToShowField: function (numbersToDisplay) {
    return this
      .waitForElementVisible('@itemsToShowField', this.api.globals.longWait)
      .click('@itemsToShowField')
      .setValue('@itemsToShowField', numbersToDisplay)
      .api.pause(1500)
      .waitForElementNotVisible('.spinner-overlay', this.api.globals.smallWait);
  },

  clickAllowSearchCheckbox: function(){ // is checked by default
    return this
      .waitForElementVisible('@allowSearchCheckbox', this.api.globals.smallWait)
      .click('@allowSearchCheckbox');
  },

  clickAllowFiltersCheckbox: function(){ // is checked by default
    return this
      .waitForElementPresent('@allowFiltersCheckbox', this.api.globals.smallWait)
      .moveToElement('@allowFiltersCheckbox', 0, 0)
      .waitForElementVisible('@allowFiltersCheckbox', this.api.globals.smallWait)
      .click('@allowFiltersCheckbox');
  },

  clickDisplayFiltersAsFullScreenOverlay: function(){
    this
      .waitForElementPresent('@displayFiltersAsFullScreenOverlayCheckboxTitle', this.api.globals.smallWait)
      .moveToElement('@displayFiltersAsFullScreenOverlayCheckboxTitle', 0, 0)
      .waitForElementVisible('@displayFiltersAsFullScreenOverlayCheckboxTitle', this.api.globals.tinyWait)
      .click('@displayFiltersAsFullScreenOverlayCheckboxTitle')
      .waitForElementPresent('@displayFiltersAsFullScreenOverlayCheckbox', this.api.globals.tinyWait)
      .expect.element('@displayFiltersAsFullScreenOverlayCheckbox').to.be.selected.before(this.api.globals.tinyWait);

    return this;
  },

  expandEntryManagementBlock: function(){
    this
      .waitForElementVisible('@entryManagementAccordionTitle', this.api.globals.longWait)
      .click('@entryManagementAccordionTitle')
      .assert.attributeEquals('@entryManagementAccordionTitle', elementAttributes.ARIA_EXPANDED, values.TRUE,
        'Entry management block is expanded.');

    return this;
  },

  expandSocialFeaturesBlock: function(){
    return this
      .waitForElementVisible('@socialFeaturesAccordionTitle', this.api.globals.longWait)
      .click('@socialFeaturesAccordionTitle')
      .assert.attributeEquals('@socialFeaturesAccordionTitle', elementAttributes.ARIA_EXPANDED, values.TRUE,
      'Social features block is expanded.');
  },

  clickAllowUserToBookmarkListItemsCheckbox: function(){ // is checked by default
    return this
      .waitForElementPresent('@allowUserToBookmarkListItemsCheckbox', this.api.globals.smallWait)
      .moveToElement('@allowUserToBookmarkListItemsCheckbox', 0, 0)
      .waitForElementVisible('@allowUserToBookmarkListItemsCheckbox', this.api.globals.smallWait)
      .click('@allowUserToBookmarkListItemsCheckbox');
  },

  clickEditComponentsCode: function() {
    return this
      .waitForElementVisible('.btn.btn-default[data-advanced]', this.api.globals.longWait)
      .moveToElement('.btn.btn-default[data-advanced]', 10, 10)
      .click('.btn.btn-default[data-advanced]')
      .waitForElementVisible('.advanced-tab.state.present .go-back', this.api.globals.smallWait)
      .waitForElementVisible('.tab-content .tab-pane.active', this.api.globals.smallWait)
      .api.pause(2000);
  },

  clickIWantToEditCheckbox: function(label) {
    return this
      .waitForElementVisible(`label[for="${label}"] span`, this.api.globals.smallWait)
      .click(`label[for="${label}"] span`)
      .api.useXpath()
      .frame(null)
      .waitForElementVisible('//h4[text()="Important"]', this.api.globals.smallWait)
      .useCss()
      .waitForElementVisible('button[data-bb-handler="confirm"]', this.api.globals.smallWait)
      .click('button[data-bb-handler="confirm"]')
      .switchToWidgetInstanceFrame()
      .waitForElementVisible(`div[data-id="${label}"][data-reset-default]`, this.api.globals.smallWait)
      .pause(1000);
  },

  /** Command for changing html class in developer options*/
  changeHtmlInDeveloperOptions: function(text){
    return this
      .waitForElementVisible('pre.CodeMirror-line span.cm-tag', this.api.globals.smallWait)
      .api.pause(3000)
      .elements('css selector', 'pre.CodeMirror-line span.cm-tag', (result)=> {
        this
          .api.elementIdClick(result.value[5].ELEMENT)
          .keys([this.api.Keys.ARROW_LEFT, text]);
      })
      .useXpath()
      .waitForElementVisible(`//span[@class="cm-string"][contains(text(), '${text}')]`, this.api.globals.smallWait)
      .useCss()
      .waitForElementVisible(`div[data-id="enable-templates"]`, this.api.globals.smallWait)
      .pause(1000);
  },

  /** Command for changing css in developer options*/
  changeCssInDeveloperOptions: function(number){
    return this
      .waitForElementVisible('pre.CodeMirror-line span.cm-number', this.api.globals.smallWait)
      .api.pause(3000)
      .element('xpath', '(//span[@class="cm-number"])[1]', (result)=> {
        this
          .api.elementIdClick(result.value.ELEMENT)
          .keys([this.api.Keys.BACK_SPACE, this.api.Keys.BACK_SPACE, number, this.api.Keys.BACK_SPACE]);
      })
      .useXpath()
      .moveToElement('(//span[@class="cm-number"])[1]', 0, 0)
      .waitForElementVisible(`//span[@class="cm-number"][contains(text(), '${number}vh')]`, this.api.globals.smallWait)
      .useCss();
  },

  /** Command for changing JS in developer options*/
  changeJsInDeveloperOptions: function(consoleText){
    return this
      .waitForElementVisible('.CodeMirror-line .cm-def', this.api.globals.smallWait)
      .api.pause(3000)
      .element('xpath', '//span[@class="cm-comment"][text()="// Constructor"]', (result)=> {
        this
          .api.elementIdClick(result.value.ELEMENT)
          .keys([this.api.Keys.ARROW_RIGHT, this.api.Keys.ARROW_RIGHT, this.api.Keys.ARROW_RIGHT,
            this.api.Keys.ARROW_RIGHT, this.api.Keys.ARROW_RIGHT, this.api.Keys.ARROW_RIGHT, this.api.Keys.ARROW_RIGHT,
            this.api.Keys.ENTER, `alert('${consoleText}');`]);
      })
      .useXpath()
      .waitForElementVisible(`//span[@class="cm-string"][text()="'${consoleText}'"]`, this.api.globals.smallWait)
      .useCss()
      .pause(1000);
  },

  switchToAnotherTabSettings: function(tab) {
    return this
      .waitForElementVisible('a[href="#css"]', this.api.globals.smallWait)
      .click(`a[href="#${tab}"]`)
      .waitForElementVisible(`#${tab} .action-control`, this.api.globals.smallWait)
      .waitForElementVisible(`.tab-pane.active[id="${tab}"]`, this.api.globals.smallWait);
  },

  /* "For" loop is added with purpose to be sure that changes are saved and details of component are closed.
     Sometimes component details don't disappear after several clicks and changes are not saved.
      ToDo: better approach for saving of changes should be found */

  clickSaveAndCloseButtonList: function(){
    return this
      .api.frameParent()
      .waitForElementVisible('.footer-column .btn.btn-primary', this.api.globals.smallWait)
      .pause(5500)
      .click('.footer-column .btn.btn-primary')
      .pause(3500)
      .perform(function () {
        for (let i = 0; i < 5; i++) {
          this.api
            .element('css selector', '.widget-interface.show.wide', function (result) {
              if (result.status === 0) {
                this
                  .moveToElement('.footer-column .btn.btn-primary', 1, 1)
                  .mouseButtonClick(0)
                  .pause(3500);
              } else return;
            })
        }
      })
      .waitForElementNotPresent('.widget-interface.show.wide', this.api.globals.smallWait)
      .pause(1000);
  },

  clickResetHtml: function() {
    return this
      .waitForElementVisible('.btn.btn-sm.btn-danger[data-id="enable-templates"]', this.api.globals.smallWait)
      .click('.btn.btn-sm.btn-danger[data-id="enable-templates"]')
      .api.frame(null)
      .waitForElementVisible('.modal-footer .btn.btn-primary', this.api.globals.smallWait)
      .click('.modal-footer .btn.btn-primary')
      .switchToWidgetInstanceFrame()
      .waitForElementNotVisible('.btn.btn-sm.btn-danger[data-id="enable-templates"]', this.api.globals.smallWait)
      .assert.elementPresent('.editor-holder.enable-templates.disabled');
  },

  confirmDataChangesInModalWindow: function() {
    this
      .api.frame(null)
      .waitForElementVisible('.btn.btn-secondary[data-bb-handler="cancel"]', this.api.globals.mediumWait)
      .click('.btn.btn-secondary[data-bb-handler="cancel"]')
      .waitForElementNotPresent('.btn.btn-secondary[data-bb-handler="cancel"]', this.api.globals.mediumWait)
      .pause(1000)
      .switchToWidgetInstanceFrame()
      .waitForElementNotVisible('.spinner-overlay', this.api.globals.longWait)
      .pause(1000);

    return this;
  },

  chooseOptionForWhoCanEditListItems: function(whoCanEditOption){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(whoCanEditListItemsOptionTitle, whoCanEditOption), this.api.globals.smallWait)
      .click(util.format(whoCanEditListItemsOptionTitle, whoCanEditOption))
      .expect.element(util.format(whoCanEditListItemsOptionTitle, whoCanEditOption)+`/parent::label//i`).to.not.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  enableAllowUserToAddListItemsOptionInEntryManagement: function() {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(allowUsersOptionInEntryManagement, 'add'), this.api.globals.tinyWait)
      .click(util.format(allowUsersOptionInEntryManagement, 'add'))
      .expect.element(util.format(allowUsersOptionInEntryManagement, 'add')+`/parent::div/input`).to.be.selected.before(this.api.globals.tinyWait);

    this
      .waitForElementVisible(util.format(allowUsersOptionInEntryManagement, 'add')+'/parent::div/div[contains(@class, "hidden-settings")]', this.api.globals.tinyWait)
      .api.useCss();

    return this;
  },

  enableAllowUserToEditListItemsOptionInEntryManagement: function() {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(allowUsersOptionInEntryManagement, 'edit'), this.api.globals.tinyWait)
      .click(util.format(allowUsersOptionInEntryManagement, 'edit'))
      .expect.element(util.format(allowUsersOptionInEntryManagement, 'edit')+`/parent::div/input`).to.be.selected.before(this.api.globals.tinyWait);

    this
      .waitForElementVisible(util.format(allowUsersOptionInEntryManagement, 'edit')+'/parent::div/div[contains(@class, "hidden-settings")]', this.api.globals.tinyWait)
      .api.useCss();

    return this;
  },

  enableAllowUserToDeleteListItemsOptionInEntryManagement: function(){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(allowUsersOptionInEntryManagement, 'delete'), this.api.globals.tinyWait)
      .click(util.format(allowUsersOptionInEntryManagement, 'delete'))
      .expect.element(util.format(allowUsersOptionInEntryManagement, 'delete') + '/parent::div/input').to.be.selected.before(this.api.globals.tinyWait);

    this
      .waitForElementVisible(util.format(allowUsersOptionInEntryManagement, 'delete') + '/parent::div/div[contains(@class, "hidden-settings")]', this.api.globals.tinyWait)
      .api.useCss();

    return this;
  },

  selectScreenWithFormInEntryManagement: function(frameNumber, screenTitle){
      this
        .switchToFlWidgetFrameByNumber(frameNumber)
        .selectValueFromDropdownByText('page', screenTitle)
        .api.useXpath()
        .expect.element(`//select[@name="link_screen"]/option[text()="${screenTitle}"]`).to.be.selected.before(this.api.globals.smallWait);

      this
        .api.useCss()
        .frameParent();

      return this;
  },

  selectFieldWherePostAuthorsEmailIsStored: function(emailField){
    this
      .selectValueFromDropdownByText('select_user_email_data', emailField)
      .api.useXpath()
      .expect.element(`//select[@name="select_user_email_data"]/option[text()="${emailField}"]`).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  addValueInInputFieldForNameDataSourceColumnInEntryManagement: function(nameDataField){
    this
      .waitForElementVisible('@inputFieldForNameDataSourceColumnInEntryManagement', this.api.globals.tinyWait)
      .setValue('@inputFieldForNameDataSourceColumnInEntryManagement', nameDataField)
      .api.element('css selector', '.select-user-email-holder label', (result) => {
        this
          .api.moveTo(result.value.ELEMENT)
          .doubleClick();
      })
      .useXpath()
      .waitForElementVisible(util.format(selectedUserNameDataFieldInEntryManagement, nameDataField), this.api.globals.tinyWait)
      .useCss();

    return this;
  },

  addValueInInputFieldForDataSourceColumnNameInSortingListByUser: function(nameDataField){
    this
      .waitForElementPresent('@entryManagementAccordionTitle', this.api.globals.tinyWait)
      .moveToElement('@entryManagementAccordionTitle', 1, 1)
      .waitForElementVisible('@inputFieldForDataSourceColumnNameInSortingListByUser', this.api.globals.tinyWait)
      .click('@inputFieldForDataSourceColumnNameInSortingListByUser')
      .api.pause(2000);

    this
      .setValue('@inputFieldForDataSourceColumnNameInSortingListByUser', nameDataField)
      .click('@inputFieldForDataSourceColumnNameInSortingListByUser')
      .api.pause(2000)
      .keys([this.api.Keys.ARROW_DOWN])
      .pause(2000)
      .keys([this.api.Keys.ENTER])
      .useXpath()
      .waitForElementVisible(util.format(selectedDatSourceColumnNameInSortingListByUser, nameDataField), this.api.globals.smallWait)
      .useCss();

    return this;
  },

  addValueInInputFieldForDataSourceColumnNameInSearchingBlock: function(nameDataField){
    this
      .waitForElementPresent('@entryManagementAccordionTitle', this.api.globals.tinyWait)
      .moveToElement('@entryManagementAccordionTitle', 1, 1)
      .waitForElementVisible('@inputFieldForDataSourceColumnNameInSearching', this.api.globals.tinyWait)
      .click('@inputFieldForDataSourceColumnNameInSearching')
      .api.pause(2000);

    this
      .setValue('@inputFieldForDataSourceColumnNameInSearching', nameDataField)
      .click('@inputFieldForDataSourceColumnNameInSearching')
      .api.pause(2000)
      .keys([this.api.Keys.ARROW_DOWN])
      .pause(2000)
      .keys([this.api.Keys.ENTER])
      .useXpath()
      .waitForElementVisible(util.format(selectedDatSourceColumnNameInSearching, nameDataField), this.api.globals.smallWait)
      .useCss();

    return this;
  },

  addValueInInputFieldForDataSourceColumnNameInFilteringBlock: function(nameDataField){
    this
      .waitForElementPresent('@entryManagementAccordionTitle', this.api.globals.tinyWait)
      .moveToElement('@entryManagementAccordionTitle', 1, 1)
      .waitForElementVisible('@inputFieldForDataSourceColumnNameInFiltering', this.api.globals.tinyWait)
      .click('@inputFieldForDataSourceColumnNameInFiltering')
      .api.pause(2000);

    this
      .setValue('@inputFieldForDataSourceColumnNameInFiltering', nameDataField)
      .click('@inputFieldForDataSourceColumnNameInFiltering')
      .api.pause(2000)
      .keys([this.api.Keys.ARROW_DOWN])
      .pause(2000)
      .keys([this.api.Keys.ENTER])
      .useXpath()
      .waitForElementVisible(util.format(selectedDatSourceColumnNameInFiltering, nameDataField), this.api.globals.smallWait)
      .useCss();

    return this;
  },

  selectUserEmailDataFieldInEntryManagement: function(emailField){
    this
      .selectValueFromDropdownByText('select_user_email', emailField)
      .api.useXpath()
      .expect.element(`//select[@name="select_user_email"]/option[text()="${emailField}"]`).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  enableAllowUsersToSortTheList: function(){
    this
      .waitForElementPresent('@allowUsersToSortTheListOption', this.api.globals.smallWait)
      .moveToElement('@allowUsersToSortTheListOption', 1, 1)
      .waitForElementVisible('@allowUsersToSortTheListOption', this.api.globals.smallWait)
      .click('@allowUsersToSortTheListOption')
      .expect.element('@allowUsersToSortTheListCheckbox').to.be.selected.before(this.api.globals.smallWait);

    return this;
  },

  clickAddNewFilterButton: function () {
    this
      .waitForElementVisible('@addNewFilterButton', this.api.globals.smallWait)
      .api.pause(1500);

    return this
      .click('@addNewFilterButton')
      .waitForElementVisible('@customFilterCollapsedPanel', this.api.globals.smallWait);
  },

  setValueForCustomFilter: function (filterValue) {
    return this
      .waitForElementVisible('@valueInputFieldInCustomFilterDropdown', this.api.globals.smallWait)
      .clearValue('@valueInputFieldInCustomFilterDropdown')
      .setValue('@valueInputFieldInCustomFilterDropdown', filterValue);
  },

  selectDataFieldForFilter: function(fieldNameForFilter){
    return this
      .waitForElementVisible('@dataSourceFieldDropdownInCustomFilterPanel', this.api.globals.smallWait)
      .waitForElementPresent(util.format(dataSourceFieldInCustomFilterDropdown, fieldNameForFilter), this.api.globals.smallWait)
      .click(util.format(dataSourceFieldInCustomFilterDropdown, fieldNameForFilter))
      .waitForElementVisible(util.format(dataSourceFieldInCustomFilterDropdown, fieldNameForFilter), this.api.globals.smallWait);
  },

  selectLogicOptionForCustomFilter: function(logicOption){
    return this
      .waitForElementVisible('@loginFieldDropdownInCustomFilterPanel', this.api.globals.smallWait)
      .waitForElementPresent(util.format(loginOptionInCustomFilterDropdown, logicOption), this.api.globals.smallWait)
      .click(util.format(loginOptionInCustomFilterDropdown, logicOption))
      .waitForElementVisible(util.format(loginOptionInCustomFilterDropdown, logicOption), this.api.globals.smallWait);
  },
};

module.exports = {
  commands: [commands],
  elements: {
    addNewItemButton: {
      selector: '.controls.clearfix .btn.btn-default.new-list-item'
    },
    collapsedActivePanel: {
      selector: '.panel-collapse.collapse.in'
    },
    selectAnIconButton: {
      selector: '.btn.btn-default.list-item-set-icon.add-icon'
    },
    itemsToShowField: {
      selector: '#items-number'
    },
    addNewFilterButton: {
      selector: '.add-filter-panel'
    },
    allowSearchCheckbox: {
      selector: 'label[for="enable-search"] .fa.fa-check'
    },
    allowFiltersCheckbox: {
      selector: 'label[for="enable-filters"] .fa.fa-check'
    },
    allowUserToBookmarkListItemsCheckbox: {
      selector: 'label[for="enable-bookmarks"] .fa.fa-check'
    },
    allowUsersToSortTheListCheckbox: {
      selector: '//label[@for="enable-sort"]/parent::div/input',
      locateStrategy: 'xpath'
    },
    allowUsersToSortTheListOption: {
      selector: '//label[@for="enable-sort"]',
      locateStrategy: 'xpath'
    },
    saveAndCloseButton: {
      selector: '.footer-column .btn.btn-primary'
    },
    listPanel: {
      selector: '//div[@class="panel-collapse collapse in"]',
      locateStrategy: 'xpath'
    },
    dataViewSettingsButton: {
      selector: '.btn.btn-default[data-relations-fields]'
    },
    loadingSpinner: {
      selector: '.spinner-overlay'
    },
    entryManagementAccordionTitle: {
      selector: '#permissions-accordion > div h4'
    },
    socialFeaturesAccordionTitle: {
      selector: '#social-accordion > div h4'
    },
    inputFieldForNameDataSourceColumnInEntryManagement: {
      selector: '#user-name-column-fields-tokenfield-tokenfield'
    },
    inputFieldForDataSourceColumnNameInSortingListByUser: {
      selector: '#sort-column-fields-tokenfield-tokenfield'
    },
    inputFieldForDataSourceColumnNameInSearching: {
      selector: '#search-column-fields-tokenfield-tokenfield'
    },
    inputFieldForDataSourceColumnNameInFiltering: {
      selector: '#filter-column-fields-tokenfield-tokenfield'
    },
    displayFiltersAsFullScreenOverlayCheckbox: {
      selector: '//span[@class="check"]/parent::label[@for="enable-filter-overlay"]/parent::div/input',
      locateStrategy: 'xpath'
    },
    displayFiltersAsFullScreenOverlayCheckboxTitle: {
      selector: '//span[@class="check"]/parent::label[@for="enable-filter-overlay"]',
      locateStrategy: 'xpath'
    },
    sortingAccordionHeading: {
      selector: '.panel-heading.ui-sortable-handle h4'
    },
    dataFieldNameDropdownInSorting: {
      selector: 'select[id*="select-data-field"]'
    },
    descendingOptionInSorting: {
      selector: 'select[id*="order-by-field"] option[value="descending"]'
    },
    fileHolderNameForListItemPanel: {
      selector: '.file-holder span'
    },
    customFilterCollapsedPanel: {
      selector: '#filter-accordion .panel-collapse.collapse.in .panel-body'
    },
    dataSourceFieldDropdownInCustomFilterPanel: {
      selector: '.panel-collapse.collapse.in select[name*="select-data-field"]'
    },
    loginFieldDropdownInCustomFilterPanel: {
      selector: '.panel-collapse.collapse.in select[name*="logic-field"]'
    },
    valueInputFieldInCustomFilterDropdown: {
      selector: 'input[name*="value-field"]'
    }
  }
};