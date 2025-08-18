const util = require('util');
const defaultValueTypeOptionInDropdown = '//select[@class="form-control"]//option[@value][contains(text(),"%s")]';

const commands = {
  openEditFormFieldsModalDialog: function (formFieldName) {
    const formFieldLocator = `//label[@class="control-label"][contains(text(), "${formFieldName}")]`;

    this
      .api.useXpath()
      .waitForElementVisible(formFieldLocator, this.api.globals.smallWait)
      .element('xpath', formFieldLocator, function (result) {
        this
          .moveTo(result.value.ELEMENT)
          .mouseButtonClick(0);
      })
      .useCss();

    return this
      .waitForElementVisible('@editFormFieldModalDialog', this.api.globals.mediumWait);
  },

  editFormFieldLabel: function (newFormFieldName) {
    this
      .waitForElementVisible('@formFieldNameInput', this.api.globals.smallWait)
      .click('@formFieldNameInput')
      .api.getValue('.modal.active input#field-label', (value) => {
        for (let i = 0; i < value.value.length; i++) {
          this.api.keys([this.api.Keys.BACK_SPACE]);
        }
      })
      .keys([newFormFieldName]);

    return this;
  },

  customizeFieldName: function(){
    return this
      .waitForElementVisible('@customizeFieldNameButton', this.api.globals.smallWait)
      .click('@customizeFieldNameButton')
      .assert.containsText('@customizeFieldNameButton', `Match the field's name and label`)
      .click('@customizeFieldNameButton');
  },

  chooseIfFormFieldNotOptional: function (valueToChoose) {
    const locator = `.modal.active .radio input[value='${valueToChoose}']`;

    this
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .click(locator + ' + label')
      .expect.element(locator).to.be.selected.before(this.api.globals.smallWait);

    return this;
  },

  setDefaultValueForFormField: function (formFieldDefaultValue) {
    return this
      .waitForElementVisible('@formFieldDefaultValueInput', this.api.globals.tinyWait)
      .setValue('@formFieldDefaultValueInput', formFieldDefaultValue);
  },

  setNewNameForFormButton: function (defaultFormButtonName, newFormButtonName) {
    const buttonNameInputLocator = `input[placeholder*="${defaultFormButtonName}"]`;

    this
      .waitForElementVisible(buttonNameInputLocator, this.api.globals.smallWait)
      .click(buttonNameInputLocator)
      .api.getValue(buttonNameInputLocator, (value) => {
        for (let i = 0; i < value.value.length; i++) {
          this.api.keys([this.api.Keys.BACK_SPACE]);
        }
      })
      .keys([newFormButtonName]);

    return this;
  },

  setDefaultValueForStarRatingField: function (defaultStarRatingValue) {
    this
      .selectValueFromDropdown('default-value', defaultStarRatingValue)
      .expect.element(`#default-value option[value="${defaultStarRatingValue}`).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.pause(500);

    return this;
  },

  chooseAlwaysAutofillWithCurrentDateRadioOptionInDatePickerFormFieldConfigurations: function(){
    const locator = '//input[@value="always"]/parent::div';

    this
      .api.useXpath()
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .click(locator+'/label')
      .expect.element(locator + '/input').to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  setPlaceholderValueForFormField: function (formFieldPlaceholderValue) {
    return this
      .waitForElementVisible('@formFieldPlaceholderInput', this.api.globals.tinyWait)
      .setValue('@formFieldPlaceholderInput', formFieldPlaceholderValue);
  },

  setPlaceholderValueForDropdownField: function (formFieldPlaceholderValue) {
    return this
      .clearValue('@formFieldDropdownPlaceholderInput')
      .waitForElementVisible('@formFieldDropdownPlaceholderInput', this.api.globals.tinyWait)
      .setValue('@formFieldDropdownPlaceholderInput', formFieldPlaceholderValue);
  },

  clickDoneButtonInModalDialog: function () {
    this
      .waitForElementVisible('@doneButtonOnModalDialog', this.api.globals.tinyWait)
      .expect.element('@doneButtonOnModalDialog').to.have.attribute('class').which.does.not.contains("disabled")
      .before(this.api.globals.tinyWait);

    return this
      .click('@doneButtonOnModalDialog')
      .waitForElementNotPresent('@editFormFieldModalDialog', this.api.globals.smallWait);
  },

  configureConformationMessage: function (text) {
    this
      .waitForElementVisible('.hidden-settings .mce-container-body.mce-stack-layout', this.api.globals.smallWait)
      .switchToFrameWhenItIsLoaded('formResult_ifr')
      .waitForElementVisible('#tinymce h2', this.api.globals.smallWait)
      .api.element('css selector', '#tinymce h2', (result) => {
        this
          .api.moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT)
          .keys([` ${text}`]);
      })
      .frameParent();

    return this
  },

  getFieldsNameFromForm: function(fieldName){
    const formFieldNameLocator = '.form-preview .form-group.row.clearfix .col-xs-12:nth-of-type(1) label[for]:nth-of-type(1)';

    return this
      .waitForElementVisible(formFieldNameLocator, this.api.globals.smallWait)
      .api.elements('css selector', formFieldNameLocator, function(elements){
        for (let i=0; i < elements.value.length; i++){
          this.elementIdText(elements.value[i].ELEMENT, (entryText) => {
            fieldName.push(entryText.value.replace(' *', ''));
          })
        }
        return fieldName;
      })
  },

  getNumberOfFormFields: function(amountOfFormFields){
    const formFieldNameLocator = '.form-preview .form-group.row.clearfix .col-xs-12:nth-of-type(1) label[for]:nth-of-type(1)';

    this
      .waitForElementVisible(formFieldNameLocator, this.api.globals.smallWait)
      .api.elements('css selector', formFieldNameLocator, function(elements){
        amountOfFormFields.push(elements.value.length);
      });
    return amountOfFormFields;
  },

  checkThatFormFieldWithEnteredNameIsPresentOnForm: function (fieldName) {
    const formFieldInput = `//*[@name="${fieldName}"]`;

    this
      .api.useXpath()
      .waitForElementPresent(formFieldInput, this.api.globals.smallWait)
      .assert.containsText(formFieldInput + `/ancestor::div[@data-field]/div/label`, fieldName,
        `The form field ${fieldName} has a correct label.`)
      .useCss();

    return this;
  },

  checkThatFormFieldHasValue: function (fieldName, formFieldValue) {
    const formFieldInput = `[name="${fieldName}"]`;

    return this
      .waitForElementPresent(formFieldInput, this.api.globals.smallWait)
      .assert.valueContains(formFieldInput, formFieldValue, `The form field ${fieldName} has a correct value ${formFieldValue}.`);
  },

  checkThatFormFieldHasPlaceholderOnForm: function (fieldName, placeholderValue) {
    const formFieldInput = `[name="${fieldName}"]`;

    return this
      .waitForElementPresent(formFieldInput, this.api.globals.smallWait)
      .assert.attributeContains(formFieldInput, 'placeholder', placeholderValue,
        `The form field ${fieldName} has a correct placeholder ${placeholderValue}`);
  },

  checkThatDropdownFormFieldHasPlaceholderOnForm: function (placeholderValue) {
    const dropdownFormFieldInputLocator = 'select[name] option[value]:nth-of-type(1)';

    return this
      .waitForElementVisible(dropdownFormFieldInputLocator, this.api.globals.smallWait)
      .assert.containsText(dropdownFormFieldInputLocator, placeholderValue);
  },

  checkThatItIsNotPossibleToSubmitFormWithoutFillingNotOptionalField: function (obligatoryFieldName) {
    const formFieldInput = `[name="${obligatoryFieldName}"]`;

    this
      .waitForElementVisible(formFieldInput, this.api.globals.smallWait)
      .clearValue(formFieldInput)
      .expect.element(formFieldInput).text.to.equal("");

    return this
      .click('@formSubmitButton')
      .waitForElementVisible(formFieldInput + '+p', this.api.globals.smallWait)
      .waitForElementVisible('@formSubmitButton', this.api.globals.smallWait)
      .assert.elementNotPresent('@successfulFormSubmissionMessage', "The form was not submitted");
  },

  enterValuesIntoForm: function (entryText) {
    const textFormField = '.fl-form .form-control';

    this
      .waitForElementVisible(textFormField, this.api.globals.longWait)
      .clearValue(textFormField)
      .api.pause(1500)
      .elements('css selector', textFormField, function (elements) {
        for (let i = 0; i < entryText.length; i++) {
          this
            .moveTo(elements.value[i].ELEMENT, 10, 10)
            .mouseButtonClick(0)
            .keys(entryText[i])
            .pause(500)
            .logTestInfo('Value for form: ' + entryText[i]);
        }
      });
    return this;
  },

  selectPreviousDayValueInCalendarDropdownDatePickerFormField: function(){
    return this
      .waitForElementVisible('@previousDayInDatePickerCalendarDropdown', this.api.globals.longWait)
      .click('@previousDayInDatePickerCalendarDropdown')
      .waitForElementNotPresent('@datePickerCalendarDropdown', this.api.globals.smallWait);
  },

  selectNextDayValueInCalendarDropdownDatePickerFormField: function(){
    return this
      .waitForElementVisible('@nextDayInDatePickerCalendarDropdown', this.api.globals.longWait)
      .click('@nextDayInDatePickerCalendarDropdown')
      .waitForElementNotPresent('@nextDayInDatePickerCalendarDropdown', this.api.globals.smallWait);
  },

  clickDatePickerFormFieldToChooseDate: function(){
    return this
      .waitForElementVisible('@datePickerInputField', this.api.globals.longWait)
      .click('@datePickerInputField')
      .waitForElementVisible('@datePickerCalendarDropdown', this.api.globals.smallWait);
  },

  checkThatTmePickerFieldHasValue: function(currentTime){
    return this
      .waitForElementVisible('@timePickerField', this.api.globals.smallWait)
      .getValue('@timePickerField', (time) => {
        currentTime.push(time.value)
      });
  },

  clickSubmitFormButton: function () {
    this
      .api.pause(2000);

    this
      .waitForElementVisible('@formSubmitButton', this.api.globals.smallWait)
      .click('@formSubmitButton')
      .api.pause(2000);

    return this;
  },

  assertThatFormHasBeenSuccessfullySubmitted: function(confirmationMessageTitle){
    return this
      .waitForElementNotPresent('@formSubmitButton', this.api.globals.mediumWait)
      .waitForElementVisible('@successfulFormSubmissionMessage', this.api.globals.smallWait)
      .assert.containsText('@successfulFormSubmissionMessage', confirmationMessageTitle);
  },

  clickChooseImageForForm: function(){
    return this
      .waitForElementVisible('@chooseImageButton', this.api.globals.smallWait)
      .click('@chooseImageButton')
  },

  getRandomValueForMultipleOptionsFormField: function(fieldName, randomValue){
    const multipleOptionFormFieldOptionLocator = `//label[contains(text(), "${fieldName}")]/ancestor::div[@class="form-group row clearfix"]//option |
    //label[contains(text(), "${fieldName}")]/ancestor::div[@class="form-group row clearfix"]//input[@value]`;

    this
      .api.useXpath()
      .waitForElementPresent(multipleOptionFormFieldOptionLocator, this.api.globals.smallWait)
      .useCss()
      .elements('xpath', multipleOptionFormFieldOptionLocator, function(result){
        const randomNumberValue = Math.floor(Math.random() * Math.floor(result.value.length));

        this.logTestInfo(`Random multiple form field option number for the current test is ${randomNumberValue}.`)
          .elementIdAttribute(result.value[randomNumberValue].ELEMENT, 'value',
            value => {
              if(value.value !== false){
                return randomValue.push(value.value);
              } else{
                this
                  .elementIdAttribute(result.value[randomNumberValue].ELEMENT, 'for',
                    value => {
                      return randomValue.push(value.value);
                    });
              }
            });
      });
  },

  selectValueFromFormDropdown: function(fieldName, valueToChoose){
    const multipleOptionFormFieldOptionLocator = `//label[contains(text(), "${fieldName}")]/ancestor::div[@class="form-group row clearfix"]
    //option[@value="${valueToChoose}"]`;

    this
      .api.useXpath()
      .waitForElementPresent(multipleOptionFormFieldOptionLocator, this.api.globals.smallWait)
      .click(multipleOptionFormFieldOptionLocator)
      .expect.element(multipleOptionFormFieldOptionLocator).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  assertDefaultDropdownValueIsSelectedOnForm: function(fieldName, defaultValue){
    const locator = `select[id="${fieldName}"] option[value="${defaultValue}"]`;

    this
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .expect.element(locator).to.be.selected.before(this.api.globals.smallWait);

    return this;
  },

  chooseRadioInForm: function (fieldName, valueToChoose) {
    const locator = `div[data-field="${fieldName}"] .radio input[value="${valueToChoose}"]`;

    this
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .click(locator + ' + label')
      .expect.element(locator).to.be.selected.before(this.api.globals.smallWait);

    return this;
  },

  tickCheckboxInForm: function (fieldName, valueToChoose) {
    const locator = `div[data-field="${fieldName}"] .checkbox input[value="${valueToChoose}"]`;

    this
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .click(locator + ' + label')
      .expect.element(locator).to.be.selected.before(this.api.globals.smallWait);

    return this;
  },

  uncheckAllCheckboxesInMultiselectFormField: function (fieldName) {
    const checkboxInputFieldLocator = `div[data-field="${fieldName}"] .checkbox input`;

    this
      .waitForElementPresent(checkboxInputFieldLocator, this.api.globals.smallWait)
      .api.elements('css selector', checkboxInputFieldLocator, (result) => {
        for (let i = 0; i < result.value.length; i++) {
          this.api.elementIdSelected(result.value[i].ELEMENT, (selected) => {
            if (selected.value == true) {
              this
                .click(checkboxInputFieldLocator + ' + label')
                .expect.element(checkboxInputFieldLocator).to.not.be.selected.before(this.api.globals.smallWait);
            }
          })
        }
      });

    return this;
  },

  assertDefaultCheckBoxValueIsSelectedOnForm: function (fieldName, defaultValue) {
    const locator = `div[data-field="${fieldName}"] .checkbox input[value="${defaultValue}"]`;

    this
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .expect.element(locator).to.be.selected.before(this.api.globals.smallWait);

    return this;
  },

  assertDefaultRadioValueIsSelectedOnForm: function(fieldName, defaultValue) {
    const locator = `div[data-field="${fieldName}"] .radio input[value="${defaultValue}"]`;

    this
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .expect.element(locator).to.be.selected.before(this.api.globals.smallWait);

    return this;
  },

  assertDefaultStarRatingValueIsSelectedOnForm: function(defaultValue) {
    const locator = `//input[@class="rating-input"][@value="${defaultValue}"]`;

    this
      .api.useXpath()
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .expect.element(locator).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  chooseStarRating: function (amountOfStars) {
    const locator = `//input[@class='rating-input'][@value="${amountOfStars}"]`;

    this
      .api.useXpath()
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .click(locator + '/following-sibling::label[1]')
      .expect.element(locator).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  enterInvalidDataAndCheckIt: function(fieldType, invalidData, messageText){
    const inputFieldLocator = `//input[@id="${fieldType}"]`;
    const errorMessageLocator = `//input[@id="${fieldType}"]/ancestor::div[1]/p`;

    this
      .api.useXpath()
      .waitForElementVisible(inputFieldLocator, this.api.globals.smallWait)
      .clearValue(inputFieldLocator)
      .setValue(inputFieldLocator, invalidData)
      .useCss()
      .pause(1500);

    this
      .click('@formSubmitButton')
      .api.useXpath()
      .waitForElementVisible(errorMessageLocator, this.api.globals.mediumWait)
      .assert.containsText(errorMessageLocator, messageText, "Error message is shown");

    this
      .api.useCss()
      .pause(500);

    return this;
  },

  selectAnImageForUploading: function(file) {
    return this
      .setValue(`input[id*='Image']`, `/files/files/${file}`)
      .waitForElementVisible('.canvas-holder', this.api.globals.mediumWait)
  },

  setOptionsForMultipleFormField: function(multipleFieldOptions){
     this
      .waitForElementVisible('@multipleFieldOptionsTextarea', this.api.globals.mediumWait)
      .clearValue('@multipleFieldOptionsTextarea')
      .setValue('@multipleFieldOptionsTextarea', multipleFieldOptions[0])
      .api.keys([this.api.Keys.ENTER]);

    return this
      .setValue('@multipleFieldOptionsTextarea', multipleFieldOptions[1]);
  },

  selectFormTemplateByName: function(name){
    const useButtonForFormTemplate  = `//h4[text()="${name} "]/following-sibling::div/div[@class="btn btn-primary"]`;

    this
      .waitForElementNotVisible('@loadingSpinner', this.api.globals.longWait)
      .api.useXpath()
      .waitForElementVisible(useButtonForFormTemplate, this.api.globals.longWait)
      .click(useButtonForFormTemplate)
      .waitForElementNotPresent(useButtonForFormTemplate, this.api.globals.longWait)
      .useCss();

    return this;
  },

  setFormName: function(name){
    return this
      .waitForElementVisible('@formNameField', this.api.globals.longWait)
      .clearValue('@formNameField')
      .setValue('@formNameField', name);
  },

  clickAddToDataSourceCheckbox: function(){
    return this
      .waitForElementVisible('@addToDataSourceCheckbox', this.api.globals.smallWait)
      .click('@addToDataSourceCheckbox')
      .waitForElementVisible('@submissionFormAddInfo', this.api.globals.smallWait);
  },

  clickEditDataSourceEntriesCheckbox: function(){
    return this
      .waitForElementVisible('@editDataSourceEntriesCheckbox', this.api.globals.smallWait)
      .click('@editDataSourceEntriesCheckbox')
      .waitForElementVisible('@submissionFormEditInfo', this.api.globals.smallWait);
  },

  tickSendEmailsCheckbox: function(){
    this
      .waitForElementPresent('@inputEditDataSource', this.api.globals.smallWait)
      .moveToElement('@inputEditDataSource', 0, 0)
      .api.element('xpath', '//label[@for="templated_email_add"]', (result) =>{
        this
          .api.elementIdClick(result.value.ELEMENT)
          .useXpath()
          .waitForElementVisible('//label[@for="templated_email_add"]/span/a[text()="Configure email template"]', this.api.globals.smallWait);
      })
      .useCss();

    return this;
  },

  openEmailConfigurationScreen: function(){
    this
      .api.useXpath()
      .pause(3000)
      .click('//label[@for="templated_email_add"]/span/a[text()="Configure email template"]')
      .useCss()
      .waitForElementVisible('.fl-widget-provider[data-package="com.fliplet.email-provider"]', this.api.globals.smallWait);

    return this;
  },

  enterEmailForSendingEmailsWhenFormIsSubmitted: function(email){
    this
      .switchToFLWidgetProviderFrame('@emailInputField')
      .waitForElementVisible('@emailInputField', this.api.globals.smallWait)
      .clearValue('@emailInputField')
      .setValue('@emailInputField', email)
      .api.frameParent();

    return this;
  },

  enterEmailSubjectForSendingEmailsWhenFormIsSubmitted: function(subject){
    this
      .switchToFLWidgetProviderFrame('@emailInputField')
      .waitForElementVisible('@subjectInputField', this.api.globals.smallWait)
      .clearValue('@subjectInputField')
      .setValue('@subjectInputField', subject)
      .api.frameParent();

    return this;
  },

  editBodyOfEmail: function(text){
    this
      .switchToFLWidgetProviderFrame('input#to')
      .waitForElementVisible('#html_ifr', this.api.globals.smallWait)
      .api.frame('html_ifr')
      .waitForElementVisible('#tinymce p', this.api.globals.smallWait)
      .element('css selector', '#tinymce p', (result) => {
        this
          .api.moveTo(result.value.ELEMENT, 0, 0)
          .elementIdClick(result.value.ELEMENT)
          .keys([text]);
      });

    return this;
  },

  clickClearFormButton: function() {
    this
      .waitForElementVisible('@clearFormButton', this.api.globals.smallWait)
      .click('@clearFormButton')
      .api.pause(2000);

    return this;
  },

  editFormattingFieldText: function (formattingFieldText) {
    const formattingFieldTextInputLocator = '.modal.active .form-control';

    this
      .waitForElementVisible(formattingFieldTextInputLocator, this.api.globals.smallWait)
      .click(formattingFieldTextInputLocator)
      .api.getValue(formattingFieldTextInputLocator, (value) => {
        for (let i = 0; i < value.value.length; i++) {
          this.api.keys([this.api.Keys.BACK_SPACE]);
        }
      })
      .keys([formattingFieldText]);

    return this;
  },

  checkFormElementContainsText: function (elementLocator, expectedText) {
    return this
      .waitForElementVisible(elementLocator, this.api.globals.smallWait)
      .assert.containsText(elementLocator, expectedText);
  },

  assertClearButtonIsNotPresent: function(){
    return this
      .assert.elementNotPresent('@clearFormButton', 'Clear button is not present.');
  },

  openFormattingFieldsModalDialog: function (formattingFieldName) {
    const formattingFieldLocator = `div[data-field="${formattingFieldName}"]`;

    this
      .waitForElementVisible(formattingFieldLocator, this.api.globals.smallWait)
      .api.element('css selector', formattingFieldLocator, function (result) {
      this
        .moveTo(result.value.ELEMENT)
        .mouseButtonClick(0);
    });

    return this
      .waitForElementVisible('@editFormFieldModalDialog', this.api.globals.mediumWait)
      .assert.containsText('.modal-title small', formattingFieldName);
  },

  openButtonFieldModalDialog: function () {
    const buttonFieldLocator = '.component div[data-field="buttons"]';

    this
      .waitForElementNotVisible('@loadingSpinner', this.api.globals.longWait)
      .waitForElementVisible(buttonFieldLocator, this.api.globals.smallWait)
      .api.element('css selector', buttonFieldLocator, function (result) {
      this
        .moveTo(result.value.ELEMENT)
        .mouseButtonClick(0);
    });

    return this
      .waitForElementVisible('.modal.active', this.api.globals.mediumWait)
      .assert.containsText('.modal.active h2 small', 'Form buttons');
  },

  fillInRichFormField: function (fieldLabel, fieldEnteredValue) {
    this
      .switchToFrameWhenItIsLoaded(`${fieldLabel}_ifr`)
      .waitForElementVisible('#tinymce p', this.api.globals.smallWait)
      .api.element('css selector', '#tinymce p', (result) => {
        this
          .api.moveTo(result.value.ELEMENT, 0, 0)
          .elementIdClick(result.value.ELEMENT)
          .keys([this.api.Keys.END])
          .getText('#tinymce p', (text) => {
            for (let i = 0; i < text.value.length; i++) {
              this.api.keys([this.api.Keys.BACK_SPACE]);
          }
        })
          .pause(1000)
          .keys([fieldEnteredValue])
          .pause(1000)
          .expect.element('#tinymce p').text.to.equal(fieldEnteredValue).before(this.api.globals.smallWait);
      })
      .frameParent();

    return this;
  },

  checkThatRichTextFormFieldHasText: function (fieldLabel, text) {
    this
      .switchToFrameWhenItIsLoaded(`${fieldLabel}_ifr`)
      .click('#tinymce')
      .waitForElementVisible('#tinymce p', this.api.globals.smallWait)
      .api.element('css selector', '#tinymce p', (result) => {
      this
        .api.moveTo(result.value.ELEMENT, 0, 0)
        .elementIdClick(result.value.ELEMENT)
    })
      .expect.element('#tinymce p').text.to.equal(text).before(this.api.globals.smallWait);

    this
      .api.frameParent();

    return this;
  },

  deleteFieldFromForm: function (formFieldName) {
    const formFieldLocator = `//label[@class="control-label"][contains(text(), "${formFieldName}")]`;
    const deleteFieldButtonLocator = '.delete-field';
    const deleteFormFieldModalButtonLocator = '.btn.btn-danger';

    this
      .api.useXpath()
      .waitForElementVisible(formFieldLocator, this.api.globals.smallWait)
      .element('xpath', formFieldLocator, function (result) {
        this
          .moveTo(result.value.ELEMENT)
      });

    this
      .api.useCss()
      .waitForElementVisible(deleteFieldButtonLocator, this.api.globals.smallWait)
      .click(deleteFieldButtonLocator)
      .frame(null)
      .waitForElementVisible('.bootbox-body', this.api.globals.mediumWait)
      .waitForElementVisible(deleteFormFieldModalButtonLocator, this.api.globals.mediumWait)
      .click(deleteFormFieldModalButtonLocator)
      .waitForElementNotPresent('.bootbox-body', this.api.globals.mediumWait)
      .switchToWidgetInstanceFrame()
      .useXpath()
      .assert.elementNotPresent(formFieldLocator)
      .useCss();

    return this;
  },

  tickShowClearButtonForForm : function(){
    const showClearButtonCheckboxLocator = '//input[@id="show_clear"]/parent::div';

    this
      .api.useXpath()
      .waitForElementPresent(showClearButtonCheckboxLocator,this.api.globals.smallWait)
      .click(showClearButtonCheckboxLocator+ '/label')
      .expect.element(showClearButtonCheckboxLocator+ '/input').to.not.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  selectOptionInDefaultValueTypeDropdown: function(defaultValueTypeOption){
    this
      .waitForElementVisible('@defaultValueTypeDropdownInFormFieldEditTab', this.api.globals.smallWait)
      .click('@defaultValueTypeDropdownInFormFieldEditTab')
      .api.useXpath()
      .waitForElementPresent(util.format(defaultValueTypeOptionInDropdown, defaultValueTypeOption), this.api.globals.smallWait)
      .click(util.format(defaultValueTypeOptionInDropdown, defaultValueTypeOption))
      .useCss();

    return this
      .waitForElementVisible('@defaultKeyInputFieldForValueType', this.api.globals.smallWait);
  },

  checkThatCorrectOptionIsSelectedInDefaultValueTypeDropdownList: function(defaultValueTypeOption){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(defaultValueTypeOptionInDropdown, defaultValueTypeOption), this.api.globals.smallWait)
      .expect.element(util.format(defaultValueTypeOptionInDropdown, defaultValueTypeOption)).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.useCss();

    return this;
  },

  enterDefaultKeyInInputFieldForValueType: function(defaultKey){
    return this
      .waitForElementVisible('@defaultKeyInputFieldForValueType', this.api.globals.smallWait)
      .setValue('@defaultKeyInputFieldForValueType', defaultKey)
      .waitForElementNotPresent('@filedIsRequiredTextNextToDefaultKeyInputFieldForValueType', this.api.globals.smallWait);
  },

  checkThatEmailIsPresentInGmailInbox: function(emailSubject){
    const fs = require('fs');

    this
      .api.pause(5000)
      .perform(function () {
        fs.readFile('utils/gmailAuthorizationFiles/gmailCredentials.json', (err, content) => {
          if(err) throw err;
          this.api.gmailAuthorize(JSON.parse(content), emailSubject, this.api.gmailCheckIfEmailWasReceivedBySubject);
        });
      })
      .pause(5000);

    return this;
  },

  assertDataSourceSecurityRulesDoNotAllowToWriteDataToFormMessage: function() {
    return this
      .waitForElementVisible('@dataSourceSecurityRuleError', this.api.globals.tinyWait)
      .assert.containsText('@dataSourceSecurityRuleError',  'not allow this app to write data')
  }
};

module.exports = {
  commands: [commands],
  elements: {
    loadingSpinner: {
      selector: '.spinner-overlay'
    },
    formSubmitButton: {
      selector: '.btn.btn-primary.pull-right',
    },
    editFormFieldModalDialog: {
      selector: '.modal.active'
    },
    fieldNameOnEditFormFieldModalDialog: {
      selector: '.modal-title small'
    },
    formFieldDefaultValueInput: {
      selector: '[placeholder*="Default value"]'
    },
    formFieldPlaceholderInput: {
      selector: '[placeholder="Placeholder text"]'
    },
    formFieldDropdownPlaceholderInput: {
      selector: 'input[placeholder="Option placeholder"]'
    },
    formFieldNameInput: {
      selector: '.modal.active input#field-label'
    },
    doneButtonOnModalDialog: {
      selector: '.modal.active .footer .btn.btn-primary'
    },
    chooseImageButton: {
      selector: 'label.btn.btn-primary'
    },
    customizeFieldNameButton: {
      selector: '.btn-link.form-fields-customize'
    },
    multipleFieldOptionsTextarea: {
      selector: '.modal.active textarea.form-control'
    },
    formNameField: {
      selector: '#formName'
    },
    inputEditDataSource: {
      selector: 'input#edit_datasource'
    },
    addToDataSourceCheckbox: {
      selector: 'label[for="save_datasource"] span.check'
    },
    editDataSourceEntriesCheckbox: {
      selector: 'label[for="edit_datasource"] span.check'
    },
    emailInputField: {
      selector: 'input#to'
    },
    subjectInputField: {
      selector: 'input#subject'
    },
    clearFormButton: {
      selector: '.btn.btn-secondary.pull-right'
    },
    titleFormattingFormField: {
      selector: 'div.col-xs-12 h2'
    },
    paragraphFormattingFormField: {
      selector: 'div.col-xs-12 p'
    },
    successfulFormSubmissionMessage: {
      selector: 'div h2'
    },
    dataSourceSecurityRuleError: {
      selector: '.callout.callout-danger'
    },
    submissionFormAddInfo: {
      selector: '.hidden-settings.active label[for=templated_email_add]'
    },
    submissionFormEditInfo: {
      selector: '.hidden-settings.active label[for=templated_email_edit]'
    },
    datePickerInputField: {
      selector: '.input-group.custom-date input'
    },
    datePickerCalendarDropdown: {
      selector: '.datepicker.datepicker-dropdown'
    },
    previousDayInDatePickerCalendarDropdown: {
      selector: '(//td[@class="today active day"]/preceding-sibling::*[1] | //td[@class="today active day"]/parent::tr/preceding-sibling::tr[1]/td[last()])[last()]',
      locateStrategy: 'xpath'
    },
    nextDayInDatePickerCalendarDropdown: {
      selector: '(//td[@class="today active day"]/following-sibling::*[1] | //td[@class="today active day"]/parent::tr/following-sibling::tr[1]/td[1])[1]',
      locateStrategy: 'xpath'
    },
    defaultValueTypeDropdownInFormFieldEditTab: {
      selector: '.form-group.cleafix select.form-control'
    },
    defaultKeyInputFieldForValueType: {
      selector: '[placeholder="Enter user data field/column name"]'
    },
    filedIsRequiredTextNextToDefaultKeyInputFieldForValueType: {
      selector: '//label[text()="Default key"]/following-sibling::div[@class="text-danger"]',
      locateStrategy: 'xpath'
    },
    timePickerField: {
      selector: '[type=time]'
    }
  }
};