const util = require('util');
const activeContentStep = '(//div[@class="content-steps-holder"]/div[contains(@class,"content-step")])[%s]';
const useTemplateButton = '//div[text()="%s"]/parent::div/parent::div/parent::li//div[@class="btn btn-primary"]';
const accessOptionForCollaborator = '//a[text()="%s"]/parent::li';

const commands = {
  assertAppSetupOverlayIsOpen: function () {
    this.expect.section('@contentHeader').to.be.visible.before(this.api.globals.longWait);
    this.expect.section('@contentBody').to.be.visible.before(this.api.globals.longWait);

    return this;
  },

  checkAppSetupSectionIsDisplay: function (title, sectionNumber) {
    this.section.contentHeader.waitForElementVisible('@overlayTitle', this.api.globals.longWait);
    this.section.contentHeader.assert.containsText('@overlayTitle', title);
    this.api.useXpath()
      .waitForElementVisible(util.format(activeContentStep, sectionNumber), this.api.globals.longWait)
      .assert.attributeContains(util.format(activeContentStep, sectionNumber), 'class', 'active')
      .useCss();

    return this;
  },

  checkAppTemplateSection: function () {
    this.checkAppSetupSectionIsDisplay('Select a template', 1);
    this.section.contentBody.expect.section('@templatesHolder').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.section.templatesHolder.waitForElementVisible('@templateHolder', this.api.globals.longWait);
    this.section.contentBody.section.templatesHolder.expect.element('@useTemplateButton').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.section.templatesHolder.expect.element('@tryDemoAppButton').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.section.templatesHolder.expect.element('@templatePreviewImage').to.be.visible.before(this.api.globals.longWait);

    return this;
  },

  waitForAppTemplatesToBeLoaded: function () {
    this.api.elements('css selector', '.template-holder', function (result) {
      for (let i = 0; i < result.value.length; i++) {
        this
          .useXpath()
          .waitForElementVisible(`(//img[@class="img-responsive"])[${i + 1}]`, this.globals.smallWait)
          .useCss();
      }
    });

    return this;
  },

  clickUseAppTemplate: function (templateName) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(useTemplateButton, templateName), this.api.globals.smallWait)
      .click(util.format(useTemplateButton, templateName))
      .useCss();

    return this;
  },

  checkAppSetupSection: function () {
    this.checkAppSetupSectionIsDisplay('App setup', 2);
    this.section.contentBody.expect.section('@appNameSetupSection').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.section.appNameSetupSection.expect.element('@appNameInputField').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.section.appNameSetupSection.expect.element('@appIcon').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.expect.element('@backButton').to.be.visible.before(this.api.globals.longWait);

    return this;
  },

  enterAppName: function (appName) {
    this.section.contentBody.section.appNameSetupSection.waitForElementVisible('@appNameInputField', this.api.globals.longWait);
    this.section.contentBody.section.appNameSetupSection.clearValue('@appNameInputField');
    this.section.contentBody.section.appNameSetupSection.setValue('@appNameInputField', appName);

    return this;
  },

  checkErrorMessageIfNoAppNameHasBeenEntered: function () {
    this.section.contentBody.section.appNameSetupSection.waitForElementVisible('@appNameInputField', this.api.globals.longWait);
    this.section.contentBody.section.appNameSetupSection.clearValue('@appNameInputField');
    this.section.contentBody.section.appNameSetupSection.assert.visible('@appNameError');

    return this;
  },

  clickBackButton: function () {
    this.section.contentBody.waitForElementVisible('@backButton', this.api.globals.longWait);
    this.section.contentBody.click('@backButton');

    return this;
  },

  clickNextButton: function () {
    this.section.contentBody.waitForElementVisible('@nextButton', this.api.globals.longWait);
    this.section.contentBody.click('@nextButton');

    return this;
  },

  downloadAppIcon: function (iconImageName) {
    this.section.contentBody.section.appNameSetupSection.waitForElementVisible('@appIcon', this.api.globals.longWait);
    this.section.contentBody.section.appNameSetupSection.click('@appIcon');
    this.section.contentBody.section.appNameSetupSection.setValue('#fl-app-icon', `/files/files/${iconImageName}`);
    this.section.contentBody.section.appNameSetupSection.assert.attributeContains('@appIcon', 'src', 'app-icon.png');

    return this;
  },

  checkFlipletViewerInfoSection: function () {
    this.checkAppSetupSectionIsDisplay('Preview your app on your mobil', 3);
    this.section.contentBody.expect.section('@flipletViewerInfoSection').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.section.flipletViewerInfoSection.expect.element('@appQrCode').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.section.flipletViewerInfoSection.expect.element('@fvLinkHolder').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.section.flipletViewerInfoSection.expect.element('@emailLinkButton').to.be.visible.before(this.api.globals.longWait);
    this.section.contentBody.section.flipletViewerInfoSection.expect.element('@copyLinkButton').to.be.visible.before(this.api.globals.longWait);

    return this;
  },

  checkIfErrorConnectingToServerAppears: function () {
    const tryAgainButtonLocator = '//button[text()="Try again"]';
    const connectingToServerErrorLocator = '//p[@class="text-warning"]';
    const resultDisplaying = [];

    this.waitForElementNotPresent('@createAppProgressBar', this.api.globals.longWait)
      .api.useXpath()
      .waitForElementPresentWithoutErrorsXpath(connectingToServerErrorLocator, 5000, resultDisplaying)
      .perform(function () {
        if (resultDisplaying[0] == true) {
          this.api.waitForElementVisible(tryAgainButtonLocator, this.api.globals.smallWait)
            .click(tryAgainButtonLocator);
        }
      })
      .waitForElementNotPresent(connectingToServerErrorLocator, this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  checkCollaborationAddingSection: function (done) {
    this
      .checkIfErrorConnectingToServerAppears(() => {
        done();
      })
      .waitForElementNotPresent('@createAppProgressBar', this.api.globals.longWait, () => {
      this.checkAppSetupSectionIsDisplay('Add collaborators', 4);
      this.section.contentBody.expect.section('@collaborationAddingSection').to.be.visible.before(this.api.globals.longWait);
      this.section.contentBody.section.collaborationAddingSection.expect.element('@addAnotherButton').to.be.visible.before(this.api.globals.longWait);
      this.section.contentBody.section.collaborationAddingSection.expect.element('@emailInputField').to.be.visible.before(this.api.globals.longWait);
      this.section.contentBody.section.collaborationAddingSection.expect.element('@accessControlSelectDropdownField').to.be.visible.before(this.api.globals.longWait);
      this.section.contentBody.expect.element('@backButton').to.be.visible.before(this.api.globals.longWait);
    });

    return this;
  },

  checkCopyLinkButton: function () {
    this.section.contentBody.section.flipletViewerInfoSection.waitForElementVisible('@copyLinkButton', this.api.globals.smallWait);
    this.section.contentBody.section.flipletViewerInfoSection.assert.containsText('@copyLinkButton', 'Copy link');
    this.section.contentBody.section.flipletViewerInfoSection.click('@copyLinkButton');
    this.section.contentBody.section.flipletViewerInfoSection.expect.element('@copyLinkButton').text.to.equal('Copied!').before(this.api.globals.tinyWait);

    return this;
  },

  checkErrorMessageTryingToAddCollaboratorWithInvalidValueInEmailField: function (invalidEmailValue) {
    this.section.contentBody.section.collaborationAddingSection.clearValue('@emailInputField');
    this.section.contentBody.section.collaborationAddingSection.setValue('@emailInputField', invalidEmailValue);
    this.section.contentBody.click('@nextButton');
    this.section.contentBody.section.collaborationAddingSection.assert.visible('@emptyEmailFieldError');

    return this;
  },

  checkAddingCollaboratorsFunctionality: function (collaboratorEmailValue) {
    this.section.contentBody.section.collaborationAddingSection.clearValue('@emailInputField');
    this.section.contentBody.section.collaborationAddingSection.setValue('@emailInputField', collaboratorEmailValue);
    this.section.contentBody.section.collaborationAddingSection.click('@addAnotherButton');
    this.section.contentBody.section.collaborationAddingSection.assert.visible('@removeButton');

    this.assertAmountOfElementsPresent('@appCollaboratorsList', 2);

    return this;
  },

  chooseValueFormAccessControlDropdownField: function (accessLevel) {
    this.section.contentBody.section.collaborationAddingSection.click('@accessControlSelectDropdownField');
    this.api.useXpath()
      .waitForElementVisible(util.format(accessOptionForCollaborator, accessLevel), this.api.globals.smallWait)
      .click(util.format(accessOptionForCollaborator, accessLevel))
      .assert.attributeContains(util.format(accessOptionForCollaborator, accessLevel), 'class', 'active');
    this.api.useCss();

    return this;
  },

  checkAbilityToRemoveCollaborators: function () {
    this
      .section.contentBody.section.collaborationAddingSection.waitForElementVisible('@removeButton', this.api.globals.smallWait)
      .click('@removeButton')
      .assert.elementNotPresent('@removeButton');

    return this
      .assertAmountOfElementsPresent('@appCollaboratorsList', 1);
  },

  waitForAppEditModeToBeLoaded: function () {
    const screensDisplaying = [];
    const previewDisplaying = [];

    this
      .waitForElementNotPresent('@appSetupOverlay', this.api.globals.longWait)
      .waitForElementVisible('.navbar-left', this.api.globals.longWait)
      .waitForElementVisible('.navbar-right', this.api.globals.longWait)
      .waitForElementVisible('.screens.screens-manageable', this.api.globals.longWait)
      .waitForElementVisible('ul.widgets', this.api.globals.longWait)
      .api.refresh()// preventing case with "Cannot read property 'fn' of undefined" error
      .waitForElementVisible('.navbar-left', this.api.globals.longWait)
      .waitForElementVisible('.navbar-right', this.api.globals.longWait)
      .waitForElementPresentWithoutErrors('.screens.screens-manageable', this.api.globals.longWait, screensDisplaying)
      .perform(function() {
        if (screensDisplaying[0] == false) { // if screens bar is not present
          this.api.refresh();
        }
      })
      .waitForElementVisible('.screens.screens-manageable', this.api.globals.longWait)
      .waitForElementVisible('ul.widgets', this.api.globals.longWait)
      .waitForElementPresentWithoutErrors('div[class="frame"] #preview', this.api.globals.tinyWait, previewDisplaying)
      .perform(function () {
        if (previewDisplaying[0] == false) { // if endless loader is present in app preview
          this.api.refresh();
        }
      })
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.longWait)
      .waitForElementPresent('.mode-interact-ready', this.api.globals.longWait)
      .frame(null)
      .waitForAjaxCompleted();

    return this;
  },

  clickCreateMyAppButton: function () {
    const screensDisplaying = [];
    const previewDisplaying = [];
    const navigationBarDisplaying = [];

    return this
      .waitForElementVisible('.app-create-form .btn.btn-primary', this.api.globals.smallWait)
      .waitForElementVisible('.app-create-form .app-name', this.api.globals.smallWait)
      .api.pause(1000)
      .waitForAjaxCompleted()
      .click('.app-create-form .btn.btn-primary')
      .waitForElementNotPresent('.progress-bar.progress-bar-striped.active', this.api.globals.longWait)
      .waitForElementPresentWithoutErrors('.navbar-left', this.api.globals.tinyWait, navigationBarDisplaying)
      .perform(function() {
        if (navigationBarDisplaying[0] == false) { // if navigation bar is not present
          this.api
            .keys([this.api.Keys.ENTER])
            .execute(function () {
              const elementForClick = document.querySelector('.modal-dialog .btn.btn-primary');
              elementForClick.click(); // if problem during creating of app appeared
            });
        }
      })
      .waitForElementVisible('.navbar-left>a', this.api.globals.longWait)
      .waitForElementVisible('.screens.screens-manageable', this.api.globals.longWait)
      .waitForElementVisible('ul.widgets', this.api.globals.longWait)
      .waitForElementVisible('.navbar-right', this.api.globals.longWait)
      .refresh() // preventing case with "Cannot read property 'fn' of undefined" error
      .waitForElementPresentWithoutErrors('.screens.screens-manageable', this.api.globals.tinyWait, screensDisplaying)
      .perform(function() {
        if (screensDisplaying[0] == false) { // if screens bar is not present
          this.api.refresh();
        }
      })
      .waitForElementVisible('.screens.screens-manageable', this.api.globals.longWait)
      .waitForElementVisible('ul.widgets', this.api.globals.longWait)
      .waitForElementPresentWithoutErrors('div[class="frame"] #preview', this.api.globals.tinyWait, previewDisplaying)
      .perform(function() {
        if (previewDisplaying[0] == false) { // if endless loader is present in app preview
          this.api.refresh()
        }
      })
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.smallWait)
      .waitForElementPresent('.mode-interact-ready', this.api.globals.smallWait)
      .frame(null);
  },

  clickTryDemoAppButtonByAppName: function (appName) {
    const tryDemoAppButtonLocator = `//div[text()="${appName}"]/parent::div/parent::div/parent::li//div[@class="btn btn-default"]`;

    this
      .api.useXpath()
      .waitForElementVisible(tryDemoAppButtonLocator, this.api.globals.mediumWait)
      .click(tryDemoAppButtonLocator)
      .useCss();

    return this
      .waitForElementVisible('@templateInfo', this.api.globals.mediumWait)
      .waitForElementVisible('@devicePreview', this.api.globals.mediumWait);
  },

  clickUseThisTemplateButton: function () {
    return this
      .waitForElementVisible('@useThisTemplateButton', this.api.globals.mediumWait)
      .click('@useThisTemplateButton')
      .waitForElementVisible('@appSetupOverlay', this.api.globals.mediumWait);
  },

  assertDetailsOfAppTemplate: function (appName, imageName, description) {
    this
      .api.useXpath()
      .waitForElementVisible(`//div[@class="name"][text()="${appName}"]/span`, this.api.globals.tinyWait)
      .assert.containsText(`//div[@class="name"][text()="${appName}"]/span`, this.api.globals.organizationName.toUpperCase())
      .waitForElementVisible(`//div[@class="name"][text()="${appName}"]`, this.api.globals.tinyWait)
      .waitForElementVisible(`//div[@class="name"][text()="${appName}"]/parent::div/following-sibling::div/img`, this.api.globals.tinyWait)
      .assert.attributeContains(`//div[@class="name"][text()="${appName}"]/parent::div/following-sibling::div/img`, 'src', imageName)
      .waitForElementVisible(`//div[@class="name"][text()="${appName}"]/parent::div/following-sibling::div[@class="template-description"]/p`, this.api.globals.tinyWait)
      .assert.containsText(`//div[@class="name"][text()="${appName}"]/parent::div/following-sibling::div[@class="template-description"]/p`, description)
      .useCss();

    return this;
  },

  assertTemplateIsNotPresentByName: function (templateName) {
    return this
      .api.useXpath()
      .pause(3000)
      .assert.elementNotPresent(`//div[@class="name"][text()="${templateName}"]`)
      .useCss();
  },

  assertAppFeaturesDescription: function (keyFeatures) {
    return this
      .waitForElementVisible('@keyFeatures', this.api.globals.tinyWait)
      .assert.containsText('@keyFeatures', keyFeatures)
  },

  assertCorrectImageIsDisplayedOnPreviewTemplateScreen: function (imageId) {
    this
      .switchToPreviewFrame()
      .waitForElementVisible('@imageOnTemplatePreviewScreen', this.api.globals.smallWait)
      .assert.attributeContains('@imageOnTemplatePreviewScreen', 'src', imageId, `Correct image with id ${imageId} is shown`)
      .api.frame(null);

    return this;
  }
};

