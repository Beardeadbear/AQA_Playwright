const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const updateText = casual.text;
const newTokenName = casual.word;
const screenName = 'First screen';

module.exports = {
  before : function(browser, done) {
    browser.globals.appNameGenerated = `${casual.letter}-${casual.word}-${casual.letter} 07-publish-app`;
    browser.globals.tokenLink = [];

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and publish first version of web application': function(browser){
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.CLIENT_SUPPORT);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');

    publish
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish
      .closePublishOverlay()
      .clickVersionHistoryButton();

    publish.assertApplicationVersionNumber(1);
  },

  'Publishing second version of web application': function(browser){
    const publish = browser.page.publishScreen();

    publish
      .closePublishOverlay()
      .clickUpdateYourAppsButton()
      .confirmApplicationUpdate()
      .enterUpdateText(updateText)
      .clickUpdateButton()
      .assertApplicationVersionOnUpdateScreen(2);

    publish
      .closePublishOverlay()
      .clickVersionHistoryButton();

    publish.assertApplicationVersionNumber(2);
  },

  'Accessing a web app using generated URL': function(browser){
    const publish = browser.page.publishScreen();

    publish
      .closePublishOverlay()
      .clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');

    publish.clickOpenUrlButtonAndSwitchToOpenedWindow();

    browser.assert.title(`${screenName} - ${browser.globals.appNameGenerated}`);
  },

  'Accessing a web app using public token': function (browser) {
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();

    apps
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');

    publish.assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish
      .clickSeeEmbedCodeButton()
      .getTokenLink(browser.globals.tokenLink);

    browser.perform(() => publish.checkThatPageWithAppLinkIsOpened(browser.globals.tokenLink));

    publish.openWebApplicationByLinkFromToken(screenName, browser.globals.appNameGenerated);
  },

  'Create a new token from publish screen': function (browser) {
    const apps = browser.page.appsPage();
    const editApp = browser.page.editAppScreen();
    const publish = browser.page.publishScreen();

    apps
      .navigate()
      .waitForAppsPageToBeLoaded()
      .openAppByName(browser.globals.appNameGenerated);

    editApp.clickPublishMenuItem();

    publish.clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL');

    publish.assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated);
    publish
      .clickSeeEmbedCodeButton()
      .clickSelectDifferentAppTokenButton()
      .clickCreateNewTokenButton();

    publish
      .enterNewTokenName(newTokenName)
      .clickOkButton();

    publish.getTokenLink(browser.globals.tokenLink);

    browser.perform(()=>
      publish
        .assertNewTokenValueNotMatchPrevious(browser.globals.tokenLink)
        .checkThatPageWithAppLinkIsOpened(browser.globals.tokenLink[1])
    );

    publish.openWebApplicationByLinkFromToken(screenName, browser.globals.appNameGenerated);
  },

  'Deleting created applications': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};