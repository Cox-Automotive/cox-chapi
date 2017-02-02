var Account = require('../../index').Account;
var acc = new Account(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("Your Updated Account:");
  console.log(JSON.stringify(json, null, 2));
}

var updates = {
  "id": "343597385771",
  "name": "More Fake Account",
  "tags": [
    {
      "key": "Environment",
      "value": "production"
    },
    {
      "key": "Owner",
      "value": "Engineering"
    }
  ]
};

acc.update(updates, log_response);
