/**
 * Login user with args details or with global user if
 * details aren't present
 * @param {string} [email] - User email
 * @param {string} [password] - User password
 */
exports.command = function(email, password) {
  email = email || this.globals.email;
  password = password || this.globals.password;
  const signIn = this.page.signInPage();
  const apps = this.page.appsPage();

  signIn.signin({ email, password });

  apps.waitForAppsPageToBeLoaded();

  return this;
};