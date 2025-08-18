const util = require('util');
const elementProperties = require('../utils/constants/elementProperties');
const listFromDataSourceLayoutNames = require('../utils/constants/listFromDataSourceLayoutNames');
const markerIconOnActiveMap = '//div[contains(@class,"active")]/div[@class="map-container"]//div[contains(@class,"marker")][@data-name="%s"]';
const menuLinkLabelLocator = '//span[@class="internal-link buttonControl" and text()="%s"]/parent::*/i';
const circleMenuLinkByNumber = '(//li[contains(@class, "linked")])[%s]';
const menuLabelInBottomIconBarMenu = '(//span[text()="%s"]/ancestor::div[@class="fl-bottom-bar-icon-holder"])[2]';
const listTitleLocator = '//div[@class="%s"][contains(text(), "%s")]';
const directoryListItemDataByTitle = '//div[@class="small-card-list-text-wrapper "]/div[contains(text(),"%s")]/parent::div//div[contains(@class,"small-card-list")][contains(text(),"%s")]';
const listPanelItem = 'li[data-panel-item-id="%s"] div[class*="image"], li[data-metro-item-id="%s"] div[class*="image"]';
const listPanelItemLinkedItem = 'li[data-metro-item-id="%s"] .linked-icon';

const commands = {
  verifyPreviewScreenIsOpened: function(){
    return this
      .waitForElementVisible('.app-side-view.app-side-view-preview', this.api.globals.smallWait)
      .assert.containsText('.nav-flow .v-link-active', 'Preview');
  },

  clickEditMenuSimple: function(){
    return this
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.mediumWait)
      .api.frame(null)
      .waitForElementVisible('.nav-flow a[href*="edit"]', this.api.globals.smallWait)
      .click('.nav-flow a[href*="edit"]');
  },

  assertAppBodyHasCorrectColour: function(property, hexColour){
    return this
      .assertElementPropertyHasCorrectColor('.fl-with-top-menu', property, hexColour);
  },

  clickButtonComponentByValue: function(value) {
    const buttonComponentLocator  = `input[value=${value}]`;

    return this
      .waitForElementVisible(buttonComponentLocator, this.api.globals.smallWait)
      .click(buttonComponentLocator);
  },

  checkTitleOnScreen: function (screenTitle) {
    this
      .api.frame(null)
      .switchToPreviewFrame();

    this
      .waitForElementVisible('@screenTitle', this.api.globals.smallWait)
      .assert.containsText('@screenTitle', screenTitle)
      .api.frame(null);

    return this;
  },

  enterEmailForVerificationComponent: function(emailAddress){
    this
      .waitForElementVisible('@emailInputFieldForVerificationComponent', this.api.globals.smallWait)
      .clearValue('@emailInputFieldForVerificationComponent')
      .setValue('@emailInputFieldForVerificationComponent', emailAddress)
      .api.keys([this.api.Keys.ENTER]);

    return this;
  },

  enterCodeFromVerificationEmail: function(code){
    this
      .waitForElementVisible('@codeInputFieldForVerificationComponent', this.api.globals.mediumWait)
      .clearValue('@codeInputFieldForVerificationComponent')
      .setValue('@codeInputFieldForVerificationComponent', code)
      .api.pause(1000)
      .keys([this.api.Keys.ENTER])
      .keys([this.api.Keys.ENTER])
      .logTestInfo(`The code is: ${code}`);

    return this;
  },

  clickBackChevronOnVerificationComponent: function(){
    return this
      .waitForElementVisible('@backChevronOnVerificationComponent',this.api.globals.smallWait)
      .click('@backChevronOnVerificationComponent')
      .waitForElementNotVisible('@backChevronOnVerificationComponent',this.api.globals.smallWait)
  },

  clickIHaveVerificationCodeLink: function(){
    return this
      .waitForElementVisible('@iHaveVerificationCodeLink',this.api.globals.smallWait)
      .click('@iHaveVerificationCodeLink');
  },

  clickContinueButtonOnVerificationComponent: function(){
    return this
      .waitForElementVisible('@verificationContinueButton', this.api.globals.longWait)
      .click('@verificationContinueButton')
      .assert.elementNotPresent('@verificationContinueButton');
    },

  assertSuccessfulVerificationInfoMessage: function(message) {
      return this
        .waitForElementVisible('@correctInfoMessage', this.api.globals.longWait)
        .assert.containsText('@correctInfoMessage', message);
  },

  assertErrorVerificationInfoMessage: function(message) {
    return this
      .waitForElementVisible('@incorrectInfoMessage', this.api.globals.longWait)
      .assert.containsText('@incorrectInfoMessage', message);
    },

  /** @param {String} imageLink - link of a selected image obtained earlier*/
  assertCorrectImageIsAddedViaComponent: function(imageLink){
    this
      .switchToPreviewFrame()
      .waitForElementVisible('.banner-content .fl-widget-instance img', this.api.globals.mediumWait)
      .expect.element('.banner-content .fl-widget-instance img').to.have.attribute('src', 'Correct image was added via image component').equals(imageLink);

    this
      .api.frame(null)
      .pause(1000);

    return this;
  },

  /**  @param imageNames - array with images' names used for gallery
   * @param ids - ids of images obtained previously   */
  assertCorrectImagesAreAddedToGallery: function(imageNames, ids){
    this
      .api.frame(null)
      .switchToPreviewFrame()
      .waitForElementVisible('.image-gallery', this.api.globals.smallWait)
      .waitForElementVisible('.image-gallery img', this.api.globals.smallWait)
      .perform(function(){
        for (let i = 0; i < imageNames.length; i++) {
          this.api
          .useXpath()
            .assert.attributeContains(`(//div[contains(@class,"image-gallery")]//img)[${i+1}]`, 'src',
            ids[i].substring(ids[i].lastIndexOf('/')+1, ids[i].length-9), "The correct image was added to the gallery")
          .useCss();
        }
      });

    return this;
  },

  checkGalleryFunctionality: function(imagesId, imagesTitles){
    this.api.elements('css selector', '.image-gallery .brick img', function(result){
      for(let i = 0; i < result.value.length; i++) {
        const galleryImageLocator = `.image-gallery .brick:nth-of-type(${i+1}) img`;
        const activeImageLocator = `img.pswp__img[src*='${imagesId[i]}']`;

        this
          .waitForElementVisible(galleryImageLocator, this.globals.smallWait)
          .click(galleryImageLocator)
          .assert.visible(activeImageLocator)
          .assert.containsText('.pswp__counter', `${i+1} / ${result.value.length}`)
          .assert.containsText(`[class='pswp__caption'] > .pswp__caption__center`,imagesTitles[i])
          .click('button[class*=right]')
          .waitForElementNotVisible(activeImageLocator, this.globals.smallWait)
          .click('.pswp__button.pswp__button--close')
          .waitForElementNotVisible('.pswp__button.pswp__button--close', this.globals.smallWait)
          .pause(1000);
      }
    });

    return this;
  },

  assertImageOnPreviewScreen: function(imageLink){
    this
      .switchToPreviewFrame()
      .waitForElementVisible('@imageComponent', this.api.globals.mediumWait)
      .expect.element('@imageComponent').to.have.attribute('src', 'Correct image is present on the screen').contains(imageLink)
      .before(this.api.globals.mediumWait);

    return this;
  },

  /** @param {number} entryLine - the number of data entry need to be checked
   * @param {String} text - text that should be in data entry  */
  assertEntryInDataDirectoryContainsText: function(entryLine, text){
    const locator = `((//li[@class="linked data-linked  circular"]//p[@class="list-title"]))[${entryLine}]`;
    return this
      .api.useXpath()
      .waitForElementVisible(locator, this.api.globals.tinyWait)
      .assert.containsText(locator, text)
      .useCss();
  },

  assertThumbnailsAreDisplayedAndCorrectImagesAreUsed: function (entriesNumber, images) {
    return this
      .waitForElementVisible('li.linked.data-linked[data-index="0"]', this.api.globals.smallWait)
      .api.elements('css selector', 'div.list-image', function(result) {
        this.assert.equal(result.value.length, entriesNumber, 'All entities have image thumbnails');
        for(let i=0; i < result.value.length; i++){
          this.elementIdAttribute(result.value[i].ELEMENT, 'style', (attr) => {
            if(attr.value.length > 1){
              this.assert.equal(attr.value.split('?')[0].split("contents/")[1], images[i],
                `Thumbnail used for data entry number ${i+1} is the same as was set in data source`);
            }
          })
        }
      })
  },

  /** @param {Array} tags  - array with all  tags in data source*/
  checkAllTagsFromDataSourceAreDisplayed: function (tags) {
    return this
      .waitForElementVisible('.list-default.directory-entries', this.api.globals.smallWait, ()=>{
        for(let i = 0; i < tags.length; i++){
          this
            .api.useXpath()
            .waitForElementPresent(`//div[@class="list-tags"]/a[text()]`, this.api.globals.smallWait)
            .assert.elementPresent(`//div[@class="list-tags"]/a[text()="${tags[i]}"]`)
            .useCss();
        }
      });
  },

  checkSimpleListTitleAndDescriptionOfListItemByDataId: function(dataId, itemTitle, itemDescription){
    return this
      .api.useXpath()
      .waitForElementVisible(`//li[@data-list-item-id="${dataId}"]`, this.api.globals.smallWait)
      .assert.containsText(`//li[@data-list-item-id="${dataId}"]//p[@class="list-title"]`, itemTitle)
      .assert.containsText(`//li[@data-list-item-id="${dataId}"]//p[2]`, itemDescription,
        'Description of list item is correct')
      .useCss();
  },

  clickSimpleListItemByDataId: function(dataId){
    return this
      .api.useXpath()
      .waitForElementVisible(`//li[@data-list-item-id="${dataId}"]//p`, this.api.globals.smallWait)
      .click(`//li[@data-list-item-id="${dataId}"]//p`)
      .useCss();
  },

  checkThumbnailsListTitleOfItemByDataId: function(dataId, listSize, itemTitle){
    const size = listSize.charAt(0).toLowerCase();
    return this
      .api.useXpath()
      .waitForElementVisible(`(//li[@data-thumb-${size}-item-id="${dataId}"]//p)[1]`,  this.api.globals.tinyWait)
      .assert.containsText(`(//li[@data-thumb-${size}-item-id="${dataId}"]//p)[1]`, itemTitle, )
      .useCss();
  },

  checkThumbnailsListDescriptionOfItemByDataId: function(dataId, listSize, itemDescription){
    const size = listSize.charAt(0).toLowerCase();
    return this
      .api.useXpath()
      .waitForElementVisible(`(//li[@data-thumb-${size}-item-id="${dataId}"]//p)[2]`,  this.api.globals.tinyWait)
      .assert.containsText(`(//li[@data-thumb-${size}-item-id="${dataId}"]//p)[2]`, itemDescription,
        'Description of list item is correct')
      .useCss();
  },

  assertCorrectImageIsUsedAsThumbnailByDataId: function(dataId, listSize, imageId){
    const size = listSize.charAt(0).toLowerCase();
    return this
      .waitForElementVisible(`li[data-thumb-${size}-item-id="${dataId}"] div[class="list-image"]`, this.api.globals.smallWait)
      .getAttribute(`li[data-thumb-${size}-item-id="${dataId}"] div[class="list-image"]`, 'style', function(attribute){
        this.assert.equal(attribute.value.split('"')[1].split("/")[6], imageId);
      });
  },

  assertCorrectImageBackgroundUsedForIconByDataId: function (dataId, listSize, imageAreaColour) {
    const size = listSize.charAt(0).toLowerCase();
    return this
      .assertElementPropertyHasCorrectColor(`li[data-thumb-${size}-item-id="${dataId}"] div[class="list-image"]`, 'background-color', imageAreaColour);
  },

  assertCorrectImageIconIsUsedByDataId: function(dataId, listSize, iconName){
    const size = listSize.charAt(0).toLowerCase();
    return this
      .getAttribute(`li[data-thumb-${size}-item-id="${dataId}"] div[class="fl-list-icon"] i`, 'class', function(result){
        const icon = iconName.includes(" ") ? iconName.replace(" ", "-").toLowerCase() : iconName.toLowerCase();
        const finalIcon = icon.includes("outlined") ? icon.replace("outlined", "o") : icon;
        this.assert.equal(result.value, `fa fa-${finalIcon}`, 'Correct icon is displayed');
      });
  },

  assertCorrectImageIsUsedForPanelByDataId: function(dataId, imageId){
    return this
      .waitForElementVisible(util.format(listPanelItem, dataId, dataId), this.api.globals.smallWait)
      .getCssProperty(util.format(listPanelItem, dataId, dataId), elementProperties.BACKGROUND_IMAGE, function (value) {
        this.assert.ok(value.value.includes(imageId), `The correct image ${imageId} is selected for panel background.`);
      });
  },

  assertCorrectColorIsUsedForPanelByDataId: function(dataId, color){
    return this
      .waitForElementVisible(util.format(listPanelItem, dataId, dataId), this.api.globals.smallWait)
      .assertElementPropertyHasCorrectColor(util.format(listPanelItem, dataId, dataId), elementProperties.BACKGROUND_COLOR,
        color, `Correct color is used for the panel.`);
  },

  clickPanelImageByDataId: function(dataId){
    return this
      .waitForElementVisible(util.format(listPanelItem, dataId, dataId), this.api.globals.smallWait)
      .click(util.format(listPanelItem, dataId, dataId));
  },

  clickLinkedIconForListItem: function(dataId){
    return this
      .waitForElementVisible(util.format(listPanelItemLinkedItem, dataId), this.api.globals.smallWait)
      .click(util.format(listPanelItemLinkedItem, dataId));
  },

  assertAppInfoOverlayIsOpened: function(){
    return this
      .waitForElementVisible('.overlayPanel', this.api.globals.smallWait)
      .assert.elementPresent('.app-info')
      .assert.visible('[check-updates]');
  },

  getNamesInSmallCardsList: function(names){
    this
      .waitForElementVisible('div[id*="small-card-list-wrapper"]', this.api.globals.mediumWait)
      .api.elements('css selector', '.small-card-list-name', function(results){
      for (let i = 0; i < results.value.length; i++) {
        this.elementIdText(results.value[i].ELEMENT, (name) => {
          names.push(name.value)
        });
      }
      return names;
    });
  },

  assertEditedPersonNameIsPresentInList: function(names, person){
    return this.api.perform(() => {
      const name = `${person[0]} ${person[1]}`;
      this.assert.ok(names.includes(name), `Person with name ${name} is present in list`)});
  },

  assertEditedPersonInformationIsPresentInList: function(names, person){
    return this.api.perform(()=>{
      const index = (names.indexOf(`${person[0]} ${person[1]}`) + 1);
      this
        .api.useXpath()
        .assert.containsText(`(//div[@class="small-card-list-role"])[${index}]`, person[2])
        .assert.containsText(`(//div[@class="small-card-list-location"])[${index}]`, person[3])
        .useCss();
    });
  },

  assertUserNamesAreSortedDescending: function(names){
    return this.api.perform(()=> {
      const sortedArray = names.sort().reverse();
      for (let i = 0; i < sortedArray.length; i++){
        this.assert.equal(names[i], sortedArray[i], `Name ${names[i]} is matching descending order`);
      }
    });
  },

  /** @param {number} countFrom  - number which should be added to start comparing from the certain element*/
  assertInformationIsPresentInPreviewScreen: function(locator, information, countFrom){
    return this
      .api.perform(()=> {
      this
        .waitForElementNotVisible('.fa.fa-circle-o-notch.fa-spin', this.api.globals.mediumWait);
      if (countFrom == undefined) {
        countFrom = 0;
      }
      for (let i = 0; i < information.length - countFrom; i++) {
        this
          .api.useXpath()
          .pause(3000)
          .waitForElementVisible(`(${locator})[${i+1}]`, this.api.globals.mediumWait)
          .assert.containsText(`(${locator})[${i+1}]`, information[i + countFrom])
      }
    })
      .pause(1000)
      .useCss();
  },

  enterSearchRequestOnPreviewScreen: function(request){
    this
      .waitForElementVisible('@searchFieldInput', this.api.globals.smallWait)
      .click('@searchFieldInput')
      .setValue('@searchFieldInput', request)
      .api.pause(1500);

    return this;
  },

  clickSearchButtonOnPreviewScreen: function(){
    return this
      .waitForElementVisible('@searchButtonSmallCards', this.api.globals.smallWait)
      .click('@searchButtonSmallCards')
      .api.pause(1500);
  },

  assertNumberOfItemsMatchesToEntered: function(locator, numbersToDisplay){
    this
      .waitForElementVisible(locator, this.api.globals.mediumWait)
      .api.pause(1000)
      .elements('css selector',locator, function (result) {
        this.assert.equal(result.value.length, numbersToDisplay, 'Number of displayed cards matches to entered');
      });

    return this;
  },

  assertChartSectionCorrectColors: function(colors){
    this
      .api.perform(function(){
      for(let i = 0; i < colors.length; i ++){
        this
          .api.useXpath()
          .waitForElementVisible(`(//*[@fill!="none"][@role])[${i+1}]`, this.api.globals.smallWait)
          .pause(2000)
          .assertElementPropertyHasCorrectColorXPath(`(//*[@fill!="none"][@role])[${i+1}]`, elementProperties.FILL, colors[i])
          .useCss();
      }
    });

    return this;
  },

  assertCorrectImagesArePresentInPreviewScreen: function(locator, information){
    return this.api.perform(()=> {
      for (let i = 0; i < information.length; i++) {
        this
          .api.useXpath()
          .pause(1500)
          .assert.attributeContains(`(${locator})[${i+1}]`,'src', information[i])
      }
    })
      .pause(1500)
      .useCss();
  },

  assertAllShownItemsMatchToFilter: function(locator, value){
    return this
      .switchToPreviewFrame()
      .waitForElementVisible(locator, this.api.globals.mediumWait)
      .api.elements('css selector', locator, function(result) {
        let valueCaps = value.toUpperCase();
        for (let i = 0; i < result.value.length; i++) {
          this.assert.containsText(locator, valueCaps, `Displayed element matches to filter - ${value}`);
        }
      })
  },

  assertFiltersAndSearchAreNotPresent: function(){
    return this
      .switchToPreviewFrame()
      .waitForElementVisible('.list-item-title', this.api.globals.smallWait)
      .assert.elementNotPresent('.simple-list-wrapper .fa.fa-sliders')
      .assert.elementNotPresent('.simple-list-wrapper .btn.btn-default.search-btn')
  },

  openDetailsOfListItem: function(numberOfElement, elementToClick){
    const listTitleLocator = `(//div[@class="${elementToClick}"])[${numberOfElement}]`;
    const listOverlayCloseIconLocator = '//div[contains(@class, "detail-overlay-close")]';

    this
      .api.useXpath()
      .waitForElementVisible(listTitleLocator, this.api.globals.smallWait)
      .click(listTitleLocator)
      .isVisible(listOverlayCloseIconLocator,function(displaying) {
        if (displaying.value !== true){
          this.click(listTitleLocator);
        }
      })
      .waitForElementVisible(listOverlayCloseIconLocator, this.api.globals.smallWait)
      .useCss();

    return this;
  },

  openListItemDetailsByTitle: function(lfdLayout, listItemTitle){
    const listOverlayCloseIconLocator = '//div[contains(@class, "detail-overlay-close")]';
    let elementToClick;

    switch(lfdLayout){
      case listFromDataSourceLayoutNames.DIRECTORY:
        elementToClick = 'small-card-list-name';
        break;
      case listFromDataSourceLayoutNames.SIMPLE_LIST:
        elementToClick = 'list-item-title';
        break;
      case listFromDataSourceLayoutNames.FEED:
        elementToClick = 'news-feed-item-title';
        break;
      case listFromDataSourceLayoutNames.FEATURED_LIST:
        elementToClick = 'small-h-card-list-item-text';
        break;
      case listFromDataSourceLayoutNames.AGENDA:
        elementToClick = 'agenda-item-title';
        break;
    }

    this
      .api.useXpath()
      .waitForElementVisible(util.format(listTitleLocator, elementToClick, listItemTitle), this.api.globals.smallWait)
      .click(util.format(listTitleLocator, elementToClick, listItemTitle))
      .isVisible(listOverlayCloseIconLocator,function(displaying) {
        if (displaying.value !== true){
          this.click(util.format(listTitleLocator, elementToClick, listItemTitle));
        }
      })
      .waitForElementVisible(listOverlayCloseIconLocator, this.api.globals.smallWait)
      .useCss();

    return this;
  },

  checkThatDirectoryItemHasDataByTitle: function(listItemTitle, listItemData){
    this
      .api.useXpath()
      .waitForElementPresent(util.format(directoryListItemDataByTitle, listItemTitle, listItemData), this.api.globals.smallWait)
      .assert.visible(util.format(directoryListItemDataByTitle, listItemTitle, listItemData),
      `The directory list item with ${listItemTitle} has data ${listItemData}.` )
      .useCss();

    return this;
  },

  assertElementPresentOnPreviewScreen: function(locator){
    return this
      .switchToPreviewFrame()
      .waitForElementPresent(locator, this.api.globals.mediumWait)
      .assert.elementPresent(locator, `Element with locator: ${locator} is present on preview screen`);
  },

  assertElementNotPresentOnPreviewScreen: function(locator) {
    return this
      .switchToPreviewFrame()
      .waitForElementNotPresent(locator, this.api.globals.mediumWait)
      .assert.elementNotPresent(locator, `Element with locator: ${locator} is not present on preview screen.`);
  },

  assertElementVisibleOnPreviewScreen: function(locator) {
    return this
      .switchToPreviewFrame()
      .waitForElementPresent(locator, this.api.globals.mediumWait)
      .assert.visible(locator, `Element with locator: ${locator} is visible on preview screen.`);
  },

  assertElementNotVisibleOnPreviewScreen: function (componentLocator){
    this
      .api.frame(null)
      .switchToPreviewFrame();

    this
      .waitForElementPresent(componentLocator, this.api.globals.mediumWait)
      .expect.element(componentLocator).to.not.be.visible.before(this.api.globals.smallWait);

    return this;
  },

  assertElementPresentOnPreviewScreenXpath: function(locator){
    return this
      .api.frame(null)
      .switchToPreviewFrame()
      .waitForElementNotVisible('.fa.fa-circle-o-notch.fa-spin', this.api.globals.longWait)
      .useXpath()
      .assert.elementPresent(locator)
      .useCss();
  },

  assertElementOnPreviewScreenHasCssValue: function(locator, property, value){
    return this
      .waitForElementPresent(locator, this.api.globals.mediumWait)
      .assert.cssProperty(locator, property, value);
  },

  assertElementsHaveTextOnPreviewScreen: function(locator, information){
    this
      .api.perform(()=> {
        for (let i = 0; i < information.length; i++) {
          this
            .api.useXpath()
            .waitForElementPresent(`(${locator})[${i+1}]`, this.api.globals.mediumWait)
            .assert.containsText(`(${locator})[${i+1}]`, information[i], "The element has a correct text: " +  information[i])
        }
      })
      .useCss();

    return this;
  },

  clickBookmarkIconNearElement: function(numberOfElement){
    return this
      .api.useXpath()
      .waitForElementVisible(`(//div[@class="agenda-item-bookmark"]//span[@class="fa fa-bookmark-o"])[${numberOfElement}]`, this.api.globals.smallWait)
      .pause(5000)
      .execute(function(numberOfElement) {
        const allTheBookmarkIcons = document.querySelectorAll(`span[class="fa fa-bookmark-o"]`);
        allTheBookmarkIcons[numberOfElement].click();
      }, [numberOfElement])
      .assert.attributeContains(`(//div[@class="agenda-item-bookmark"]//span[contains(@class, "fa fa-bookmark")])[${numberOfElement}]`,
        'class', 'fa fa-bookmark', "The bookmark is active")
      .useCss()
      .waitForElementPresent('.agenda-detail-overlay-content-holder', this.api.globals.smallWait);
  },

  clickBookmarkIconNearElementByItemTitle: function (itemTitle) {
    const agendaItemBookmarkLocator = `//div[div[h2[text()="${itemTitle}"]]]//span[@class="fa fa-bookmark-o"]`;

    return this
      .api.useXpath()
      .waitForElementVisible(agendaItemBookmarkLocator, this.api.globals.mediumWait)
      .pause(2000)
      .element('xpath', agendaItemBookmarkLocator, function (result) {
        this.moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT)
      })
      .waitForElementNotPresent(agendaItemBookmarkLocator, this.api.globals.smallWait)
      .useCss();
  },

  closeDetailsOfListItem:
    function () {
      return this
        .waitForElementVisible(`.fa.fa-times`, this.api.globals.smallWait)
        .waitForElementVisible('.agenda-item-detail-label', this.api.globals.smallWait)
        .api.execute(function () {
          const closeIcon = document.querySelectorAll(`.fa.fa-times`);
          closeIcon[0].click();
        })
        .waitForElementNotPresent('.agenda-item-detail-label', this.api.globals.smallWait);
    },

  clickMyAgendaButton: function(){
    return this
      .waitForElementVisible(`.agenda-list-controls`, this.api.globals.smallWait)
      .api.pause(3000)
      .execute(function() {
        const myAgenda = document.querySelectorAll(`span[class="fa fa-bookmark-o"]`);
        myAgenda[0].click();
      })
      .assert.attributeContains('.toggle-agenda', 'class', 'active',
        "My agenda is active")
      .useXpath()
      .waitForElementNotVisible('(//h2[@class="agenda-item-title"])[2]', this.api.globals.smallWait)
      .useCss();
  },

  assertOnlyBookedItemsAreVisible: function(numberOfBooked, expectedValue){
    let numberOfVisible = 0;
    return this
      .api.elements('css selector', '.agenda-item-title', function (result) {
        for (let i = 0; i < result.value.length; i++) {
          this.elementIdDisplayed(result.value[i].ELEMENT, function (display) {
            if (display.value !== false) {
              numberOfVisible++;
              this.elementIdText(result.value[i].ELEMENT, function(text) {
                this.assert.equal(text.value, expectedValue);
              })
            }
          });
        }
      })
  },

  assertTextInAlertContainsInsertedJs: function(jsText){
    return this
      .api.getAlertText(function(result) {
        this.assert.deepEqual(result.value, jsText, `Testing if "${result.value}" text in alert match to expected "${jsText}"`)
      })
      .acceptAlert();
  },

  clickAddEntityIcon: function() {
    return this
      .waitForElementNotVisible('.fa.fa-circle-o-notch.fa-spin', this.api.globals.mediumWait)
      .waitForElementVisible('.dynamic-list-add-item i', this.api.globals.smallWait)
      .api.execute(function () {
        const addIcon = document.querySelector(`.dynamic-list-add-item i`);
        addIcon.click();
      })
  },

  clickAndConfirmDeleteEntityButton: function() {
    return this
      .api.useXpath()
      .waitForElementVisible('//div[contains(@class, "btn btn-danger")]', this.api.globals.smallWait )
      .execute(function () {
        const addIcon = document.querySelector(`.btn.btn-danger.dynamic-list-delete-item`);
        addIcon.click();
      })
      .waitForElementVisible('//button[@class="button action-sheet-option"]', this.api.globals.smallWait)
      .click('//button[@class="button action-sheet-option"]')
      .waitForElementNotPresent('//div[contains(@class, "details")]', this.api.globals.smallWait)
      .useCss()
      .pause(500);
  },

  assertNameOfScreenOnCollapsedScreenSelector: function(screenName){
    return this
      .api.frame(null)
      .waitForElementVisible('.screens-label strong', this.api.globals.smallWait)
      .assert.containsText('.screens-label strong', screenName);
  },

  clickEditEntityIcon: function() {
    this
      .waitForElementNotVisible('.fa.fa-circle-o-notch.fa-spin', this.api.globals.mediumWait)
      .waitForElementVisible('.btn.btn-default.dynamic-list-edit-item', this.api.globals.smallWait)
      .api.execute(function () {
        const addIcon = document.querySelector(`.btn.btn-default.dynamic-list-edit-item`);
        addIcon.click();
      });

    return this;
  },

  clickLikeIconInElementDetails: function(){
    return this
      .waitForElementNotVisible('.simple-list-overlay-inner-holder  .fa.fa-heart.fa-lg.animated.bounceIn', this.api.globals.smallWait)
      .waitForElementVisible('.simple-list-overlay-inner-holder  .fa.fa-heart-o.fa-lg', this.api.globals.smallWait)
      .api.execute(function() {
        const likeIcon = document.querySelector(`.simple-list-overlay-inner-holder  .fa.fa-heart-o.fa-lg`);
        likeIcon.click();
      })
      .waitForElementVisible('.simple-list-overlay-inner-holder  .fa.fa-heart.fa-lg.animated.bounceIn', this.api.globals.smallWait);
  },

  signInIntoLoginForm: function(email, password){
    this
      .waitForElementVisible('.form-control.profile_email', this.api.globals.smallWait)
      .waitForElementVisible('.form-control.profile_password', this.api.globals.smallWait)
      .waitForElementVisible('.btn.btn-primary.btn-login', this.api.globals.smallWait)
      .api.pause(1000)
      .setValue('.form-control.profile_email', email)
      .setValue('.form-control.profile_password', password)
      .submitForm('.fl-login-form .form-horizontal')
      .pause(1000)
      .element('css selector', '.fl-toast-title', function(result){
        if(result.status !== 0){
          this.execute(function () {
            const loginButton = document.querySelector(`.btn.btn-primary.btn-login`);
            loginButton.click();
          });
        }
      })
      .waitForElementVisible('.fl-toast-title', this.api.globals.smallWait)
      .assert.containsText('.fl-toast-title', 'Login successful');

    return this;
  },

  signInIntoLoginFormWithSecurityEnabled: function(email, password){
    this
      .switchToPreviewFrame()
      .waitForElementVisible('.form-control.profile_email', this.api.globals.smallWait)
      .waitForElementVisible('.form-control.profile_password', this.api.globals.smallWait)
      .waitForElementVisible('.btn.btn-primary.btn-login', this.api.globals.smallWait)
      .api.pause(1000)
      .setValue('.form-control.profile_email', email)
      .setValue('.form-control.profile_password', password)
      .submitForm('.fl-login-form .form-horizontal')
      .pause(1000);

    return this;
  },

  assertMenuStyleOnPreviewScreen: function(menuStyle) {
    return this
      .switchToPreviewFrame()
      .assert.elementPresent(`div[data-type="menu"][data-name="${menuStyle}"]`);
},

  openAppHamburgerMenu: function() {
    this
      .api.frame(null);

    return this
      .switchToPreviewFrame()
      .waitForElementVisible('@hamburgerAppMenuIcon', this.api.globals.smallWait)
      .click('@hamburgerAppMenuIcon')
      .waitForElementVisible('@openAppMenuOverlay', this.api.globals.smallWait);
  },

  closeAppHamburgerMenu : function(){
    return this
      .waitForElementVisible('@closeButtonOnOpenAppMenu', this.api.globals.smallWait)
      .click('@closeButtonOnOpenAppMenu')
      .assert.elementNotPresent('@openAppMenuOverlay', 'Menu overlay is closed.');
  },

  openAboutAppOverlay: function() {
    return this
      .waitForElementVisible('@aboutAppLink', this.api.globals.smallWait)
      .click('@aboutAppLink')
      .waitForElementVisible('@overlayPanelContent', this.api.globals.smallWait);
  },

  assertDetailsOfAboutAppOverlay: function(titleText, textForAboutInfo, appName) {
    const moment = require('moment');

    return this
      .waitForElementVisible('.client-info h2', this.api.globals.smallWait)
      .assert.containsText('.client-info h2', appName + ' ' + titleText)
      .api.useXpath()
      .waitForElementVisible('(//div[@class="client-info"]/p)[2]', this.api.globals.smallWait)
      .assert.containsText('(//div[@class="client-info"]/p)[2]', textForAboutInfo)
      .waitForElementVisible('(//div[@class="client-info"]/p)[3]', this.api.globals.smallWait)
      .assert.containsText('(//div[@class="client-info"]/p)[3]', this.api.globals.organizationName + ' ' + moment().year())
      .useCss()
      .waitForElementVisible('.foot-note a', this.api.globals.smallWait)
      .assert.containsText('.foot-note a', 'Fliplet technology')
      .waitForElementVisible('a[check-updates]', this.api.globals.smallWait);
  },

  assertUploadedCustomFontAppearedOnPreview: function(appFontFamily) {
    return this
      .switchToPreviewFrame()
      .assert.cssProperty('section[data-fl-edit] p', 'font-family', appFontFamily)
      .api.useXpath()
      .assert.elementPresent(`//style[contains(text(),'@font-face { font-family: "leighton"; src: url')]`)
      .useCss()
      .frame(null);
  },

  assertCorrectImagesArePresentInPreviewScreenByStyle: function(locator, information){
    return this.api.perform(()=> {
      for (let i = 0; i < information.length; i++) {
        this
          .api.useXpath()
          .pause(1500)
          .assert.visible(`${locator}[contains(@style, '${information[i]}')]`)
      }
    })
      .pause(1500)
      .useCss();
  },

  clickElementOnPreviewScreen: function (locator) {
    this
      .api.frame(null)
      .switchToPreviewFrame();

    this
      .waitForElementVisible(locator, this.api.globals.smallWait)
      .click(locator)
      .api.frame(null);

    return this;
  },

  clickMenuLinkByLabel: function(menuLinkLabel){
    this
      .api.pause(2000)
      .useXpath()
      .waitForElementVisible(util.format(menuLinkLabelLocator, menuLinkLabel), this.api.globals.smallWait)
      .click(util.format(menuLinkLabelLocator, menuLinkLabel))
      .useCss();

    return this;
  },

  clickCircleMenuLinkByNumber: function(menuLinkNumber){
    this
      .api.pause(2000)
      .useXpath()
      .waitForElementVisible(util.format(circleMenuLinkByNumber, menuLinkNumber), this.api.globals.smallWait)
      .click(util.format(circleMenuLinkByNumber, menuLinkNumber))
      .useCss();

    return this;
  },

  clickBottomIConBarMenuLinkByLabel: function(menuLinkLabel){
    this
      .api.pause(2000)
      .useXpath()
      .waitForElementVisible(util.format(menuLabelInBottomIconBarMenu, menuLinkLabel), this.api.globals.smallWait)
      .click(util.format(menuLabelInBottomIconBarMenu, menuLinkLabel))
      .useCss();

    return this;
  },

  clickMoreButtonToExpandBottomIConBarMenu: function(){
    return this
      .waitForElementVisible('@moreButtonInBottomIconBarMenu', this.api.globals.smallWait)
      .click('@moreButtonInBottomIconBarMenu')
      .waitForElementVisible('@expandedBottomIconBarMenu', this.api.globals.smallWait)
      .waitForElementVisible('@hideButtonInBottomIconBarMenu', this.api.globals.smallWait);
  },

  clickHideButtonToExpandBottomIConBarMenu: function(){
    return this
      .waitForElementVisible('@hideButtonInBottomIconBarMenu', this.api.globals.smallWait)
      .click('@hideButtonInBottomIconBarMenu')
      .waitForElementNotPresent('@expandedBottomIconBarMenu', this.api.globals.smallWait)
      .waitForElementVisible('@moreButtonInBottomIconBarMenu', this.api.globals.smallWait);
  },

  assertInformationTextOnPreviewScreen: function(locator, information, countFrom){
    return this
      .api.perform(()=> {
        if (countFrom == undefined) {
          countFrom = 0;
        }
        for (let i = 0; i < information.length - countFrom; i++) {
          this
            .api.useXpath()
            .waitForElementVisible(`${locator}[contains(text(), '${information[i + countFrom]}')]`, this.api.globals.smallWait);
        }
      })
      .pause(1000)
      .useCss();
  },

  openPreviewForDeviceByName: function(device){
    const devicePreviewModeButtonLocator = `.btn-device.${device.toLowerCase()}`;

    this
      .api.frame(null)
      .waitForElementVisible(devicePreviewModeButtonLocator, this.api.globals.tinyWait)
      .click(devicePreviewModeButtonLocator)
      .moveToElement('.nav-flow a[href*="preview"]', 0, 0)
      .waitForElementNotVisible('.device-selector.animated', this.api.globals.smallWait);

    return this;
  },

  checkDisplayedMapName: function (mapName) {
    return this
      .waitForElementVisible('@mapButton', this.api.globals.smallWait)
      .assert.containsText('@mapButton', mapName);
  },

  assertMarkerNameHolderIsNotDisplayed: function(){
    return this
      .waitForElementNotVisible('@markerNameHolder', 'Marker name holder is not displayed.')
      .assert.elementNotPresent('@activeMarker', 'There is no selected marker.');
    },

  clickMarkerOnMap: function (markerName) {
    this
      .api.useXpath()
      .waitForElementVisible(util.format(markerIconOnActiveMap, markerName), this.api.globals.mediumWait)
      .element('xpath', util.format(markerIconOnActiveMap, markerName), function (result) {
        this
          .moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT);
      })
      .useCss();

    return this;
  },

  checkDisplayedMarkerIcon: function(markerName, markerIcon){
    this
      .api.useXpath()
      .assert.attributeContains(util.format(markerIconOnActiveMap+'/i', markerName), 'class', markerIcon, 'Marker has a correct icon')
      .useCss();

    return this;
  },

  checkActiveMarker: function (markerName) {
    return this
      .waitForElementVisible('@activeMarker', this.api.globals.smallWait)
      .assert.attributeContains('@activeMarker', 'data-name', markerName, 'The correct marker is active.')
      .waitForElementVisible('@markerNameHolder', this.api.globals.smallWait)
      .assert.containsText('@markerNameHolder', markerName, 'The active marker has the correct name.');
  },

  switchToAnotherMap: function (mapName) {
    const mapNameLocator = `//p[@class ="map-list-text" and contains(text(), "${mapName}")]`;
    const mapOverlayLocator = '.interactive-maps-overlay.overlay-open';

    this
      .waitForElementVisible('@mapButton', this.api.globals.tinyWait)
      .click('@mapButton')
      .api.useCss()
      .waitForElementPresent(mapOverlayLocator, this.api.globals.mediumWait)
      .useXpath()
      .waitForElementVisible(mapNameLocator, this.api.globals.tinyWait)
      .click(mapNameLocator)
      .useCss()
      .waitForElementNotPresent(mapOverlayLocator, this.api.globals.mediumWait);

    return this;
  },

  assertCorrectBackgroundImageForOnboardingLayoutIsDisplayed: function(imageId){
    return this
      .waitForElementVisible('@onboardingLayoutScreen', this.api.globals.smallWait)
      .assert.attributeContains('@onboardingLayoutScreen', 'style', imageId,`Correct image with id ${imageId} is used for background`)
  },

  assertCorrectSlideImageIsDisplayed: function(imageId){
    return this
      .waitForElementVisible('@slideImage', this.api.globals.smallWait)
      .assert.attributeContains('@slideImage', 'src', imageId,`Correct image with id ${imageId} is used for slide`)
  },

  assertCorrectVideoIsDisplayed: function(mediaId){
    return this
      .waitForElementVisible('@videoDownloadedForLink', this.api.globals.longWait)
      .assert.attributeContains('@videoDownloadedForLink', 'src', mediaId,`Correct video with id ${mediaId} is open`);
  },

  checkSlidesPaginationBullets: function(amountOfSlides){
    return this
      .assertAmountOfElementsVisible('@sliderPaginationBullet', amountOfSlides);
  },

  checkSlideComponents: function(slideName){
    const slideLocator = '.swiper-slide.swiper-slide-active';

    return this
      .waitForElementVisible(slideLocator, this.api.globals.smallWait)
      .waitForElementVisible('@slideTitle', this.api.globals.smallWait)
      .assert.containsText('@slideTitle', slideName);
  },

  checkSlidePagination: function(paginationOption, slideNumber) {
    const paginationLocator = `.swiper-button-${paginationOption}`;

    this
      .waitForElementVisible(paginationLocator, this.api.globals.smallWait)
      .click(paginationLocator)
      .api.useXpath()
      .waitForElementVisible(`//div[contains(@class,"swiper-slide")][${slideNumber}]`, this.api.globals.smallWait)
      .assert.attributeContains(`//span[contains(@class, 'wiper-pagination-bullet')][${slideNumber}]`,'class', 'active')
      .useCss();

    return this;
  },

  clickSkipSlidesButton: function(){
    return this
      .waitForElementVisible('@skipSlidesButton', this.api.globals.smallWait)
      .click('@skipSlidesButton')
  },

  clickSlideButton: function(slideButtonLabel){
    return this
      .waitForElementVisible('@slideButton', this.api.globals.smallWait)
      .assert.value('@slideButton', slideButtonLabel)
      .click('@slideButton');
  },

  goBackToSlideScreen: function(){
    return this
      .waitForElementVisible('@goBackButton', this.api.globals.smallWait)
      .click('@goBackButton')
      .waitForElementVisible('@skipSlidesButton', this.api.globals.mediumWait)
  },

  checkSlideDescription: function(slideDescriptionText) {
    return this
      .waitForElementVisible('@slideDescription', this.api.globals.smallWait)
      .assert.containsText('@slideDescription', slideDescriptionText, 'The description is correct on the slide')
  },

  checkRssElementsArePresent: function () {
    return this
      .waitForElementVisible('div.rss', this.api.globals.mediumWait)
      .api.expect.element('.feed-panels :first-child.linked.feed-item').to.be.visible.before(this.api.globals.mediumWait);
  },

  checkRssFeedConfigurationSettings: function (configurationOption) {
    const feedPanelLocator = '.feed-panels';

    return this
      .waitForElementVisible(feedPanelLocator, this.api.globals.smallWait)
      .assert.attributeContains(feedPanelLocator, 'class', configurationOption)
  },

  checkRssFeedDesignSettings: function (designOption) {
    return this
      .waitForElementVisible('@rssFeedItem', this.api.globals.smallWait)
      .assert.attributeContains('@rssFeedItem', 'class', designOption)
  },

  checkRssFeedFunctionality: function (designOption) {
    const readOnlineButtonLocator ='.actionButton';
    const closeOverlayButtonLocator ='.overlayNavbar .closeButton';

    return this
      .waitForElementVisible('.pull-to-refresh', this.api.globals.smallWait)
      .click('.feed-panels li:first-child span.fa.fa-angle-right')
      .waitForElementVisible('@overlayPanelContent', this.api.globals.mediumWait)
      .assert.visible(readOnlineButtonLocator)
      .clickElementAndCheckElementNotPresent(closeOverlayButtonLocator, '.overlayPanelContent')
      .waitForElementNotPresent('@overlayPanelContent', this.api.globals.mediumWait)
      .waitForElementNotVisible(`.feed-panels li:first-child span.${designOption}-icon`, this.api.globals.smallWait);
  },

  setLockPassword: function(lockPassword){
    this
      .waitForElementVisible('@lockPasswordInputField', this.api.globals.smallWait)
      .assert.attributeContains('@lockPasswordInputField', 'placeholder', 'Tap to enter passcode')
      .setValue('@lockPasswordInputField',lockPassword)
      .api.pause(2000);

    return this;
  },

  reenterLockPassword: function(lockPassword) {
    this
      .waitForElementVisible('@lockPasswordInputField', this.api.globals.smallWait)
      .assert.attributeContains('@lockPasswordInputField', 'placeholder', 'Tap to re-enter passcode')
      .setValue('@lockPasswordInputField', lockPassword)
      .api.pause(2000);

    return this;
  },

  checkLockComponentFunctionality: function() {
    this
      .waitForElementVisible('@verificationContinueButton', this.api.globals.mediumWait)
      .api.element('css selector', '.btn-primary[class*="continue"]:not([class*="touchID"])', function(result){
        this
          .moveTo(result.value.ELEMENT)
          .mouseButtonClick(0);
      })
      .pause(1000);

    return this;
  },

  checkChartTotalAmount: function(totalValue){
    return this
      .waitForElementVisible('@chartTotalAmount', this.api.globals.mediumWait)
      .assert.containsText('@chartTotalAmount', totalValue, "The total amount of entries is correct");
  },

  checkChartPopOverInformation: function(locatorToMoveTo){
    return this
      .waitForElementVisible(locatorToMoveTo, this.api.globals.mediumWait)
      .click(locatorToMoveTo)
      .waitForElementPresent('@chartPopOverInformation', this.api.globals.mediumWait)
      .assert.visible('@chartPopOverInformation');
  },

  assertUploadedFontIsDisappearedInDeveloperCode: function (){
    return this
      .switchToPreviewFrame()
      .api.useXpath()
      .assert.elementNotPresent(`//style[contains(text(),'@font-face { font-family: "leighton"; src: url')]`)
      .useCss();
  },

  clickResetPreviewButton: function () {
    return this
      .waitForElementVisible('@resetPreviewButton', this.api.globals.smallWait)
      .click('@resetPreviewButton')
      .acceptModalWindow()
      .api.pause(1500)
  },

  checkThatAppIsInAppList: function(appName) {
    return this
      .waitForElementVisible('@appTitleInAppListHolder', this.api.globals.smallWait)
      .assert.containsText('@appTitleInAppListHolder', appName);
  },

  expandAccordion: function(){
    return this
      .waitForElementVisible('@accordionHeading', this.api.globals.mediumWait)
      .click('@accordionHeading')
      .assert.attributeContains('@accordionHeading', 'aria-expanded', 'true');

    return this;
  },

  collapseAccordion: function(){
    return this
      .waitForElementVisible('@accordionHeading', this.api.globals.mediumWait)
      .click('@accordionHeading')
      .assert.attributeContains('@accordionHeading', 'aria-expanded', 'false');
  },

  checkAccordionHeadingTitle: function(accordionTitle){
    return this
      .waitForElementVisible('@accordionHeading', this.api.globals.mediumWait)
      .assert.containsText('@accordionHeading', accordionTitle, 'The accordion heading has a correct title');
  },

  checkHeadingBackgroundColor: function(color){
    return this
      .assertElementPropertyHasCorrectColor(`@accordionHeading`, 'background-color', color);
  },

  checkPrimaryButtonAppearanceSettingsColor: function (appearanceSettingsColor, color) {
    return this
      .assertElementPropertyHasCorrectColor(`@primaryButton`, appearanceSettingsColor, color);
  },

  clickListItemImageByTitle: function(listItemTitle){
    const listItemImage = `//div[div[contains(text(),"${listItemTitle}")]]//div[@style]`;
    const resultDisplaying = [];

    this
      .api.useXpath()
      .waitForElementVisible(listItemImage, this.api.globals.mediumWait)
      .click(listItemImage)
      .waitForElementNotPresentWithoutErrors('.small-h-card-list-item', 5000, resultDisplaying)
      .perform(function () {
        if (resultDisplaying[0] === false) {
        this.api.click(listItemImage);
      }
      })
      .useCss()
      .pause(2000);

    return this;
  },

  assertCorrectMenuItemIsSelected: function(screenTitle){
    const screenTitleOnMenuPanelLocator = `(//*[@class='fl-widget-instance']//div[@class = 'fl-menu-title']/span[text()='${screenTitle}'])[2]`;

    this
      .api.frame(null)
      .switchToPreviewFrame();

    this.api
      .useXpath()
      .waitForElementVisible(screenTitleOnMenuPanelLocator, this.api.globals.mediumWait)
      .assert.cssProperty(screenTitleOnMenuPanelLocator, 'color', 'rgba(0, 171, 209, 1)')
      .useCss()
      .frame(null);

    return this;
  },

  assetFontAndBackgroundColorOfTextComponent: function(font, color){
    const textComponentLocator = '.col-sm-12 section :nth-child(2)';

    return this
      .switchToPreviewFrame()
      .waitForElementVisible(textComponentLocator, this.api.globals.smallWait)
      .assert.cssProperty(textComponentLocator, 'font-family', font)
      .assert.cssProperty(textComponentLocator, 'background-color', color);
  },

  clickEnableSecurityButtonForPreview: function(){
    this
      .api.frame(null);

    this
      .waitForElementVisible('@enableSecurityButton', this.api.globals.mediumWait)
      .click('@enableSecurityButton')
      .assert.attributeContains('@enableSecurityButton', 'class', 'full-bg')
      .api.pause(3000);

    return this;
  },

  assertContainerHasCorrectImageForBackground: function(media){
    this
      .switchToPreviewFrame()
      .waitForElementVisible('@containerWidget', this.api.globals.smallWait)
      .getCssProperty('@containerWidget', elementProperties.BACKGROUND_IMAGE, function (result) {
        this.assert.ok(result.value.includes(media), `The correct image ${media} is selected for container background.`);
      })
      .api.frame(null);

    return this;
  }
};

