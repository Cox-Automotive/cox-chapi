/**
 *  Demonstrates how to fetch an account by its owner_id
 *
 *  Note: multiple calls to find_by_owner can be made without unnecessary calls
 *  to the CloudHealth API
 */

var Account = require('../../index').Account;
var acc = new Account(require('../config').api_key);

var accs = account.list(function(err, json) {
  var acc = find_by_owner(json.aws_accounts[0].owner_id, json.aws_accounts);
  console.log(JSON.stringify(acc, null, 2));
});

function find_by_owner(id, list) {
  var acc = list.find(function(item) {
    if(item.owner_id == id) {
      return true;
    }
    return false;
  });
  return acc;
}
