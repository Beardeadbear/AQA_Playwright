const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const columnNames = ['Email', 'Phone'];
const emailAddress = [casual.email.toLowerCase(), casual.email.toLowerCase()];
const phoneNumber = [casual.phone.slice(0,-1), casual.phone.slice(0,-1)];
const screenWithSmsVerificationComponent = 'First screen';
const screenForRedirection = 'Second screen';
let verificationCode;
const bypassEmail = {
  code: '',
  email: emailAddress[0]
};

module.exports = {

  '@disabled': (globals.smokeTest === 'true'),

  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 08-verification-sms`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 08-verification-sms`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login()
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Create a new app, a data source for verification components via app data overlay': function (browser) {
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();
    const dataSource = browser.page.singleDataSourcePage();
    const allDataSources = browser.page.allDataSourcesPage();

    browser.createApplicationWithCondition(browser.globals.appNameGenerated);

    rightSideNavMenu.openAppDataScreen();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt(browser.globals.appNameGenerated);

    allDataSources
      .clickCreateDataSourceButton()
      .setValueInDataSourceModal(browser.globals.dataSourceNameGenerated)
      .clickConfirmButtonInDataSourceModal();

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .changeDataSourceColumnNames(columnNames)
      .changeValuesInDataSourceCells(2, [emailAddress[0], phoneNumber[0]])
      .changeValuesInDataSourceCells(3, [emailAddress[1], phoneNumber[1]])
      .clickSaveChangesButtonOnEntriesScreen();
  },

  'Get bypassing validation code and verification code from data source settings': function (browser) {
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    dataSource.switchToSettingsTab()
      .clickShowBypassCodeButton()
      .getText('@verificationHiddenCode', function(verificationCodeValue){
      verificationCode = verificationCodeValue.value;
    })
      .getText('@bypassCode', function(bypassEmailValue){
      bypassEmail.code = bypassEmailValue.value;

        dataSource.switchToEntriesTab()
          .changeValuesInDataSourceCells(2, [`${bypassEmail.code}${bypassEmail.email}`])
          .clickSaveChangesButtonOnEntriesScreen();
    });

    dataSourceManagerOverlay.closeDataSourceManagerOverLay();
  },

  'Add Email Verification component to the app and configure it': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const dataSourceProvider = browser.page.dataSourceProvider();

    browser.dragAndDropWithCondition(widgets.VERIFICATION_EMAIL)
      .switchToWidgetInstanceFrame()
      .switchToFLWidgetProviderFrame('.form-horizontal')
      .switchToFLWidgetProviderFrame('.form-group');

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectTheColumnFromDataSourceForValue(columnNames[0], 1);

    browser.frameParent()
      .frameParent();

    componentsScreen.setLinkActionForComponent(2, 'Display another screen');
    componentsScreen.selectScreenForLinkingByName(screenForRedirection);
    componentsScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview mode and check error if email or code is not correct for Email Verification component': function(browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.VERIFICATION_EMAIL)
      .switchToPreviewFrame();

    previewApp.enterEmailForVerificationComponent(casual.email)
      .assertErrorVerificationInfoMessage('The email address could not be found.')
      .enterEmailForVerificationComponent(`${bypassEmail.code}${bypassEmail.email}`)
      .enterCodeFromVerificationEmail(casual.integer(from = 100000, to = 999998))
      .assertErrorVerificationInfoMessage("You entered the wrong verification code or it might have expired");
  },

  'Check Email Verification component functionality': function(browser) {
    const previewApp = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    previewApp.clickBackChevronOnVerificationComponent()
      .clickIHaveVerificationCodeLink()
      .enterCodeFromVerificationEmail(verificationCode)
      .clickContinueButtonOnVerificationComponent();

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenForRedirection);
  },

  'Navigate to edit mode to add SMS Verification component to the app and configure it': function (browser) {
    const componentsScreen = browser.page.componentsScreen();
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
    const dataSourceProvider = browser.page.dataSourceProvider();

    appTopFixedNavigationBar.navigateToEditMode();

    appScreensLeftsidePanel.openScreenByName(screenWithSmsVerificationComponent);

    browser.dragAndDropWithCondition(widgets.VERIFICATION_SMS)
      .switchToWidgetInstanceFrame()
      .switchToFLWidgetProviderFrame('.form-horizontal')
      .switchToFLWidgetProviderFrame('.form-group');

    dataSourceProvider.selectDataSourceInDropdownList(browser.globals.dataSourceNameGenerated)
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.selectTheColumnFromDataSourceForValue(columnNames[0], 1);

    browser.frameParent()
      .frameParent();

    componentsScreen.setLinkActionForComponent(2, 'Display another screen')
      .selectScreenForLinkingByName(screenForRedirection)
      .clickSaveAndCloseButton();
  },

  'Navigate to preview mode and check error if email or phone is not correct for SMS verification component': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewApp = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.VERIFICATION_SMS)
      .switchToPreviewFrame();

    previewApp.enterEmailForVerificationComponent(casual.email)
      .assertErrorVerificationInfoMessage('The email address could not be found.')
      .enterEmailForVerificationComponent([`${bypassEmail.code}${bypassEmail.email}`])
      .assertErrorVerificationInfoMessage("A 'To' phone number is required.")
  },

  'Check SMS Verification component functionality': function(browser) {
    const previewApp = browser.page.previewAppScreen();
    const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();

    previewApp.clickIHaveVerificationCodeLink()
      .enterCodeFromVerificationEmail(casual.integer(from = 100000, to = 999998))
      .assertErrorVerificationInfoMessage("You entered the wrong verification code or it might have expired")
      .enterCodeFromVerificationEmail(verificationCode)
      .clickContinueButtonOnVerificationComponent();

    appScreensLeftsidePanel.checkTitleOfActiveScreen(screenForRedirection);
  },

  //disabled test with checking  SMS Verification component functionality on web
  // 'Return to edit mode to select data source for phone numbers': function (browser) {
  //   const componentsScreen = browser.page.componentsScreen();
  //   const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
  //   const appScreensLeftsidePanel = browser.page.appScreensLeftsidePanel();
  //
  //   appTopFixedNavigationBar.navigateToEditMode();
  //
  //   appScreensLeftsidePanel.openScreenByName(screenWithSmsVerificationComponent);
  //   editApp.openDetailsOfTopComponentNewDnd(smsVerificationComponent);
  //
  //     browser.switchToFLWidgetProviderFrame('.form-horizontal')
  //     .switchToFLWidgetProviderFrame('.form-group');
  //
  //   componentsScreen.selectDataSourceForLinkingByName(browser.globals.dataSourceNameGenerated);
  //   componentsScreen.selectTheColumnFromDataSourceForValue(columnNames[1], 2);
  //
  //   browser.frameParent()
  //     .frameParent();
  //
  //   componentsScreen.setLinkActionForComponent(2, 'Display another screen');
  //   componentsScreen.selectScreenForLinkingByName(screenForRedirection);
  //   componentsScreen.clickSaveAndCloseButton();
  // },
  //
  // 'Publish the application and open it': function (browser) {
  //   const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
  //   const publish = browser.page.publishScreen();
  //
  //   appTopFixedNavigationBar.navigateToPublishMode();
  //
  //   publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');
  //   publish.clickPublishButton()
  //     .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
  //   publish.clickOpenUrlButtonAndSwitchToOpenedWindow();
  // },
  //
  // 'Check the added components functionality on web': function (browser) {
  //   const webApp = browser.page.webApplicationPages();
  //   const previewApp = browser.page.previewAppScreen();
  //
  //   webApp.checkPageTitle(`${screenWithSmsVerificationComponent} - ${browser.globals.appNameGenerated}`);
  //
  //   previewApp.enterEmailForVerificationComponent(`${bypassEmail.code}${bypassEmail.email}`)
  //       .assertErrorVerificationInfoMessage(`The 'To' number ${phoneNumber[0].split("-").join("")} is not a valid phone number.`)
  // },

  'Delete the created application and data source': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};