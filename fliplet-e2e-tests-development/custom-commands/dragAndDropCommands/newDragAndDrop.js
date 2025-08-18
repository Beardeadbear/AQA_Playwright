/**
 * Simulates a widget drop on the device page
 * @param {String} package - package name to "drop" on the page
 */
exports.command = function(package) {
 this
   .waitForElementVisible(`div[data-package="${package}"]`, this.globals.smallWait)
   .pause(1000)
   .execute(function(package) {
    var elementDropped = document.querySelectorAll(`[data-package="${package}"]`)[0];
    var data = {
     widgetId: elementDropped.dataset.widgetId,
     package: elementDropped.dataset.package,
     displayType: elementDropped.dataset.displayType,
     placeholderId: new Date().getTime()
    };
    // Placeholder ID is randomly generated for tests and needs to be
    // added to the wrapper HTML for D&D to work
    elementDropped.setAttribute('data-placeholder-id', data.placeholderId);
    return {
     data: data,
     toInsert: elementDropped.outerHTML
    };
   },[package], function(result) {
    this
      .waitForElementVisible('#preview', this.globals.longWait)
      .frame('preview')
      .execute(
        function(result) {
         var data = result.value.data;
         var toInsert = result.value.toInsert; // element "div" data for drop
         let doc = new DOMParser().parseFromString(toInsert, 'text/html'); // change type of data from string to node
         var dropzone = document.querySelector('main[data-fl-drop-zone]'); // area for drop
         dropzone.insertBefore(doc.body, dropzone.querySelectorAll('[data-name]')[0]); // drop element to drop area
         // fliplet-interact:3.0 D&D event
         var ev = new CustomEvent('FlStudioEvent', {
          detail: {
           type: 'widgetPlaced',
           target: dropzone,
           data: data
          }
         });
         document.dispatchEvent(ev);
        },[result]
      )
   })
   .frameParent()
   .waitForElementPresent('#widget-instance', this.globals.mediumWait)
   .waitForAjaxCompleted();
 return this;
};