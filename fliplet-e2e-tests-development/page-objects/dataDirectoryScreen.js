const commands = {
  selectOptionForNewDataSourceCreation: function (name) {
    return this
      .waitForElementVisible('select#data-sources', this.api.globals.smallWait)
      .selectValueFromDropdown('data-sources', 'new')
      .api.setAlertText(name)
      .acceptAlert()
      .pause(3000)
      .acceptAlert()
      .waitForElementVisible('.alert.alert-warning', this.api.globals.smallWait)
      .pause(500);
  },

  clickEditDataSourceLink: function(){
    return this
      .waitForElementVisible('@editDataSourceLink', this.api.globals.smallWait)
      .click('@editDataSourceLink')
  },

  switchToOpenedDataSourceOverlay: function(){
    return this
      .api.frame(null)
      .waitForElementPresent('.overlay-content-header', this.api.globals.smallWait)
      .switchToWidgetProviderFrame()
      .waitForElementVisible('#toolbar', this.api.globals.smallWait)
      .pause(3000);
  },

  selectDataSourceForDataDirectoryByName: function(dataSourceName){
    const locator = `//select[@id="data-sources"]/option[text()="${dataSourceName}"]`;

    return this
      .api.useXpath()
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .pause(1500)
      .click(locator)
      .acceptAlert()
      .useCss()
      .pause(2000);
  },

  tickDataRetrievalCheckbox: function () {
    return this
      .waitForElementVisible('@retrieveDataCheckbox', this.api.globals.smallWait)
      .click('@retrieveDataCheckbox');
  },

  waitForNavTabsToBeClickable: function(dataSourceName){
    return this
      .api.useXpath()
      .waitForElementPresent(`//select[@id="data-sources"]/option[text()="${dataSourceName}"]`, this.api.globals.smallWait)
      .useCss();
  },

  switchToListNavigationTab: function(){
    return this
      .waitForElementVisible('@listTab', this.api.globals.smallWait)
      .click('@listTab')
      .waitForElementVisible('#directory-browse-label', this.api.globals.smallWait);
  },

  tickShowTagsCheckbox: function(){
    return this
      .waitForElementVisible('@showTagsCheckbox', this.api.globals.smallWait)
      .click('@showTagsCheckbox');
  },

  switchOrderDisplayToAsLoaded: function(){
    return this
      .waitForElementVisible('#data-alphabetical-fields-select', this.api.globals.smallWait)
      .moveToElement('label[for="order"]', 0, 0)
      .waitForElementVisible('label[for="order"]', this.api.globals.smallWait)
      .click('label[for="order"]');
  },

  switchToAdvancedNavigationTab: function(){
    return this
      .waitForElementVisible('@advancedTab', this.api.globals.smallWait)
      .click('@advancedTab')
      .waitForElementVisible('div#advanced-tab', this.api.globals.smallWait);
  },

  expandEnableDirectoryThubmnailsAccordeon:function(){
    return this
      .click('div#heading2')
      .waitForElementVisible('@enableDirectoryThumbnailsYes', this.api.globals.smallWait);
  },

  enableDirectoryThumbnails: function () {
    return this
      .click('@enableDirectoryThumbnailsYes')
      .waitForElementVisible('select#data-thumbnail-fields-select', this.api.globals.smallWait);
  },

  enableShowingThumbnailsInMainList: function(){
    return this
      .waitForElementVisible('@showThumbnailsMainListYes', this.api.globals.smallWait)
      .click('@showThumbnailsMainListYes');
  },

  enableShowingThumbnailsOnDetails: function(){
    return this
      .waitForElementVisible('@showThumbnailsDetailsYes', this.api.globals.smallWait)
      .click('@showThumbnailsDetailsYes');
  },

  clickBrowseYourFolderLibraryButton: function(){
    const resultDisplaying = [];

    return this
      .moveToElement('@browseYourFolderLibraryButton', 0, 0)
      .waitForElementVisible('@browseYourFolderLibraryButton', this.api.globals.smallWait)
      .api.pause(1000)
      .click('.btn.btn-default.select-folder')
      .pause(3000)
      .frame(null)
      .switchToWidgetInstanceFrame()
      .waitForElementPresentWithoutErrors('.fl-widget-provider[data-package="com.fliplet.file-picker"]', this.api.globals.tinyWait,
        resultDisplaying)
      .perform(function() {
        if (resultDisplaying[0] == false) { // if file browsing is not opened
          this.api.click('.btn.btn-default.select-folder');
        }
      })
  },

  startBrowsingFoldersInOrganizationFolder: function(){
    return this
      .waitForElementPresent('@orgFolderLocator', this.api.globals.smallWait)
      .click('@orgFolderLocator')
      .api.pause(8000);
  },

  clickFolderWithThumbnailsByName: function(name){
    const locator = `//div[text()="${name}"]/ancestor::div//div[@class="image-overlay"]`;

    return this
      .api.useXpath()
      .waitForElementVisible(locator, this.api.globals.mediumWait)
      .click(locator)
      .useCss();
  }
};

module.exports = {
  commands: [commands],
  elements: {
    editDataSourceLink: {
      selector: '//a[text()="Edit data source"]',
      locateStrategy: 'xpath'
    },
    retrieveDataCheckbox: {
      selector: '//label[@for="enable_live_data"]//span',
      locateStrategy: 'xpath'
    },
    listTab: {
      selector: 'li#main-list-control'
    },
    showTagsCheckbox: {
      selector: '//label[@for="show_tags"]/span',
      locateStrategy: 'xpath'
    },
    advancedTab: {
      selector: 'li#advanced-control'
    },
    enableDirectoryThumbnailsYes: {
      selector: '//input[@id="enable-thumb-yes"]/following-sibling::label',
      locateStrategy: 'xpath'
    },
    showThumbnailsMainListYes: {
      selector: '//input[@id="thumb-list-yes"]/following-sibling::label',
      locateStrategy: 'xpath'
    },
    showThumbnailsDetailsYes: {
      selector: '//input[@id="thumb-details-yes"]/following-sibling::label',
      locateStrategy: 'xpath'
    },
    browseYourFolderLibraryButton: {
      selector: '.btn.btn-default.select-folder'
    },
    orgFolderLocator: {
      selector: '//select[@id="drop-down-file-source"]//option[starts-with(@value, "org")]',
      locateStrategy: 'xpath'
    }
  }
};
