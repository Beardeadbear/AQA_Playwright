const commands = {
  enterSearchTerm: function (term) {
    this
      .waitForElementVisible('@inputFieldForSearch', this.api.globals.tinyWait)
      .setValue('@inputFieldForSearch', term)
      .api.pause(1000);

    return this;
  },

  assertAllFoundUsersMatchTheSearchTerm: function(term){
    this
      .api.elements('xpath', '//tbody/tr', function(result) {
      for (let i = 0; i < result.value.length; i++) {
        this.elementIdText(result.value[i].ELEMENT, (text) =>
          this.assert.ok(text.value.toLowerCase().includes(term.toLowerCase()),
            `The found user is matching search term '${term}'`));
      }
    });

    return this
  },

  clickEditButtonNearUserByEmail: function(email){
    const resultDisplaying = [];
    const editButtonByUserLocator = `//td[text()="${email}"]/following-sibling::td/a`;

    this
      .api.useXpath()
      .waitForElementVisible(editButtonByUserLocator, this.api.globals.tinyWait)
      .pause(1000)
      .click(editButtonByUserLocator)
      .useCss()
      .waitForElementPresentWithoutErrors('#userEmail', this.api.globals.tinyWait, resultDisplaying)
      .perform(function() {
        if (resultDisplaying[0] == false) { // if user's details still load
          this.api.refresh()
        }
      })
      .waitForElementVisible('#userEmail', this.api.globals.mediumWait);

    return this;
  },

  clickSaveButtonOnUserEdit: function () {
    return this
      .waitForElementVisible('@saveButtonOnEditUser', this.api.globals.tinyWait)
      .click('@saveButtonOnEditUser')
      .waitForElementVisible('@successInfoMessage', this.api.globals.mediumWait)
      .click('@successInfoMessage')
      .waitForElementNotPresent('@successInfoMessage', this.api.globals.mediumWait);
  },

  waitForUserTabToBeLoadedInManageOrganization: function(){
    return this
      .waitForElementVisible('.btn.btn-primary', this.api.globals.smallWait)
      .waitForElementVisible('.form-control.pull-right', this.api.globals.smallWait)
      .waitForElementVisible('.btn.btn-default', this.api.globals.smallWait);
  },

  verifyFirstAndLastNamesAreChangedByEmail: function(email, firstName, lastName){
    this
      .api.useXpath()
      .waitForElementVisible(`//td[text()="${email}"]/preceding-sibling::td[2]`, this.api.globals.smallWait)
      .assert.containsText(`//td[text()="${email}"]/preceding-sibling::td[2]`, firstName)
      .assert.containsText(`//td[text()="${email}"]/preceding-sibling::td[1]`, lastName)
      .useCss();

    return this;
  },

  enterAndConfirmUserPassword: function(password){
    return this
      .waitForElementVisible('@passwordField', this.api.globals.tinyWait)
      .setValue('@passwordField', password)
      .waitForElementVisible('@confirmPasswordField', this.api.globals.tinyWait)
      .setValue('@confirmPasswordField', password);
  },

  clickAssignAppAccessToUser: function () {
    return this
      .waitForElementVisible('@assignAppAccessToUserLink', this.api.globals.tinyWait)
      .waitForElementVisible('.btn.btn-primary', this.api.globals.tinyWait)
      .waitForElementVisible('@standardButton', this.api.globals.tinyWait)
      .click('@assignAppAccessToUserLink')
      .waitForElementVisible('@assignButton', this.api.globals.longWait);
  },

  checkUserCredentialsForAppAssigning: function( userFirstName, userLastName, userEmail) {
    return this
      .waitForElementVisible('@userCredentialsHolder', this.api.globals.longWait)
      .assert.containsText('@userCredentialsHolder', `${userFirstName} ${userLastName} (${userEmail})`);
  },

  selectAppForGrantingAccess: function(appName){
    const appInDropdownLocator = `//select/option[text()="${appName}"]`;

    this
      .api.useXpath()
      .waitForElementPresent(appInDropdownLocator, this.api.globals.tinyWait)
      .click(appInDropdownLocator)
      .useCss();

    return this;
  },

  selectPermissionForApplications: function(permission){
    const text = permission.charAt(0).toUpperCase() + permission.slice(1);
    const permissionOptionInDropdownLocator = `//select/option[text()="${text}"]`;

    this
      .api.useXpath()
      .waitForElementPresent(permissionOptionInDropdownLocator, this.api.globals.tinyWait)
      .click(permissionOptionInDropdownLocator)
      .useCss();

    return this;
  },

  clickAssignButton: function () {
    return this
      .click('@assignButton')
      .waitForElementVisible('@tableLine', this.api.globals.smallWait)
  },

  assertAppIsAddedToAssigned: function(appName){
    this
      .api.useXpath()
      .assert.elementPresent(`//tbody//td[text()="${appName}"]`)
      .useCss();

    return this;
  },

  clickSaveButtonForAssigningApp: function () {
    return this
      .waitForElementVisible('@saveButtonOnAssignApp', this.api.globals.tinyWait)
      .click('@saveButtonOnAssignApp')
      .waitForElementVisible('@successInfoMessage', this.api.globals.mediumWait)
      .click('@successInfoMessage')
      .waitForElementNotPresent('@successInfoMessage', this.api.globals.mediumWait)
      .closeOverlay();
  },

  changeLevelOfAccessToApplicationByName: function(appName, accessLevel){
    const text = accessLevel.charAt(0).toUpperCase() + accessLevel.slice(1);

    this
      .api.useXpath()
      .waitForElementPresent(`//td[text()="${appName}"]/following-sibling::td//select/option[text()="${text}"]`, this.api.globals.smallWait)
      .click(`//td[text()="${appName}"]/following-sibling::td//select/option[text()="${text}"]`)
      .useCss();

    return this;
  },

  unasignApplicationFromUserByName: function(appName){
    this
      .api.useXpath()
      .waitForElementVisible(`//td[text()="${appName}"]/following-sibling::td//a`, this.api.globals.tinyWait)
      .click(`//td[text()="${appName}"]/following-sibling::td//a`)
      .waitForElementVisible(`//td[text()="${appName}"]/following-sibling::td//a[text()="Undo"]`, this.api.globals.tinyWait)
      .useCss();

    return this;
  },

  switchToAppsTab: function () {
    return this
      .waitForElementVisible('@appsTabInManageOrganization', this.api.globals.tinyWait)
      .click('@appsTabInManageOrganization')
      .waitForElementVisible('@inputFieldForSearch', this.api.globals.smallWait);
  },

  switchToUsersTab: function () {
    this
      .api.element('css selector', '.btn.btn-primary[href]', function (result) {
        if (result.status !== 0) {
          this
            .waitForElementVisible('a[href*=users]', this.globals.longWait)
            .click('a[href*=users]')
        }
      });

    return this
      .waitForElementVisible('@usersTabInManageOrganization', this.api.globals.longWait)
      .assert.attributeContains('@usersTabInManageOrganization', 'class', 'active',
        "The Users tab is open.")
      .waitForElementVisible('@tableLine', this.api.globals.longWait);
  },

  expandActionsForAppByName: function(appName){
    this
      .api.pause(2000)
      .useXpath()
      .waitForElementVisible(`//table[@class="table table-hover table-list"]//td[text()="${appName}"]`, this.api.globals.smallWait)
      .click(`//td[text()="${appName}"]//following-sibling::td//button`)
      .waitForElementVisible(`//td[text()="${appName}"]//following-sibling::td//ul`, this.api.globals.tinyWait)
      .useCss();

    return this;
  },

  duplicateApplicationFromMenu: function(duplicatedAppName){
    this
      .api.element('xpath', '//div[contains(@class, "btn-group open")]//a[text()="Duplicate"]', function(result) {
        this.elementIdClick(result.value.ELEMENT);
      })
      .waitForElementVisible('.bootbox-form input', this.api.globals.tinyWait)
      .clearValue('.bootbox-form input')
      .setValue('.bootbox-form input', duplicatedAppName)
      .click('button[data-bb-handler="confirm"]')
      .waitForElementNotPresent('.modal-content', this.api.globals.tinyWait);

    return this;
  },

  selectDeleteActionFromMenu: function(){
    this
      .api.element('xpath', '//div[contains(@class, "btn-group open")]//span[@class="text-danger"]', function(result) {
        this.elementIdClick(result.value.ELEMENT);
      })
      .waitForElementVisible('.modal-content', this.api.globals.tinyWait)
      .click('button[data-bb-handler="confirm"]')
      .waitForElementNotPresent('.modal-content', this.api.globals.tinyWait);

    return this;
  },

  assertApplicationIsPresentInListByName: function(appName){
    this
      .waitForElementVisible('@actionButton', this.api.globals.smallWait)
      .api.useXpath()
      .assert.elementPresent(`//td[text()="${appName}"]`)
      .useCss();

    return this;
  },

  assertApplicationIsNotPresentInListByName: function(appName){
     this
      .api.useXpath()
      .waitForElementVisible('//table[@class="table table-hover table-list"]//td[contains(text(),"Today")]', this.api.globals.smallWait)
      .expect.element(`//td[text()="${appName}"]`).to.not.be.present.after(this.api.globals.smallWait);

     this.api.useCss();

     return this;
  },

  clickCreateNewUserButton: function () {
    return this
      .waitForElementVisible('@createNewUserButton', this.api.globals.mediumWait)
      .click('@createNewUserButton')
      .waitForElementVisible('@createUserButton', this.api.globals.smallWait)
      .waitForElementVisible('@setPasswordLink', this.api.globals.smallWait)
      .waitForElementVisible('@emailAddressField', this.api.globals.smallWait);
  },

  enterUserEmailAddress: function (email) {
    return this
      .waitForElementVisible('@emailAddressField', this.api.globals.tinyWait)
      .clearValue('@emailAddressField')
      .setValue('@emailAddressField', email);
  },

  enterUserFirstName: function (firstName) {
    return this
      .waitForElementVisible('@firstNameField', this.api.globals.tinyWait)
      .clearValue('@firstNameField')
      .setValue('@firstNameField', firstName);
  },

  enterUserLastName: function (lastName) {
    return this
      .waitForElementVisible('@lastNameField', this.api.globals.tinyWait)
      .clearValue('@lastNameField')
      .setValue('@lastNameField', lastName);
  },

  clickSetPassword: function () {
    return this
      .waitForElementVisible('@setPasswordLink', this.api.globals.tinyWait)
      .click('@setPasswordLink')
      .waitForElementVisible('@passwordField', this.api.globals.smallWait);
  },

  clickCreateUserButton: function(){
    this
      .api.pause(2000);

    return this
      .click('@createUserButton')
      .waitForElementVisible('@userCreatedConformationMessage', this.api.globals.longWait)
      .waitForElementVisible('@createNewUserButtonOnConformationMessage', this.api.globals.smallWait)
  },

  selectAdminUserRole: function(){
    return this
      .waitForElementVisible('@adminButton', this.api.globals.tinyWait)
      .click('@adminButton');
  },

  clickDeleteUserButton: function(){
    return this
      .waitForElementVisible('@deleteUserButton', this.api.globals.tinyWait)
      .click('@deleteUserButton')
      .waitForElementVisible('@deleteUserButtonOnConfirmationModal', this.api.globals.tinyWait)
      .click('@deleteUserButtonOnConfirmationModal');
  },

  assertUserIsNotPresentInListByEmail: function (email) {
    this
      .api.pause(2000)
      .useXpath()
      .assert.elementNotPresent(`//td[text()="${email}"]`)
      .useCss();

    return this;
  },

  assertUserIsPresentInListByEmail: function (email) {
    return this
      .api.pause(2000)
      .useXpath()
      .assert.elementPresent(`//td[text()="${email}"]`)
      .useCss();
  }
};

