const util = require('util');
const elementAttributes = require('../utils/constants/elementAttributes');
const elementProperties = require('../utils/constants/elementProperties');
const componentLocator = '(//*[@data-widget-package="%s"])[%d]';
const componentLocatorWithoutIndex = '//*[@data-widget-package="%s"]';
const componentDetailsLocator = '//section[@class="widget-interface show"]';
const textComponentLocator = '//*[@data-widget-package="com.fliplet.text"]/div';
const deleteComponentIconLocator ='//div[contains(@class, "selected")]/div[@class="widget-control"][@title="Delete component"]/i';
const deleteButtonOnModalWindow = '//button[@class="btn btn-danger"]';
const appearanceComponentIconForNestedComponentLocator = '//div[not(contains(@class, "selected"))]/div[@class="widget-control"][@title="Edit appearance settings"]/i';
const appearanceComponentIconLocator = '//div[contains(@class, "selected")]/div[@class="widget-control"][@title="Edit appearance settings"]/i';
const screenOptionInDropdownMenuForCopyWidget = '//div[@class="indented-area"]//span[text()="%s"]';
const imageHolderLocator = '(//img[@data-image-id])[%d]';
const lfdTypeOnScreen = '[data-dynamic-lists-layout="%s"]'
const iconPaintBrushLocator = `//div[@data-widget-package="%s"]//i[@class="icon fl-icon-paintbrush"][not(ancestor::div[@class="mce-offscreen-selection"])]`;
const componentFrameLocator = `//span[@data-widget-package-control="%s"]/parent::*/parent::*`;
const screenMenuHeaderLocator = '//div[@class="fl-viewport-header "]';

