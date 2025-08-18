/* Custom command
 * navigates to My apps page,
 * gets names of all applications that correspond the specified value,
 * deletes all found applications.
 * @param {String} appName - application name
 */
exports.command = function(appName){
  const apps = this.page.appsPage();
  const applicationTitle = `.//*[@class='app-name'][contains(text(), '${appName}')]`;
  let appsNames = [];

//Navigating to My apps page
  apps.navigate()
    .waitForAppsPageToBeLoaded()
    .waitForAppsListToBeLoaded();

  //Getting names of all applications that correspond the specified value
  this.elements('xpath', applicationTitle, function(result){
    for(let i = 0; i < result.value.length; i ++){
      this
        .elementIdText(result.value[i].ELEMENT, function(text){
          appsNames[i] = text.value;
        });
    }
  });

  //Deleting all found applications
  this.perform(() => {
    for(let k = 0; k < appsNames.length; k ++){
      apps.expandOptionsForAppByName(appsNames[k])
        .deleteApplicationByName(appsNames[k])
        .assertApplicationIsNotPresentInListByName(appsNames[k]);
    }
  });
};