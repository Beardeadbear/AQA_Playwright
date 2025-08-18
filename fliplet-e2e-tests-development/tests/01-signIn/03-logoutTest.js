module.exports = {
  beforeEach: function (browser) {
    browser
      .deleteCookies()
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Successful logout from website': function (browser) {
    const menu = browser.page.topMenu();
    const signIn = browser.page.signInPage();

    menu.expandMyAccountDropDown();
    menu.clickLogout();

    signIn.expect.element('@emailInput').to.be.visible;
  },

  'User is unable to access website using expired access token': function (browser) {
    const menu = browser.page.topMenu();
    const signIn = browser.page.signInPage();
    const appsPage = browser.page.appsPage();
    const token = {
      name: '_auth_token',
      value: ''
    };

    //Getting the authentication token of a current session

    browser.getCookie('_auth_token', function callback (result) {
      this.assert.equal(result.name, token.name);
      token.value = result.value;
    });

    menu.expandMyAccountDropDown();
    menu.clickLogout();

    /*1. Checking that the token was revoked after logging out
    2. Setting up old authentication token in Cookies
     */

    browser
      .getCookies(function (result) {
        for(let singleValue of result.value) {
          this.assert.notEqual(singleValue.name, token.name);
        }
      })
      .setCookie(token);

    appsPage
      .navigate()
      .waitForElementVisible('body', browser.globals.smallWait);

    signIn.expect.element('@emailInput').to.be.visible.after(5000);
  }
};