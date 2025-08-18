const commands = {
  openComponentsScreen: function () {
    this
      .waitForElementVisible('@addComponentsButton', this.api.globals.smallWait)
      .click('@addComponentsButton')
      .expect.element('@addComponentsButton').to.have.attribute('class').contains('active')
      .before(this.api.globals.mediumWait);

    return this
      .waitForElementVisible('.side-view.page-widgets', this.api.globals.smallWait);
  },

  openLayoutsScreen: function () {
    this
      .waitForElementVisible('@addScreensButton', this.api.globals.smallWait)
      .click('@addScreensButton')
      .expect.element('@addScreensButton').to.have.attribute('class').contains('active')
      .before(this.api.globals.mediumWait);

    return this
      .waitForElementVisible('section.page-layouts', this.api.globals.mediumWait)
      .waitForElementVisible('.content-close', this.api.globals.smallWait)
  },

  openAppearanceScreen: function () {
    this
      .waitForElementVisible('@themeAppearanceButton', this.api.globals.smallWait)
      .click('@themeAppearanceButton')
      .expect.element('@themeAppearanceButton').to.have.attribute('class').contains('active')
      .before(this.api.globals.mediumWait);

    return this
      .switchToWidgetProviderFrame();
  },

  openMenuScreen: function () {
    this
      .waitForElementVisible('@menuOptionsButton', this.api.globals.smallWait)
      .click('@menuOptionsButton')
      .expect.element('@menuOptionsButton').to.have.attribute('class').contains('active')
      .before(this.api.globals.mediumWait);

    return this
      .switchToWidgetProviderFrame()
      .waitForElementNotVisible('.spinner-holder.animated', this.api.globals.longWait);
  },

  openAppDataScreen: function () {
    return this
      .waitForElementVisible('@appDataButton', this.api.globals.smallWait)
      .click('@appDataButton')
      .waitForElementVisible('@overlayContent', this.api.globals.mediumWait)
      .assert.containsText('@overlayContentTitle', 'Data Sources')
  },

  openFileManagerScreen: function () {
    return this
      .waitForElementVisible('@manageCollaboratorsButton', this.api.globals.smallWait)
      .click('@manageCollaboratorsButton')
      .waitForElementVisible('@overlayContent', this.api.globals.smallWait)
      .assert.containsText('@overlayContentTitle', 'File Manager');
  },

  openAppSettingScreen: function () {
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@appSettingsButton', this.api.globals.smallWait)
      .click('@appSettingsButton')
      .waitForElementVisible('@overlayContent', this.api.globals.smallWait)
      .assert.containsText('@overlayContentTitle', 'App Settings');
  },

  openManageCollaboratorsScreen: function () {
    return this
      .waitForElementVisible('@manageCollaboratorsButton', this.api.globals.smallWait)
      .click('@manageCollaboratorsButton')
      .waitForElementVisible('@overlayContent', this.api.globals.smallWait)
      .assert.containsText('@overlayContentTitle', 'Manage Collaborators');
  },

  openDeveloperOptionsScreen: function () {
    this
      .waitForElementVisible('@developerOptionsButton', this.api.globals.smallWait)
      .click('@developerOptionsButton')
      .expect.element('@developerOptionsButton').to.have.attribute('class').contains('active')
      .before(this.api.globals.mediumWait);

    return this
      .waitForElementVisible('.preview-toolbar.developer-open', this.api.globals.mediumWait);
  }
};

module.exports = {
  commands: [commands],
  selector: '.side-nav',
  elements: {
    addComponentsButton: {
      selector: '//img[contains(@src,"add-components")]/parent::button',
      locateStrategy: 'xpath'
    },
    addScreensButton: {
      selector: '//img[contains(@src,"add-screen")]/parent::button',
      locateStrategy: 'xpath'
    },
    themeAppearanceButton: {
      selector: '//img[contains(@src,"paintbrush")]/parent::button',
      locateStrategy: 'xpath'
    },
    menuOptionsButton: {
      selector: '//img[contains(@src,"menu")]/parent::button',
      locateStrategy: 'xpath'
    },
    appDataButton: {
      selector: '//img[contains(@src,"data")]/parent::button',
      locateStrategy: 'xpath'
    },
    fileManagerButton: {
      selector: '//img[contains(@src,"file-folder")]/parent::button',
      locateStrategy: 'xpath'
    },
    appSettingsButton: {
      selector: '//img[contains(@src,"settings")]/parent::button',
      locateStrategy: 'xpath'
    },
    manageCollaboratorsButton: {
      selector: '//img[contains(@src,"profile")]/parent::button',
      locateStrategy: 'xpath'
    },
    developerOptionsButton: {
      selector: '//img[contains(@src,"developer-options")]/parent::button',
      locateStrategy: 'xpath'
    },
    overlayContent: {
      selector: '#overlay-content-0'
    },
    overlayContentTitle: {
      selector: '#overlay-content-0 .overlay-title'
    }
  }
};
