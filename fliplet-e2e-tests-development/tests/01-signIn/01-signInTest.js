module.exports = {
  before: function (browser) {
    browser.deleteCookies();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Failed sign in - wrong email': function (browser) {
    const signIn = browser.page.signInPage();

    signIn
      .setValueForEmail('foo')
      .clickContinueButtonForSignIn()
      .assertThatEmailErrorAlertIsPresent();
  },

  'Failed sign in - wrong password' : function (browser) {
    const signIn = browser.page.signInPage();

    signIn
      .setValueForEmail(browser.globals.email)
      .clickContinueButtonForSignIn()
      .setValueForPassword('bar')
      .clickContinueButtonForSignIn()
      .assertEmailPasswordCombinationDoesNotMatchErrorAlertIsPresent();
  },

  'Successful sign in': function (browser) {
    const signIn = browser.page.signInPage();
    const apps = browser.page.appsPage();
    const menu = browser.page.topMenu();

    signIn.signin({
        email: browser.globals.email,
        password: browser.globals.password
      });

    apps
      .waitForAppsPageToBeLoaded()
      .waitForAppsListToBeLoaded();

    menu
      .expandMyAccountDropDown()
      .assertEmailMatchesToEnteredDuringLogin(browser.globals.email);
  }
};