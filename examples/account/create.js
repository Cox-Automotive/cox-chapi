var Account = require('../../index').Account;
var acc = new Account(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("Your New Account:");
  console.log(JSON.stringify(json, null, 2));
}

var account = {
  "name": "Example Account",
  "authentication": {
    "protocol": "access_key",
    "access_key": "QQQQQQQQQQQQQQQ",
    "secret_key": "sosososososososososososososoSecret"
  },
  "billing": {
    "bucket": "my-fake-billing-bucket"
  },
  "cloudtrail": {
    "enabled": true,
    "bucket": "my-fake-cloudtrail-bucket"
  },
  "aws_config": {
    "enabled": true,
    "bucket": "my-fake-aws-config-bucket",
    "prefix": "foo"
  },
  "tags": [
    {"key": "Environment", "value": "Production"}
  ]
};

acc.create(account, log_response);
