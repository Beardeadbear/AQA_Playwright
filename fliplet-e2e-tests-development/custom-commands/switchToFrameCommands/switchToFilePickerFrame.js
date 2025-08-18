/**
 * Command to define and switch to the frame that is used for File Picker
 * * @param {Number} frameNumber - frame number with file picker to switch to
 */
exports.command = function(frameNumber){
  const browser = this;
  const filePickerDropdownFileSourceMenuLocator = 'select#drop-down-file-source';
  const frameIds = [];

  //define frame with file picker
  browser
    .frame(null)
    .logTestInfo('Switching to file picker frame.')
    .elements('css selector', 'iframe[src*=https]', function(result){
      for(let i = 0; i < result.value.length; i ++){
        browser.elementIdAttribute(result.value[i].ELEMENT, 'id', (id) => {
          frameIds.push(id.value);
        })
      }
    });

  //switch to the defined frame with file picker
  browser
    .perform(function(){
      if(frameIds.includes('widget-provider')){
        browser.switchToWidgetProviderFrame();
      } else{
        browser.switchToWidgetInstanceFrame();
      }
    });

  //check if there is nested frames with file picker and switch to them
  browser
    .elements('css selector', 'iframe', function(result){
      if(result.value.length > 0){
        browser.switchToFlWidgetFrameByNumber(frameNumber);
      }
    })
    .elements('css selector', 'iframe', function(result){
      if(result.value.length > 0){
        browser.switchToFLWidgetProviderFrame(filePickerDropdownFileSourceMenuLocator);
      }
    })
    .waitForElementVisible(filePickerDropdownFileSourceMenuLocator, this.globals.longWait);
};