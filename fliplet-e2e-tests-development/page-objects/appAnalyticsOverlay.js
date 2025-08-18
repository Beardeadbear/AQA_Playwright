const elementAttributes = require('../utils/constants/elementAttributes');
const elementProperties = require('../utils/constants/elementProperties');
const colors = require('../utils/constants/colors');
const values = require('../utils/constants/values');

const commands = {
  checkThatAnalyticsOverlayIsOpen: function(){
    return this
      .waitForElementVisible('@analyticsOverlayHeader', this.api.globals.longWait)
      .assert.containsText('@analyticsOverlayHeader', 'App Analytics', 'App Analytics overlay is open.')
      .waitForElementVisible('@analyticsOverlayContent', this.api.globals.longWait)
      .waitForElementVisible('@analyticsOverlayCloseButton', this.api.globals.longWait)
      .switchToWidgetProviderFrame()
      .waitForElementNotVisible('@loadAppAnalyticsProgressBar', this.api.globals.longWait);
  },

  checkThatAppAnalyticsContentIsVisible: function(){
    this
      .expect.section('@timeframe').to.be.visible.before(this.api.globals.longWait);
    this
      .expect.section('@timeline').to.be.visible.before(this.api.globals.longWait);
    this
      .expect.section('@appMetrics').to.be.visible.before(this.api.globals.longWait);
    this
      .expect.section('@mostPopularScreens').to.be.visible.before(this.api.globals.longWait);
    this
      .expect.section('@mostActiveUsers').to.be.visible.before(this.api.globals.longWait);
    this
      .expect.section('@interactionsPerScreen').to.be.visible.before(this.api.globals.longWait);
    this
      .expect.section('@actionsPerUser').to.be.visible.before(this.api.globals.longWait);

    return this;
  },

  checkTimeframeSectionElements: function(){
    return this
      .waitForElementVisible('@timeframeSectionInfo', this.api.globals.tinyWait)
      .assert.visible('@timeframeSectionCalendar', 'Timeframe section is available.');
  },

  openTimeframeOptionsForAnalytics: function(){
    return this
      .waitForElementVisible('@timeframeSectionCalendar', this.api.globals.tinyWait)
      .click('@timeframeSectionCalendar')
      .waitForElementVisible('@appAnalyticsSectionTitle', this.api.globals.longWait);
  },

  checkThatTimeframeOptionsForAnalyticsIsOpen: function(){
    const optionLocator = '.options-row label.radio-label';

    this
      .api.elements('css selector', optionLocator, function(result){
      this.assertAmountOfElementsVisible(optionLocator, result.value.length);
    });

    return this;
  },

  checkCustomDatesOptionIsSelected: function(){
    return this
      .waitForElementVisible('@customDatesContent', this.api.globals.mediumWait)
      .waitForElementVisible('@startDateInput', this.api.globals.mediumWait)
      .waitForElementVisible('@endDateInput', this.api.globals.mediumWait);
  },

  selectInvalidDatesForAnalytics: function(){
    const resultDisplaying = [];

    this
      .waitForElementVisible('@startDateInput', this.api.globals.tinyWait)
      .click('@startDateInput')
      .waitForElementVisible('@datePicker', this.api.globals.mediumWait)
      .waitForElementVisible('@lastActiveCurrentMonthDate', this.api.globals.tinyWait)
      .click('@lastActiveCurrentMonthDate')
      .waitForElementNotPresent('@datePicker', this.api.globals.mediumWait)
      .waitForElementVisible('@endDateInput', this.api.globals.tinyWait)
      .click('@endDateInput')
      .waitForElementVisible('@firstActiveCurrentMonthDate', this.api.globals.tinyWait)
      .click('@firstActiveCurrentMonthDate')
      .waitForElementPresentWithoutErrors('@invalidCustomDateMessage', 5000, resultDisplaying)
      .api.perform(() => {
      if(resultDisplaying[0] == false){ // if the error message is not present
        this.click('@endDateInput')
          .waitForElementVisible('@datePicker', this.api.globals.tinyWait)
          .waitForElementVisible('@previousMonthPaginationButton', this.api.globals.tinyWait)
          .click('@previousMonthPaginationButton')
          .waitForElementVisible('@lastActiveCurrentMonthDate', this.api.globals.tinyWait)
          .click('@lastActiveCurrentMonthDate');
      }
    });

    return this;
  },

  checkThatInvalidDateMessageIsShown: function(){
    return this
      .waitForElementVisible('@invalidCustomDateMessage', this.api.globals.smallWait)
      .assert.containsText('@invalidCustomDateMessage', "Please enter a valid end date", 'The invalid dates message is shown.');
  },

  checkThatInvalidDateMessageIsNotShown: function(){
    return this
      .assert.elementNotPresent('@invalidCustomDateMessage', 'The invalid dates message is not shown.');
  },

  enterValidCustomDate: function(){
    return this
      .waitForElementVisible('@startDateInput', this.api.globals.tinyWait)
      .click('@startDateInput')
      .waitForElementVisible('@datePicker', this.api.globals.mediumWait)
      .click('@previousMonthPaginationButton')
      .waitForElementVisible('@firstActiveCurrentMonthDate', this.api.globals.tinyWait)
      .click('@firstActiveCurrentMonthDate');
  },

  selectTimeRangeForAnalytics: function(timeRange){
    const timeRangeOptionLocator = `//input[@value="${timeRange.replace(new RegExp(' ', 'g'), '-').toLowerCase()}"]//parent::*/div`;

    this
      .api.useXpath()
      .waitForElementPresent(timeRangeOptionLocator, this.api.globals.smallWait)
      .useCss()
      .element('xpath', timeRangeOptionLocator, (result) => {
        this.api.elementIdSelected(result.value.ELEMENT, (selected) => {
          if(selected.value !== true){
            this
              .api.elementIdClick(result.value.ELEMENT);
          }
        });
      });

    return this;
  },

  clickApplyButtonForAnalyticsTimeRange: function(){
    return this
      .waitForElementVisible('@applyButtonForAnalyticsTimeRange', this.api.globals.smallWait)
      .click('@applyButtonForAnalyticsTimeRange')
      .waitForElementNotVisible('@applyButtonForAnalyticsTimeRange', this.api.globals.longWait)
      .waitForElementNotVisible('@loadAppAnalyticsProgressBar', this.api.globals.longWait);
  },

  checkAnalyticsTimelineChart: function(){
    const timelineOptionButtonLocator = '.timeline-radio-selectors .radio-label';
    const timelineChartLocator = '.highcharts-background';

    this
      .waitForElementVisible(timelineChartLocator, this.api.globals.longWait)
      .api.elements('css selector', timelineOptionButtonLocator, function(result){
      this.assertAmountOfElementsVisible(timelineOptionButtonLocator, result.value.length)
      for(let i = result.value.length; i > 0; i --){
        this.elementIdClick(result.value[i - 1].ELEMENT)
          .waitForElementVisible(timelineChartLocator, this.globals.smallWait);
      }
    });

    return this;
  },

  checkPossibilityToChoosePeriodForTimeline: function(period){
    const periodPickerForChartLocator = `//*[contains(@class, 'highcharts-legend-item')]//*[text()='${period} period' ]`;

    this
      .api.useXpath()
      .waitForElementVisible(periodPickerForChartLocator, this.api.globals.tinyWait)
      .assert.cssProperty(periodPickerForChartLocator, elementProperties.COLOR, colors.BLACK.RGBA,
      'The period chart is enabled.')
      .click(periodPickerForChartLocator)
      .assert.cssProperty(periodPickerForChartLocator, elementProperties.COLOR, colors.LIGHT_GREY.RGBA,
      'The period chart is disabled.')
      .useCss();

    return this;
  },

  checkThatChartIsEmptyWhenAllPeriodsAreOff: function(){
    return this
      .waitForElementVisible('@emptyAnalyticsChart', this.api.globals.smallWait)
      .assert.containsText('@emptyAnalyticsChart', 'No data to display', 'All chart periods are off for analytics.');
  },

  checkAppMetricsTable: function(labels){
    this
      .api.perform(function(){
      for(let i = 0; i < labels.length; i ++){
        this
          .api.useXpath()
          .assert.visible(`(//div/span[@class="analytics-box-number"])[${i + 1}]`, 'The numbers are present in App Metrics section.')
          .assert.visible(`(//div/span[@class="analytics-box-text-span"])[${i + 1}]`, 'The labels are present in App Metrics section.')
          .assert.containsText(`(//div/span[@class="analytics-box-text-span"])[${i + 1}]`, labels[i],
          'The labels have correct texts in App Metrics section.')
          .useCss();
      }
    });

    return this;
  },

  checkMostPopularScreens: function(){
    const screenButtonLocator = '.screens-radio-selectors .radio-label-btn';
    const screenDataLocator = '.analytics-row-wrapper.analytics-row-wrapper-screen';

    this
      .api.elements('css selector', screenButtonLocator, function(result){
      this.assertAmountOfElementsVisible(screenButtonLocator, result.value.length)
      for(let i = result.value.length; i > 0; i --){
        this.elementIdClick(result.value[i - 1].ELEMENT)
          .waitForElementVisible(screenDataLocator, this.globals.smallWait);
      }
    });

    return this;
  },

  checkSearchOptionInDetailedScreenLayout: function(){
    const screensRows = 'tbody tr[role="row"]';

    this
      .waitForElementVisible('@firstCellInFirstColumnAnalyticsTable', this.api.globals.longWait)
      .getText('@firstCellInFirstColumnAnalyticsTable', (result) => {
        this.logTestInfo('Search value for the test is' + result.value)
          .waitForElementVisible('@searchInputInDetailedView', this.api.globals.longWait)
          .click('@searchInputInDetailedView')
          .setValue('@searchInputInDetailedView', result.value)
          .waitForElementNotVisible('@processingLoad', this.api.globals.mediumWait)
          .api.pause(2000)
          .elements('css selector', screensRows, (elements) => {
            for(let i = 0; i < elements.value.length; i ++){
              this.api.elementIdText(elements.value[i].ELEMENT, elementsText => {
                this.assert.ok((elementsText.value.toUpperCase()).includes(result.value.toUpperCase()), 'Search result is correct.');
              });
            }
          });
      });

    return this;
  },

  checkSortingOptionOnDetailedScreenLayout: function(){
    const lastPaginationButtonLocator = '//*[contains(@class,"paginate_button")][last()]';
    const paginationButtons = 'span a.paginate_button';
    const firstValue = '(//td[@class="sorting_1"])[1]';
    const lastValue = '(//td[@class="sorting_1"])[last()]';
    const secondColumnTitleInAnalyticsTable = '(//tr[@role="row"]/th)[2]';
    const sortingAsdArrow = '//th[@class="sorting_asc"]';

    this
      .api.useXpath()
      .pause(2000)
      .waitForElementVisible(firstValue, this.api.globals.mediumWait)
      .getText(firstValue, (result1) => {
        this.api.elements('css selector', paginationButtons, function(elements){
          if(elements.value.length > 1){ //if there are more than one page in the table
            this.waitForElementVisible(lastPaginationButtonLocator, this.globals.mediumWait)
              .click(lastPaginationButtonLocator)
              .pause(2000);
          }
        })
          .waitForElementVisible(lastValue, this.api.globals.mediumWait)
          .getText(lastValue, (result2) => {
            this.waitForElementVisible(secondColumnTitleInAnalyticsTable, this.api.globals.mediumWait)
              .click(secondColumnTitleInAnalyticsTable)
              .waitForElementVisible(sortingAsdArrow, this.api.globals.mediumWait)
              .api.pause(2000)
              .getText(firstValue, (result3) => {
                this.api.elements('css selector', paginationButtons, function(elements){
                  if(elements.value.length > 1){ //if there are more than one page in the table
                    this.waitForElementVisible(lastPaginationButtonLocator, this.globals.mediumWait)
                      .click(lastPaginationButtonLocator)
                      .pause(2000);
                  }
                })
                  .getText(lastValue, (result4) => {
                    this.assert.equal(result3.value, result2.value)
                      .assert.equal(result1.value, result4.value, "Sorting is correct.");
                  })
              })
          })
      })
      .useCss();

    return this
      .waitForElementVisible('@sortingAsdArrow', this.api.globals.mediumWait);
  },

  chooseOptionForMostActiveSection(section, analyticsSectionOption){
    const mostActiveOptionButtonLocator = `//div[contains(text(),"${section}")]/parent::div//span[@class='radio-label-btn' and text()="${analyticsSectionOption}"]`;

    this
      .api.useXpath()
      .waitForElementVisible(mostActiveOptionButtonLocator, this.api.globals.mediumWait)
      .click(mostActiveOptionButtonLocator)
      .assert.cssProperty(mostActiveOptionButtonLocator, elementProperties.BACKGROUND_COLOR, colors.BLACK.RGBA,
      'The correct button is selected.')
      .useCss();

    return this;
  },

  clickSeeAllForAnalyticsSection: function(section){
    const seeMoreLinkLocator = `//div[contains(text(),"${section}")]/parent::div//div[contains(@class, 'see-more')]`;

    this
      .api.useXpath()
      .waitForElementVisible(seeMoreLinkLocator, this.api.globals.tinyWait)
      .click(seeMoreLinkLocator)
      .useCss();

    return this
      .waitForElementVisible('@analyticsOptionsOverlay', this.api.globals.mediumWait);
  },

  checkOptionForMostActiveUser: function(option){
    return this
      .waitForElementVisible('@analyticsOptionsOverlayTitle', this.api.globals.longWait)
      .assert.containsText('@analyticsOptionsOverlayTitle', option, "Correct option data is shown.");
  },

  checkTableColumnsSorting: function(){
    return this
      .waitForElementVisible('@secondColumnLabelInAnalyticsTable', this.api.globals.mediumWait)
      .assert.attributeContains('@secondColumnLabelInAnalyticsTable', elementAttributes.CLASS, 'sorting',
        'Sorting is disabled.')
      .moveToElement('@secondColumnLabelInAnalyticsTable', 5, 5, function(){
        this.mouseButtonClick();
      })
      .waitForElementNotVisible('@processingLoad', this.api.globals.mediumWait)
      .assert.attributeContains('@secondColumnLabelInAnalyticsTable', elementAttributes.CLASS, 'sorting_asc',
        'ACS sorting is enabled.')
      .moveToElement('@secondColumnLabelInAnalyticsTable', 5, 5, function(){
        this.mouseButtonClick();
      })
      .waitForElementNotVisible('@processingLoad', this.api.globals.mediumWait)
      .assert.attributeContains('@secondColumnLabelInAnalyticsTable', elementAttributes.CLASS, 'sorting_desc',
        'DESC sorting is enabled.');
  },

  checkSearchOptionInTableColumns: function(){
    const screensRows = 'tbody tr[role="row"] td:nth-of-type(3)';

    this
      .waitForElementVisible('@firstCellInThirdColumnInAnalyticsTable', this.api.globals.longWait)
      .getText('@firstCellInThirdColumnInAnalyticsTable', (result) => {
        this.logTestInfo('Search value is ' + result.value)
          .waitForElementVisible('@searchInputInThirdColumnTitle', this.api.globals.longWait)
          .click('@searchInputInThirdColumnTitle')
          .setValue('@searchInputInThirdColumnTitle', result.value)
          .waitForElementNotVisible('@processingLoad', this.api.globals.mediumWait)
          .api.pause(2000)
          .elements('css selector', screensRows, (elements) => {
            for(let i = 0; i < elements.value.length; i ++){
              this.api.elementIdText(elements.value[i].ELEMENT, elementsText => {
                this.assert.ok((elementsText.value.toUpperCase()).includes(result.value.toUpperCase()), 'Search result is correct.');
              })
            }
          });
      });

    return this;
  },

  closeTableWithDetailedInfo: function(){
    return this
      .waitForElementVisible('@analyticsOptionsCloseButton', this.api.globals.tinyWait)
      .click('@analyticsOptionsCloseButton')
      .waitForElementNotPresent('@analyticsOptionsCloseButton', this.api.globals.smallWait)
      .closeOverlay();
  },

  checkInteractionPerSectionOpening: function(option){
    const interactionPerScreenHeaderSectionLocator = `.analytics-box.actions-by-${option.toLowerCase()} > span`;

    return this
      .waitForElementVisible(interactionPerScreenHeaderSectionLocator, this.api.globals.mediumWait)
      .assert.containsText(interactionPerScreenHeaderSectionLocator, `${option.toUpperCase()}`)
      .click(interactionPerScreenHeaderSectionLocator)
      .waitForElementVisible('@exportVisibleEntriesToExcelButton', this.api.globals.longWait)
      .assert.containsText('@appAnalyticsSectionTitle', `${option.toUpperCase()}`, 'Section is shown correctly.');
  },

  checkTableColumns: function(labels){
    this
      .api.perform(function(){
      for(let i = 0; i < labels.length; i ++){
        this
          .api.useXpath()
          .assert.visible(`(//*[@class='dataTables_scrollHead']//tr[@role="row"]/th)[${i + 1}]`, 'The table has columns labels.')
          .assert.containsText(`(//*[@class='dataTables_scrollHead']//tr[@role="row"]/th)[${i + 1}]`, labels[i],
          'The table has correct columns titles.')
          .useCss();
      }
    });

    return this;
  },

  checkEntriesAmountChangingInTable: function(entriesPerPage){
    const entriesPerPageOptionLocator = `//div[contains(@class, "active")]//label/select/option[text()='${entriesPerPage}']`;

    this
      .waitForElementVisible('@amountOfEntriesToDisplayDropdown', this.api.globals.longWait)
      .click('@amountOfEntriesToDisplayDropdown')
      .api.useXpath()
      .waitForElementVisible(entriesPerPageOptionLocator, this.api.globals.mediumWait)
      .click(entriesPerPageOptionLocator)
      .expect.element(entriesPerPageOptionLocator).to.be.selected.before(this.api.globals.smallWait);

    this
      .api.pause(2000)
      .useCss();

    return this;
  },

  checkPagination: function(){
    return this
      .waitForElementVisible('@previousPaginationButton', this.api.globals.smallWait)
      .assert.attributeContains('@previousPaginationButton', elementAttributes.CLASS, values.DISABLED,
        'Previous pagination button is disabled.')
      .waitForElementVisible('@lastPaginationButton', this.api.globals.smallWait)
      .click('@lastPaginationButton')
      .waitForElementNotVisible('@processingLoad', this.api.globals.mediumWait)
      .assert.attributeEquals('@previousPaginationButton', elementAttributes.CLASS, 'paginate_button previous',
        'Previous pagination button is enabled.')
      .assert.attributeContains('@nextPaginationButton', elementAttributes.CLASS, values.DISABLED,
        'Next pagination button is disabled.')
      .click('@firstPaginationButton')
      .waitForElementNotVisible('@processingLoad', this.api.globals.mediumWait)
      .assert.attributeContains('@firstPaginationButton', elementAttributes.CLASS, values.CURRENT,
        'The current page is correct.')
      .assert.attributeContains('@nextPaginationButton', elementAttributes.CLASS, 'paginate_button next',
        'Next pagination button is enabled.');
  },

  clickPaginationButton: function(pageNumber = 2){
    const paginationButtonLocator = `//*[contains(@class,"paginate_button ") and text()="${pageNumber}"]`;

    this
      .api.useXpath()
      .waitForElementVisible(paginationButtonLocator, this.api.globals.smallWait)
      .pause(5000)
      .click(paginationButtonLocator)
      .assert.attributeContains(paginationButtonLocator, elementAttributes.CLASS, values.CURRENT)
      .useCss();

    return this;
  }
};

