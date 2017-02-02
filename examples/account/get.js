var Account = require('../../index').Account;
var acc = new Account(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("Your Account:");
  console.log(JSON.stringify(json, null, 2));
}

acc.get(343597385771, log_response);
