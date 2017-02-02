var Account = require('../../index').Account;
var acc = new Account(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("Your Accounts:");
  console.log(JSON.stringify(json, null, 2));
}

acc.list(log_response);