const commands = {
  verifyEditScreenIsOpened: function(){
    return this
      .waitForElementVisible('@widgetsRightsideNavigationBarTitle', this.api.globals.smallWait)
      .assert.containsText('@openModeTitle', 'Edit', 'Edit mode is open.');
  },

  changeTitleOfTextOnAppScreen: function(title){
    return this
      .api.pause(1000)
      .switchToPreviewFrame()
      .waitForElementVisible('#fl-editor-0 h3', this.api.globals.smallWait)
      .element('css selector', '#fl-editor-0 h3', function(result){
        this.moveTo(result.value.ELEMENT, 0, 0, function(){
          this.doubleClick(function(){
            this.keys([title])})
        })
      })
      .pause(2000);
  },

  assertThatAllChangesAreSavedAlertIsDisplayed: function() {
    this
      .waitForElementVisible('@screenTitle',this.api.globals.smallWait)
      .click('@screenTitle')
      .api.pause(2000)
      .frameParent();

    return this
      .waitForElementVisible('@allChangesAreSavedAlert', this.api.globals.mediumWait);
  },

  changeTextOnAppScreen: function(text){
    return this
      .api.pause(1000)
      .switchToPreviewFrame()
      .waitForElementVisible('#fl-editor-0>p', this.api.globals.smallWait)
      .element('css selector', '#fl-editor-0>p', function(result){
        this.moveTo(result.value.ELEMENT, 0, 0, function(){
          this.doubleClick(function(){
            this.keys([text])})
        })
      })
      .pause(2000);
  },

  clickPreviewMenuItemWithAlert: function(){
    return this
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.smallWait)
      .waitForElementVisible('@previewMenu', this.api.globals.smallWait)
      .click('@previewMenu');
  },

  clickPublishMenuItem: function(){
    return this
      .waitForElementVisible('@publishMenu', this.api.globals.smallWait)
      .click('@publishMenu')
      .waitForElementVisible('.publishing-options-wrapper h3', this.api.globals.smallWait)
      .waitForElementVisible('.launch-option-image img', this.api.globals.smallWait);
  },

  /** Changes font style of a first word in title*/
  changeWordInTitleToItalic: function(){
    return this
      .waitForElementVisible('@widgetsRightsideNavigationBarTitle', this.api.globals.smallWait)
      .switchToFrameWhenItIsLoaded('preview')
      .waitForElementVisible('#fl-editor-0 h3', this.api.globals.smallWait)
      .api.element('css selector','#fl-editor-0 h3', function(result){
        this
          .elementIdClick(result.value.ELEMENT)
          .moveTo(result.value.ELEMENT, 0, 0, function(){
            this.doubleClick(function(){
              this
                .frameParent()
                .waitForElementVisible('.mce-ico.mce-i-italic', this.globals.smallWait)
                .click('.mce-ico.mce-i-italic');
            });
          })
      })
      .frame('preview');
  },

  /** Changes font style of a random word in text*/
  changeWordInTextToStrikethrough: function(){
    return this
      .waitForElementVisible('@widgetsRightsideNavigationBarTitle', this.api.globals.smallWait)
      .switchToFrameWhenItIsLoaded('preview')
      .waitForElementVisible('#fl-editor-0>p', this.api.globals.smallWait)
      .api.element('css selector','#fl-editor-0>p', function(result){
        this
          .elementIdClick(result.value.ELEMENT)
          .moveTo(result.value.ELEMENT, 0, 0, function(){
            this.doubleClick(function(){
              this
                .frameParent()
                .waitForElementVisible('.mce-ico.mce-i-strikethrough', this.globals.smallWait)
                .click('.mce-ico.mce-i-strikethrough');
            });
          })
      })
      .frame('preview');
    },

  clickExitButton: function () {
    return this
      .waitForElementVisible('@exitButton', this.api.globals.smallWait)
      .click('@exitButton')
      .waitForElementVisible('.app-list', this.api.globals.smallWait);
  },

  /** @param{Array} arr - array where all obtained names will be stored*/
  getNamesOfScreens: function(arr){
    this
      .waitForElementVisible('.screens.screens-manageable', this.api.globals.smallWait)
      .api.elements('css selector', '.screen-name', function(result){
      for (let i = 0; i < result.value.length; i++) {
        this.elementIdText(result.value[i].ELEMENT, function (text) {
          arr.push(text.value);
        });
      }
      return arr;
    });
  },

  openDetailsOfComponentByClickingOnIt: function(component, orderNumberOfComponentOnScreen = 1){
    const resultDisplaying = [];

    this
      .api.frame(null)
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.longWait)
      .useXpath()
      .waitForElementVisible(util.format(componentLocator, component, orderNumberOfComponentOnScreen), this.api.globals.longWait)
      .click(util.format(componentLocator, component, orderNumberOfComponentOnScreen))
      .frame(null)
      .waitForElementPresentWithoutErrorsXpath(componentDetailsLocator, 5000, resultDisplaying)
      .perform(function () {
        this.api.logTestInfo(`The component details are open ${resultDisplaying[0]}`);
        if (resultDisplaying[0] == false) {
          this.api.useCss()
            .switchToPreviewFrame()
            .useXpath()
            .click(util.format(componentLocator, component, orderNumberOfComponentOnScreen))
            .frame(null);
        }
      })
      .waitForElementVisible(componentDetailsLocator, this.api.globals.longWait)
      .useCss()
      .switchToWidgetInstanceFrame();

    return this;
  },

  openEditorToolbarForTextComponent: function(){
    this
      .switchToPreviewFrame()
      .waitForElementNotPresent('@screenLoadingSpinner', this.api.globals.longWait)
      .api.useXpath()
      .waitForElementVisible(textComponentLocator, this.api.globals.mediumWait)
      .click(textComponentLocator)
      .element('xpath', textComponentLocator, (elements) => {
        this.api
          .moveTo(elements.value.ELEMENT)
          .doubleClick()
      })
      .useCss()
      .frame(null);

    return this
      .waitForElementVisible('@editorToolbar',this.api.globals.smallWait);
  },

  addInlineLinkToTextComponent: function(){
    return this
      .waitForElementVisible('@insertLinkButtonOnEditorToolbar')
      .click('@insertLinkButtonOnEditorToolbar');
  },

  closeQuickTutorialPopUp: function () {
    return this
      .waitForElementVisible('.quick-start-body', this.api.globals.smallWait)
      .waitForElementVisible('.placeholder-screen', this.api.globals.smallWait)
      .waitForElementVisible('.fl-icon-cancel-3-fill', this.api.globals.smallWait)
      .click('.fl-icon-cancel-3-fill')
      .waitForElementNotPresent('.quick-start-body', this.api.globals.smallWait)
      .waitForElementNotPresent('.placeholder-screen', this.api.globals.smallWait)
      .api.pause(1500);
  },

  openAppearanceSettingsForComponent: function(component){
    this
      .api.frame(null)
      .waitForElementVisible('.navbar-right', this.api.globals.longWait)
      .switchToPreviewFrame()
      .waitForElementPresent('.widget-overlay', this.api.globals.longWait)
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.longWait)
      .useXpath()
      .waitForElementPresent(screenMenuHeaderLocator, this.api.globals.smallWait)
      .moveToElement(screenMenuHeaderLocator , 1, 1)
      .pause(1000)
      .waitForElementPresent(util.format(iconPaintBrushLocator, component), this.api.globals.mediumWait)
      .assert.cssProperty(util.format(componentFrameLocator, component), elementProperties.OPACITY, '0')
      .pause(2000)
      .moveToElement(util.format(iconPaintBrushLocator, component), 0, 0)
      .assert.cssProperty(util.format(componentFrameLocator, component), elementProperties.OPACITY, '1')
      .click(util.format(iconPaintBrushLocator, component))
      .useCss()
      .pause(2000)
      .frame(null)
      .switchToWidgetProviderFrame();

    return this;
  },

  deleteComponentFromScreen: function(component){
    const amountOfComponents = [];

    this
      .switchToPreviewFrame()
      .api.useXpath()
      .waitForElementVisible(util.format(componentLocatorWithoutIndex, component), this.api.globals.mediumWait)
      .elements('xpath', util.format(componentLocatorWithoutIndex, component), function (elements) {
        amountOfComponents.push(elements.value.length);
      })
      .logTestInfo(amountOfComponents)
      .click(util.format(componentLocatorWithoutIndex, component))
      .frame(null)
      .waitForElementVisible(deleteComponentIconLocator,this.api.globals.smallWait)
      .click(deleteComponentIconLocator)
      .waitForElementVisible(deleteButtonOnModalWindow, this.api.globals.smallWait)
      .click(deleteButtonOnModalWindow)
      .waitForElementNotPresent(deleteButtonOnModalWindow, this.api.globals.smallWait)
      .useCss()
      .switchToPreviewFrame()
      .useXpath()
      .perform(() => {
        this.assertAmountOfElementsPresentXpath(util.format(componentLocatorWithoutIndex, component), amountOfComponents[amountOfComponents.length-1] - 1, 'The component was deleted from the screen.')
      })
      .useCss()
      .frame(null);

    return this;
  },

  checkAmountOfComponents: function (component, amount){
    this
      .switchToPreviewFrame()
      .assertAmountOfElementsPresentXpath(util.format(componentLocatorWithoutIndex, component), amount, 'The amount of components is correct.')
      .api.frame(null);

    return this;
  },

  openWidgetCopyMenuForComponent: function(component, numberOfComponent = 1){
    this
      .api.frame(null)
      .switchToPreviewFrame()
      .useXpath()
      .waitForElementVisible(util.format(componentLocator, component, numberOfComponent), this.api.globals.mediumWait)
      .click(util.format(componentLocator, component, numberOfComponent))
      .useCss()
      .frame(null);

    this
      .waitForElementVisible('@copyComponentIconInWidgetControl',this.api.globals.smallWait)
      .click('@copyComponentIconInWidgetControl')
      .waitForElementVisible('@widgetCopyMenu', this.api.globals.smallWait)
      .api.refresh()
      .switchToPreviewFrame()
      .useXpath()
      .waitForElementVisible(util.format(componentLocator, component, numberOfComponent), this.api.globals.mediumWait)
      .click(util.format(componentLocator, component, numberOfComponent))
      .useCss()
      .frame(null);

    return this
      .waitForElementVisible('@copyComponentIconInWidgetControl',this.api.globals.smallWait)
      .click('@copyComponentIconInWidgetControl')
      .waitForElementVisible('@widgetCopyMenu', this.api.globals.smallWait);
  },

  expandAccordionHeadingForComponentAdding: function(){
    this
      .switchToPreviewFrame()
      .waitForElementVisible('.fl-page-content-wrapper')
      .api.element('css selector', 'fl-page-content-wrapper', function(result) {
       this
          .moveTo(result.value.ELEMENT)
          .doubleClick()
          .keys([this.Keys.ENTER])
      })
      .frame(null)
      .waitForElementNotPresent('.widget-interface.show');

    return this;
  },

  openEditAppearanceSettingForNestedComponent: function(component) {
    return this
      .switchToPreviewFrame()
      .api.useXpath()
      .waitForElementVisible(util.format(componentLocatorWithoutIndex, component), this.api.globals.mediumWait)
      .element('xpath', util.format(componentLocatorWithoutIndex, component), (elements) => {
        this.api
          .moveTo(elements.value.ELEMENT)
      })
      .frame(null)
      .waitForElementVisible(appearanceComponentIconForNestedComponentLocator,this.api.globals.smallWait)
      .element('xpath', appearanceComponentIconForNestedComponentLocator, (elements) => {
        this.api
          .moveTo(elements.value.ELEMENT)
          .mouseButtonClick()
      })
      .useCss()
      .switchToWidgetProviderFrame()
      .waitForElementVisible('#theme-application', this.api.globals.mediumWait);
  },

  openEditAppearanceSettingForComponent: function(component) {
    this
      .switchToPreviewFrame()
      .api.useXpath()
      .waitForElementVisible(util.format(componentLocatorWithoutIndex, component), this.api.globals.mediumWait)
      .element('xpath', util.format(componentLocatorWithoutIndex, component), (elements) => {
        this.api
          .moveTo(elements.value.ELEMENT)
          .mouseButtonClick()
      })
      .frame(null)
      .waitForElementVisible(appearanceComponentIconLocator,this.api.globals.smallWait)
      .element('xpath', appearanceComponentIconLocator, (elements) => {
        this.api
          .moveTo(elements.value.ELEMENT)
          .mouseButtonClick()
      })
      .useCss()
      .switchToWidgetProviderFrame()
      .waitForElementNotPresent('.spinner-overlay',this.api.globals.mediumWait)
      .waitForElementVisible('#theme-application', this.api.globals.mediumWait);

    return this;
  },

  openEditAppearanceSettingForLfd: function() {
    this
      .waitForElementVisible('.frame', this.api.globals.mediumWait)
      .api.element('css selector', '.frame', (element) => {
        this.api
        .moveTo(element.value.ELEMENT)
        .mouseButtonClick();
    })
      .useXpath()
      .waitForElementPresent(appearanceComponentIconLocator,this.api.globals.smallWait)
      .useCss()
      .element('xpath', appearanceComponentIconLocator, (element) => {
        this.api
          .moveTo(element.value.ELEMENT)
          .mouseButtonClick();
      })
      .switchToWidgetProviderFrame()
      .waitForElementNotPresent('.spinner-overlay',this.api.globals.mediumWait)
      .waitForElementVisible('#theme-application', this.api.globals.mediumWait);

    return this;
  },

  checkFontOfTextComponent: function(screenFontFamily){
    this
      .api.frame(null);

    return this
      .switchToPreviewFrame()
      .waitForElementVisible('@screenTextComponent', this.api.globals.mediumWait)
      .assert.cssProperty('@screenTextComponent', elementProperties.FONT_FAMILY, screenFontFamily, 'The text is the correct font.');
  },

  assertAppListIsHiddenBySingInButton:  function(){
    this
      .switchToPreviewFrame()
      .waitForElementVisible('@signInAppListButton', this.api.globals.longWait)
      .assert.containsText('@signInAppListButton', 'Sign in')
      .api.frame(null);

    return this;
  },

  assertInlineLinkCorrectLabel:  function(label){
    this
      .api.frame(null)
      .switchToPreviewFrame();

    this
      .waitForElementVisible('@inlineLink', this.api.globals.longWait)
      .assert.containsText('@inlineLink', label)
      .api.frame(null);

    return this;
  },

  assertInlineLinkCorrectTextColor:  function(color){
    this
      .api.frame(null)
      .switchToPreviewFrame();

    this
      .waitForElementVisible('@inlineLink', this.api.globals.longWait)
      .assertElementPropertyHasCorrectColor('@inlineLink',"color", color)
      .api.frame(null);

    return this;
  },

  getApplicationId: function(appId) {
    this
      .api.perform(function () {
      this.api.url(function (result) {
        appId.push(result.value.match(/apps\/(\d*)/)[1]);
      });
    });

    return this;
  },

  assertCorrectLfdLayoutIsPresentOnScreen: function(lfdLayout) {
    this
      .api.frameParent()
      .switchToPreviewFrame()
      .waitForElementVisible(util.format(lfdTypeOnScreen, lfdLayout), this.api.globals.mediumWait)
      .frameParent();

    return this;
  },

  getImageIdFromEditModeScreen: function(imageId, imageNumber = 1 ){
      this
        .api.frame(null)
        .switchToPreviewFrame()
        .useXpath()
        .waitForElementPresent(util.format(imageHolderLocator, imageNumber), this.api.globals.smallWait)
        .useCss()
        .element('xpath', util.format(imageHolderLocator, imageNumber), function (result) {
          this.elementIdAttribute(result.value.ELEMENT, elementAttributes.SRC, function (property) {
            imageId.push(property.value.match(/.*\/(.*).jpg.*/)[1]);
        })
      })
        .frame(null);

      return this;
    },

  checkScreenTemplateApplied: function(screenLayout) {
    this
      .api.frame(null);

    this
      .switchToPreviewFrame()
      .waitForElementPresent('@screenTemplate', this.api.globals.longWait)
      .getAttribute('@screenTemplate', elementAttributes.DATA_NAME, function(attribute){
        this.assert.ok(attribute.value.toUpperCase().includes(screenLayout), `The screen has the correct layout ${screenLayout}.`)
      })
      .api.frame(null);

    return this;
  },

  clickDuplicateButtonInWidgetCopyMenu: function(){
    return this
      .waitForElementVisible('@duplicateButtonForWidgetInWidgetCopyMenu', this.api.globals.smallWait)
      .click('@duplicateButtonForWidgetInWidgetCopyMenu')
      .waitForElementNotPresent('@duplicateButtonForWidgetInWidgetCopyMenu', this.api.globals.longWait);
  },

  selectDuplicateToAnotherScreenInWidgetCopyMenu: function(){
    return this
      .waitForElementVisible('@duplicateToAnotherScreenOptionInWidgetCopyMenu', this.api.globals.smallWait)
      .click('@duplicateToAnotherScreenOptionInWidgetCopyMenu')
      .waitForElementVisible('@screenDropdownInWidgetCopyMenu', this.api.globals.longWait);
  },

  chooseScreenForWidgetDuplicatingInDropdownMenu: function(screenTitle){
    this
      .waitForElementVisible('@screenDropdownInWidgetCopyMenu', this.api.globals.smallWait)
      .click('@screenDropdownInWidgetCopyMenu')
      .api.useXpath()
      .waitForElementPresent(util.format(screenOptionInDropdownMenuForCopyWidget, screenTitle), this.api.globals.smallWait)
      .click(util.format(screenOptionInDropdownMenuForCopyWidget, screenTitle))
      .waitForElementNotPresent(util.format(screenOptionInDropdownMenuForCopyWidget, screenTitle), this.api.globals.smallWait)
      .useCss();

    return this;
  },
};

