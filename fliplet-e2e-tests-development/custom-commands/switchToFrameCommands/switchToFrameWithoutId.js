/**
 * Custom command for switching to frame without id
 * Works for same-origin frames
 * @param {String} frameClass - class name of a frame
 * @param {String} frameName - 'name' attribute of a frame
 */

exports.command = function(frameClass, frameName){
  this
    .execute(function(frameClass){
      let iFrame = parent.getElementsByClassName(frameClass);
      let iFrameDoc = iFrame.contentWindow.document;
      do {
        if (iFrameDoc.readyState === 'complete') {
          return true;
        }
      } while(false);
    }, [frameName], function(){
      this.frame(frameName);
    });
};