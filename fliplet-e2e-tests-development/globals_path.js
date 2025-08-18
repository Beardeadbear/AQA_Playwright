const program = require('commander');
const casual = require('casual');

program
  .allowUnknownOption()
  .option('-p, --password <url>', 'Password')
  .parse(process.argv);

module.exports = {
  email: process.env.FLIPLET_E2E_EMAIL,
  email2: process.env.FLIPLET_E2E_EMAIL2,
  email3: process.env.FLIPLET_E2E_EMAIL3,
  emailForOrganizationTests: process.env.FLIPLET_E2E_EMAIL_FOR_ORG,
  appleEmail: process.env.APPLE_AAB_EMAIL,
  applePassword: process.env.APPLE_AAB_PASSWORD,
  password: program.password,
  apiUri: 'https://staging.api.fliplet.com',
  appName: casual.title,
  dataSourceName: casual.title,
  tokenName: casual.word,
  editedSubject: casual.title,
  firstName: casual.first_name,
  lastName: casual.last_name,
  userEmail: casual.email,
  userPassword: casual.password.concat(casual.word),
  userEditedPassword: casual.word.concat(casual.password),
  organizationId: 173,
  dndDataSourceId: 395228,
  asyncHookTimeout: 30000,
  tinyWait: 25000,
  smallWait: 40000,
  mediumWait: 60000,
  longWait: 80000,
  logsArray: [],
  sentryURI: 'https://sentry.io/api/0/projects/fliplet/qa/issues/',
  sentryBearer: process.env.SENTRY_BEARER,
  gmailEmail: 'qafliplettest@gmail.com',
  organizationName: 'QA MADNESS AUTOMATION',
  imageFolder: 'org images folder',
  videoFolder: 'org videos folder',
  docFolder: 'org docs folder',
  fontFolder: 'org fonts folder',
  waitForConditionTimeout: 15000,
  retryAssertionTimeout: 15000,
  smokeTest: process.env.SMOKE_TEST,

  beforeEach: function(browser, done){
    browser.resizeWindow(1600, 1200, () => {
      done();
    })
  }
};
