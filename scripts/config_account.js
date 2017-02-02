/**
 *  configures an account in cloudhealth
 *  usage:
 *  node config_accounts.js <aws-id> <short-name> <name> [user <access-key> <secret-key> | role <role-name> [<external-id>]]
 */

var CloudHealth = require('..');
var utils = CloudHealth.utils;

if (process.argv.length < 5) {
  utils.print_response(new Error(`
Error: incorrect number of arguments
Usage:
node config_accounts.js <aws-id> <name> <short-name> [user <access-key> <secret-key> | role <role-name> [<external-id>]]
  `));
}

var aws_id = process.argv[2];
var name = process.argv[3];
var short_name = process.argv[4];
var auth_type = process.argv[5] || "";
var auth;
if (auth_type.toLowerCase() === 'role') {
  auth = {
    protocol: 'assume_role',
    assume_role_arn: "arn:aws:iam::" + aws_id + ":role/" + (process.argv[6] || "role-has-not-been-set"),
  };
  var external_id = process.argv[7];
  if (external_id) {
    auth.assume_role_external_id = external_id;
  }
}
else {
  auth = {
    protocol: 'access_key',
    access_key: process.argv[6] || "HASNOTBEENSET",
    secret_key: process.argv[7] || "HASNOTBEENSET",
  };
}

utils.find_api_key((err, api_key) => {
  if (err) return utils.print_response(err, api_key);

  var account_api = new CloudHealth.Account(api_key);

  account_api.find_by("owner_id", aws_id, (err, accounts) => {
    var account = {};
    if (err) {
      utils.print_response(err, accounts);
    }
    else if (accounts.length > 0) {
      account = accounts[0];
    }
    else {
      utils.print_response(new Error("Account not found in CloudHealth"), accounts);
    }

    account.name = name;
    account.authentication = auth;
    account.cloudtrail = {
      enabled: "true",
      bucket: short_name + ".logs.coxautomotive",
    };
    account.aws_config = {
      enabled: "true",
      bucket: short_name + ".logs.coxautomotive",
    };

    account_api.update(account, utils.print_response);
  });
});
