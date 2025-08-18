const commands = {
  assertForgotPasswordFormIsOpen: function () {
    return this
      .waitForElementVisible('@cancelButton', this.api.globals.mediumWait);
  },

  setValueForEmailInResetPassword: function (email) {
    return this
      .clearValue('@emailField')
      .setValue('@emailField', email);
  },

  clickResetPassword: function () {
    return this
      .waitForElementVisible('@resetPasswordButton', this.api.globals.mediumWait)
      .click('@resetPasswordButton');
  },

  assertThatEmailDoesNotExistErrorIsPresent: function () {
    return this
      .waitForElementVisible('@warningAlert', this.api.globals.smallWait)
      .expect.element('@warningAlert').text.to.contain('Email does not exist');
  },

  assertThatSuccessAlertIsPresent: function (email) {
    return this
      .waitForElementVisible('@successAlert', this.api.globals.smallWait)
      .expect.element('@successAlert').text.to.equal(`An email with password reset instructions has been sent to ${email}.`);
  }
};

module.exports = {
  commands: [commands],
  elements: {
    emailField: {
      selector: '.form-control'
    },
    resetPasswordButton: {
      selector: './/button[text()="Reset password"]',
      locateStrategy: 'xpath'
    },
    cancelButton: {
      selector: './/button[text()="Cancel"]',
      locateStrategy: 'xpath'
    },
    warningAlert: {
      selector: '.alert.alert-danger'
    },
    successAlert: {
      selector: '.alert.alert-success'
    }
  }
};