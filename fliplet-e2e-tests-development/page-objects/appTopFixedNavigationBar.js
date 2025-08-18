const commands = {
  assertOpenAppTitle: function (appName) {
    this.section.leftNavBar.waitForElementVisible('@appNameHolder', this.api.globals.longWait);
    this.section.leftNavBar.assert.containsText('@appNameHolder', appName);

    return this;
  },

  waitForAppTopFixedNavigationBarTobeLoaded: function () {
    this.expect.section('@leftNavBar').to.be.visible.before(this.api.globals.longWait);
    this.expect.section('@middleNavBar').to.be.visible.before(this.api.globals.longWait);
    this.expect.section('@rightNavBar').to.be.visible.before(this.api.globals.longWait);

    return this;
  },

  assertIconImageIsPresentAndGetItsId: function (iconImageId) {
    this.section.leftNavBar.assert.visible('@appIcon', this.api.globals.longWait);
    this.section.leftNavBar.getAttribute('@appIcon', 'src', function (srcAttributeValue) {
      return iconImageId.push(srcAttributeValue.value.substring(srcAttributeValue.value.lastIndexOf('/') + 1));
    });

    return this;
  },

  navigateToPreviewMode: function () {
    return this
      .api.frame(null)
      .waitForAjaxCompleted()
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.smallWait)
      .frame(null)
      .waitForElementVisible('.nav-flow a[href*="preview"]', this.api.globals.smallWait)
      .click('.nav-flow a[href*="preview"]')
      .waitForElementVisible('.device-preview.light', this.api.globals.mediumWait)
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.smallWait)
      .frame(null)
      .waitForAjaxCompleted();
  },

  navigateToPublishMode: function () {
    return this
      .api.frame(null)
      .waitForAjaxCompleted()
      .waitForElementVisible('.nav-flow a[href*="publish"]', this.api.globals.smallWait)
      .click('.nav-flow a[href*="publish"]')
      .waitForElementVisible('.publishing-options-wrapper h3', this.api.globals.smallWait)
      .waitForElementVisible('.launch-option-image img', this.api.globals.smallWait);
  },

  navigateToEditMode: function () {
    return this
      .api.frame(null)
      .waitForAjaxCompleted()
      .waitForElementVisible('.nav-flow a[href*="edit"]', this.api.globals.smallWait)
      .pause(1500)
      .click('.nav-flow a[href*="edit"]')
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.mediumWait)
      .frame(null)
      .waitForAjaxCompleted();
  },

  clickExitButton: function () {
    this
      .section.leftNavBar.waitForElementVisible('@exitButton', this.api.globals.smallWait)
      .click('@exitButton')
      .waitForElementNotPresent('@exitButton', this.api.globals.smallWait);

    return this;
  },
};

module.exports = {
  commands: [commands],
  selector: '.navbar.navbar-fixed-top',
  sections: {
    leftNavBar: {
      selector: '.navbar-left',
      elements: {
        appNameHolder: {
          selector: '.app-name',
        },
        appIcon: {
          selector: 'a img'
        },
        exitButton: {
          selector: '.exit'
        }
      }
    },
    middleNavBar: {
      selector: '.nav.navbar-middle'
    },
    rightNavBar: {
      selector: '.navbar-right',
      elements: {
        editButton: {
          selector: '.nav-flow a[href*="edit"]'
        },
        previewButton: {
          selector: '.nav-flow a[href*="preview"]'
        },
        publishButton: {
          selector: '.nav-flow a[href*="publish"]'
        }
      }
    }
  }
};
