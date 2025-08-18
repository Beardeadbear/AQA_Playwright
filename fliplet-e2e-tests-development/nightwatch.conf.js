const program = require('commander');

program
  .allowUnknownOption()
  .option('-w, --www <url>', 'Url to test')
  .parse(process.argv);

module.exports = (function(settings) {
  settings.test_settings.default.launch_url = program.www
  return settings;
})(require('./nightwatch.json'));