module.exports = {
  commands: [commands],
  elements: {
    widgetsRightsideNavigationBarTitle: {
      selector: '.side-view.page-widgets>header>p'
    },
    openModeTitle: {
      selector: '.nav-flow .v-link-active'
    },
    textBlock: {
      selector: '.panel-body.scroll'
    },
    titleText: {
      selector: '#fl-editor-0>h3'
    },
    bodyText: {
      selector: '#fl-editor-0>p'
    },
    previewMenu: {
      selector: '.nav-flow a[href*="preview"]'
    },
    publishMenu: {
      selector: '.nav-flow a[href*="publish"]'
    },
    quote: {
      selector: '.mb-wrap > blockquote > p'
    },
    settingsMenu: {
      selector: '.btn .fl-icon-settings'
    },
    exitButton: {
      selector: '.exit'
    },
    addedComponentButton:{
      selector: '#fl-editor-0 span>input'
    },
    signInAppListButton: {
      selector: 'a.visible-xs.login-button'
    },
    screenLoadingSpinner: {
      selector: '.spinner-wrapper .spinner-circle'
    },
    inlineLink: {
      selector: 'a[data-inline-link-id]'
    },
    editorToolbar: {
      selector: '.editor-toolbar.light.visible'
    },
    insertLinkButtonOnEditorToolbar: {
      selector: '.mce-ico.mce-i-mce-ico.mce-i-link'
    },
    addScreenButton: {
      selector: '.btn-add-layout'
    },
    allChangesAreSavedAlert: {
      selector: '.fl-save-status .fade-transition.alert.alert-success'
    },
    screenTitle: {
      selector: '.nav-title>span'
    },
    screenTemplate: {
      selector: '.fl-page-content-wrapper  div.fl-widget-instance[data-name]'
    },
    copyComponentIconInWidgetControl: {
      selector: '//div[contains(@class, "selected")]/div[contains(@class,"widget-control")][@title="Duplicate"]/i',
      locateStrategy: 'xpath'
    },
    widgetCopyMenu: {
      selector: '.dropdown-menu.duplicate-dropdown.is-visible'
    },
    duplicateButtonForWidgetInWidgetCopyMenu: {
      selector: '.dropdown-menu.duplicate-dropdown.is-visible .btn.btn-primary'
    },
    duplicateToAnotherScreenOptionInWidgetCopyMenu: {
      selector: '[for*=copy-new-screen]'
    },
    screenDropdownInWidgetCopyMenu: {
      selector: '.indented-area .multiselect__input'
    },
    screenTextComponent: {
      selector: '.col-sm-12 p'
    }
  }
};