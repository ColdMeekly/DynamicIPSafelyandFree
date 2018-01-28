const express = require('express');
const https = require('https');
const fs = require('fs');
var sslOptions = {
  key: fs.readFileSync('key.key'),
  cert: fs.readFileSync('cert.cert')
};
var server = express();
const approvedDevices = ['DESKTOP-4SS8KL0', 'CUSTOM_LP_VIT'];
const basicAuth = require('express-basic-auth')
const SUCCESS_CODE = 204;

function getFormattedTime() {
  return `[${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}]`;
}

function reply(message) {
	date = new Date();
	console.log(`\x1b[33m[${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}]\x1b[0m	${message}`);
}

function isValidUserAgent(useragent) {
  // Wanted format = ColdMeekly#DESKTOP
  return (
    userAgent.length > 0 &&
    userAgent.indexOf('#') > 0 &&
    userAgent.split('#').length == 2
  )
}

// Will be using 401 because that's what basicAuth denies with.
function declineAccess(res) {
  res.status(401).end();
  return;
}

function acceptAccess(res) {
  res.status(SUCCESS_CODE).end();
  return;
}

https.createServer(sslOptions, server).listen(443)
reply("IP Logger running!");

server.use(basicAuth(
  {
    users: { 'iplogger': 'iamauthorizedpleaseletmein1337' }
  }
));

server.get('/updater',function(req, res){
  let userAgent = req.get('User-Agent');

  // Make sure that the user agent is in the format that we expect
  if (!isValidUserAgent(userAgent)) {
    declineAccess(res);
    return;
  }

  let splitAgent = userAgent.split("#");

  if (approvedDevices.indexOf(splitAgent[1]) > 0)
  {
    acceptAccess(res);


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
    fs.writeFile(`Logs/${splitAgent[0]}/${splitAgent[1]}.txt`, req.connection.remoteAddress, (err) => {
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
    fs.appendFileSync('Logs/AuthLogs.txt', `${getFormattedTime()} UNKNOWN_ID ${userAgent}`);
  }

});
