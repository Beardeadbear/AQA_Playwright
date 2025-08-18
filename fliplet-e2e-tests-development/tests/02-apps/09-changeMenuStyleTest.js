const globals = require('../../globals_path');
const casual = require('casual');
const applicationTemplates = require('../../utils/constants/applicationTemplates');
const menuStyles = ['Overlay', 'Circle', 'Eversheds Menu', 'Push in', 'Slide in', 'Swipe'];//list of all menus except a default one
const menuStyle = menuStyles[Math.floor(Math.random()*menuStyles.length)];

module.exports = {
  before: function(browser, done) {
    browser.globals.appNameGenerated = `${casual.title} 09-change-menu-style`;

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

  'Change the menu style to a random one': function(browser){
    const menuScreen = browser.page.menuScreen();
    const rightSideNavMenu = browser.page.rightSideNavigationMenu();

    browser.createAppUsingTemplate(browser.globals.appNameGenerated, applicationTemplates.DIRECTORY_APP);

    rightSideNavMenu.openMenuScreen();

    menuScreen.selectMenuStyleByName(menuStyle)
      .assertMenuStyleIsSelectedByName(menuStyle);
  },

  'Check the menu style on preview screen': function(browser){
    const appTopFixedNavigationBar = browser.page.appTopFixedNavigationBar();
    const previewAppScreen = browser.page.previewAppScreen();

    appTopFixedNavigationBar.navigateToPreviewMode();

    previewAppScreen.assertMenuStyleOnPreviewScreen(menuStyle);
  },

  'Delete the created application': function (browser) {
    browser
      .deleteApplicationsMatchingParticularName(browser.globals.appNameGenerated)
      .removeNamesFromCleanersList([browser.globals.appNameGenerated]);
  }
};