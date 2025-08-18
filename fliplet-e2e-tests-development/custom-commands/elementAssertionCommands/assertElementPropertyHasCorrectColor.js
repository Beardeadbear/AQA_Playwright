/**
 * This command is used for comparing an actual colour of element on page(in RGB) with colour in Hex,
 that was used in theme for application
 * Takes three parameters:
 * @param {String} element - element for comparison
 * @param {String} property - css property that is compared (color, background-color, etc.)
 * @param {String} hexColor - colour in format #FFFFFF
 */

exports.command = function(element, property, hexColor){
  return this
    .execute(function(hex){
      function hexToRgb(hex) {
        return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
      }

      let rgbColour = hexToRgb(hex.split(""));

      return `rgba(${rgbColour[0]}, ${rgbColour[1]}, ${rgbColour[2]}`;

    }, [hexColor], function(text){
      this
        .waitForElementVisible(element, this.globals.smallWait)
        .element('css selector', element, (result) => {
          this.elementIdCssProperty(result.value.ELEMENT, 'opacity', (opacity) => {
            this.assert.cssProperty(element, property, `${text.value}, ${opacity.value})`);
          })
        });
    });
};