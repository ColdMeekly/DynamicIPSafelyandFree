/*
* TODO Use config file.
* TODO Clean up directories.
*/


const express = require('express');
const server = express();
const https = require('https');
const fs = require('fs');
const JsonDB = require('node-json-db');
if (!fs.existsSync('Config')){
    fs.mkdirSync('Config');
}
let db = new JsonDB("./Config/config", true, true);

// const approvedDevices = ['DESKTOP-4SS8KL0', 'CUSTOM_LP_VIT'];
const basicAuth = require('express-basic-auth');
// const SUCCESS_CODE = 204;

const sslOptions = {
  key: undefined,
  cert: undefined
};

let successCode, failCode;
let approvedDevices, approvedUsernames;
let bannedDevices, bannedUsernames;
let accounts;

let certPath, keyPath;
let certValue, keyValue;




function setupConfig() {
  // TODO Type check and integrity check every single thing here.
  /* Access */
  approvedDevices   = setupAttribute('/Access/Whitelist/Devices', ["Devicename"]);
  bannedDevices     = setupAttribute('/Access/Blacklist/Devices', ["Devicename2"]);

  approvedUsernames = setupAttribute('/Access/Whitelist/Usernames', ["Username"]);
  bannedUsernames   = setupAttribute('/Access/Blacklist/Usernames', ["Username2"]);

  successCode       = setupAttribute("/Access/Success/StatusCode", 204);
  failCode          = setupAttribute("/Access/Fail/StatusCode", 401);

  accounts          = setupAttribute("/Access/Accounts", {
      users: {
        'iplogger': 'iamauthorizedpleaseletmein1337',
        'user'    : 'password'
       }
    });



  /* End of Access  */


  /* SSL */
  certPath          = setupAttribute('/SSL/Cert_Path', "./Config/SSL/certificate.cert");
  keyPath           = setupAttribute('/SSL/Key_Path', "./Config/SSL/key.key");

  if (!fs.existsSync(certPath)) {
    reply(`Error: Could not find certificate file in ${certPath}`);
    return false;
  }
  if (!fs.existsSync(keyPath)) {
    reply(`Error: Could not find key file in ${keyPath}`);
    return false;
  }

  try {
    certValue       = fs.readFileSync(certPath);
    keyValue        = fs.readFileSync(keyPath);
  } catch(error) {
    reply(`Error: Could not access certificate or key\n => ${error}`);
    return false;
  }

  sslOptions['key'] = keyValue;
  sslOptions['cert'] = certValue;
  /* End of SSL */

  return true;

}

function setupAttribute(path, defaultValue) {

  let attribute = getData(path);
  if (attribute === undefined) {
    db.push(path,defaultValue);
    return defaultValue;
  }
  return attribute;
}

function getData(path) {
  try {
    var data = db.getData(path);
    return data;
  } catch(error) {
      return undefined;
  }
}

function getFormattedTime() {
  return `[${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}]`;
}

function reply(message) {
	date = new Date();
	console.log(`\x1b[33m[${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}]\x1b[0m	${message}`);
}

function isValidUserAgent(userAgent) {
  // Wanted format = ColdMeekly#DESKTOP
  return (
    userAgent.length > 0 &&
    userAgent.indexOf('#') > 0 &&
    userAgent.split('#').length == 2
  )
}

// Will be using 401 because that's what basicAuth denies with.
function declineAccess(res) {
  res.status(failCode).end();
  return;
}

function acceptAccess(res) {
  res.status(successCode).end();
  return;
}

if (!setupConfig())
  return;
https.createServer(sslOptions, server).listen(443);
reply("IP Logger running!");

server.use(basicAuth(accounts));

server.get('/updater',function(req, res){
  let userAgent = req.get('User-Agent');

  // Make sure that the user agent is in the format that we expect
  if (!isValidUserAgent(userAgent)) {
    declineAccess(res);
    return;
  }

  let splitAgent = userAgent.split("#");

  if (approvedDevices.indexOf(splitAgent[1]) >= 0)
  {
    acceptAccess(res);
    fs.appendFileSync('Logs/AuthLogs.txt', `${getFormattedTime()} AUTHORISED ${userAgent}\n`);

    reply(`Got IP for '${splitAgent[0]} on ${splitAgent[1]}' => ${req.connection.remoteAddress}`);

    // Create folder structure
    if (!fs.existsSync('Logs')){
        fs.mkdirSync('Logs');
    }
    if (!fs.existsSync(`Logs/${splitAgent[0]}`)){
        fs.mkdirSync(`Logs/${splitAgent[0]}`);
    }
    //

    // Write IP to file
    fs.writeFile(`Logs/${splitAgent[0]}/${splitAgent[1]}.txt`, `${req.connection.remoteAddress}\n`, (err) => {
        if (err) {
          reply(`File write error: ${err}`);
        }
    });
  }
  else {
    // UserAgent not in our list.
    declineAccess(res);
    if (!fs.existsSync('Logs')){
        fs.mkdirSync('Logs');
    }
    reply(`Rejected unauthorized identifier [${userAgent}]`);
    fs.appendFileSync('Logs/AuthLogs.txt', `${getFormattedTime()} UNKNOWN_ID ${userAgent}\n`);
  }

});
