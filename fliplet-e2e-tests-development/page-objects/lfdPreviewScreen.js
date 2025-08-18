const util = require('util');
const values = require('../utils/constants/values');
const elementAttributes = require('../utils/constants/elementAttributes');
const filterOptionTitle = '//h4[span[@class="panel-title-text" and contains(text(),"%s")]]';
const filterOptionPanel = '//h4[span[@class="panel-title-text" and contains(text(),"%s")]]/..';
const filterValueButton = '//div[contains(@class, "controls-filter")][text()="%s"]';
const filtersCount = '//h4[span[@class="panel-title-text" and contains(text(),"%s")]]//span[@class="active-filter-count"]';
const listItemTextByLevel = '.small-card-list-%s, [class*="news-feed"][class*="%s"]:not([class*="panel"]):not([class*="has"])';
const activeFilterByValue = '//*[@data-filter-active-group]//*[@class="btn hidden-filter-controls-filter mixitup-control-active applied-filter"][text()="%s"]';
const listItemDataByTitle = '//div[@class="small-card-list-text-wrapper " or @class="simple-list-wrapper" or @class="news-feed-list-wrapper"]' +
  '//*[contains(text(),"%s")]/parent::div//div[contains(@class,"list") or contains(@class,"item")][contains(text(),"%s")]';
const sortByUserOptionInDropdown = '//ul[@class="dropdown-menu list-sort"]/li[@data-sort-field="%s"]';
const sortByUserOptionInDropdownOrder = '//ul[@class="dropdown-menu list-sort"]/li[@data-sort-field="%s"]/span/i';
const listItemTitle = '(//div//div[contains(@class,"list") and contains(@class, "-%s")] | //*[contains(@class, "news-feed-item-%s") or contains(@class, "news-feed-%s-category")])[%d]';
const filterOptionButtonByTitle = '//div[contains(@class, "btn hidden-filter-controls-filter")][text()="%s"]';
const bookmarkIconOnListItemByTitle = '//div[contains(@class, "text-wrapper") or contains(@class, "info-holder")]/div[contains(text(), "%s")]/parent::*//i[contains(@class,"bookmark")]';
const listItemBookmarkIcon = 'i[class*="fa-bookmark"]';

