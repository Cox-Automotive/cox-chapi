var Perspective = require('../../index').Perspective;
var pers = new Perspective(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("Your New Account:");
  console.log(JSON.stringify(json, null, 2));
}

var perspective = {
  "name": "API-Test",
  "rules": [],
  "merges": [],
  "constants": []
};

pers.create(perspective, log_response);
