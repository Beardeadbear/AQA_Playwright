const elementProperties = require('../utils/constants/elementProperties');
const elementAttributes = require('../utils/constants/elementAttributes');

const commands = {
  selectThemeByName: function(name){
    const themeOption =`//select[@id="select-theme"]/option[text()="${name}"]`;

    return this
      .api.useXpath()
      .waitForElementVisible(`//select[@id="select-theme"]`, this.api.globals.smallWait)
      .waitForElementVisible(`//div[@class="instance-empty"]/h2`, this.api.globals.smallWait)
      .pause(4000)
      .waitForElementPresent(themeOption, this.api.globals.smallWait)
      .element('xpath', themeOption, (result) => {
        this
          .api.elementIdAttribute(result.value.ELEMENT, 'data-theme-id', (attribute) => {
          this
            .api.useCss()
            .waitForElementPresent(`#select-theme option[data-theme-id="${attribute.value}"]`, this.api.globals.smallWait)
            .pause(2000)
            .click(`#select-theme option[data-theme-id="${attribute.value}"]`);
        })
      });
  },

  clickApplyChangesButton: function(){
    return this
      .api.frameParent()
      .waitForElementVisible('.widget-provider .btn.btn-primary', this.api.globals.smallWait)
      .pause(2000)
      .click('.widget-provider .btn.btn-primary')
      .pause(3000)
      .refresh()
      .pause(2000);
  },

  clickGroupOfSettingsByName: function (name) {
    return this
      .waitForElementVisible('div #accordion', this.api.globals.smallWait)
      .api.element('xpath', `//div[starts-with(@class, "panel-heading")]/h4[contains(text(),"${name}")]`, (result)=>{
        this.api
          .moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT);
      });
  },

  openComponentSettings: function(componentName){
    this
      .waitForElementVisible('@themeSettingsFrame', this.api.globals.longWait)
      .api.useXpath()
      .waitForElementVisible(`//div[@class="components-buttons-holder"]/div[contains(text(),"${componentName}")]`, this.api.globals.smallWait)
      .click(`//div[@class="components-buttons-holder"]/div[contains(text(),"${componentName}")]`)
      .useCss();

    return this
      .assert.containsText('@themeSettingsTitle', componentName, `${componentName} component theme settings are open.`);
  },

  changeBodyBackgroundColor: function(color){
    return this
      .waitForElementVisible('@bodyBackgroundField', this.api.globals.smallWait)
      .clearValue('@bodyBackgroundField')
      .setValue('@bodyBackgroundField', color);
  },

  changeFontColor: function(color){
    return this
      .waitForElementVisible('@fontColourField', this.api.globals.smallWait)
      .clearValue('@fontColourField')
      .setValue('@fontColourField', color);
  },

  changeFontSize: function(size){
    return this
      .waitForElementVisible('@fontSizeField', this.api.globals.smallWait)
      .clearValue('@fontSizeField')
      .setValue('@fontSizeField', size);
  },

  clickApplyStylesToThemeAndConfirm: function(){
    return this
      .moveToElement('@applyStylesButton', 0, 0)
      .waitForElementVisible('@applyStylesButton', this.api.globals.smallWait)
      .click('@applyStylesButton')
      .api.frame(null)
      .acceptModalWindow();
  },

  openColorPickerForFieldByName: function(fieldLabel){
    this
      .api.useXpath()
      .waitForElementVisible(`//div[@class="field-label"][text()="${fieldLabel}"]/preceding-sibling::div`, this.api.globals.tinyWait)
      .click(`//div[@class="field-label"][text()="${fieldLabel}"]/preceding-sibling::div`)
      .useCss()
      .waitForElementVisible('div.value', this.api.globals.tinyWait);

    return this;
  },

  openColorPickerForFieldByNameForComponentAppearance: function(fieldLabel){
    const colorPickerLocator = `//div[div[label[text()='${fieldLabel}']]]//div[@id='color-picker-container']`;

    this
      .api.useXpath()
      .waitForElementVisible(colorPickerLocator, this.api.globals.tinyWait)
      .click(colorPickerLocator)
      .useCss()
      .waitForElementVisible('div.value', this.api.globals.tinyWait);

    return this;
  },

  changeFontSizeForFieldByNameForComponentAppearance: function(fieldLabel, fontSize){
    const sizeFontLocator = `//div[div[label[text()='${fieldLabel}']]]//span[contains(@class,'drag-input-holder')]`;

    this
      .api.useXpath()
      .waitForElementVisible(sizeFontLocator, this.api.globals.tinyWait)
      .click(sizeFontLocator)
      .getText(sizeFontLocator, (result) => {
        this.api
          .perform(() => {
            for (let i = 0; i < result.value.length; i++) {
              this.api.keys([this.api.Keys.BACK_SPACE])
            }
          })
      })
      .keys([fontSize])
      .useCss();

    return this;
  },

  enterColorForOpenedColorPicker: function(color){
    return this
      .waitForElementVisible('@inputFieldInOpenedPicker', this.api.globals.smallWait)
      .clearValue('@inputFieldInOpenedPicker')
      .setValue('@inputFieldInOpenedPicker', color);
  },

  checkColorFieldInAppearanceSettings: function (fieldLabel, color) {
    this
      .api.useXpath()
      .waitForElementVisible(`//div[@class="field-label"][text()="${fieldLabel}"]/preceding-sibling::div/div`, this.api.globals.tinyWait)
      .assertElementPropertyHasCorrectColorXPath(`//div[@class="field-label"][text()="${fieldLabel}"]/preceding-sibling::div/div`,
        elementProperties.BACKGROUND_COLOR, color)
      .useCss();

    return this;
  },

  compareAppliedThemeWidthSettingsWithPreview: function(width, initialWidth) {
    this
      .api.frame(null)
      .perform(() => {
        this
          .switchToPreviewFrame()
          .waitForElementPresent('.news-feed-item-content')
          .getCssProperty('.news-feed-item-content', 'width', function (result) {
            let currentWidth = Math.round(parseInt(initialWidth, 10) / 100 * width);
            this.assert.ok((Math.abs(parseInt(result.value) - currentWidth) < 2) || (parseInt(result.value) === currentWidth),
              `The width value of list is correct, ${currentWidth} equals ${Math.round(parseInt(result.value))}`);
          })
      })
      .frame(null);

    return this;
  },

  compareAppliedThemeFontColorSettingsWithPreview: function(colour) {
    this
      .api.frame(null)
      .perform(() => {
        this
          .switchToPreviewFrame()
          .waitForElementPresent("[class*=item-inner-content]")
          .assertElementPropertyHasCorrectColor("[class*=item-inner-content]", "background-color", colour);
      })
      .frame(null);

    return this;
  },

  clickMobileIconInAppearance: function(){
    this
      .api.pause(2000);

    this
      .waitForElementVisible('@mobileIconInAppearance', this.api.globals.smallWait)
      .click('@mobileIconInAppearance')
      .api.pause(2000)
      .waitForElementNotPresent('.save-status', this.api.globals.tinyWait)
      .pause(2000);

    return this;
  },

  openEditingOfInputField: function(fieldLabel){
    return this
      .api.useXpath()
      .waitForElementVisible(`//div[@class="field-label"][text()="${fieldLabel}"]/parent::div/span`, this.api.globals.tinyWait)
      .click(`//div[@class="field-label"][text()="${fieldLabel}"]/parent::div/span`)
      .useCss()
      .waitForElementVisible('.input-holder[style=""] input', this.api.globals.tinyWait);
  },

  checkWidthValueOfComponent: function(fieldLabel, width){
    const widthValueLocator = `//div[@class="field-label"][text()="${fieldLabel}"]/parent::div/span`;

    return this
      .waitForElementNotPresent('.input-holder[style=""] input', this.api.globals.smallWait)
      .api.useXpath()
      .waitForElementVisible(widthValueLocator, this.api.globals.tinyWait)
      .assert.containsText(widthValueLocator, width)
      .useCss();
  },

  checkColorValueOfComponent: function(fieldLabel, color) {
    const backgroundColorValueLocator = `//div[@class="field-label"][text()="${fieldLabel}"]/preceding-sibling::div/div`;

    this
      .waitForElementNotPresent('div.value', this.api.globals.smallWait)
      .api.useXpath()
      .waitForElementVisible(backgroundColorValueLocator, this.api.globals.tinyWait)
      .assertElementPropertyHasCorrectColorXPath(backgroundColorValueLocator, "background-color", color)
      .useCss();

    return this;
  },

  enterValueForOpenedAppearanceField: function(value, fieldLabel){
    return this
      .waitForElementVisible('@inputAppearanceField', this.api.globals.smallWait)
      .api.useXpath()
      .waitForElementVisible(`//div[@class="field-label"][text()="${fieldLabel}"]/parent::div/span`, this.api.globals.tinyWait)
      .getText(`//div[@class="field-label"][text()="${fieldLabel}"]/parent::div/span`, (result) => {
        let valueLength = result.value.length;

        this
          .api.useCss()
          .click('.input-holder[style=""] input')
          .perform(() => {
            for (let i = 0; i < valueLength; i++) {
              this.api.keys([this.api.Keys.BACK_SPACE])
            }
        })
      })
      .setValue('.input-holder[style=""] input', value);
  },

  clickResetToThemeStyles: function(){
    return this
      .waitForElementPresent('@resetToThemeStylesButton', this.api.globals.mediumWait)
      .moveToElement('@resetToThemeStylesButton', 0, 0)
      .waitForElementVisible('@resetToThemeStylesButton', this.api.globals.smallWait)
      .click('@resetToThemeStylesButton')
      .api.frame(null)
      .acceptModalWindow()
      .switchToWidgetProviderFrame()
      .waitForElementNotPresent('.save-status', this.api.globals.tinyWait)
      .frame(null)
      .pause(3000);
  },

  clickResetToFlipletDefaultThemeStyles: function(){
    return this
      .waitForElementVisible('@resetThemeToFlipletDefaultButton', this.api.globals.smallWait)
      .click('@resetThemeToFlipletDefaultButton')
      .api.frame(null)
      .acceptModalWindow()
      .switchToWidgetProviderFrame()
      .waitForElementNotPresent('.save-status', this.api.globals.tinyWait)
      .frame(null)
      .pause(2000);
  },

  expandTabInAppearanceSettings: function(title){
    return this
      .api.useXpath()
      .waitForElementVisible(`//div[@class="components-buttons"][contains(text(), '${title}')]`, this.api.globals.tinyWait)
      .click(`//div[@class="components-buttons"][contains(text(), '${title}')]`)
      .useCss()
      .waitForElementVisible('a[href="#tab-mobile"]', this.api.globals.tinyWait)
      .pause(2000);
  },

  clickTabletIconInAppearance: function(){
    return this
      .waitForElementVisible('@tabletIconInAppearance', this.api.globals.smallWait)
      .click('@tabletIconInAppearance')
      .waitForElementNotPresent('.save-status', this.api.globals.tinyWait)
      .api.pause(2000);
  },

  clickDesktopIconInAppearance: function(){
    return this
      .waitForElementVisible('@desktopIconInAppearance', this.api.globals.smallWait)
      .click('@desktopIconInAppearance')
      .waitForElementNotPresent('.save-status', this.api.globals.tinyWait)
      .api.pause(2000);
  },

  clickUpgradeAppearanceNow: function(){
    return this
      .waitForElementVisible(`@upgradeNowAppearanceButton`, this.api.globals.longWait)
      .click(`@upgradeNowAppearanceButton`)
      .api.frame(null)
      .acceptModalWindow()
      .waitForElementVisible(`.app-preview`, this.api.globals.tinyWait)
      .pause(3000)
      .switchToWidgetProviderFrame()
      .waitForElementNotPresent('#theme-application .spinner-overlay', this.api.globals.tinyWait);
  },

  selectImageOptionForContainerBackground: function() {
    return this
      .waitForElementVisible('@labelForImageOptionForContainerBackground', this.api.globals.longWait)
      .click('@labelForImageOptionForContainerBackground')
      .assert.visible('@imageButtonForContainerBackground', 'Image option for container background is selected.' )
  },

  clickImageButtonForContainerBackground: function() {
    this
      .waitForElementVisible('@imageButtonForContainerBackground', this.api.globals.longWait)
      .click('@imageButtonForContainerBackground')
      .api.frame(null);

    return this;
  },

  assertThatCorrectImageIsSelectedForContainerBackground: function(imageName){
    this
      .api.frame(null);

    this
      .switchToWidgetProviderFrame()
      .waitForElementVisible('@imageButtonForContainerBackground', this.api.globals.longWait)
      .api.pause(2000)
      .refresh();

    return this
      .switchToWidgetProviderFrame()
      .waitForElementVisible('@imageButtonForContainerBackground', this.api.globals.longWait)
      .assert.attributeContains('@imageButtonForContainerBackground', elementAttributes.STYLE, imageName,
        `The correct image ${imageName} is selected for container background.`);
  },

  assertThatImageIsSelectedForContainerBackground: function(){
    return this
      .waitForElementVisible('@imageButtonForContainerBackground', this.api.globals.longWait)
      .assert.attributeContains('@imageButtonForContainerBackground', elementAttributes.CLASS, 'has-image',
      `The image is selected for container background.`);
  }
};