const commands = {
  clickApplyButtonInFiltersOverlay: function(){
    return this
      .waitForElementVisible('@applyFilterButton', this.api.globals.smallWait)
      .click('@applyFilterButton')
      .waitForElementNotVisible('@applyFilterButton', this.api.globals.smallWait);
  },

  clickClearButtonInFiltersOverlay: function(){
    return this
      .waitForElementVisible('@clearFilterButton', this.api.globals.smallWait)
      .click('@clearFilterButton')
      .waitForElementNotVisible('@applyFilterButton', this.api.globals.smallWait);
  },

  checkThatActiveFiltersGroupIsAbsent: function(){
    return this
      .waitForElementNotVisible('@activeFiltersGroup', this.api.globals.smallWait);
  },

  openFilterOverlayForLFD: function(){
    return this
      .waitForElementVisible('@clickFiltersIconToOpenOverlay', this.api.globals.mediumWait)
      .click('@clickFiltersIconToOpenOverlay')
      .waitForElementVisible('@filtersOverlay', this.api.globals.mediumWait);
  },

  expandFilterOptionByLabel: function(filterOption){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(filterOptionTitle, filterOption), this.api.globals.mediumWait)
      .click(util.format(filterOptionTitle, filterOption))
      .assert.attributeContains(util.format(filterOptionPanel, filterOption), elementAttributes.ARIA_EXPANDED, values.TRUE)
      .useCss();

    return this;
  },

  getInitialFilterValue: function(filterOption, initialFiltersCountValue){
    this
      .api.useXpath()
      .waitForElementPresent(util.format(filtersCount, filterOption), this.api.globals.mediumWait)
      .useCss()
      .element('xpath', util.format(filtersCount, filterOption), (result) => {
        this
          .api.elementIdText(result.value.ELEMENT, (text) => {
          if(text.value !== ''){
            initialFiltersCountValue.unshift(parseInt(text.value.replace('(', '').replace(')', '')));
          } else{
            initialFiltersCountValue.unshift(0);
          }
        })
      });
  },

  selectFilterByTitle: function(filterOption, filterValue, done){
    const initialFiltersCountValue = [];

    this
      .getInitialFilterValue(filterOption, initialFiltersCountValue, () => {
        done();
      });

    this
      .api.useXpath()
      .waitForElementVisible(util.format(filterValueButton, filterValue), this.api.globals.mediumWait)
      .click(util.format(filterValueButton, filterValue))
      .assert.attributeContains(util.format(filterValueButton, filterValue), elementAttributes.CLASS, values.ACTIVE)
      .getText(util.format(filtersCount, filterOption), (text) => this.assert.ok(text.value.includes(
        initialFiltersCountValue[0] + 1), `The active filters count is correct and it is ${text.value}.`))
      .useCss();

    return this;
  },

  unselectFilterByTitle: function(filterOption, filterValue, done){
    const initialFiltersCountValue = [];

    this
      .getInitialFilterValue(filterOption, initialFiltersCountValue, () => {
        done();
      });

    this
      .api.useXpath()
      .waitForElementVisible(util.format(filterValueButton, filterValue), this.api.globals.mediumWait)
      .click(util.format(filterValueButton, filterValue))
      .expect.element(util.format(filterValueButton, filterValue)).to.have.attribute(elementAttributes.CLASS).not.contains(values.ACTIVE);

    this
      .api.perform(() => {
      if(initialFiltersCountValue[0] === 1){
        this.expect.element(util.format(filtersCount, filterOption)).text.to.equal('');
      } else{
        this.expect.element(util.format(filtersCount, filterOption)).text.to.equal(`(${initialFiltersCountValue[0] - 1})`);
      }
    })
      .useCss();

    return this;
  },

  assertListItemsContainText: function(textLevel, valueToSearch){
    this
      .api.elements('css selector', util.format(listItemTextByLevel, textLevel, textLevel.toLowerCase()), function(result){
      for(let i = 0; i < result.value.length; i ++){
        this.elementIdText(result.value[i].ELEMENT, function(text){
          this.assert.ok(text.value.toLowerCase().includes(valueToSearch.toString().toLowerCase()),
            `All list items contain the expected text ${valueToSearch}.`);
        });
      }
    });

    return this;
  },

  assertThatLfdNumberIsGreaterThanValue: function(textLevel, value){
    this
      .api.elements('css selector', util.format(listItemTextByLevel, textLevel, textLevel.toLowerCase()), function(result){
      for(let i = 0; i < result.value.length; i ++){
        this.elementIdText(result.value[i].ELEMENT, function(number){
          this.assert.ok(number.value > value, `All list items contain numbers greater than ${value}.`);
        });
      }
    });

    return this;
  },

  assertListItemsDoNotContainText: function(textLevel, value){
    this
      .api.elements('css selector', util.format(listItemTextByLevel, textLevel, textLevel.toLowerCase()), function(result){
      for(let i = 0; i < result.value.length; i ++){
        this.elementIdText(result.value[i].ELEMENT, function(text){
          this.assert.ok(!text.value.toLowerCase().includes(value.toString().toLowerCase()),
            `All list items do not contain ${value}.`);
        });
      }
    });

    return this;
  },

  assertActiveFilterIsPresentInLfd: function(filterValue){
    this
      .waitForElementVisible('@activeFiltersGroup', this.api.globals.mediumWait)
      .api.useXpath()
      .waitForElementPresent(util.format(activeFilterByValue, filterValue), this.api.globals.mediumWait)
      .assert.visible(util.format(activeFilterByValue, filterValue), `There is an active filter with value ${filterValue}.`)
      .useCss();

    return this;
  },

  clickActiveFilterToDismissIt: function(filterValue){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(activeFilterByValue, filterValue), this.api.globals.mediumWait)
      .click(util.format(activeFilterByValue, filterValue))
      .assert.elementNotPresent(util.format(activeFilterByValue, filterValue), `There is no active filter with value ${filterValue}.`)
      .useCss();

    return this;
  },

  checkThatLfdItemHasDataByTitle: function(listItemTitle, listItemData){
    this
      .api.useXpath()
      .waitForElementPresent(util.format(listItemDataByTitle, listItemTitle, listItemData), this.api.globals.smallWait)
      .assert.visible(util.format(listItemDataByTitle, listItemTitle, listItemData),
      `The directory list item with ${listItemTitle} has data ${listItemData}.`)
      .useCss();

    return this;
  },

  clickSortListIconToOpenIt: function(){
    return this
      .waitForElementVisible('@sortListByUserIcon', this.api.globals.smallWait)
      .click('@sortListByUserIcon')
      .waitForElementVisible('@sortListByUserDropdown', this.api.globals.smallWait);
  },

  clickSortListIconToCloseIt: function(){
    return this
      .waitForElementVisible('@sortListByUserIcon', this.api.globals.smallWait)
      .click('@sortListByUserIcon')
      .waitForElementNotVisible('@sortListByUserDropdown', this.api.globals.smallWait);
  },

  checkThatSortingOptionIsAvailableForUser: function(sortingOption){
    this
      .api.useXpath()
      .waitForElementPresent(util.format(sortByUserOptionInDropdown, sortingOption), this.api.globals.smallWait)
      .assert.visible(util.format(sortByUserOptionInDropdown, sortingOption), `The user can sort the list by ${sortingOption}.`)
      .useCss();

    return this;
  },

  sortListOrderingByAscending: function(sortingOption){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(sortByUserOptionInDropdownOrder, sortingOption), this.api.globals.smallWait)
      .element('xpath', util.format(sortByUserOptionInDropdownOrder, sortingOption), (result) => {
        this.api.elementIdAttribute(result.value.ELEMENT, elementAttributes.CLASS, (attribute) => {
          if(attribute.value.includes(values.DESC) || ( ! attribute.value.includes(values.DESC) && ! attribute.value.includes(values.ASC))){
            this.api.click(util.format(sortByUserOptionInDropdownOrder, sortingOption));
          } else{
            this.api.logTestInfo('Ascending order is already on for sorting the list. There is nothing to change.');
          }
        })
      })
      .pause(2000)
      .assert.attributeContains(util.format(sortByUserOptionInDropdownOrder, sortingOption), elementAttributes.CLASS, values.ASC,
      'Ascending order is on for sorting the list.')
      .useCss();

    return this;
  },

  sortListOrderingByDescending: function(sortingOption){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(sortByUserOptionInDropdownOrder, sortingOption), this.api.globals.smallWait)
      .element('xpath', util.format(sortByUserOptionInDropdownOrder, sortingOption), (result) => {
        this.api.elementIdAttribute(result.value.ELEMENT, elementAttributes.CLASS, (attribute) => {
          if(attribute.value.includes(values.ASC)){
            this.api.click(util.format(sortByUserOptionInDropdownOrder, sortingOption));
          }
          if( ! attribute.value.includes(values.DESC) && ! attribute.value.includes(values.ASC)){
            this
              .api.click(util.format(sortByUserOptionInDropdownOrder, sortingOption))
              .click(util.format(sortByUserOptionInDropdownOrder, sortingOption));
          } else{
            this.api.logTestInfo('Descending order is already on for sorting the list. There is nothing to change.');
          }
        })
      })
      .pause(2000)
      .assert.attributeContains(util.format(sortByUserOptionInDropdownOrder, sortingOption), elementAttributes.CLASS, values.DESC,
      'Descending order is on for sorting the list.')
      .useCss();

    return this;
  },

  getLfdEntriesValuesByTextLevel: function(textLevel, sortedValues){
    this
      .api.elements('css selector', `.small-card-list-${textLevel}, .list-item-${textLevel}, .news-feed-item-${textLevel}, .news-feed-${textLevel}-category`, function(result){
      for(let i = 1; i < result.value.length + 1; i ++){
        this
          .useXpath()
          .waitForElementVisible(util.format(listItemTitle, textLevel, textLevel, textLevel, i), this.globals.smallWait)
          .getText(util.format(listItemTitle, textLevel, textLevel, textLevel, i), (text) => sortedValues.push(text.value))
          .useCss();
      }
      return sortedValues;
    });
  },

  checkThatLfdEntriesAreSortedByAscending: function(valuesToSort, textLevel, done){
    const sortedValues = []

    this
      .getLfdEntriesValuesByTextLevel(textLevel, sortedValues, () => {
        done();
      });

    this
      .api.perform(() => {
      this.assert.equal(sortedValues.toString(), valuesToSort.sort().toString(), `The sorting by ascending is correct.
        It is: ${sortedValues.toString()}.`);
    });

    return this;
  },

  checkThatLfdEntriesAreSortedByDescending: function(valuesToSort, textLevel, done){
    const sortedValues = []

    this
      .getLfdEntriesValuesByTextLevel(textLevel, sortedValues, () => {
        done();
      });

    this
      .api.perform(() => {
      this.assert.equal(sortedValues.toString(), valuesToSort.sort().reverse().toString(), `The sorting by descending is correct.
        It is: ${sortedValues}.`);
    });

    return this;
  },

  checkThatLfdEntriesAreSortedByNumberAscending: function(valuesToSort, textLevel, done){
    const sortedValues = [];

    this
      .getLfdEntriesValuesByTextLevel(textLevel, sortedValues, () => {
        done();
      });

    this
      .api.perform(() => {
      this.assert.equal(sortedValues.toString(), valuesToSort.sort((a, b) => a - b).toString(), `Number sorting by ascending is correct.
        It is: ${sortedValues}.`);
    });

    return this;
  },

  checkThatLfdEntriesAreSortedByNumberDescending: function(valuesToSort, textLevel, done){
    const sortedValues = [];

    this
      .getLfdEntriesValuesByTextLevel(textLevel, sortedValues, () => {
        done();
      });

    this
      .api.perform(() => {
      this.assert.equal(sortedValues.toString(), valuesToSort.sort((a, b) => b - a).toString(), `Number sorting by descending is correct. 
        It is: ${sortedValues}.`);
    });

    return this;
  },

  checkThatLfdEntriesAreSortedByDateAscending: function(valuesToSort, textLevel, done){
    const sortedValues = [];

    this
      .getLfdEntriesValuesByTextLevel(textLevel, sortedValues, () => {
        done();
      });

    this
      .api.perform(() => {
      this.assert.equal(sortedValues.toString().replace(/(\d{2}\s)(\w{3})(\w+)(\s\d{4})/g, '$1$2$4')
          .replace(new RegExp(' /', 'g'), '').toLowerCase(),
        valuesToSort.sort((a, b) => new Date(a) - new Date(b)).toString().toLowerCase(),
        `Date sorting by ascending is correct. It is: ${sortedValues}.`);
    });

    return this;
  },

  checkThatLfdEntriesAreSortedByDateDescending: function(valuesToSort, textLevel, done){
    const sortedValues = [];

    this
      .getLfdEntriesValuesByTextLevel(textLevel, sortedValues, () => {
        done();
      });

    this
      .api.perform(() => {
      this.assert.equal(sortedValues.toString().replace(/(\d{2}\s)(\w{3})(\w+)(\s\d{4})/g, '$1$2$4')
          .replace(new RegExp(' /', 'g'), '').toLowerCase(),
        valuesToSort.sort((a, b) => new Date(b) - new Date(a)).toString().toLowerCase(),
        `Date sorting by descending is correct. It is: ${sortedValues}.`);
    });

    return this;
  },

  clickMyBookmarks: function(){
    return this
      .waitForElementVisible('@myBookmarksIcon', this.api.globals.tinyWait)
      .click('@myBookmarksIcon')
      .assert.attributeContains('@myBookmarksIcon', elementAttributes.CLASS, values.ACTIVE,
        'My bookmarks is active.');
  },

  clickMyBookmarksIconToDismissIt: function(){
    this
      .waitForElementVisible('@myBookmarksIcon', this.api.globals.tinyWait)
      .click('@myBookmarksIcon')
      .expect.element('@myBookmarksIcon').to.have.attribute(elementAttributes.CLASS).does.not.contains(values.ACTIVE)
      .before(this.api.globals.tinyWait);

    return this;
  },

  clickBookmarkListItemByTitle: function(listItemTitle){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(bookmarkIconOnListItemByTitle, listItemTitle), this.api.globals.mediumWait)
      .pause(2000)
      .element('xpath', util.format(bookmarkIconOnListItemByTitle, listItemTitle), function(result){
        this.moveTo(result.value.ELEMENT)
          .elementIdClick(result.value.ELEMENT)
      })
      .assert.attributeContains(util.format(bookmarkIconOnListItemByTitle, listItemTitle), elementAttributes.CLASS, values.ANIMATED)
      .useCss();

    return this;
  },

  assertThatAllDisplayedListIconAreBookmarked: function(){
    this
      .api.elements('css selector', listItemBookmarkIcon, function(result){
      for(let i = 0; i < result.value.length; i ++){
        this.elementIdAttribute(result.value[i].ELEMENT, elementAttributes.CLASS, function(attribute){
          this.assert.ok(attribute.value.includes(values.ANIMATED),
            'All displayed list items are bookmarked.')
        });
      }
    });

    return this;
  },

  assertThereIsNoListItemDisplayed: function(){
    return this
      .waitForElementNotVisible('@listItemContent', this.api.globals.smallWait);
  },

  assertThereIsNoListItemPresent: function(){
    return this
      .waitForElementNotPresent('@listItemContent', this.api.globals.smallWait);
  },

  assertListItemsAreDisplayed: function(){
    return this
      .waitForElementVisible('@listItemContent', this.api.globals.smallWait);
  },

  searchForValueInLfd: function(valueToSearch){
    this
      .waitForElementVisible('@searchInputField', this.api.globals.smallWait)
      .setValue('@searchInputField', valueToSearch)
      .waitForElementVisible('@searchButton', this.api.globals.smallWait)
      .click('@searchButton')
      .expect.element('@searchQueryHolder').text.to.equal(valueToSearch);

    return this;
  },

  openLfdFiltersBlock: function(){
    return this
      .waitForElementVisible('@filtersButton', this.api.globals.mediumWait)
      .click('@filtersButton')
      .waitForElementVisible('@filtersCloseButton', this.api.globals.mediumWait);
  },

  closeLfdFiltersBlock: function(){
    return this
      .waitForElementVisible('@filtersCloseButton', this.api.globals.mediumWait)
      .click('@filtersCloseButton')
      .waitForElementVisible('@filtersButton', this.api.globals.mediumWait);
  },

  clickFilterOptionButton: function(filterOption){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(filterOptionButtonByTitle, filterOption), this.api.globals.smallWait)
      .click(util.format(filterOptionButtonByTitle, filterOption))
      .assert.attributeContains(util.format(filterOptionButtonByTitle, filterOption), elementAttributes.CLASS, values.ACTIVE,
      `The filter option ${filterOption} is selected.`)
      .useCss();

    return this;
  },

  clearSearchInLfd: function(){
    return this
      .waitForElementVisible('@clearSearchButton', this.api.globals.smallWait)
      .click('@clearSearchButton')
      .waitForElementNotVisible('@searchQueryHolder', this.api.globals.smallWait);
  },

  getListItemContentCssProperty: function(property, propertyValue) {
    this
      .api.frame(null);

    this
      .switchToPreviewFrame()
      .waitForElementVisible('@listItemContent', this.api.globals.mediumWait)
      .getCssProperty('@listItemContent', property, (value) => propertyValue.push(value.value))
      .api.frame(null);

    return this;
  },

  checkListItemContentCssProperty: function(property, propertyValue) {
    this
      .api.frame(null)

    this
      .switchToPreviewFrame()
      .waitForElementVisible('@listItemContent', this.api.globals.mediumWait)
      .assert.cssProperty('@listItemContent', property, propertyValue, `The css property ${property} is correct
      and its value is ${propertyValue}`)
      .api.frame(null);

    return this;
  },

  compareWidthValueOfListItems: function (initialWidthValue) {
    this
      .switchToPreviewFrame()
      .waitForElementVisible('@listItemContent', this.api.globals.mediumWait)
      .getCssProperty('@listItemContent', values.WIDTH, function (result) {
        this.assert.ok((Math.abs(parseInt(result.value) - parseInt(initialWidthValue)) < 2)||(result.value===initialWidthValue),
          `The width value of list is correct, ${result.value} equals ${initialWidthValue}`);
      })
      .api.frame(null);

    return this;
  },

  checkAmountOfLfdEntriesShown: function(numberToDisplay){
    return this
      .waitForElementVisible('@listItemContent', this.api.globals.smallWait)
      .assertAmountOfElementsVisible('@listItemContent', numberToDisplay);
  }
};