module.exports = {
  commands: [commands],
  sections: {
    contentHeader: {
      selector: '.content-header',
      elements: {
        closeAppSetupOverlayButton: {
          selector: '.content-close'
        },
        overlayTitle: {
          selector: '.content-title'
        },
        contentStepHolder: {
          selector: '.content-steps-holder'
        },
      }
    },
    contentBody: {
      selector: '.content-body',
      sections: {
        templatesHolder: {
          selector: '.templates-holder',
          elements: {
            templateHolder: {
              selector: '.template-holder',
            },
            tryDemoAppButton: {
              selector: '.btn.btn-default'
            },
            useTemplateButton: {
              selector: '.btn.btn-primary'
            },
            templatePreviewImage: {
              selector: '.img-responsive'
            }
          }
        },
        appNameSetupSection: {
          selector: '.app-customize-holder',
          elements: {
            appNameInputField: {
              selector: 'input#app_name'
            },
            appIcon: {
              selector: '[class=app-icon]'
            },
            appNameError: {
              selector: '.app-name-danger'
            }
          }
        },
        flipletViewerInfoSection: {
          selector: '.app-fv-holder',
          elements: {
            appQrCode: {
              selector: '.app-qr-code'
            },
            fvLinkHolder: {
              selector: '.fv-link p'
            },
            copyLinkButton: {
              selector: 'button.btn-default.btn-minimal'
            },
            emailLinkButton: {
              selector: 'a.btn-default.btn-minimal'
            }
          }
        },
        collaborationAddingSection: {
          selector: '.app-collaborators-holder',
          elements: {
            addAnotherButton: {
              selector: '.app-collab-add .btn-default'
            },
            removeButton: {
              selector: '//*[@class="app-collab-remove"]/*[text()="Remove"]',
              locateStrategy: 'xpath'
            },
            emailInputField: {
              selector: 'input[type=text]'
            },
            accessControlSelectDropdownField: {
              selector: '.app-collab-access div'
            },
            emptyEmailFieldError: {
              selector: '.collab-email-danger small'
            }
          }
        }
      },
      elements: {
        backButton: {
          selector: '.btn.btn-default'
        },
        nextButton: {
          selector: '.btn.btn-primary'
        }
      }
    }
  },
  elements: {
    appSetupOverlay: {
      selector: '.app-setup-overlay'
    },
    templateInfo: {
      selector: '.description'
    },
    devicePreview: {
      selector: '.device-preview'
    },
    keyFeatures: {
      selector: '.description p'
    },
    imageOnTemplatePreviewScreen: {
      selector: '[data-fl-edit] img'
    },
    useThisTemplateButton: {
      selector: '.overlay-content-header .btn.btn-primary'
    },
    appCollaboratorsList: {
      selector: '.app-collab-list'
    },
    createAppProgressBar: {
      selector: '.progress-bar.progress-bar-striped.active'
    }
  }
};
