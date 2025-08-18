const commands = {
  assertDataSourceManagerOverlayIsOpenAndSwitchToIt: function (appName ='Edit Data Sources') {
    return this
      .waitForElementVisible('@appDataOverlayTitle', this.api.globals.longWait)
      .assert.containsText('@appDataOverlayTitle', appName)
      .switchToWidgetProviderFrame()
      .waitForElementNotVisible('@loadingDataSpinner', this.api.globals.longWait);
  },

  clickShowAllDataSourcesButton: function () {
    return this
      .waitForElementVisible('@showAllDataSourcesButton', this.api.globals.mediumWait)
      .click('@showAllDataSourcesButton')
      .waitForElementNotVisible('@showAllDataSourcesButton', this.api.globals.mediumWait);
  },

  clickShowAppsDataSourcesButton: function (){
    return this
      .waitForElementVisible('@showAppsDataSourcesButton', this.api.globals.mediumWait)
      .click('@showAppsDataSourcesButton')
      .waitForElementNotVisible('@showAppsDataSourcesButton', this.api.globals.mediumWait);
  },

  closeDataSourceManagerOverLay: function () {
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@overlayCloseButton', this.api.globals.mediumWait)
      .click('@overlayCloseButton')
      .waitForElementNotPresent('@overlayCloseButton', this.api.globals.mediumWait)
      .assert.elementNotPresent('@appDataOverlayTitle', 'Data source manager overlay is closed.')
      .switchToWidgetInstanceFrame();
  },

  clickSaveButtonInDataSourceManagerOverlay: function(){
    return this
      .waitForElementVisible('@saveChangesButtonEntries', this.api.globals.smallWait)
      .click('@saveChangesButtonEntries')
      .waitForElementNotVisible('@saveChangesButtonEntries', this.api.globals.smallWait);
  },

  clickSaveButtonInDataSourceManagerOverlayOpenFromDataSourceProvider: function(){
    this
      .waitForElementVisible('@saveChangesButtonEntries', this.api.globals.smallWait)
      .click('@saveChangesButtonEntries')
      .waitForElementNotPresent('@saveChangesButtonEntries', this.api.globals.smallWait)
      .assert.elementNotPresent('@overlayCloseButton', 'Data source manager is closed after saving changes for data source.')
      .api.frame(null);

    return this;
  },
};

module.exports = {
  commands: [commands],
  elements: {
    appDataOverlayTitle: {
      selector: '.overlay-title'
    },
    overlayCloseButton: {
      selector: '.overlay-close'
    },
    listOfAppDataSources: {
      selector: '#data-sources'
    },
    dataSourceContent: {
      selector: '#source-contents'
    },
    dataSourceTitle: {
      selector: '.editing-data-source-name'
    },
    loadingDataSpinner: {
      selector: '.spinner-holder .spinner-overlay'
    },
    showAllDataSourcesButton: {
      selector: 'button[data-show-all-source]'
    },
    showAppsDataSourcesButton: {
      selector: 'button[data-app-source]'
    },
    saveChangesButtonEntries: {
      selector: '.save-btn button'
    }
  }
};