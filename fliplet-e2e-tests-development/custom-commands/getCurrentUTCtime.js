/**
 * This command is used for getting current UTC time
 * Takes one parameter:
 * @param {Array} time - empty array for pushing of current time
*/
const moment = require('moment');

exports.command = function(time) {

  this.perform(function() {
    const date = moment.utc();
    const dateMinusOne = moment.utc().subtract(1, 'minutes');
    const datePlusOne = moment.utc().add(1, 'minutes');
    const currentTime = `${date.format('HH')}:${date.format('mm')}`;
    const currentTimePlusOne = `${datePlusOne.format('HH')}:${datePlusOne.format('mm')}`;
    const currentTimeMinusOne = `${dateMinusOne.format('HH')}:${dateMinusOne.format('mm')}`;

    time.length = 0;
    time.push(currentTime);
    time.push(currentTimePlusOne);
    time.push(currentTimeMinusOne);

    return time;
  });
};