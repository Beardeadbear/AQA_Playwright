const commands = {
    signin: function (options) {
        const {email, password} = options;

        return this
            .navigate()
            .waitForAjaxCompleted()
            .waitForElementVisible('@emailInput', this.api.globals.smallWait)
            .clearValue('@emailInput')
            .setValue('@emailInput', email)
            .waitForElementVisible('@signInButton', this.api.globals.smallWait)
            .click('@signInButton')
            .waitForElementVisible('@passwordInput', this.api.globals.mediumWait)
            .clearValue('@passwordInput')
            .setValue('@passwordInput', password)
            .waitForElementVisible('@signInButton', this.api.globals.mediumWait)
            .click('@signInButton');
    },

    setValueForEmail: function(email) {
        return this
          .navigate()
          .waitForAjaxCompleted()
          .waitForElementVisible('@emailInput', this.api.globals.mediumWait)
          .clearValue('@emailInput')
          .setValue('@emailInput', email);
    },

    clickContinueButtonForSignIn: function() {
        return this
          .waitForElementVisible('@signInButton', this.api.globals.mediumWait)
          .click('@signInButton');
    },

    setValueForPassword: function(password) {
        return this
          .waitForElementVisible('@passwordInput', this.api.globals.longWait)
          .clearValue('@passwordInput')
          .setValue('@passwordInput', password);
    },

    assertThatEmailErrorAlertIsPresent: function(){
        return this
          .waitForElementVisible('@alert', this.api.globals.mediumWait)
          .expect.element('@alert').text.to.contain('Email address not found');
    },

    assertEmailPasswordCombinationDoesNotMatchErrorAlertIsPresent: function(){
        return this
          .waitForElementVisible('@alert', this.api.globals.mediumWait)
          .expect.element('@alert').text.to.contain('Email/password combination does not match');
    },

    clickForgotPassword: function () {
        return this
            .waitForElementVisible('@forgotPasswordLink', this.api.globals.smallWait)
            .click('@forgotPasswordLink');
    },

    enterConfirmationPasswordForAccountUpdating: function(password){
        return this
          .waitForElementVisible('@confirmPasswordInput', this.api.globals.smallWait)
          .clearValue('@confirmPasswordInput')
          .setValue('@confirmPasswordInput', password);
    },

    checkIfUserLoggedIn: function (options) {
        const {email, password} = options;
        const resultDisplaying = [];

        return this
            .waitForElementPresentWithoutErrors('.navbar-top-holder', this.api.globals.tinyWait, resultDisplaying)
            .api.perform(function() {
                if (resultDisplaying[0] == false) { // if Navigation bar is not present
                    this
                        .api.refresh()
                        .useXpath()
                        .waitForElementVisible('(//input[@class="form-control"])[1]', this.api.globals.smallWait)
                        .waitForElementVisible('//input[@type="password"]', this.api.globals.tinyWait)
                        .waitForElementVisible('//button[@type="submit"] ', this.api.globals.smallWait)
                        .clearValue('(//input[@class="form-control"])[1]')
                        .setValue('(//input[@class="form-control"])[1]', email)
                        .clearValue('//input[@type="password"]')
                        .setValue('//input[@type="password"]', password)
                        .useCss()
                        .click('[type=submit]');
                }
            });
    }
};

module.exports = {
    url: function () {
        return `${this.api.launchUrl}/signin`;
    },
    commands: [commands],
    elements: {
        emailInput: {
            selector: '(//input[@class="form-control"])[1]',
            locateStrategy: 'xpath'
        },
        passwordInput: {
            selector: 'input[type=password]'
        },
        confirmPasswordInput: {
            selector: '(//input[@type="password"])[2]',
            locateStrategy: 'xpath'
        },
        signInButton: {
            selector: '[type=submit]'
        },
        alert: {
            selector: '[role=alert]'
        },
        forgotPasswordLink: {
            selector: '.form-control-static>a'
        }
    }
};