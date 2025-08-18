const appName = 'Complex test app 3.0';
const appMetricsLabels = ['Active devices', 'New devices', 'Sessions', 'Screen views', 'Interactions'];
const screenColumnsHeaders = ['Screen name', 'Event category', 'Event action', 'Event label', 'Count'];
const userColumnsHeaders = ['User', 'Screen', 'Type', 'Event category', 'Event action', 'Event label', 'Count'];
const analyticsSectionOptions = ['Sessions', 'Screen views', 'Interactions'];
const analyticsSectionOptionForUsers = analyticsSectionOptions[Math.floor(Math.random() * analyticsSectionOptions.length)];
const analyticsSectionOptionForScreens = analyticsSectionOptions[Math.floor(Math.random() * analyticsSectionOptions.length)];

module.exports = {
  before: function(browser){
    browser.login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Open App Analytics and check its sections': function(browser){
    const appsPage = browser.page.appsPage();
    const appAnalyticsOverlay = browser.page.appAnalyticsOverlay();

    appsPage.navigate()
      .waitForAppsPageToBeLoaded()
      .assertApplicationIsPresentInListByName(appName)
      .openAnalyticsByAppName(appName);

    appAnalyticsOverlay.checkThatAnalyticsOverlayIsOpen()
      .checkThatAppAnalyticsContentIsVisible();
  },

  'Check Timeframe section': function(browser){
    const appAnalyticsOverlay = browser.page.appAnalyticsOverlay();

    appAnalyticsOverlay.checkTimeframeSectionElements()
      .openTimeframeOptionsForAnalytics()
      .checkThatTimeframeOptionsForAnalyticsIsOpen()
      .selectTimeRangeForAnalytics('Custom dates')
      .checkCustomDatesOptionIsSelected()
      .selectInvalidDatesForAnalytics()
      .checkThatInvalidDateMessageIsShown()
      .enterValidCustomDate()
      .checkThatInvalidDateMessageIsNotShown()
      .selectTimeRangeForAnalytics('Last 30 days')
      .clickApplyButtonForAnalyticsTimeRange();
  },

  'Check Timeline section': function(browser){
    const appAnalyticsOverlay = browser.page.appAnalyticsOverlay();

    appAnalyticsOverlay.checkAnalyticsTimelineChart()
      .checkPossibilityToChoosePeriodForTimeline('Current')
      .checkPossibilityToChoosePeriodForTimeline('Prior')
      .checkThatChartIsEmptyWhenAllPeriodsAreOff();
  },

  'Check App Metrics section': function(browser){
    const appAnalyticsOverlay = browser.page.appAnalyticsOverlay();

    appAnalyticsOverlay.checkAppMetricsTable(appMetricsLabels);
  },

  'Check Most Popular Screens section': function(browser){
    const appAnalyticsOverlay = browser.page.appAnalyticsOverlay();

    appAnalyticsOverlay.checkMostPopularScreens()
      .chooseOptionForMostActiveSection('MOST POPULAR SCREENS', analyticsSectionOptionForScreens)
      .clickSeeAllForAnalyticsSection('MOST POPULAR SCREENS')
      .checkOptionForMostActiveUser(analyticsSectionOptionForScreens)
      .checkSortingOptionOnDetailedScreenLayout()
      .checkEntriesAmountChangingInTable(25)
      .checkSearchOptionInDetailedScreenLayout()
      .closeTableWithDetailedInfo();
  },

  'Check Most Active Users section': function(browser){
    const appsPage = browser.page.appsPage();
    const appAnalyticsOverlay = browser.page.appAnalyticsOverlay();

    appsPage.openAnalyticsByAppName(appName);

    appAnalyticsOverlay.checkThatAnalyticsOverlayIsOpen()
      .chooseOptionForMostActiveSection('MOST ACTIVE USERS', analyticsSectionOptionForUsers)
      .clickSeeAllForAnalyticsSection('MOST ACTIVE USERS')
      .checkOptionForMostActiveUser(analyticsSectionOptionForUsers)
      .checkSortingOptionOnDetailedScreenLayout()
      .checkEntriesAmountChangingInTable(50)
      .checkSearchOptionInDetailedScreenLayout()
      .closeTableWithDetailedInfo();
  },

  'Check Interaction Per Screen section': function(browser){
    const appsPage = browser.page.appsPage();
    const appAnalyticsOverlay = browser.page.appAnalyticsOverlay();

    appsPage.openAnalyticsByAppName(appName);

    appAnalyticsOverlay.checkThatAnalyticsOverlayIsOpen()
      .checkInteractionPerSectionOpening('Screen')
      .checkTableColumns(screenColumnsHeaders)
      .checkEntriesAmountChangingInTable(100)
      .checkSearchOptionInDetailedScreenLayout()
      .checkTableColumnsSorting()
      .checkSearchOptionInTableColumns()
      .closeTableWithDetailedInfo();
  },

  'Check Actions Per User section': function(browser){
    const appsPage = browser.page.appsPage();
    const appAnalyticsOverlay = browser.page.appAnalyticsOverlay();

    appsPage.openAnalyticsByAppName(appName);

    appAnalyticsOverlay.checkThatAnalyticsOverlayIsOpen()
      .checkInteractionPerSectionOpening('User')
      .checkTableColumns(userColumnsHeaders)
      .checkPagination()
      .checkEntriesAmountChangingInTable(500)
      .checkSearchOptionInDetailedScreenLayout()
      .checkTableColumnsSorting()
      .checkSearchOptionInTableColumns()
      .closeTableWithDetailedInfo();
  }
};