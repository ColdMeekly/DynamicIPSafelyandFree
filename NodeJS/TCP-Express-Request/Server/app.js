const express = require('express');
const https = require('https');
const fs = require('fs');
var sslOptions = {
  key: fs.readFileSync('key.key'),
  cert: fs.readFileSync('cert.cert')
};
var server = express();
const approvedDevices = ['ColdMeekly#DESKTOP-4SS8KL0', 'CUSTOM_LP_VIT'];
const basicAuth = require('express-basic-auth')

function reply(message) {
	date = new Date();
	console.log(`\x1b[33m[${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}]\x1b[0m	${message}`);
}

function replyToUser(message) {
	console.log(`\x1b[36m$: \x1b[0m${message}`);
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
  let splitAgent = userAgent.split("#");
  // ColdMeekly#DESKTOP => ["ColdMeekly","DESKTOP"]
  //                        username      ComputerName

  if (approvedDevices.indexOf(userAgent) >= 0)
  {
    res.status(204).end();


    reply(`Got IP for '${splitAgent[0]} on ${splitAgent[1]}' => ${req.connection.remoteAddress}`);
    // Create folder structure
    if (!fs.existsSync('Logs')){
        fs.mkdirSync('Logs');
    }
    if (!fs.existsSync(`Logs/${splitAgent[0]}`)){
        fs.mkdirSync(`Logs/${splitAgent[0]}`);
    }
    fs.writeFile(`Logs/${splitAgent[0]}/${splitAgent[1]}.txt`, req.connection.remoteAddress, (err) => {
      // throws an error, you could also catch it here
      if (err) {
        reply(`File write error: ${err}`);
      }
  });
  }
  else {
    res.status(401).end();
  }

});
