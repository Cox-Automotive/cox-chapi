var Account = require('../../index').Account;
var acc = new Account(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log(json.message);
}

acc.delete(343597385771, log_response);
