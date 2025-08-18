const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const appVersion =`1.0.${casual.month_number}`;
const distributionChannel = 'Unsigned IPA';
const appIconFile = 'icon.png';
const appIcon = 'text_has_31_characters_Lorem_ip';

module.exports = {
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 05-unsigned-ipa-invalid-data`;

    browser.getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .deleteCookies()
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new application, open publish screen, enter app icon name and app version' : function (browser) {
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.switchToUnsignedTab();
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm.enterAppIconNameUnsigned(appIcon);
    distributionForm.changeAppVersionUnsigned(appVersion);
    distributionForm.clickSaveProgressButtonUnsigned();
  },

  'Configuring an App Store submission with invalid data - Unsigned IPA': function(browser){
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();
    const appSettings = browser.page.appSettingsOverlay();
    const editApp = browser.page.editAppScreen();

    //assert build cannot be requested without icon

    distributionForm.clickRequestAppButtonUnsignedIPA();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.expandAppDetailsUnsignedIPA();

    browser
      .waitForElementVisible('#accordionUnsigned .form-group.clearfix.app-icon-name.has-error .help-block.text-danger.app-details-error', browser.globals.mediumWait)
      .assert.containsText('#accordionUnsigned .form-group.clearfix.app-icon-name.has-error .help-block.text-danger.app-details-error',
      'Upload a 1024 × 1024 pixels image. Click the change button to upload a new app icon.')
      .refresh();

    //add icon and assert build cannot be requested with empty app icon name

    publish.openEditMenu();

    rightSideNavMenu.openAppSettingScreen();

    appSettings.clickChangeAppIconButton();
    appSettings.uploadAppIcon(appIconFile);
    appSettings.clickSaveButton();
    appSettings.closeSettingsOverlay();
    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.switchToUnsignedTab();
    distributionForm.enterAppIconNameUnsigned('');
    distributionForm.clickSaveProgressButtonUnsigned();
    distributionForm.clickRequestAppButtonUnsignedIPA();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('.help-block.with-errors .list-unstyled', browser.globals.mediumWait)
      .assert.containsText('.help-block.with-errors .list-unstyled', 'Please enter an app icon name')
      .click('div[id="unsignedGeneralHeading"]')
      .waitForElementNotVisible('#fl-uns-iconName', browser.globals.mediumWait);

    //assert build cannot be requested with empty app version

    distributionForm.enterAppIconNameUnsigned(appIcon);
    distributionForm.clickSaveProgressButtonUnsigned();

    browser
      .pause(1000)
      .assert.value('#fl-uns-iconName', appIcon.slice(0, -1));

    distributionForm.changeAppVersionUnsigned('');
    distributionForm.clickRequestAppButtonUnsignedIPA();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('#unsignedTech .help-block.with-errors li', browser.globals.mediumWait)
      .assert.containsText('.help-block.with-errors .list-unstyled', 'Please enter an app version number')
      .click('div[id="unsignedTechHeading"]')
      .waitForElementNotVisible('#fl-uns-versionNumber', browser.globals.mediumWait);

    //assert build cannot be requested with empty BundleID

    distributionForm.changeAppVersionUnsigned('1');
    distributionForm.changeBundleIDForUnsignedIPA('');
    distributionForm.clickRequestAppButtonUnsignedIPA();
    distributionForm.acceptModalWindowWithError();
    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');

    browser
      .waitForElementVisible('.fl-bundleId-field.show .list-unstyled li', browser.globals.mediumWait)
      .assert.containsText('.fl-bundleId-field.show .list-unstyled li', 'Please enter your Bundle ID');
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};
