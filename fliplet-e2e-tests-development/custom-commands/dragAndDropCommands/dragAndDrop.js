/**
 * Simulates a widget drop on the device page
 * @param {String} package - package name to "drop" on the page
 * @param {String} dropOn - Selector where to drop the package
 */
exports.command = function(package, dropOn) {
  // TODO: dropOn. For now it just drops at the beggining of the page.
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
            var toInsert = result.value.toInsert;
            var editor = window.tinyMCE.activeEditor;

            editor.insertContent(toInsert);

            editor.fire('drop', {
              target: editor.selection.getNode(),
              data: data
            });

            // fliplet-interact:2.0 D&D event
            var ev = new CustomEvent('FlStudioEvent', {
              detail: {
                type: 'widgetPlaced',
                target: editor.selection.getNode(),
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
