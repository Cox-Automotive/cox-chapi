var Perspective = require('../../index').Perspective;
var pers = new Perspective(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("Your Perspectives:");
  console.log(JSON.stringify(json, null, 2));
}

pers.list(log_response);
