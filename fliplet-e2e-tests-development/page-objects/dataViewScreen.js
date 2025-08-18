const commands = {
  assertDefaultsDataViewSettingsMatchToExpected: function(layout, summaryFieldsArray, summaryColumnsArray) {
    return this
      .waitForElementVisible('@titleOfFieldsInDataView', this.api.globals.mediumWait)
      .api.perform(function () {
        switch (layout) {
          case 'Small expandable cards':
          case 'Cards with description':
          case 'Small horizontal cards':
            for (let i= 0; i<5; i++) {
              this
                .api.useXpath()
                .assert.containsText(`(//div[@class="original-row clearfix"]/div[@class="rTableCell title"])[${i+1}]`, summaryFieldsArray[i])
                .assert.visible(`(//select[@name="summary_select_field"]/option[@value="${summaryColumnsArray[i]}"])[${i+1}]`)
                .assert.containsText(`(//select[@name="summary_select_field"])[${i+1}]`, summaryColumnsArray[i])
            }
            break;

          case 'Simple List':
          case 'Agenda':
            for (let i= 0; i<4; i++) {
              this
                .api.useXpath()
                .assert.containsText(`(//div[@class="original-row clearfix"]/div[@class="rTableCell title"])[${i+1}]`, summaryFieldsArray[i])
                .assert.visible(`(//select[@name="summary_select_field"]/option[@value="${summaryColumnsArray[i]}"])[${i+1}]`)
                .assert.containsText(`(//select[@name="summary_select_field"])[${i+1}]`, summaryColumnsArray[i])
            }
            break;
        }
      })
      .useCss();
  },

  clickBackToSettingsButton: function () {
    this
      .api.frame(null);

    return this
      .switchToWidgetInstanceFrame()
      .waitForElementVisible('@backToSettingsLink', this.api.globals.smallWait)
      .click('@backToSettingsLink')
      .waitForElementNotPresent('@backToSettingsLink', this.api.globals.smallWait);
  },

  selectDataViewValue: function (numberOfDropDown, value) {
    this
      .api.useXpath()
      .waitForElementVisible(`(//select[@name="summary_select_field"])[${numberOfDropDown}]`, this.api.globals.smallWait)
      .getAttribute(`(//select[@name="summary_select_field"])[${numberOfDropDown}]`, 'id', function (result) {
        this
          .selectValueFromDropdownByText(result.value, value)
          .useXpath()
          .waitForElementVisible(`//select[@id='${result.value}']/option[text()='${value}']`, this.globals.smallWait);
      })
      .useCss();

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

  startBrowsingFoldersInOrganization: function(){
    return this
      .waitForElementPresent('@orgFolderLocator', this.api.globals.smallWait)
      .click('@orgFolderLocator')
      .api.pause(8000);
  },

  clickFolderWithThumbnailsByNameDataView: function(name){
    const locator = `//div[text()="${name}"]/parent::div//div[@class="image-overlay"]`;

    return this
      .api.useXpath()
      .waitForElementVisible(locator, this.api.globals.mediumWait)
      .click(locator)
      .useCss()
      .waitForElementVisible('div[class*="selected"] i.fa.fa-folder', this.api.globals.mediumWait);
  },

  clickOpenLinkOption: function(){
    return this
      .waitForElementVisible('label[for="detail-link"] span', this.api.globals.smallWait)
      .click('label[for="detail-link"] span')
      .waitForElementVisible('#select_field_link', this.api.globals.smallWait);
  },

  configureLinkTypeForEntryOnClick: function(column, linkType){
    return this
      .selectValueFromDropdown('select_field_link', column)
      .selectValueFromDropdown('select_type_link', linkType);
  },

  clickAutoUpdateWhenNewFieldsAreAdded: function(){
    return this
      .switchToWidgetInstanceFrame()
      .waitForElementVisible('label[for="enable-auto-update"] span.check', this.api.globals.mediumWait)
      .click('label[for="enable-auto-update"] span.check')
      .api.pause(3500);
  }
};

module.exports = {
  commands: [commands],
  elements: {
    titleOfFieldsInDataView: {
      selector: '(//div[@class="original-row clearfix"]/div[@class="rTableCell title"])',
      locateStrategy: 'xpath'
    },
    orgFolderLocator: {
      selector: '//select[@id="drop-down-file-source"]//option[starts-with(@value, "org")]',
      locateStrategy: 'xpath'
    },
    backToSettingsLink: {
      selector: '.relations-tab.state.present .go-back'
    }
  }
};
