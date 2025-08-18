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
         var toInsert = result.value.toInsert;
         let doc = new DOMParser().parseFromString(toInsert, 'text/html');
         var dropzone = document.querySelector('.fl-page-content-wrapper');
         dropzone.appendChild(doc.body.firstChild);
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