module.exports = {
  commands: [commands],
  elements: {
    titleText: {
      selector: '.col-sm-12>section>h3'
    },
    bodyText: {
      selector: '.col-sm-12>section>p'
    },
    editAppMenu: {
      selector: '.nav-flow a[href*="edit"]'
    },
    screenTitle: {
      selector: '.nav-title > span'
    },
    appBody: {
      selector: '.fl-with-top-menu'
    },
    imageComponent: {
      selector: 'span[data-name="Image"] img:not([style*=none])'
    },
    aboutAppLink: {
      selector: 'a[open-about-overlay]'
    },
    searchFieldInput: {
      selector: ' input[class*="search"]'
    },
    searchButtonSmallCards: {
      selector: '.section-top-wrapper.profile-disabled .btn.btn-default.search-btn'
    },
    tabletDevicePreview: {
      selector: '.btn-device.tablet'
    },
    mapButton: {
      selector: 'div.maps-button'
    },
    markerNameHolder: {
      selector: 'div.interactive-map-label-wrapper'
    },
    activeMarker: {
      selector: '.marker.active'
    },
    mapMarker: {
      selector: '.marker'
    },
    buttonComponent: {
      selector: 'span > input.btn'
    },
    primaryButton: {
      selector: '.btn.btn-primary'
    },
    secondaryButton: {
      selector: '.btn.btn-secondary'
    },
    onboardingLayoutScreen: {
      selector: '.onboarding-holder.full-screen'
    },
    sliderPaginationBullet: {
      selector: '.swiper-pagination-bullet'
    },
    slideTitle: {
      selector: '.swiper-slide.swiper-slide-active h1',
    },
    slideImage: {
      selector: '.swiper-slide.swiper-slide-active img',
    },
    skipSlidesButton: {
      selector: '.ob-skip span'
    },
    slideButton: {
      selector: '.swiper-slide.swiper-slide-active input'
    },
    goBackButton: {
      selector: '.fa.fa-angle-left'
    },
    slideDescription: {
      selector: '.swiper-slide.swiper-slide-active p'
    },
    rssFeedItem: {
      selector: '.feed-panels :first-child.linked.feed-item'
    },
    overlayPanelContent: {
      selector: '.overlayPanelContent'
    },
    lockPasswordInputField: {
      selector: '.state.present input.passcode-field'
    },
    incorrectInfoMessage: {
      selector: '[class="text-danger"],[style="overflow: auto;"] .text-danger'
    },
    correctInfoMessage: {
      selector: '.state.present p'
    },
    verificationContinueButton: {
      selector: '.btn-primary[class*="continue"]:not([class*="touchID"])'
    },
    chartTotalAmount: {
      selector: 'span.total'
    },
    chartPopOverInformation: {
      selector: '.highcharts-label text :nth-child(3)'
    },
    menuLink: {
      selector: '.internal-link.buttonControl'
    },
    videoDownloadedForLink: {
      selector: 'video#flLinkVideo'
    },
    resetPreviewButton: {
      selector: '//a[text()="Reset preview"]',
      locateStrategy: 'xpath'
    },
    appTitleInAppListHolder: {
      selector: 'p.list-title'
    },
    emailInputFieldForVerificationComponent: {
      selector: '.form-group input[name="verify-email"]'
    },
    codeInputFieldForVerificationComponent: {
      selector: '.verify_pin.form-control'
    },
    backChevronOnVerificationComponent: {
      selector: '.fa.fa-chevron-left.back'
    },
    iHaveVerificationCodeLink: {
      selector: '.btn.btn-link.have-code'
    },
    accordionHeading: {
      selector: '[data-parent="#accordion-1"]'
    },
    imageGallery: {
      selector: '.image-gallery'
    },
    enableSecurityButton: {
      selector: 'div .btn.btn-rounded.btn-white:nth-of-type(3)',
    },
    closeButtonOnOpenAppMenu: {
      selector: '.hamburger.is-active .hamburger-box'
    },
    hamburgerAppMenuIcon: {
      selector: '.hamburger-box'
    },
    openAppMenuOverlay: {
      selector: '[class*=fl-menu].active'
    },
    expandedBottomIconBarMenu: {
      selector: '.fl-menu-body.expanded'
    },
    moreButtonInBottomIconBarMenu: {
      selector: '//span[text()="More"]/ancestor::div[@class="fl-bottom-bar-icon-holder"]',
      locateStrategy: 'xpath'
    },
    hideButtonInBottomIconBarMenu: {
      selector: '//span[text()="Hide"]/ancestor::div[@class="fl-bottom-bar-icon-holder"]',
      locateStrategy: 'xpath'
    },
    containerWidget: {
      selector: '[data-name=Container]'
    },
    lfdItem: {
      selector: '.small-card-list-item, .small-h-card-list-item, .agenda-item-inner-content'
    }
  }
};
