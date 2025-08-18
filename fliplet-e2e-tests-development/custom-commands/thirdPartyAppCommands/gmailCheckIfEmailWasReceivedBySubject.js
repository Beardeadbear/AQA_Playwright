/*
 * Check if email is received by subject
 * Reference https://developers.google.com/gmail/api/quickstart/nodejs
 * @param {Object} OAuth2 client.
 * @param {String} subject of the email.
 */

const {google} = require('googleapis');

exports.command = function(auth, subject){
  const gmail = google.gmail({version: 'v1', auth});

  gmail.users.messages.list({
    userId: 'me',
    q: `subject:${subject}`
  }, (err, res) => {
    if(err) throw err;
    const labels = res.data.messages;
      this.assert.ok(labels, `The email with the specified subject ${subject} was received.`);
  });
};