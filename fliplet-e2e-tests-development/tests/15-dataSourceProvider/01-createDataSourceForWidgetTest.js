const widgets = require('../../utils/constants/widgets');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const casual = require('casual');
const screensTitles = {
  screenWithLogin: 'First screen',
  screenToRedirect: 'Second screen',
};
const usersInfo = [
  {
    "name": casual.full_name,
    "email": casual.email.toLowerCase(),
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  },
  {
    "name": casual.full_name,
    "email": casual.email.toLowerCase(),
    "password": casual.password,
    "company": casual.word,
    "position": casual.title
  }
];
const columns = Object.keys(usersInfo[0]);
const dataSourceId = [];

module.exports = {

  '@reference': 'https://weboo.atlassian.net/browse/OD-1',

  before: function(browser, done){
    browser.globals.appNameGenerated = `${casual.letter} ${casual.word} ${casual.letter} 01-create-ds-provider`;
    browser.globals.dataSourceNameGenerated = `${casual.title} 01-create-ds-provider`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated], done)
      .login();
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Create a new app and add Login component to the screen': function(browser){
    browser
      .createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.BLANK)
      .newDragAndDrop(widgets.LOGIN)
      .waitForWidgetInterfaceNewDnd(widgets.LOGIN)
      .switchToWidgetInstanceFrame();
  },

  'Create a new data source in data source provider in Login configurations': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const componentsScreen = browser.page.componentsScreen();

    dataSourceProvider
      .clickCreateNewDataSource()
      .enterNameForDataSource(browser.globals.dataSourceNameGenerated)
      .confirmDataSourceProviderModal()
      .checkThatCorrectDataSourceIsSelectedInDropdownList(browser.globals.dataSourceNameGenerated);

    componentsScreen.clickSaveAndCloseButton();
  },

  'Get the id of the created data source': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const editApp = browser.page.editAppScreen();

    browser.checkThatComponentIsPresentOnPreviewScreen(widgets.LOGIN);

    editApp.openDetailsOfComponentByClickingOnIt(widgets.LOGIN);

    dataSourceProvider.getDataSourceIdFromSelectedDataSourceInProvider(dataSourceId);
  },

  'Fill in the created data source with user data and check that it has been updated': function(browser){
    const dataSourceProvider = browser.page.dataSourceProvider();
    const dataSource = browser.page.singleDataSourcePage();
    const dataSourceManagerOverlay = browser.page.dataSourceManagerOverlay();

    browser.fillInDataSourceViaApi(dataSourceId[0], usersInfo);

    dataSourceProvider.clickViewDataSource();

    dataSourceManagerOverlay.assertDataSourceManagerOverlayIsOpenAndSwitchToIt();

    dataSource
      .assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated)
      .assertDataSourceColumnNamesAreCorrect(columns);

    dataSourceManagerOverlay.closeDataSourceManagerOverLay();
  },

  'Connect the data source with users list to login component and choose a screen to redirect after login': function(browser){
    const componentsScreen = browser.page.componentsScreen();

    componentsScreen
      .selectFieldsForLoginFromDataSourceColumnNames(columns.slice(1, 3))
      .switchToFlWidgetFrameByNumber(2)
      .selectScreenForLinkingByName(screensTitles.screenToRedirect)
      .clickSaveAndCloseButton();
  },

  'Publish the application and open it on web': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const publishScreen = browser.page.publishScreen();

    appTopFixedNavigationBar.navigateToPublishMode();

    publishScreen
      .clickSelectButtonNearPublishingOptionByChannelName('Publish to the web via a URL')
      .clickPublishButton()
      .assertGeneratedAppUrlContainsAppName(browser.globals.appNameGenerated)
      .clickOpenUrlButtonAndSwitchToOpenedWindow();
  },

  'Login to the web application as the first user and check the screen title after redirection': function(browser){
    const webApp = browser.page.webApplicationPages();

    webApp
      .checkPageTitle(`${screensTitles.screenWithLogin} - ${browser.globals.appNameGenerated}`)
      .assertWidgetIsPresentOnScreen(widgets.LOGIN)
      .enterEmailAndPasswordForLogin(usersInfo[0].email, usersInfo[0].password)
      .submitLoginForm()
      .assertLoginIsSuccessful()
      .checkPageTitle(`${screensTitles.screenToRedirect} - ${browser.globals.appNameGenerated}`);
  },

  'Delete the created application and data source': function(browser){
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated, browser.globals.dataSourceNameGenerated]);
  }
};