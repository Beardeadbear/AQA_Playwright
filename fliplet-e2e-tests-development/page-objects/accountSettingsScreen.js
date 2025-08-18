const commands = {
  clickSaveButtonAccountSettings: function () {
    return this
      .waitForElementVisible('button[type="submit"]', this.api.globals.tinyWait)
      .click('button[type="submit"]')
      .waitForElementVisible('.fade-transition.alert.alert-success', this.api.globals.smallWait);
  },

  enterEmailAddressAccountSettings: function (email) {
    return this
      .waitForElementVisible('@emailAddressField', this.api.globals.tinyWait)
      .clearValue('@emailAddressField')
      .setValue('@emailAddressField', email);
  },

  enterFirstNameAccountSettings: function (firstName) {
    return this
      .waitForElementVisible('@firstNameField', this.api.globals.tinyWait)
      .clearValue('@firstNameField')
      .setValue('@firstNameField', firstName);
  },

  enterLastNameAccountSettings: function (lastName) {
    return this
      .waitForElementVisible('@lastNameField', this.api.globals.tinyWait)
      .clearValue('@lastNameField')
      .setValue('@lastNameField', lastName);
  },

  enterAndConfirmPasswordAsUser: function(currentPassword, newPassword, newPasswordConfirmation){
    return this
      .waitForElementVisible('@currentPasswordField', this.api.globals.mediumWait)
      .setValue('@currentPasswordField', currentPassword)
      .waitForElementVisible('@passwordField', this.api.globals.mediumWait)
      .setValue('@passwordField', newPassword)
      .waitForElementVisible('@confirmPasswordField', this.api.globals.tinyWait)
      .setValue('@confirmPasswordField', newPasswordConfirmation);
  },

  clickSaveButtonOnUserEditWithoutSuccess: function () {
    this
      .waitForElementVisible('button[type="submit"]', this.api.globals.tinyWait)
      .click('button[type="submit"]')
      .api.pause(2000);

    return this;
  },

  assertValueInEmailField: function (email) {
    return this
      .waitForElementVisible('@emailAddressField', this.api.globals.tinyWait)
      .assert.containsText('@emailAddressField', email);
  },

  assertErrorMessageIsVisible: function (errorMessage) {
    this
      .waitForElementVisible('.fade-transition.alert.alert-danger', this.api.globals.tinyWait)
      .assert.containsText('.fade-transition.alert.alert-danger', errorMessage)
      .api.refresh();

    return this;
  }
};

module.exports = {
  commands: [commands],
  elements: {
    firstNameField: {
      selector: 'input#userFirstName'
    },
    lastNameField: {
      selector: 'input#userLastName'
    },
    passwordField: {
      selector: 'input#userPassword'
    },
    confirmPasswordField: {
      selector: 'input#userPasswordConfirm'
    },
    emailAddressField: {
      selector: 'p.form-control-static'
    },
    currentPasswordField: {
      selector: 'input#currentPassword'
    }
  }
};