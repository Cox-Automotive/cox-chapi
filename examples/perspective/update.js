var Perspective = require('../../index').Perspective;
var pers = new Perspective(require('../config').api_key);

function log_response(err, json) {
  if(err) {
    console.error("ERROR: ");
    console.error(err);
    return;
  }
  console.log("Your Updated Perspective:");
  console.log(JSON.stringify(json, null, 2));
}

var perspective = {
  id: "123412341234",
  include_in_reports: "false",
  rules: [
    {
      type: "filter",
      asset: "AwsAccount",
      to: "new-group",
      condition: {
        clauses: [
          {
            field: [
              "CloudTrail"
            ],
            op: "=",
            val: "true"
          }
        ]
      }
    },
  ],
  merges: [],
  constants: []
};

pers.update(perspective, log_response);
