const commands = {
  assertComponentConfigurationIsOpen: function (componentName) {
    return this
      .waitForElementVisible('@editAppTitle', this.api.globals.smallWait)
      .assert.containsText('@editAppTitle', componentName)
  },

  setLinkActionForComponent: function(numberOfFrame = 1, actionName){
     this
       .switchToFlWidgetFrameByNumber(numberOfFrame)
       .waitForElementVisible('div.link-wrapper', this.api.globals.longWait)
       .waitForElementPresent('div#screenSection', this.api.globals.mediumWait)
       .api.pause(3000)
       .selectValueFromDropdownByText('action', actionName)
       .useXpath()
       .expect.element(`//select[@id='action']/option[text()='${actionName}']`).to.be.selected.before(this.api.globals.smallWait);

     this.api.useCss();

     return this;
  },

  setValueInWebPageInputFieldForLinkAction: function(pageUrl){
    return this
      .waitForElementVisible('@webPageInputFieldForLinkAction', this.api.globals.longWait)
      .setValue('@webPageInputFieldForLinkAction', pageUrl);
  },

  selectScreenForLinkingByName: function(screenName){
    this
      .selectValueFromDropdownByText('page', screenName)
      .api.useXpath()
      .expect.element(`//select[@name="link_screen"]/option[text()="${screenName}"]`).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.pause(500)
      .useCss()
      .frameParent();

    return this;
  },

  switchToSettingsTab: function(){
    return this
      .waitForElementVisible('@formSettingsTab', this.api.globals.longWait)
      .click('@formSettingsTab')
      .api.useXpath()
      .assert.attributeContains('//a[text()="Settings"]/parent::li', 'class', 'active', "The chosen tab is selected")
      .useCss();
  },

  switchToTabName: function(tabName){
    const tabTitleLocator  =`//ul[@class='nav nav-tabs']/li/a[text()='${tabName}']/parent::li`;

    this
      .api.frame(null)
      .switchToWidgetInstanceFrame()
      .useXpath()
      .waitForElementVisible(tabTitleLocator, this.api.globals.mediumWait)
      .click(tabTitleLocator)
      .assert.attributeContains(tabTitleLocator, 'class', 'active', "The chosen tab is open")
      .useCss();

    return this;
  },

  clickSaveAndCloseButton: function(){
    this
      .api.frame(null)
      .switchToWidgetInstanceFrame()
      .frame(null)
      .waitForElementVisible('.side-content', this.api.globals.mediumWait)
      .waitForElementVisible('.footer-column > .btn.btn-primary', this.api.globals.smallWait)
      .waitForAjaxCompleted()
      .pause(5000)
      .click('.footer-column > .btn.btn-primary')
      .pause(2000)

      /* "For" loop is added with purpose to be sure that changes are saved and details of component are closed.
      Sometimes component details don't disappear after several clicks and changes are not saved.
       ToDo: better approach for saving of changes should be found */
      .perform(function () {
        for (let i = 0; i < 5; i++) {
          this.api
            .element('css selector', '.widget-interface.show', function (result) {
              if (result.status === 0) {
                this
                  .moveToElement('.footer-column > .btn.btn-primary', 1, 1)
                  .mouseButtonClick(0)
                  .pause(3000);
              } else return;
            })
        }
      })
      .waitForElementNotPresent('.widget-interface.show', this.api.globals.mediumWait)
      .waitForElementNotPresent('.widget-holder', this.api.globals.mediumWait);

      return this;
  },

  /** @param {Array} names - array with names of columns in data source, f.e. 'email', 'password' */
  selectFieldsForLoginFromDataSourceColumnNames: function(names){
    return this
      .waitForElementVisible('#emailColumn', this.api.globals.smallWait)
      .selectValueFromDropdown('emailColumn', names[0])
      .waitForElementVisible('#passColumn', this.api.globals.smallWait)
      .selectValueFromDropdown('passColumn', names[1])
      .waitForElementVisible(`#passColumn option[value="${names[1]}"]`, this.api.globals.smallWait);
  },

  mapContactsDataForChat: function (name, email, image, job) {
    this
      .api.useXpath()
      .waitForElementNotPresent(`//select[@id="fullName"]/option[text()='-- Please wait...']`, this.api.globals.smallWait)
      .selectValueFromDropdownByText('fullName', name)
      .waitForElementNotPresent(`//select[@id="emailColumn"]/option[text()='-- Please wait...']`, this.api.globals.smallWait)
      .selectValueFromDropdownByText('emailColumn', email)
      .waitForElementNotPresent(`//select[@id="titleName"]/option[text()='-- Please wait...']`, this.api.globals.smallWait)
      .selectValueFromDropdownByText('titleName', job)
      .waitForElementNotPresent(`//select[@id="avatarColumn"]/option[text()='-- Please wait...']`, this.api.globals.smallWait)
      .selectValueFromDropdownByText('avatarColumn', image)
      .useXpath()
      .waitForElementVisible(`//select[@id="avatarColumn"]/option[text()='${image}']`, this.api.globals.smallWait)
      .useCss();

    return this;
  },

  /** @param{String} columnName - name of column where value is stored*/
  selectTheColumnFromDataSourceForValue: function(columnName, optionNumber){
    const locator = `(//div[@class="form-group"]//option[@value="${columnName}"])[${optionNumber}]`;

    this
      .api.useXpath()
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .pause(1000)
      .click(locator)
      .waitForElementVisible(locator, this.api.globals.smallWait)
      .useCss()
      .pause(1000);

    return this;
  },

  selectDataSourceEmailColumnForAppListSecurityOption: function(columnName){
    const locator = `//select[@id="dataSourceColumn"]/option[@value="${columnName}"]`;

    this
      .api.useXpath()
      .waitForElementPresent(locator, this.api.globals.smallWait)
      .click(locator)
      .waitForElementVisible(locator, this.api.globals.smallWait)
      .useCss()
      .pause(1000);

    return this;
  },

  /** Two switching to 'fl-widget-provider' frames are used instead of custom command
   * This was the way to define them as they have same name, but various attributes
   */
  openEmailTemplateInFormDetails: function(){
    return this
      .api.frame(null)
      .switchToWidgetInstanceFrame()
      .waitForElementVisible('.fl-widget-provider[data-package="com.fliplet.validation-manager"]', this.api.globals.smallWait)
      .waitForElementNotPresent('.spinner-holder.animated', this.api.globals.mediumWait)
      .pause(2500)
      .element('css selector', '.fl-widget-provider[data-package="com.fliplet.validation-manager"]', (result) => {
        this.api.elementIdAttribute(result.value.ELEMENT, 'name', (text) => {
          this
            .api.frame(text.value)
            .waitForElementVisible('.btn.btn-primary.show-email-provider', this.api.globals.smallWait);
        })
      })
      .pause(3000)
      .element('css selector','.email-settings .col-sm-8 a', (result) => {
        this.api
          .elementIdClick(result.value.ELEMENT)
          .pause(3000)
          .element('css selector', '.fl-widget-provider[data-package="com.fliplet.email-provider"]', function(displaying){
            if (displaying.status !== 0){
              this.execute(function () {
                const elementForClick = document.querySelector('.btn.btn-primary.show-email-provider');
                elementForClick.click();
              });
            }
          })
      });
  },

  /** To prevent issue with endless loader during opening email template details if details are not visible after 3 sec
   * this method will refresh page and oped details of form again after that asserting of template text will be performed
   * @param{String} addedText - text added to data source definition
   */
  verifyEmailSubjectOfTemplateContainsAddedText: function(addedText){
    return this
      .api.pause(3000)
      .element('css selector', '.fl-widget-provider[data-package="com.fliplet.email-provider"]', function(displaying) {
        if (displaying.status !== 0) {
          this
            .refresh()
            .frame(null)
            .switchToWidgetInstanceFrame()
            .waitForElementVisible('.fl-widget-provider[data-package="com.fliplet.validation-manager"]', this.globals.smallWait)
            .waitForElementNotPresent('.spinner-holder.animated', this.globals.mediumWait)
            .pause(2500)
            .element('css selector', '.fl-widget-provider[data-package="com.fliplet.validation-manager"]', (result) => {
              this.elementIdAttribute(result.value.ELEMENT, 'name', (text) => {
                this
                  .frame(text.value)
                  .waitForElementVisible('.btn.btn-primary.show-email-provider', this.globals.smallWait);
              })
            })
            .pause(3000)
            .element('css selector','.email-settings .col-sm-8 a', (result) => {
              this
                .elementIdClick(result.value.ELEMENT)
                .waitForElementVisible('.fl-widget-provider[data-package="com.fliplet.email-provider"]', this.globals.mediumWait)
                .element('css selector', '.fl-widget-provider[data-package="com.fliplet.email-provider"]', (result) => {
                  this.elementIdAttribute(result.value.ELEMENT, 'name', (text) => {
                    this
                      .frame(text.value)
                      .waitForElementVisible('#subject', this.globals.smallWait);
                  })
                })
                .assert.valueContains('#subject', addedText);
            });
        } else {
          this
            .waitForElementVisible('.fl-widget-provider[data-package="com.fliplet.email-provider"]', this.globals.mediumWait)
            .element('css selector', '.fl-widget-provider[data-package="com.fliplet.email-provider"]', (result) => {
              this.elementIdAttribute(result.value.ELEMENT, 'name', (text) => {
                this
                  .frame(text.value)
                  .waitForElementVisible('#subject', this.globals.smallWait);
              })
            })
            .assert.valueContains('#subject', addedText);
        }
      })
  },

  clickAddImagesButton: function(){
    this
      .waitForElementVisible('.help-text', this.api.globals.smallWait)
      .waitForElementVisible('.btn.btn-primary.add-image-button', this.api.globals.smallWait)
      .api.pause(5000)
      .clickElementAndCheckExpectedElement('.btn.btn-primary.add-image-button', '.fl-widget-provider')

    return this;
  },

  deleteSelectedImageFromGallery: function(imageId){
    const imageHolderLocator = `.image-holder[style*='${imageId}'] .fa.fa-trash-o`;

    this
      .waitForElementVisible('@imageHolder', this.api.globals.smallWait)
      .waitForElementPresent(imageHolderLocator, this.api.globals.smallWait)
      .api.element('css selector', imageHolderLocator, (result) => {
        this
          .api.moveTo(result.value.ELEMENT)
          .mouseButtonClick();
      })
      .waitForElementNotPresent(imageHolderLocator, this.api.globals.smallWait)
      .frame(null);

    return this;
  },

  assertCorrectQtyOfImagesDisplayedInGallery: function(numberOfImages){
    this
      .api.frame(null);

    return this
      .switchToWidgetInstanceFrame()
      .assertAmountOfElementsVisible('@imageHolder', numberOfImages);
  },

  changeTitlesForGalleryImages: function(imageTitles){
    const imageTitleInputFiledLocator ='.edit-image-title #edit-input';
    const imageEditButtonLocator ='.edit-image-title #edit-button';

    this
      .waitForElementVisible('@imageHolder', this.api.globals.smallWait, function(){
      for (let i = 0; i < imageTitles.length; i++){
        this.element('xpath', `(//div[@class='image-holder'])[${i+1}]`, (result)=>{
          this.elementIdClick(result.value.ELEMENT, ()=>{
            this.waitForElementVisible(imageTitleInputFiledLocator, this.globals.smallWait)
              .waitForElementVisible(imageEditButtonLocator, this.globals.smallWait)
              .setValue(imageTitleInputFiledLocator,imageTitles[i])
              .click('#editClose')
              .waitForElementNotPresent(imageTitleInputFiledLocator, this.globals.smallWait)
              .waitForElementNotPresent(imageEditButtonLocator,this.globals.smallWait)
              .useXpath()
              .assert.containsText(`(//div[@class='image-title'])[${i + 1}]`, imageTitles[i],
              `Correct title is shown for ${i + 1} image`)
              .useCss();
          })
        });
      }
    });

    return this;
  },

  checkGalleryImagesTitles: function(imageTitles){
    this
      .waitForElementVisible('.title-text', this.api.globals.smallWait, function(){
        for (let i = 0; i < imageTitles.length; i++){
          this
            .useXpath()
            .assert.containsText( `(//span[contains(@class,'title-text')])[${i+1}]`,imageTitles[i], 'The image has a correct title')
            .useCss();
        }
      });

    return this;
  },

  clickSaveAndCloseButtonWithWrongData: function () {
    const selectButtonLocator = '.footer-column > .btn.btn-primary';

    this.api.frame(null);
    return this
      .waitForElementVisible('.side-content', this.api.globals.smallWait)
      .waitForElementVisible(selectButtonLocator, this.api.globals.smallWait)
      .click(selectButtonLocator)
  },

  assertErrorInComponentsScreen: function (error) {
    this.api.frame(null);

    return this
      .switchToWidgetInstanceFrame()
      .waitForElementVisible('@errorsBlock', this.api.globals.smallWait)
      .assert.containsText('@errorsTextInComponentFooter', error)
  },

  assertErrorInMapComponents: function (error) {
    return this
      .waitForElementVisible('@errorInMapComponents', this.api.globals.smallWait)
      .assert.containsText('@errorInMapComponents', error)
  },

  clickAddNewMapButton: function () {
    return this
      .waitForElementVisible('@addNewMapPanelButton', this.api.globals.smallWait)
      .click('@addNewMapPanelButton')
      .waitForElementVisible('@mapNameField', this.api.globals.smallWait)
  },

  setNameForMapUsingBackspace: function (name, mapNumber) {
    const mapNameInputFieldLocator = `(//div[@class="panel-body"]//input)[${mapNumber}]`;

    this
      .api.useXpath()
      .waitForElementVisible(mapNameInputFieldLocator, this.api.globals.smallWait)
      .click(mapNameInputFieldLocator)
      .getValue(mapNameInputFieldLocator, (value) => {
        for (let i = 0; i < value.value.length; i++) {
          this.api.keys([this.api.Keys.BACK_SPACE]);
        }
      })
      .clearValue(mapNameInputFieldLocator)
      .keys([name])
      .useCss();

    return this;
  },

  clickMarkMapsButton: function () {
    return this
      .waitForElementVisible('@markMapsButton', this.api.globals.tinyWait)
      .click('@markMapsButton')
  },

  checkSectionHeaderTitle: function (sectionTitle) {
    return this
      .waitForElementVisible('@sectionHeaderTitle', this.api.globals.smallWait)
      .assert.containsText('@sectionHeaderTitle', sectionTitle)
  },

  addNewMarkerVerification: function (markerNumber) {
    const markerHolderLocator = `(//div[contains(@class,"marker-holder")])[${markerNumber}]`;
    const addNewMarkerButtonLocator = '//div[@class="settings-buttons-wrapper"]/div';
    const resultDisplaying = [];

    this
      .api.useXpath()
      .waitForElementVisible(addNewMarkerButtonLocator, this.api.globals.smallWait)
      .pause(2000)
      .click(addNewMarkerButtonLocator)
      .waitForElementPresentWithoutErrorsXpath(markerHolderLocator, 5000, resultDisplaying)
      .perform( function() {
        if (resultDisplaying[0] == false) {
          this.api.click(addNewMarkerButtonLocator);
        }
      })
      .waitForElementPresent(markerHolderLocator, this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  switchToAnotherDataSourceInInteractiveGraphicsConfigurations: function(){
    return this
      .waitForElementVisible('@switchToAnotherDataSource', this.api.globals.tinyWait)
      .click('@switchToAnotherDataSource')
      .waitForElementNotPresent('@switchToAnotherDataSource', this.api.globals.tinyWait);
  },

  clickUseTheseSettingsButton: function(){
    return this
      .switchToWidgetInstanceFrame()
      .waitForElementVisible('@useTheseSettingsButton', this.api.globals.tinyWait)
      .click('@useTheseSettingsButton')
      .waitForElementNotPresent('@useTheseSettingsButton', this.api.globals.tinyWait);
  },

  removeMarker: function (markerNumber) {
    const removeMarkerTrashLocator = `(//i[@class='fa fa-trash'])[${markerNumber}]`;
    const markerIconHolderLocator = `(//div[@class="marker-icon-holder"])[${markerNumber}]`;

    this
      .assertAmountOfElementsPresent('.marker-wrapper', 2)
      .api.useXpath()
      .waitForElementVisible(removeMarkerTrashLocator, this.api.globals.smallWait)
      .click(removeMarkerTrashLocator)
      .waitForElementNotPresent(removeMarkerTrashLocator, this.api.globals.smallWait)
      .assert.elementNotPresent(markerIconHolderLocator)
      .useCss()
      .assertAmountOfElementsPresent('.marker-wrapper', 1);

    return this;
  },

  selectMapInDropDown: function (selectedMapName) {
    const mapNameInDropDownLocator = `//ul[@class="dropdown-menu dropdown-menu-right"]/li/a[contains(text(),'${selectedMapName}')]`;

    this
      .click('@mapName')
      .api.useXpath()
      .waitForElementVisible(mapNameInDropDownLocator, this.api.globals.smallWait)
      .click(mapNameInDropDownLocator)
      .useCss()
      .pause(2000);

    return this;
  },

  checkSelectedMapNameInMarkerSection: function (firstMapName, secondMapName, done) {
    return this
      .assert.containsText('@mapName', firstMapName)
      .assert.containsText('@mapButtonName', firstMapName);
  },

  clickSelectAnImageForMap: function () {
    const selectImageForMapButtonLocator = `(//div[@class="panel-body"]//div[@class="btn btn-default"])[1]`;

    this
      .api.frame(null)
      .switchToWidgetInstanceFrame()
      .useXpath()
      .waitForElementVisible(selectImageForMapButtonLocator, this.api.globals.smallWait)
      .click(selectImageForMapButtonLocator)
      .useCss()
      .pause(4000);

    return this
      .switchToFLWidgetProviderFrame('@createNewFolderButton')
  },

  setMarkerName: function (markerName, markerNumber) {
    const changeMarkerNamePencilLocator = `(//i[@class="fa fa-pencil"])[${markerNumber}]`;
    const markerNameInputFieldLocator = '//div[@class="marker-name-edit-holder"]/input[contains(@class,"form-control")]';

    this
      .api.frame(null)
      .switchToWidgetInstanceFrame()
      .useXpath()
      .waitForElementVisible(changeMarkerNamePencilLocator, this.api.globals.smallWait)
      .click(changeMarkerNamePencilLocator)
      .waitForElementVisible(markerNameInputFieldLocator, this.api.globals.smallWait)
      .getValue(markerNameInputFieldLocator, (value) => {
        for (let i = 0; i < value.value.length; i++) {
          this.api.keys([this.api.Keys.BACK_SPACE]);
        }
      })
      .clearValue(markerNameInputFieldLocator)
      .setValue(markerNameInputFieldLocator, markerName)
      .useCss();

    return this;
  },

  checkMarketName: function(markerName, markerNumber){
      const changeMarkerNamePencilLocator = `(//div[@class="marker-name-holder"]/span)[${markerNumber}]`;
      const activeMarkerOnMapLocator='//div[@class="marker active"]';

      this
        .click('@checkCircleToSaveMarkerName')
        .waitForElementNotPresent('@checkCircleToSaveMarkerName', this.api.globals.smallWait)
        .api.useXpath()
        .assert.containsText(changeMarkerNamePencilLocator, markerName)
        .waitForElementVisible(activeMarkerOnMapLocator, this.api.globals.smallWait)
        .assert.attributeContains(activeMarkerOnMapLocator,'data-name', markerName)
        .useCss();

      return this;
  },

  openMarkerMenu: function (markerNumber) {
    const markerIconCaretLocator = `(//div[@class="marker-icon-holder"]//span[@class="caret"])[${markerNumber}]`;
    const manageStyleLocator = `(//span[contains(text(), "Manage style")])[${markerNumber}]`;

    this
      .api.useXpath()
      .waitForElementVisible(markerIconCaretLocator, this.api.globals.smallWait)
      .click(markerIconCaretLocator)
      .waitForElementVisible(manageStyleLocator, this.api.globals.smallWait)
      .click(manageStyleLocator)
      .useCss();

    return this;
  },

  removeMap: function (mapNumber) {
    const deleteMapTrashLocator = `(//span[@class='icon-delete fa fa-trash'])[${mapNumber}]`;
    const mapPanelLocator = `(//div[@class="panel-heading grabbable"])[${mapNumber}]`;

    this
      .api.useXpath()
      .click(deleteMapTrashLocator)
      .frame(null)
      .useCss()
      .acceptModalWindow()
      .switchToWidgetInstanceFrame()
      .useXpath()
      .waitForElementNotPresent(mapPanelLocator, this.api.globals.smallWait)
      .useCss()

    return this;
  },

  assertIconStyleOnMarkerHolder: function (iconName) {
    const markerCaretLocator = '//div[@class="marker-icon-holder"]//span[@class="caret"]';
    const markerIconLocator = `//a/i[contains(@class, "${iconName.toLowerCase()}")]`;

    this
      .api.useXpath()
      .waitForElementVisible(markerCaretLocator, this.api.globals.smallWait)
      .click(markerCaretLocator)
      .waitForElementVisible(markerIconLocator, this.api.globals.smallWait)
      .click(markerIconLocator)
      .waitForElementPresent(markerIconLocator, this.api.globals.smallWait)
      .useCss();

    return this;
  },

  assertMarkerIconOnMap: function (iconName) {
    return this
      .waitForElementVisible('@markerElementOnMap', this.api.globals.smallWait)
      .assert.attributeContains('@markerElementOnMap', 'class', iconName.toLowerCase());
  },

  clickBrowseYourMediaLibraryButton: function(){
    return this
      .waitForElementVisible('@browseYourMediaLibraryButton', this.api.globals.mediumWait)
      .click('@browseYourMediaLibraryButton')
      .waitForElementVisible('@filePickerFrame', this.api.globals.mediumWait);
  },

  clickBrowseYourMediaLibraryForVideoButton: function(){
    return this
      .waitForElementVisible('@browseYourMediaLibraryForVideoButton', this.api.globals.mediumWait)
      .click('@browseYourMediaLibraryForVideoButton')
      .waitForElementVisible('@filePickerFrame', this.api.globals.mediumWait);
  },

  assertFileIsAddedForComponent: function(fileName){
    return this
      .switchToFLWidgetProviderFrame('.file-holder.document')
      .waitForElementVisible('.document-remove', this.api.globals.smallWait )
      .assert.containsText('@browseYourMediaLibraryButton', 'Replace document')
      .assert.containsText('@addedDocumentHolder', fileName)
  },

  tickCheckBoxByLabel: function(label) {
    const checkBoxLocator = `//span[@class='check']/parent::label[@for='${label}']`;

    this
      .api.useXpath()
      .waitForElementVisible(checkBoxLocator, this.api.globals.tinyWait)
      .click(checkBoxLocator)
      .expect.element(checkBoxLocator+`/parent::div/input`).to.be.selected.before(this.api.globals.tinyWait);

    this.api.useCss();

    return this;
  },

  disableCheckBoxByLabel: function (label){
    const checkBoxLocator = `//span[@class='check']/parent::label[@for='${label}']`;

    this
      .api.useXpath()
      .waitForElementVisible(checkBoxLocator, this.api.globals.tinyWait)
      .click(checkBoxLocator)
      .expect.element(checkBoxLocator + `/parent::div/input`).to.not.be.selected.before(this.api.globals.tinyWait);

    this.api.useCss();

    return this;
  },

  assertAppIsPresentInAppList: function(appName) {
    const appTitleLocator =`//div[@class='app-name']/p[text()='${appName}']`;

    return this
      .waitForElementVisible('@appListContainer', this.api.globals.smallWait)
      .api.useXpath()
      .waitForElementVisible(appTitleLocator,  this.api.globals.longWait)
      .assert.visible(appTitleLocator)
      .useCss();
  },

  assertAppIsNotPresentInAppList: function(appName) {
    const appTitleLocator =`//div[@class='app-name']/p[text()='${appName}']`;

    return this
      .waitForElementVisible('@appListContainer', this.api.globals.smallWait)
      .api.useXpath()
      .assert.elementNotPresent(appTitleLocator)
      .useCss();
  },

  chooseAppForAppList: function(appName) {
    const appTitleLocator = `//div[@class='app-name']/p[text()='${appName}']`;
    const checkedAppLocator = `//p[text()='${appName}']/ancestor::label//i[@class='fa fa-check']`;

    this
      .api.useXpath()
      .waitForElementVisible(appTitleLocator, this.api.globals.smallWait)
      .moveToElement(appTitleLocator, 10, 10)
      .click(appTitleLocator)
      .waitForElementVisible(checkedAppLocator, this.api.globals.smallWait)
      .useCss();

    return this
  },

  getAppIdFromAppListConfigurationsByAppName: function(appName, appId){
    const checkedAppLocator = `//div[@class="app-name"]/p[text()="${appName}"]//ancestor::label`;

    this
      .api.useXpath()
      .waitForElementVisible(checkedAppLocator, this.api.globals.tinyWait)
      .getAttribute(checkedAppLocator, 'for', (result) => {
        appId.unshift(result.value.match(/id_(\d+)/)[1]);
      })
      .useCss();

    return appId;
  },

  changeComponentLabel: function(componentLabel){
    return this
      .waitForElementVisible('@componentLabel')
      .clearValue('@componentLabel')
      .setValue('@componentLabel', componentLabel);
  },

  clickManageNotificationsButton: function () {
    return this
      .waitForElementVisible('@manageNotificationsButton', this.api.globals.mediumWait)
      .click('@manageNotificationsButton');
  },

  assertSecurityRuleWarningAlertIsPresentInSettings: function () {
    return this
      .waitForElementPresent('@securityRuleWarningAlertInSettings', this.api.globals.mediumWait)
      .assert.visible('@securityRuleWarningAlertInSettings', 'Security rule warning is present in the component settings.')
  },

  acceptChangingDataSourceAlert: function(){
    this
      .api.frame(null);

    return this
      .waitForElementVisible('@okButtonOnChangingDataSourceAlert', this.api.globals.longWait)
      .click('@okButtonOnChangingDataSourceAlert')
      .waitForElementNotPresent('@okButtonOnChangingDataSourceAlert', this.api.globals.longWait);
  }
};

module.exports = {
  commands: [commands],
  elements: {
    editAppTitle: {
      selector: '//form/header/p',
      locateStrategy: 'xpath'
    },
    configurationOptionsTabs: {
      selector: '[role=tab]'
    },
    formSettingsTab: {
      selector: '//a[text()="Settings"]',
      locateStrategy: 'xpath'
    },
    selectImageTab: {
      selector: '//a[text()="Select Image"]',
      locateStrategy: 'xpath'
    },
    formNameField: {
      selector: '#formName'
    },
    orgFolderLocator: {
      selector: '//select[@id="drop-down-file-source"]//option[starts-with(@value, "org")]',
      locateStrategy: 'xpath'
    },
    appFolderLocator: {
      selector: '//select[@id="drop-down-file-source"]//option[starts-with(@value, "app")]',
      locateStrategy: 'xpath'
    },
    errorsBlock: {
      selector: '.errors-holder'
    },
    errorsTextInComponentFooter: {
      selector: '.errors-holder p'
    },
    addNewMapPanelButton: {
      selector: '.add-map-panel'
    },
    mapNameField: {
      selector: '(//div[@class="panel-body"]//input[@class="form-control"])[last()]',
      locateStrategy: 'xpath'
    },
    markMapsButton: {
      selector: '.col-sm-8 .btn.btn-default'
    },
    errorInMapComponents: {
      selector: '.error-holder'
    },
    sectionHeaderTitle: {
      selector: '#interactive-map-app header div p'
    },
    mapName: {
      selector: 'span.map-name'
    },
    mapButtonName: {
      selector: '.map-button-text p'
    },
    mapDropDownSwitcher: {
      selector: '.marker-map-holder .dropdown-menu li:last-child'
    },
    markerNameField: {
      selector: '//div[@class="marker-name-edit-holder"]/input[@class="form-control"]',
      locateStrategy: 'xpath'
    },
    checkCircleToSaveMarkerName: {
      selector: '.fa.fa-check-circle'
    },
    markerElementOnMap: {
      selector: '//div[@class ="marker active"]/i[contains(@class, "fa")]',
      locateStrategy: 'xpath'
    },
    browseYourMediaLibraryButton: {
      selector: '.btn.btn-default.add-document'
    },
    browseYourMediaLibraryForVideoButton: {
      selector: '.btn.btn-default.add-video'
    },
    addedDocumentHolder: {
      selector: '#documentSection div.file-title span'
    },
    createNewFolderButton: {
      selector: '.btn.btn-link.add-folder-btn'
    },
    appListContainer: {
      selector: '//div[contains(@class,"apps-container")]',
      locateStrategy: 'xpath'
    },
    componentLabel: {
      selector: '.form-group .form-control[type=text]'
    },
    imageHolder: {
      selector: '.image-holder'
    },
    screenListDropdownField: {
      selector: '#screen-list .hidden-select.form-control'
    },
    manageNotificationsButton: {
      selector: '.manage-notifications'
    },
    loadingSpinner: {
      selector: '.spinner-overlay'
    },
    selectButtonForGalleryImages: {
      selector: '.widget-interface.show a.btn.btn-primary, .widget-provider footer a.btn.btn-primary'
    },
    allChangesAreSavedAlert: {
      selector: '.fl-save-status .fade-transition.alert.alert-success'
    },
    securityRuleWarningAlertInSettings: {
      selector: '#security-alert'
    },
    filePickerGallery: {
      selector: 'div.holder.container-fluid'
    },
    seeAllFilesLinkInFilePicker: {
      selector: '.browse-files'
    },
    switchToAnotherDataSource: {
      selector: '//a[text()="Switch to another data source"]',
      locateStrategy: 'xpath'
    },
    okButtonOnChangingDataSourceAlert: {
      selector: '//h4[text()="Changing data source"]/parent::div/parent::div//button[@data-bb-handler="confirm"]',
      locateStrategy: 'xpath'
    },
    webPageInputFieldForLinkAction: {
      selector: 'input#url'
    },
    useTheseSettingsButton: {
      selector: '//div[text()="Use these settings"]',
      locateStrategy: 'xpath'
    },
    filePickerFrame: {
      selector: '.fl-widget-provider[data-package="com.fliplet.file-picker"]'
    }
  }
};
