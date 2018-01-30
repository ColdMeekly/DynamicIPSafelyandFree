/*
 * TODO Clean up directories.
 */

// Dependencies
const express = require('express')
const server = express()
const https = require('https')
const fs = require('fs')
const JsonDB = require('node-json-db')
if (!fs.existsSync('Config')) {
  fs.mkdirSync('Config')
}
const db = new JsonDB('./Config/config', true, true)
const basicAuth = require('express-basic-auth')

// Variables
const sslOptions = {
  key: undefined,
  cert: undefined
}

let successCode, failCode
let approvedDevices, approvedUsernames
let bannedDevices, bannedUsernames
let authMethod, authType
let accounts

let certPath, keyPath

// Functions
function setupConfig () {
  // TODO Type check and integrity check every single thing here.
  /* Access */
  approvedDevices = setupAttribute('/Access/Whitelist/Devices', ['Devicename'])
  bannedDevices = setupAttribute('/Access/Blacklist/Devices', ['Devicename2'])

  approvedUsernames = setupAttribute('/Access/Whitelist/Usernames', ['Username'])
  bannedUsernames = setupAttribute('/Access/Blacklist/Usernames', ['Username2'])

  /*
  0 = Accept All,
  1 = Blacklist,
  2 = Whitelist,
  */
  authMethod = setupAttribute('/Access/AuthMethod', 0)

  /*
  0 = Devices,
  1 = Users,
  2 = Both Devices and Users,
  */
  authType = setupAttribute('/Access/AuthType', 0)

  successCode = setupAttribute('/Access/Success/StatusCode', 204)
  failCode = setupAttribute('/Access/Fail/StatusCode', 401)

  accounts = setupAttribute('/Access/Accounts', {
    users: {
      'iplogger': 'iamauthorizedpleaseletmein1337',
      'user': 'password'
    }
  })

  /* End of Access  */

  /* SSL */
  certPath = setupAttribute('/SSL/Cert_Path', './Config/SSL/certificate.cert')
  keyPath = setupAttribute('/SSL/Key_Path', './Config/SSL/key.key')

  if (!fs.existsSync(certPath)) {
    reply(`Error: Could not find certificate file in ${certPath}`)
    return false
  }
  if (!fs.existsSync(keyPath)) {
    reply(`Error: Could not find key file in ${keyPath}`)
    return false
  }

  try {
    sslOptions['cert'] = fs.readFileSync(certPath)
    sslOptions['key'] = fs.readFileSync(keyPath)
  } catch (error) {
    reply(`Error: Could not access certificate or key\n => ${error}`)
    return false
  }

  /* End of SSL */

  return true
}

function setupAttribute (path, defaultValue) {
  let attribute = getData(path)
  if (attribute === undefined) {
    db.push(path, defaultValue)
    return defaultValue
  }
  return attribute
}

function getData (path) {
  try {
    var data = db.getData(path)
    return data
  } catch (error) {
    return undefined
  }
}

function getFormattedTime () {
  let date = new Date()
  return `[${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}]`
}

function reply (message) {
  let date = new Date()
  console.log(`\x1b[33m[${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}]\x1b[0m  ${message}`)
}

function isValidUserAgent (userAgent) {
  return (
    userAgent.length > 0 &&
    userAgent.indexOf('#') > 0 &&
    userAgent.split('#').length === 2
  )
}

function isAuthorisedDevice (devicename, authMethod) {
  if (authMethod === 0) {
    return true
  } else if (authMethod === 1) {
    return bannedDevices.indexOf(devicename) === -1
  } else if (authMethod === 2) {
    return approvedDevices.indexOf(devicename) >= 0
  } else {
    console.error(`[DEVICE] Invalid authMethod received: ${authMethod}`)
  }
}

function isAuthorisedUser (username, authMethod) {
  if (authMethod === 0) {
    return true
  } else if (authMethod === 1) {
    return bannedUsernames.indexOf(username) === -1
  } else if (authMethod === 2) {
    return approvedUsernames.indexOf(username) >= 0
  } else {
    console.error(`[USER] Invalid authMethod received: ${authMethod}`)
  }
}

function checkAuthorised (username, devicename, authM, authT) {
  switch (authT) {
    case 0:
      return isAuthorisedDevice(devicename, authM)
    case 1:
      return isAuthorisedUser(username, authM)
    case 2:
      return (isAuthorisedDevice(devicename, authM) && isAuthorisedUser(username, authM))
  }
}

function declineAccess (res) {
  res.status(failCode).end()
}

function acceptAccess (res) {
  res.status(successCode).end()
}

function main () {
  if (!setupConfig()) {
    return
  }
  https.createServer(sslOptions, server).listen(443)
  reply('[DIPSFREE] Running!')

  server.use(basicAuth(accounts))

  server.get('/updater', function (req, res) {
    let userAgent = req.get('User-Agent')

    // Make sure that the user agent is in the format that we expect
    if (!isValidUserAgent(userAgent)) {
      declineAccess(res)
      return
    }

    let splitAgent = userAgent.split('#')

    if (checkAuthorised(splitAgent[0], splitAgent[1], authMethod, authType)) {
      acceptAccess(res)
      fs.appendFileSync('Logs/AuthLogs.txt', `${getFormattedTime()} AUTHORISED ${userAgent}\n`)

      reply(`[DIPSFREE] Got IP for '${splitAgent[0]} on ${splitAgent[1]}' => ${req.connection.remoteAddress}`)

      // Create folder structure
      if (!fs.existsSync('Logs')) {
        fs.mkdirSync('Logs')
      }
      if (!fs.existsSync(`Logs/${splitAgent[0]}`)) {
        fs.mkdirSync(`Logs/${splitAgent[0]}`)
      }
      //

      // Write IP to file
      fs.writeFile(`Logs/${splitAgent[0]}/${splitAgent[1]}.txt`, `${req.connection.remoteAddress}\n`, (err) => {
        if (err) {
          reply(`File write error: ${err}`)
        }
      })
    } else {
      // UserAgent not in our list.
      declineAccess(res)
      if (!fs.existsSync('Logs')) {
        fs.mkdirSync('Logs')
      }
      reply(`[DIPSFREE] Rejected unauthorized identifier [${userAgent}]`)
      fs.appendFileSync('Logs/AuthLogs.txt', `${getFormattedTime()} UNKNOWN_ID ${userAgent}\n`)
    }
  })
}

// Main code
main()
