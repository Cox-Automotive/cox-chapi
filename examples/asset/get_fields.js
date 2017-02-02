var Asset = require('../../index').Asset;
var asset = new Asset(require('../config').api_key);

var object_type = 'AwsAccount';

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("List of Fields for " + object_type + ":");
  console.log(JSON.stringify(json, null, 2));
}

asset.get_fields(object_type, log_response);
