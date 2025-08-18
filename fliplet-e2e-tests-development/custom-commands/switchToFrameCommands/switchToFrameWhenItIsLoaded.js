/**
 * General command that waits for frame to load before switching to it
 * Works for same-origin frames
 * @param {String} frame - frame id as a parameter
 */
exports.command = function(frame){
  this
    .execute(function(frame){
      let iFrame = document.getElementById(frame);
      let iFrameDoc = iFrame.contentWindow.document;
      do {
        if (iFrameDoc.readyState === 'complete') {
          return true;
        }
      } while(false);
    }, [frame], function(){
      this.frame(frame);
    });
};