module.exports = {
  commands: [commands],
  elements: {
    tableLine: {
      selector: '.table.table-hover tbody tr'
    },
    firstNameField: {
      selector: 'input#userFirstName'
    },
    lastNameField: {
      selector: 'input#userLastName'
    },
    backToOrganizationLink: {
      selector: '.organization-edit-user a[href]'
    },
    passwordField: {
      selector: 'input#userPassword'
    },
    confirmPasswordField: {
      selector: 'input#userPasswordConfirm'
    },
    createNewUserButton: {
      selector: '.btn.btn-primary[href^="/organizations"]'
    },
    emailAddressField: {
      selector: '#userEmail'
    },
    createUserButton: {
      selector: '.btn.btn-primary[type="submit"]'
    },
    currentPasswordField: {
      selector: 'input#currentPassword'
    },
    userCredentialsHolder: {
      selector: '.manage-app-access p strong'
    },
    inputFieldForSearch: {
      selector: '.form-control.pull-right'
    },
    saveButtonOnEditUser: {
      selector: 'button[type="submit"]'
    },
    deleteUserButton: {
      selector: '.btn.btn-link.pull-right.text-danger'
    },
    deleteUserButtonOnConfirmationModal: {
      selector: '.btn.btn-danger'
    },
    adminButton: {
      selector: 'label[for=orgAdmin]'
    },
    standardButton: {
      selector: 'label[for="orgStandard"]'
    },
    setPasswordLink: {
      selector: '.form-group a'
    },
    successInfoMessage: {
      selector: '.modal-content [data-bb-handler=ok]'
    },
    saveButtonOnAssignApp: {
      selector: '.manage-app-access .btn.btn-primary'
    },
    assignButton: {
      selector: '.manage-app-access button.btn.btn-default'
    },
    assignAppAccessToUserLink: {
      selector: '.btn.btn-default'
    },
    userCreatedConformationMessage: {
      selector: '.form-horizontal.create-user-success'
    },
    createNewUserButtonOnConformationMessage: {
      selector: '.form-horizontal.create-user-success .btn.btn-primary'
    },
    actionButton: {
      selector: '.btn.btn-default.dropdown-toggle'
    },
    appsTabInManageOrganization: {
      selector: '//ul[@class="nav nav-tabs"]//a[text()="Apps"]',
      locateStrategy: 'xpath'
    },
    usersTabInManageOrganization: {
      selector: '//ul[@class="nav nav-tabs"]//a[text()="Users"]',
      locateStrategy: 'xpath'
    }
  }
};