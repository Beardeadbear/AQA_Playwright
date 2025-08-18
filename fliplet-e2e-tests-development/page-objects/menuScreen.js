const util = require('util');
const menuLinkPanel = '(//div[@class="panel-heading ui-sortable-handle"])[%d]';
const menuLinkPanelBody = '(//div[@class="panel-body"])[%d]';
const trashButtonForMenuLinkPanel = '//span[@class="panel-title-text"][text()="%s"]/ancestor::div[1]//span[@class="icon-delete fa fa-trash"]';
const menuLinkLabelLocator = '//span[@class="internal-link buttonControl" and text()="%s"]/parent::*/i';
const menuLinkLabelInCircleMenu = '(//li[@data-fl-navigate])[%d]';
const menuLabelInBottomIconBarMenu = '//span[text()="%s"]/ancestor::div[@class="fl-bottom-bar-icon-holder"]';
const menuLabelIconInBottomIconBarMenu ='(//span[text()="%s"]/ancestor::div[@class="fl-bottom-bar-icon-holder"]/div/i)[2]';

const commands = {
  switchToTabName: function(tabName){
    const tabTitleLocator  =`//ul[@class='nav nav-tabs']/li/a[text()='${tabName}']/parent::li`;

    this
      .api.frame(null)
      .switchToWidgetProviderFrame()
      .useXpath()
      .waitForElementVisible(tabTitleLocator, this.api.globals.mediumWait)
      .click(tabTitleLocator)
      .assert.attributeContains(tabTitleLocator, 'class', 'active', "The chosen tab is open")
      .useCss();

    return this;
  },

  clickSaveButton: function(){
    this
      .api.frame(null);

    this
      .waitForElementVisible('@saveButtonForMenu', this.api.globals.smallWait)
      .click('@saveButtonForMenu')
      .switchToPreviewFrame()
      .waitForElementNotPresent('@spinnerLoadingCircle', this.api.globals.longWait)
      .waitForAjaxCompleted()
      .api.frame(null);

    return this;
  },

  selectMenuStyleByName: function(menuStyle){
    this
      .logTestInfo(`The selected menu style for the test run is ${menuStyle}`)
      .waitForElementPresent(`#menu_id_[data-menu-name="${menuStyle}"]`, this.api.globals.smallWait)
      .api.element('css selector', `#menu_id_[data-menu-name="${menuStyle}"]`, (result) => {
      this.api.elementIdAttribute(result.value.ELEMENT, 'class', (attribute) => {
        const locator = `.btn.btn-sm.btn-secondary[data-widget-id="${attribute.value.split("_")[1]}"]`;
        this
          .api.execute(function(selector){
          let element = document.querySelector(selector);
          element.scrollIntoView();
          return this;
        }, [locator], function(){
          this
            .waitForElementVisible(locator, this.globals.smallWait)
            .click(locator)
        });
      })
    })
      .waitForElementNotVisible('.instance-loading .spinner-overlay', this.api.globals.longWait);

    return this;
  },

  assertMenuStyleIsSelectedByName: function(name){
    this
      .api.pause(3000)
      .useXpath()
      .expect.element(`.//input[@data-menu-name="${name}"]/parent::node()`)
      .to.have.attribute('data-widget-instance-id').which.does.not.equal("").before(10000);

    this.api
      .useCss()
      .frame(null);

    return this;
  },

  openMenuSettingByClickingMenuComponent: function(menuStyle){
    const menuComponentLocator = `div[data-type="menu"][data-name="${menuStyle}"]`;

    this
      .switchToPreviewFrame()
      .waitForElementVisible(menuComponentLocator, this.api.globals.smallWait)
      .click(menuComponentLocator)
      .api.frame(null);

    return this
      .switchToWidgetInstanceFrame()
      .waitForElementVisible('@widgetHolderHeader', this.api.globals.mediumWait)
      .assert.containsText('@widgetHolderHeader', 'Configure the menu settings');
  },

  selectWhereDoYouWantTheMenuButtonToBeDisplayed: function(menuLocation){
    return this
      .selectValueFromDropdown('menu-location', 'menu'.concat(menuLocation));
  },

  selectMenuOptionInMenuLinksTab: function(menuOption){
    return this
      .waitForElementVisible('@selectMenuDropdownField', this.api.globals.longWait)
      .selectValueFromDropdownByText('app-menu', menuOption);
  },

  assertLocationOfMenuIcon: function (location) {
    return this
      .waitForElementVisible('@menuHamburgerIcon', this.api.globals.smallWait)
      .assert.attributeContains('@menuHamburgerIcon', 'class', location.toLowerCase());
  },

  deleteMenuLinkByTitle: function(menuLinkTitle){
    this
      .api.frame(null)
      .switchToWidgetProviderFrame()
      .useXpath()
      .waitForElementPresent(util.format(trashButtonForMenuLinkPanel, menuLinkTitle), this.api.globals.tinyWait)
      .click(util.format(trashButtonForMenuLinkPanel, menuLinkTitle))
      .assert.elementNotPresent(util.format(trashButtonForMenuLinkPanel, menuLinkTitle),
      `The menu link ${menuLinkTitle} is not present in the menu settings.`)
      .useCss();

    return this;
  },

  addMenuLink: function(){
    this
      .api.frame(null)
      .switchToWidgetProviderFrame();

    this
      .waitForElementVisible('@addMenuLinkButton', this.api.globals.smallWait)
      .api.elements('css selector', '.panel.panel-default', function(result){
      this
        .click('button#add-link')
        .useXpath()
        .waitForElementVisible(`(//div[@class="panel panel-default"])[${result.value.length + 1}]`, this.globals.smallWait)
        .useCss()
        .assertAmountOfElementsVisible('.panel.panel-default', result.value.length + 1);
    });

    return this;
  },

  expandMenuLinkPanelByNumber: function(menuLinkPanelNumber){
    this
      .api.frame(null)
      .switchToWidgetProviderFrame()
      .pause(2000)
      .useXpath()
      .waitForElementVisible(util.format(menuLinkPanel, menuLinkPanelNumber), this.api.globals.tinyWait)
      .click(util.format(menuLinkPanel, menuLinkPanelNumber))
      .assert.visible(util.format(menuLinkPanelBody, menuLinkPanelNumber), `The menu link panel ${menuLinkPanelNumber} is open.`)
      .useCss();

    return this;
  },

  collapseMenuLinkPanelByNumber: function(menuLinkPanelNumber){
    this
      .api.frame(null)
      .switchToWidgetProviderFrame()
      .useXpath()
      .waitForElementVisible(util.format(menuLinkPanel, menuLinkPanelNumber), this.api.globals.tinyWait)
      .click(util.format(menuLinkPanel, menuLinkPanelNumber))
      .pause(2000)
      .expect.element(util.format(menuLinkPanelBody, menuLinkPanelNumber)).to.not.be.visible.before(this.api.globals.mediumWait);

    this
      .api.useCss();

    return this;
  },

  changeMenuLinkLabel: function (menuLinkPanelNumber, menuLinkNewLabel) {
    const menuLinkLabelInput = `(//input[@class='form-control link-label'])[${menuLinkPanelNumber}]`;
    const menuLinkPanelTitle = `(//span[@class='panel-title-text'])[${menuLinkPanelNumber}]`;

    this
      .api.useXpath()
      .waitForElementVisible(menuLinkLabelInput, this.api.globals.tinyWait)
      .clearValue(menuLinkLabelInput)
      .setValue(menuLinkLabelInput, menuLinkNewLabel)
      .expect.element(menuLinkPanelTitle).text.to.equal(menuLinkNewLabel).before(this.api.globals.mediumWait);

    this
      .api.useCss();

    return this;
  },

  openIconPickerConsoleForMenuLink: function (menuLinkPanelNumber) {
    const replaceIconButtonLocator = `(//*[@data-select-icon])[${menuLinkPanelNumber}]`;

    this
      .api.useXpath()
      .waitForElementVisible(replaceIconButtonLocator, this.api.globals.tinyWait)
      .click(replaceIconButtonLocator)
      .useCss()
      .switchToFLWidgetProviderFrame('div#fa');

    return this;
  },

  checkMenuLinkIconOnPanel: function (menuLinkPanelNumber, icon) {
    const menuLinkHolderLocator = `(//i[contains(@class,'selected-icon')])[${menuLinkPanelNumber}]`;

    this
      .api.frame(null)
      .switchToWidgetProviderFrame()
      .useXpath()
      .waitForElementVisible(menuLinkHolderLocator, this.api.globals.mediumWait)
      .assert.attributeContains(menuLinkHolderLocator, 'class', icon.toString().toLowerCase())
      .useCss();

    return this;
  },

  removeIconForMenuLink: function (menuLinkPanelNumber) {
    const selectIconButtonLocator = `(//*[contains(@class, "select-icon")])[${menuLinkPanelNumber}]`;
    const removeIconButtonLocator = `(//*[contains(@class, "remove-icon")])[${menuLinkPanelNumber}]`;

    this
      .api.useXpath()
      .waitForElementVisible(removeIconButtonLocator, this.api.globals.tinyWait)
      .click(removeIconButtonLocator)
      .waitForElementNotVisible(removeIconButtonLocator, this.api.globals.tinyWait)
      .expect.element(selectIconButtonLocator).to.be.visible.before(this.api.globals.mediumWait);

    this
      .api.useCss();

    return this;
  },

  checkMenuLinkIconOnScreen: function (menuLinkNumber, menuLinkIcon) {
    const menuLinkOnScreenLocator = `(//li[contains(@class, "linked")])[${menuLinkNumber}]`;
    const menuLinkIconHolderLocator = `(//li[contains(@class, "linked")]/div/i)[${menuLinkNumber}]`;

    this
      .api.useXpath()
      .waitForElementVisible(menuLinkOnScreenLocator, this.api.globals.mediumWait)
      .assert.attributeContains(menuLinkOnScreenLocator, 'class','with-icon')
      .assert.attributeContains(menuLinkIconHolderLocator, 'class', menuLinkIcon.toLowerCase())
      .useCss();

    return this;
  },

  checkMenuLinkWithoutIconOnScreen: function (menuLinkNumber) {
    const menuLinkOnScreenLocator = `(//li[contains(@class, "linked")])[${menuLinkNumber}]`;

    this
      .api.useXpath()
      .waitForElementVisible(menuLinkOnScreenLocator, this.api.globals.mediumWait)
      .expect.element(menuLinkOnScreenLocator).to.have.attribute('class').not.contains('with-icon');

    this
      .api.useXpath()

    return this;
  },

  clickSelectAndSaveButtonForMenuLinkIcons : function() {
    const selectButtonLocator = '(//a[text()="Select & Save"])[2]';
    const saveAndCloseButtonLocator = `(//a[text()="Save"])[2]`;
    const resultDisplaying = [];

    this
      .api.frame(null)
      .useXpath()
      .waitForElementVisible(selectButtonLocator, this.api.globals.smallWait)
      .click(selectButtonLocator)
      .waitForElementPresentWithoutErrorsXpath(saveAndCloseButtonLocator, 5000, resultDisplaying)
      .perform(function () {
        if (resultDisplaying[0] == false) {
          this.api.click(selectButtonLocator);
        }
      })
      .waitForElementPresent(saveAndCloseButtonLocator, this.api.globals.mediumWait)
      .useCss()
      .switchToWidgetProviderFrame();

    return this;
  },

  assertMenuLinkIsNotPresentInMenuByLabel: function(menuLinkLabel){
    this
      .waitForElementVisible('@openAppMenuOverlay', this.api.globals.smallWait)
      .api.useXpath()
      .assert.elementNotPresent(util.format(menuLinkLabelLocator, menuLinkLabel), `There is no menu link ${menuLinkLabel} in the menu.`)
      .useCss();

    return this;
  },

  assertMenuLinkIsPresentInMenuByLabel: function(menuLinkLabel){
    this
      .waitForElementVisible('@openAppMenuOverlay', this.api.globals.smallWait)
      .api.useXpath()
      .assert.visible(util.format(menuLinkLabelLocator, menuLinkLabel), `There is the menu link ${menuLinkLabel} in the menu.`)
      .useCss();

    return this;
  },

  assertCircleMenuLinkHasLabel: function(menuLinkNumber, menuLinkLabel){
    this
      .waitForElementVisible('@openAppMenuOverlay', this.api.globals.smallWait)
      .api.useXpath()
      .waitForElementVisible(util.format(menuLinkLabelInCircleMenu, menuLinkNumber), this.api.globals.mediumWait)
      .assert.containsText(util.format(menuLinkLabelInCircleMenu, menuLinkNumber), menuLinkLabel)
      .useCss();

    return this;
  },

  checkThatCircleMenuHasNoLabel: function(menuLinkLabel){
    const listOfTextValues = [];

    this
      .waitForElementVisible('@openAppMenuOverlay', this.api.globals.smallWait)
      .api.elements('css selector', 'li[data-fl-navigate]', function(elements){
      for(let i = 0; i < elements.value.length; i ++){
        this.elementIdText(elements.value[i].ELEMENT, (entryText) => {
          listOfTextValues.push(entryText.value);
        })
      }
      return listOfTextValues;
    })
      .perform(() => {
        this.assert.ok( ! listOfTextValues.includes(menuLinkLabel), `There is no menu link ${menuLinkLabel} in the circle menu.`)
      });

    return this;
  },

  assertBottomIconBarMenuHasLinkWithLabel: function(menuLinkLabel){
    this
      .api.useXpath()
      .assert.elementPresent(util.format(menuLabelInBottomIconBarMenu, menuLinkLabel),
      `There is the menu link ${menuLinkLabel} in Bottom icon Bar menu.`)
      .useCss();

    return this;
  },

  assertBottomIconBarMenuHasNoLinkWithLabel: function(menuLinkLabel){
    this
      .api.useXpath()
      .assert.elementNotPresent(util.format(menuLabelInBottomIconBarMenu, menuLinkLabel),
      `There is no menu link ${menuLinkLabel} in Bottom icon Bar menu.`)
      .useCss();

    return this;
  },

  checkThatMenuLinkInBottomIconBarMenuHasCorrectIcon: function (menuLinkLabel, menuLinkIcon) {
    this
      .api.frame(null)
      .switchToPreviewFrame()
      .useXpath()
      .waitForElementVisible(util.format(menuLabelIconInBottomIconBarMenu, menuLinkLabel), this.api.globals.mediumWait)
      .assert.attributeContains(util.format(menuLabelIconInBottomIconBarMenu, menuLinkLabel), 'class', `fa fa-${menuLinkIcon.toLowerCase()}`,
      `The menu link ${menuLinkLabel} in Bottom icon Bar menu has the correct icon ${menuLinkIcon}.`)
      .useCss();

    return this;
  }
};

module.exports = {
  commands: [commands],
  elements: {
    saveButtonForMenu: {
      selector: '//footer/a[@class="btn btn-primary"]',
      locateStrategy: 'xpath'
    },
    spinnerLoadingCircle: {
      selector: '.spinner-wrapper .spinner-circle, .instance-loading .spinner-overlay '
    },
    panelTitleCollapsed: {
      selector: '.panel-title'
    },
    menuStylesTab: {
      selector: '#menu-settings-control a'
    },
    widgetHolderHeader: {
      selector: 'div.widget-holder form header p'
    },
    menuHamburgerIcon: {
      selector: 'div.fl-viewport-header, div.fl-menu-circle-header'
    },
    menuLinkPanel: {
      selector: '.panel.panel-default'
    },
    menuLinkPanelDeleteIcon: {
      selector: '.icon-delete'
    },
    addMenuLinkButton: {
      selector: 'button#add-link'
    },
    menuLinksPanelBody: {
      selector: '[aria-expanded=true] .panel-body'
    },
    menuLinkIconHolder: {
      selector: 'i.selected-icon'
    },
    selectMenuDropdownField: {
      selector: '#app-menu'
    },
    openAppMenuOverlay: {
      selector: '[class*=fl-menu].active'
    }
  }
};