module.exports = {
  commands: [commands],
  elements: {
    applyFilterButton: {
      selector: '.btn.apply-filters'
    },
    filtersOverlay: {
      selector: '[class*="-filter-overlay display"]'
    },
    clickFiltersIconToOpenOverlay: {
      selector: '.fa.fa-sliders'
    },
    clearFilterButton: {
      selector: '.btn.clear-filters'
    },
    activeFiltersGroup: {
      selector: 'fieldset[data-filter-active-group]'
    },
    sortListByUserIcon: {
      selector: '.sort-group.btn-group'
    },
    sortListByUserDropdown: {
      selector: 'ul.dropdown-menu.list-sort'
    },
    myBookmarksIcon: {
      selector: '.toggle-bookmarks'
    },
    listItemContent: {
      selector: '.small-card-list-wrapper, [class*=item-inner-content], .small-h-card-list-item'
    },
    searchInputField: {
      selector: 'input.search-feed'
    },
    searchQueryHolder: {
      selector: '.current-query'
    },
    clearSearchButton: {
      selector: 'span.clear-search'
    },
    searchButton: {
      selector: '.search-holder .search-btn:first-of-type'
    },
    filtersButton: {
      selector: '.fa.fa-sliders'
    },
    filtersCloseButton: {
      selector: '.list-search-icon .fa.fa-times'
    }
  }
};