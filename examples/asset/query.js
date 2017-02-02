var Asset = require('../../index').Asset;
var asset = new Asset(require('../config').api_key);

var query = {
  asset_type: 'AwsAccount',
  name: 'My Account',
  cluster_name: 'General Cluster',
  is_private: false,
  is_cloudtrail: true,
};

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("Listing " + query.asset_type + "(s) Matching Your Query:");
  console.log(JSON.stringify(json, null, 2));
}

asset.query(query, log_response);
