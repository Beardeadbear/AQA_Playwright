const commands = {
  /** @param emails - can be array of emails or single email(String) */
  enterEmailsForSharing: function (emails) {
    const line = emails instanceof Array ? emails.toString() : emails;

    return this
      .waitForElementVisible('@shareEmailField', this.api.globals.tinyWait)
      .waitForElementVisible('.app-share-invite .btn.btn-primary', this.api.globals.tinyWait)
      .click('@shareEmailField')
      .setValue('@shareEmailField', line);
  },

  selectAccessControlLevel: function(level){
    const text = level.charAt(0).toUpperCase() + level.slice(1);

    return this
      .waitForElementVisible('.app-share-invite .btn.btn-primary', this.api.globals.tinyWait)
      .api.useXpath()
      .waitForElementPresent(`//select[@id="invitee_role"]/option[text()="${text}"]`, this.api.globals.tinyWait)
      .click(`//select[@id="invitee_role"]/option[text()="${text}"]`)
      .useCss();
  },

  clickShareButton: function(){
    return this
      .waitForElementVisible('@shareButton', this.api.globals.tinyWait)
      .click('@shareButton')
      .waitForElementNotPresent('.btn.btn-primary.disabled', this.api.globals.smallWait)
      .waitForElementVisible('.text-success', this.api.globals.smallWait)
      .click('.app-share-invite .btn.btn-primary')
      .api.pause(5000);
  },

  switchToWhoHasAccessTab: function(){
    return this
      .waitForElementVisible('@whoHasAccessTab', this.api.globals.tinyWait)
      .click('@whoHasAccessTab')
      .waitForElementVisible('input[class="form-control"]', this.api.globals.smallWait);
  },

  verifyUserIsPresentInAccessListByEmail: function(email){
    return this
      .api.pause(2000)
      .useXpath()
      .waitForElementVisible('//div[@class="users"]', this.api.globals.smallWait)
      .assert.elementPresent(`//p/small[text()="${email}"]`)
      .useCss();
  },

  clickGoBackAfterCreatingOfUser: function(){
    return this
      .waitForElementVisible('@goBackLink', this.api.globals.tinyWait)
      .click('@goBackLink')
      .waitForElementVisible('.btn.btn-primary', this.api.globals.smallWait)
      .waitForElementVisible('.table.table-hover.table-list', this.api.globals.smallWait)
      .waitForElementVisible('.btn.btn-default', this.api.globals.smallWait);
  }

};

module.exports ={
  commands: [commands],
  elements : {
    shareEmailField: {
      selector: '#share_emails_2'
    },
    shareButton: {
      selector: '//a[text()="Share"]',
      locateStrategy: 'xpath'
    },
    whoHasAccessTab: {
      selector: '//a[text()="Who has access"]',
      locateStrategy: 'xpath'
    },
    closeIcon: {
      selector: '.overlay-close  a'
    },
    goBackLink: {
      selector: '.btn.btn-link.v-link-active'
    }
  }
};