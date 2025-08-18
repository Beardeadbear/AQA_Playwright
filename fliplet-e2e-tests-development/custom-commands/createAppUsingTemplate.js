exports.command = function (appName, templateName, appId) {
  const applicationTemplates = require('../utils/constants/applicationTemplates');
  const appsCreateOverlay = this.page.createAppOverlay();
  const appsPage = this.page.appsPage();
  const appTopFixedNavigationBar = this.page.appTopFixedNavigationBar();
  const editApp = this.page.editAppScreen();

  appsPage
    .navigate()
    .waitForAppsPageToBeLoaded()
    .clickNewAppButton();

  appsCreateOverlay.assertAppSetupOverlayIsOpen()
    .checkAppTemplateSection()
    .waitForAppTemplatesToBeLoaded()
    .clickUseAppTemplate(templateName)
    .checkAppSetupSection()
    .enterAppName(appName)
    .clickNextButton();

  this.perform(function () {
    if (templateName !== applicationTemplates.BLANK_DEFAULT)
      appsCreateOverlay.waitForAppEditModeToBeLoaded();
  });

  this.pause(1000);

  appTopFixedNavigationBar.assertOpenAppTitle(appName);

  this.pause(1000);

  this.perform(function () {
    if (typeof appId === 'object')
      editApp.getApplicationId(appId);
  });
};