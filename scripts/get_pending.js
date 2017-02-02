/**
 *  prints out a list of all pending accounts' aws ids
 */

let CloudHealth = require('..');

/**
 *  Gets all accounts in CloudHealth whose name is their owner_id (ie. they
 *  haven't been set up)
 *  @param {Function} cb - called with (err, accts)
 *                         err - an error object (null if successful)
 *                         accts - an array of accounts
 */
function getPendingAccounts(cb) {
  CloudHealth.utils.find_api_key((err, api_key) => {
    if (err) return CloudHealth.utils.print_response(err, api_key);

    let account = new CloudHealth.Account(api_key);

    account.list({all: true}, (err, all_accounts) => {
      if (err) return cb(err);

      let pending = all_accounts.reduce((prev, curr) => {
        if (curr.name === curr.owner_id) {
          prev.push(curr);
        }
        return prev;
      }, []);

      cb(null, pending);
    });
  });
}

getPendingAccounts((err, accounts) => {
  if (err) return CloudHealth.utils.print_response(err, accounts);

  for (let account of accounts) {
    console.log(account.owner_id);
  }
});
