/*
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * Reference: https://developers.google.com/gmail/api/quickstart/nodejs
 * @param {Object} credentials The authorization client credentials.
 * @param {String} subject of the email.
 * @param {function} callback The callback to call with the authorized client.
 */

const fs = require('fs');
const {google} = require('googleapis');
const TOKEN_PATH = 'utils/gmailAuthorizationFiles/gmailToken.json';

exports.command = function(credentials, subject, callback){
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
  fs.readFile(TOKEN_PATH, (err, token) => {
    if(err) throw err;
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, subject);
  });
};