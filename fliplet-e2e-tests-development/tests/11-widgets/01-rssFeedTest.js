const globals = require('../../globals_path');
const casual = require('casual');
const widgets = require('../../utils/constants/widgets');
const rssFeedScreenName = 'RSS Feed';
const rssFeedUrl ='http://rss.cnn.com/rss/edition.rss';
const rssFeedLayoutOption = 'Thumbnail on the right';
const entriesSeparatingType = 'Thin lines';
const unreadEntryHighlightingType ='Circle';

module.exports = {
  '@disabled': (globals.smokeTest == 'true'),
  before: function (browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 01-rss-feed`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login()
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Add RSS feed to app and check it on preview screen': function (browser) {
    browser.createApplicationWithCondition(browser.globals.appNameGenerated)
      .dragAndDropWithCondition(widgets.RSS_FEED)
      .switchToWidgetInstanceFrame();
  },

  'Configure RSS Feed - check Invalid URL message with incorrect RSS feed link': function (browser) {
    const rssWidgetInterface = browser.page.rssWidgetInterface();

    rssWidgetInterface.configureRssFeedView(rssFeedLayoutOption);
    rssWidgetInterface.setRssFeedUrl('.' + rssFeedUrl);
    rssWidgetInterface.checkRssFeedContentSetting('failed');
    rssWidgetInterface.checkIncorrectRssFeedUrl('You have entered an invalid URL. Please try again')
  },

  'Configure RSS feed - correct RSS feed link': function(browser) {
    const rssWidgetInterface = browser.page.rssWidgetInterface();

    rssWidgetInterface.setRssFeedUrl(rssFeedUrl);
    rssWidgetInterface.checkRssFeedContentSetting('active checked');
  },

  'Content setting - Title and description configuration of RSS feed': function(browser){
    const rssWidgetInterface = browser.page.rssWidgetInterface();

    rssWidgetInterface.choseElementDisplayingSetting('title','Show entire title');
    rssWidgetInterface.choseElementDisplayingSetting('description', 'Clip to 4 lines')
  },

  'Design settings of RSS feed': function(browser){
    const rssWidgetInterface = browser.page.rssWidgetInterface();
    const componentScreen = browser.page.componentsScreen();

    rssWidgetInterface.designRssFeedEntriesView(entriesSeparatingType);
    rssWidgetInterface.designRssFeedEntriesView(unreadEntryHighlightingType);

    componentScreen.clickSaveAndCloseButton();
  },

  'Navigate to preview screen and check RSS feed functionality': function (browser) {
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode()
      .switchToPreviewFrame();

    previewAppScreen.checkRssElementsArePresent();
    previewAppScreen.checkRssFeedDesignSettings(unreadEntryHighlightingType.toLowerCase());
    previewAppScreen.checkRssFeedFunctionality(unreadEntryHighlightingType.toLowerCase());
  },

  'Asserting that all changes are applied to RSS feed': function (browser) {
    const previewAppScreen = browser.page.previewAppScreen();

    previewAppScreen.checkRssFeedConfigurationSettings(rssFeedLayoutOption.split(" ").slice(-1));
    previewAppScreen.checkRssFeedConfigurationSettings(entriesSeparatingType.substring(entriesSeparatingType.lastIndexOf(" ") +1,
      entriesSeparatingType.length-1));
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};