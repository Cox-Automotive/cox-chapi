var Perspective = require('../../index').Perspective;
var pers = new Perspective(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("Your Perspective:");
  console.log(JSON.stringify(json, null, 2));
}

pers.get(123412341234, log_response);
