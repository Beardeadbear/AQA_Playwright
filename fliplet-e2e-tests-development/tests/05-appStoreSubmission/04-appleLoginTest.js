const casual = require('casual');
const globals = require('../../globals_path');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const distributionChannel = 'App Store';
const wrongLogin = casual.email;
const wrongPassword = casual.word;
const errorMessage = 'The email or password you entered for the Apple Developer portal are wrong. Please try again.';
const appIconFile = 'icon.png';

module.exports = {

  '@disabled': true, //until app store submission tests are fixed
 // '@disabled': (globals.smokeTest === 'true'),

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 04-apple-login`;

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

  'Create a new application and set an icon for it': function (browser) {
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const appSettings = browser.page.appSettingsOverlay();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    rightSideNavMenu.openAppSettingScreen();

    appSettings.clickChangeAppIconButton();
    appSettings.uploadAppIcon(appIconFile);
    appSettings.clickSaveButton();
    appSettings.closeSettingsOverlay();
  },

  'Test Apple login with incorrect login': function (browser) {
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //enter correct login and wrong password

    distributionForm.expandAppStoreTechHeading();

    browser
      .pause(5000)
      .elements('css selector', '.appStore-login-details.hidden', (result)=>{
        if (result.value.length > 0){
          distributionForm.logoutFromAppleDeveloperAccount();
        }
      });

    distributionForm
      .enterAppleDeveloperAccountLogin(wrongLogin)
      .enterAppleDeveloperAccountPassword(browser.globals.applePassword)
      .clickAppStoreLoginButton();

    //verify error message about wrong credentials is displayed

    distributionForm.verifyAppleDeveloperPortalErrorMessageIsDisplayed(errorMessage);
  },

  'Test Apple login with incorrect password': +function (browser) {
    const distributionForm = browser.page.distributionForms();
    const publish = browser.page.publishScreen();

    browser.refresh();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //enter correct login and wrong password

    distributionForm
      .expandAppStoreTechHeading()
      .enterAppleDeveloperAccountLogin(browser.globals.appleEmail)
      .enterAppleDeveloperAccountPassword(wrongPassword)
      .clickAppStoreLoginButton();

    //verify error message about wrong credentials is displayed

    distributionForm.verifyAppleDeveloperPortalErrorMessageIsDisplayed(errorMessage);
  },

  'Test Apple login with empty login and password fields': function (browser) {
    const distributionForm = browser.page.distributionForms();
    const publish = browser.page.publishScreen();

    browser.refresh();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //enter correct login and wrong password

    distributionForm
      .expandAppStoreTechHeading()
      .enterAppleDeveloperAccountLogin('')
      .enterAppleDeveloperAccountPassword('')
      .clickAppStoreLoginButton();

    //verify error message about wrong credentials is displayed

    browser.expect.element('.form-group.clearfix.has-error.has-danger input[type="email"]').to.be.visible.after(2000);
    browser.expect.element('.form-group.clearfix.has-error.has-danger input[type="password"]').to.be.visible.after(2000);
  },

  'Test Apple login with correct credentials': function (browser) {
    const distributionForm = browser.page.distributionForms();
    const publish = browser.page.publishScreen();

    browser.refresh();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //enter correct login and wrong password

    distributionForm
      .expandAppStoreTechHeading()
      .enterAppleDeveloperAccountLogin(browser.globals.appleEmail)
      .enterAppleDeveloperAccountPassword(browser.globals.applePassword);

    browser.pause(3000);

    distributionForm.clickAppStoreLoginButton();

    //verify user is logged in

    distributionForm.verifyUserIsLoggedInWithAppleDeveloperAccount(browser.globals.appleEmail);
  },

  'Test Apple auto login': function(browser){
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    apps
      .navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown();
    menu.clickLogout();

    browser.login();

    apps.openAppByName(browser.globals.appNameGenerated);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    browser.pause(2000);

    distributionForm.expandAppStoreTechHeading();

    browser.moveToElement('#fl-store-versionNumber', 0, 0);

    distributionForm.verifyUserIsLoggedInWithAppleDeveloperAccount(browser.globals.appleEmail);
  },

  'Test Apple auto login after doing a logout': function(browser){
    const menu = browser.page.topMenu();
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();
    const distributionForm = browser.page.distributionForms();

    apps
      .navigate()
      .waitForAppsPageToBeLoaded();

    menu.expandMyAccountDropDown();
    menu.clickLogout();

    browser.login();

    apps.openAppByName(browser.globals.appNameGenerated);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);
    distributionForm.expandAppStoreTechHeading();
    distributionForm.verifyUserIsLoggedInWithAppleDeveloperAccount(browser.globals.appleEmail);
    distributionForm
      .logoutFromAppleDeveloperAccount()
      .enterAppleDeveloperAccountLogin(" ")
      .clickSaveProgressButtonForStoreAndMarket();

    browser.refresh();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to Apple devices');

    distributionForm.scrollDownAndSwitchToWidgetProviderFrameByDistributionName('Apple');
    distributionForm.verifyCorrectDistributionChannelIsSelected(distributionChannel);

    //verify that user is not logged in

    distributionForm.expandAppStoreTechHeading();

    distributionForm.expect.element('@appStoreLoginButton').to.be.present.after(5000);
  },

  'Deleting created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};