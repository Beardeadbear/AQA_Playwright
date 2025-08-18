const globals = require("../../globals_path");
const webAppUrl = 'https://staging-apps.fliplet.com/qa-complex-app-complex-test-app-20-automation';
const appName = 'Complex test app 2.0';
const credentials = [];

module.exports = {
  before: function (browser) {
    browser.url(webAppUrl);
  },

  afterEach: function (browser, done) {
    browser.getBrowserConsoleLogs(done);
  },

  after: function (browser) {
    browser.end();
  },

  'Check Onboarding screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkPageTitle(`Onboarding - ${appName}`)
      .checkOnboardingScreen(3, 3)
      .checkOnboardingSlidesFunctionality()
      .checkSkipButton()
      .checkPageTitle(`Login - ${appName}`); //TODO: add Button On Slide and background image tests
  },

  /*  disabled due to bug https://github.com/Fliplet/fliplet-studio/issues/6314
  'Check Agenda LFD screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('Agenda LFD', appName)
      .checkPageTitle(`Agenda LFD - ${appName}`)
      .checkBookmarkedLfdItem()
      .checkBookmarkFunctionality(2)
      .openAndCheckLfdBookmarkedItemDetails()
      .removeBookmarkFromLfdItem()
      .closeLfdItemDetailsOverlay()
      .checkIfBookmarkIsNotSelected()
      .checkAgendaLfdDaysFunctionality();
  },

  'Check News Feed LFD screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('News Feed LFD', appName)
      .checkPageTitle(`News Feed LFD - ${appName}`)
      .checkBookmarkedLfdItem()
      .checkBookmarkFunctionality(1)
      .openAndCheckLfdBookmarkedItemDetails()
      .removeBookmarkFromLfdItem()
      .closeLfdItemDetailsOverlay()
      .checkIfBookmarkIsNotSelected()
      .checkLfdFilterFunctionality()
      .checkLfdLikeFunctionality()
      .checkLfdSearchFunctionality(1); //TODO: add test for comments functionality
  },
  */

  'Check App List Screen without login': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('App List', appName)
      .checkPageTitle(`App List - ${appName}`)
      .assertAppListIsHiddenBySingInButton()
      .clickElementOnWebAppScreen('@signInAppListButton');
  },

  'Check Login screen ': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkPageTitle(`Login - ${appName}`);
    webApp.getCredentials(credentials);
    webApp.checkForgotPassword();
  },

  'Check "Login error" message': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.enterEmailAndPasswordForLogin(credentials[0], credentials[1].replace(1, 10))
      .submitLoginForm()
      .assertErrorLoginMessageIsDisplayed("our email or password don't match. Please try again.");
  },

  'Check login with correct credentials': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.enterEmailAndPasswordForLogin(credentials[0], credentials[1])
      .submitLoginForm()
      .assertLoginIsSuccessful()
      .checkPageTitle(`List - ${appName}`);
  },

  'Check List (with small thumbnails) screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkListScreen(11)
      .checkListImages(11)
      .clickListItem('App List')
      .checkPageTitle(`App List - ${appName}`);
  },

  'Check App List Screen after login': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.checkTheAppInAppList('just app')
      .checkAppListSignOutButton()
      .checkAppDeleteActionInAppList(); //TODO: add test to check ability to open another app and return back
  },

  'Check Directory LFD Screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('Directory LFD', appName)
      .checkPageTitle(`Directory LFD - ${appName}`)
      .checkDirectoryLFDScreen()
      .checkLfdFilterFunctionality()
      .checkLfdSearchFunctionality(1)
      .openAndCheckLfdItemDetails2()
      .closeLfdItemDetailsOverlay(); //TODO: add test to check '.dynamic-list-add-item' with Form component
  },

  'Check Interactive Graphics Screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('Interactive Graphics', appName)
      .checkPageTitle(`Interactive Graphics - ${appName}`)
      .checkInteractiveGraphicsMaps(2)
      .checkInteractiveGraphicsMarkers(2)
      .switchBetweenMaps('Map 2')
      .checkInteractiveGraphicsMaps(2)
      .checkInteractiveGraphicsMarkers(2);
  },

  'Check Chart Screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('Chart', appName)
      .checkPageTitle(`Chart - ${appName}`)
      .checkChartScreen(2)
      .checkSelectChatValueFunctionality();
  },

  'Check Gallery Screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('Gallery', appName)
      .checkPageTitle(`Gallery - ${appName}`)
      .checkGalleryImages(5)
      .checkImagesInsideAccordionComponent(2);
  },

  'Check Media Screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('Media', appName)
      .checkPageTitle(`Media - ${appName}`)
      .assertOfflineVideoComponentIsPresent()
      .checkOnlineVideo();
  },

  'Check Slider Screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('Slider', appName)
      .checkPageTitle(`Slider - ${appName}`)
      .checkOnboardingScreen(4, 2)
      .checkOnboardingSlidesFunctionality()
      .checkSlideWithButton();  //TODO: add test for slide button functionality
  },

  'Check RSS Screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('RSS', appName)
      .checkPageTitle(`RSS - ${appName}`)
      .checkRssScreenUpdate()
      .checkRssFeedPanel()
      .checkArticleOverlayPanel();
  },

  'Check About this app Screen': function (browser) {
    const webApp = browser.page.webApplicationPages();

    webApp.openScreenFromMenuPanelByName('List', appName)
      .checkPageTitle(`List - ${appName}`)
      .clickListItem('About this app')
      .checkAboutThisAppOverlay()
      .checkInlineLink('Fliplet')
      .clickElementOnWebAppScreen('@inlineLink')
      .switchToNewWindow('@inlineLink', 'https://fliplet.com/')
      .checkPageTitle('Fliplet');
  }
};