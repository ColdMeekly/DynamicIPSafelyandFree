const rp = require('request-promise');
const os = require('os');

const SUCCESS_CODE = 204;
const options = {
    method: 'GET',
    uri: 'https://iplogger:iamauthorizedpleaseletmein1337@juan.screenman.pro/updater',
    headers: {
        'User-Agent': 'Undefined'
    },
    resolveWithFullResponse: true,
    simple: false
};

options.headers['User-Agent'] = `${os.userInfo().username}#${os.hostname()}`;

rp(options)
    .then((response) => {
        let statusCode = response.statusCode;
        if (statusCode == SUCCESS_CODE) {
          console.log('Successfully updated IP Address of this machine!')
        } else {
          console.log('ERROR - Someone is spoofing the server!')
        }
    })
    .catch((err) => {
        console.log(`Request Error: ${err}`)
    });
