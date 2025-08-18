const commands = {
  clickLogout: function(){
    const resultDisplaying = [];

    this
      .waitForElementVisible('@logOutLink', this.api.globals.smallWait)
      .click('@logOutLink')
      .waitForElementPresentWithoutErrors('.form-signin-heading', this.api.globals.tinyWait, resultDisplaying)
      .api.perform(function() {
        if (resultDisplaying[0] == false) { // if logout loading is stuck
          this.api
            .refresh()
            .waitForElementVisible('.form-signin-heading', this.api.globals.longWait);
        } else { // if logout success
          this.api.waitForElementVisible('.form-signin-heading', this.api.globals.longWait);
        }
      });

    return this;
  },

  clickManageAppData: function(){
    return this
      .waitForElementVisible('@manageAppData', this.api.globals.smallWait)
      .click('@manageAppData');
  },

  clickManageOrganization: function(){
    return this
      .waitForElementVisible('@manageOrganization', this.api.globals.longWait)
      .click('@manageOrganization')
      .waitForElementVisible('.nav.nav-tabs', this.api.globals.longWait);
  },

  expandMyAccountDropDown: function () {
    this
      .api.pause(2000)
      .waitForElementVisible('#dropdown-account', this.api.globals.longWait)
      .click('#dropdown-account')
      .waitForElementVisible('.dropdown-menu.dropdown-menu-right.my-account-dropdown', this.api.globals.smallWait)
      .pause(2000);

    return this;
  },

  assertEmailMatchesToEnteredDuringLogin: function (email) {
    this
      .waitForElementVisible('#dropdown-account', this.api.globals.smallWait)
      .api.useXpath()
      .waitForElementVisible('//li[@class="user-info"][last()]', this.api.globals.smallWait)
      .assert.containsText('//li[@class="user-info"][last()]', email)
      .useCss();

    return this;
  },

  clickAccountSettings: function(){
    return this
      .waitForElementVisible('@accountSettingsLink', this.api.globals.longWait)
      .click('@accountSettingsLink')
      .waitForElementVisible('#userFirstName', this.api.globals.smallWait)
      .waitForElementVisible('.row .btn.btn-primary', this.api.globals.smallWait);
  },

  assertUserDetailsArePresent: function(firstData, secondData){
    this
      .waitForElementVisible('@logOutLink', this.api.globals.longWait)
      .api.useXpath()
      .assert.visible(`//li[@class="user-info"][contains(text(), '${firstData} ${secondData}')]`)
      .useCss();

    return this;
  },

  assertUserEmailIsPresentInAccountDropDown: function(email){
    this
      .waitForElementVisible('@logOutLink', this.api.globals.longWait)
      .api.useXpath()
      .assert.visible(`//li[@class="user-info"][contains(text(), '${email}')]`)
      .useCss();

    return this;
  },

  checkThatLinkIsNotPresentInMenuBar: function (tabName) {
    this
      .api.useXpath()
      .assert.elementNotPresent(`.//a[text()="${tabName}"]`)
      .useCss();

    return this
  }
};

module.exports = {
  commands: [commands],
  selector: '.navbar-top-holder',
  elements: {
    createNewApp: {
      selector: '//a[@href="/apps/create"]',
      locateStrategy: 'xpath'
    },
    browseApps: {
      selector: '//a[@href="/apps"]',
      locateStrategy: 'xpath'
    },
    manageAppData: {
      selector: '//a[@href="/data-sources"]',
      locateStrategy: 'xpath'
    },
    manageOrganization: {
      selector: './/a[text()="Manage organization"]',
      locateStrategy: 'xpath'
    },
    logOutLink: {
      selector: './/a[text()="Log out"]',
      locateStrategy: 'xpath'
    },
    accountSettingsLink: {
      selector: './/a[text()="Account settings"]',
      locateStrategy: 'xpath'
    }
  }
};