module.exports = {
  commands: [commands],
  elements: {
    themeSettingsFrame: {
      selector: '#theme-application'
    },
    themeSettingsTitle: {
      selector: '#component-settings-overlay p'
    },
    bodyBackgroundField: {
      selector: 'input[name="bodyBackground"]'
    },
    inputFieldInOpenedPicker: {
      selector: 'input.input'
    },
    fontSizeField: {
      selector: 'input[name="bodyFontSize"]'
    },
    fontColourField: {
      selector: 'input[name="bodyTextColor"]'
    },
    tabletIconInAppearance: {
      selector: 'a[href="#tab-tablet"]'
    },
    mobileIconInAppearance: {
      selector: 'a[href="#tab-mobile"]'
    },
    applyStylesButton: {
      selector: '.settings-fields .btn.btn-primary'
    },
    inputAppearanceField: {
      selector: '.input-holder[style=""] input'
    },
    resetToThemeStylesButton: {
      selector: '.buttons-holder .btn.btn-default'
    },
    resetThemeToFlipletDefaultButton: {
      selector: '.buttons-holder .btn.btn-primary'
    },
    desktopIconInAppearance: {
      selector: 'a[href="#tab-desktop"]'
    },
    upgradeNowAppearanceButton: {
      selector: '.btn.btn-primary.update-theme'
    },
    labelForImageOptionForContainerBackground: {
      selector: '.background-field-holder  label[for="radio-background-image"]'
    },
    imageButtonForContainerBackground: {
      selector: 'div[data-original-title*="image"] div.btn'
    }
  }
};