module.exports = {
  commands: [commands],
  sections: {
    timeframe: {
      selector: '.analytics-box.timeframe-text',
    },
    timeline: {
      selector: '//div[contains(text(),"TIMELINE")]/parent::div',
      locateStrategy: 'xpath'
    },
    appMetrics: {
      selector: '//div[contains(text(),"APP METRICS")]/parent::div',
      locateStrategy: 'xpath'
    },
    mostPopularScreens: {
      selector: '//div[contains(text(),"MOST POPULAR SCREENS")]/parent::div',
      locateStrategy: 'xpath'
    },
    mostActiveUsers: {
      selector: '//div[contains(text(),"MOST ACTIVE USERS")]/parent::div',
      locateStrategy: 'xpath'
    },
    interactionsPerScreen: {
      selector: '.analytics-box.actions-by-screen',
    },
    actionsPerUser: {
      selector: '.analytics-box.actions-by-user'
    }
  },
  elements: {
    analyticsOverlayCloseButton: {
      selector: '.overlay-close'
    },
    analyticsOverlayContent: {
      selector: '.app-analytics'
    },
    analyticsOverlayHeader: {
      selector: '.overlay-content-header h3'
    },
    loadAppAnalyticsProgressBar: {
      selector: 'div.loader'
    },
    exportVisibleEntriesToExcelButton: {
      selector: '.active .dt-button.buttons-excel'
    },
    startDateInput: {
      selector: '//*[@placeholder="Start date"]',
      locateStrategy: 'xpath'
    },
    endDateInput: {
      selector: '//*[@placeholder="End date"]',
      locateStrategy: 'xpath'
    },
    datePicker: {
      selector: '//div[contains(@class,"datepicker ")]',
      locateStrategy: 'xpath'
    },
    firstActiveCurrentMonthDate: {
      selector: '(//td[@class="day"])[1]',
      locateStrategy: 'xpath'
    },
    lastActiveCurrentMonthDate: {
      selector: '(//td[@class="day"])[last()]',
      locateStrategy: 'xpath'
    },
    invalidCustomDateMessage: {
      selector: '.custom-dates-alert.custom-end-date-alert.active'
    },
    previousMonthPaginationButton: {
      selector: '//*[@class="datepicker-days"]//*[@class="prev"]',
      locateStrategy: 'xpath'
    },
    appAnalyticsSectionTitle: {
      selector: '.active .header-title'
    },
    applyButtonForAnalyticsTimeRange: {
      selector: '.apply-button'
    },
    customDatesContent: {
      selector: '.custom-dates-hidden-content'
    },
    timeframeSectionInfo: {
      selector: '.analytics-box.timeframe-text'
    },
    timeframeSectionCalendar: {
      selector: '.fa.fa-calendar'
    },
    emptyAnalyticsChart: {
      selector: '.highcharts-root'
    },
    analyticsOptionsOverlay: {
      selector: '.full-screen-overlay.active'
    },
    analyticsOptionsOverlayTitle: {
      selector: '//*[contains(@class,"active")]//thead/*[@role="row"]/th[2]',
      locateStrategy: 'xpath'
    },
    analyticsOptionsCloseButton: {
      selector: '.full-screen-overlay.active .close-button'
    },
    firstCellInFirstColumnAnalyticsTable: {
      selector: '(//tr[@role="row"]/td)[1]',
      locateStrategy: 'xpath'
    },
    firstCellInThirdColumnInAnalyticsTable: {
      selector: '(//tr[@role="row"]/td)[3]',
      locateStrategy: 'xpath'
    },
    secondColumnLabelInAnalyticsTable: {
      selector: '(//tr[@role="row"]/th)[2]',
      locateStrategy: 'xpath'
    },
    searchInputInThirdColumnTitle: {
      selector: '(//tr[@role="row"]/th/input)[3]',
      locateStrategy: 'xpath'
    },
    sortingAsdArrow: {
      selector: '//th[@class="sorting_asc"]',
      locateStrategy: 'xpath'
    },
    searchInputInDetailedView: {
      selector: 'input[type="search"]'
    },
    amountOfEntriesToDisplayDropdown: {
      selector: '//div[contains(@class, "active")]//div/label/select',
      locateStrategy: 'xpath'
    },
    previousPaginationButton: {
      selector: '//*[contains(@class,"paginate_button ")  and text()="Previous"]',
      locateStrategy: 'xpath'
    },
    nextPaginationButton: {
      selector: '//*[contains(@class,"paginate_button ")  and text()="Next"]',
      locateStrategy: 'xpath'
    },
    lastPaginationButton: {
      selector: '//*[@class= "paginate_button "][last()]',
      locateStrategy: 'xpath'
    },
    firstPaginationButton: {
      selector: '//span/*[contains(@class,"paginate_button ") and text()="1"]',
      locateStrategy: 'xpath'
    },
    processingLoad: {
      selector: '[id*=processing]'
    }
  }
};