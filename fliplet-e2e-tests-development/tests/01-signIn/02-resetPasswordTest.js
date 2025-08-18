module.exports = {
  beforeEach: function (browser) {
    browser.deleteCookies();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Unsuccessful attempt to reset password': function (browser) {
    const signIn = browser.page.signInPage();
    const forgotPassword = browser.page.forgotPasswordPage();

    signIn
      .setValueForEmail(browser.globals.email)
      .clickContinueButtonForSignIn()
      .clickForgotPassword();

    forgotPassword
      .assertForgotPasswordFormIsOpen()
      .setValueForEmailInResetPassword('qa+123test@fliplet.com')
      .clickResetPassword()
      .assertThatEmailDoesNotExistErrorIsPresent();
  },

  'Successful attempt to reset password': function (browser) {
    const signIn = browser.page.signInPage();
    const forgotPassword = browser.page.forgotPasswordPage();

    forgotPassword
      .assertForgotPasswordFormIsOpen()
      .setValueForEmailInResetPassword(browser.globals.email)
      .clickResetPassword()
      .assertThatSuccessAlertIsPresent(browser.globals.email);
  }
};