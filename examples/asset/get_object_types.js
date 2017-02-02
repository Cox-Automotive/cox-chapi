var Asset = require('../../index').Asset;
var asset = new Asset(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("List of Object Types:");
  console.log(JSON.stringify(json, null, 2));
}

asset.get_object_types(log_response);
