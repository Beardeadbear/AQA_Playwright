exports.command = function (testInfo) {
  return this.perform(function (browser, done) {
    console.log(`Test info: ${testInfo}`);
    done();
  });
};