var Perspective = require('../../index').Perspective;
var pers = new Perspective(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR:");
    console.error(err);
    return;
  }
  console.log(json.message);
}

pers.destroy(123412341234, {hard_delete: true}, log_response);
