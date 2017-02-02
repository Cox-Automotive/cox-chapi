/**
 *  Reads data from a csv and makes chapi calls to update the accounts
 *
 *  Execute like `node update_from_csv.js path/to/csv/file`
 */

var fs = require('fs');
var readline = require('readline');
var CloudHealth = require('..');

if (process.argv.length < 3) {
  CloudHealth.utils.print_response(new Error(
`Invalid number of arguments

usage:
node update_from_csv.js path/to/csv
or
chapi run update_from_csv path/to/csv`
  ));
  process.exit(1);
}


var account;
CloudHealth.utils.find_api_key((err, api_key) => {
  if (err) {
    CloudHealth.utils.print_response(err, api_key);
    return;
  }

  account = new CloudHealth.Account(api_key);

  var rl = readline.createInterface({
    input: fs.createReadStream(process.argv[2]),
  });
  var data = [];

  rl.on('line', (line) => {
    var fields = line.split(',');
    fields = fields.map((item) => item.trim());
    data.push(fields);
  });

  rl.on('close', () => {
    // associate constants with columns
    var header = data.shift();
    var columns = {
      id: parseInt(header.reduce((prev, curr, index) => {
        // the account id
        if (curr.match(/Account ID/i)) return index;
        return prev;
      })),
      name: parseInt(header.reduce((prev, curr, index) => {
        // the account name
        if (curr.match(/label/i)) return index;
        return prev;
      })),
      short: parseInt(header.reduce((prev, curr, index) => {
        // the account short name
        if (curr.match(/short\s?name/i)) return index;
        return prev;
      })),
      access: parseInt(header.reduce((prev, curr, index) => {
        // the cloudhealth access key
        if (curr.match(/access key/i)) return index;
        return prev;
      })),
      secret: parseInt(header.reduce((prev, curr, index) => {
        // the cloudhealth secret key
        if (curr.match(/secret key/i)) return index;
        return prev;
      })),
    };

    updateAccounts(columns, data.slice(1));
  });
});

/**
 *  configures all unconfigured accounts
 *  @param {object} columns - an object containing the following
 *  @param {number} columns.id - the index in "rows" for the id field
 *  @param {number} columns.name - the index in "rows" for the name field
 *  @param {number} columns.short - the index in "rows" for the shortname field
 *  @param {number} columns.access - the index in "rows" for the access key field
 *  @param {number} columns.secret - the index in "rows" for the secret key field
 *  @param {string[][]} rows - an array of arrays, each sub array containing a
 *                             row from a spreadsheet
 */
function updateAccounts(columns, rows) {
  const ID = columns.id;
  const NAME = columns.name;
  const SHORT = columns.short;
  const ACCESS = columns.access;
  const SECRET = columns.secret;

  getPendingAccounts((err, accts) => {
    if (err) return CloudHealth.utils.print_response(err, accts);

    accts.forEach((acct) => {
      var row = rows.find((row) => row[ID] == acct.owner_id);

      if (row) {
        var new_acct = buildUpdate(acct.id, row);

        account.update(new_acct, (err, json) => {
          if (err) {
            console.log('Failed to update account \"' + row[NAME] + '\" (id: ' + acct.id + ')');
            if (json) console.log(json);
            throw err;
          }
          console.log('Successfully updated account \"' + row[NAME] + '\" (id: ' + acct.id + ')');
        });
      }
      else {
        console.log('Could not resolve account \"' + acct.name + '\" (id: ' + acct.id + ')');
      }
    });
  });

  /**
   *  creates an object that can be sent to CloudHealth to update the account
   *  @param {string} id - the account's id
   *  @param {string[]} row - an array of fields from a spreadsheet for the updated account
   *  @return {object} a new account
   */
  function buildUpdate(id, row) {
    var new_acct = {};

    new_acct.id = id;
    new_acct.name = row[NAME];

    new_acct.authentication = {};
    // if (row[ACCESS] !== '' && row[SECRET] !== '') {
    //   new_acct.authentication.access_key = row[ACCESS];
    //   new_acct.authentication.secret_key = row[SECRET];
    // }
    // else {
      new_acct.authentication.access_key = 'HASNOTBEENSET';
      new_acct.authentication.secret_key = 'FakeSecretKey';
    // }

    if (row[SHORT] !== '') {
      var bucket_name = row[SHORT] + '.logs.coxautomotive';
      new_acct.cloudtrail = {};
      new_acct.cloudtrail.enabled = true;
      new_acct.cloudtrail.bucket = bucket_name;

      new_acct.aws_config = {};
      new_acct.aws_config.enabled = true;
      new_acct.aws_config.bucket = bucket_name;
    }

    return new_acct;
  }
}

/**
 *  Gets all accounts in CloudHealth whose name is their owner_id (ie. they
 *  haven't been set up)
 *  @param {Function} cb - called with (err, accts)
 *                         err - an error object (null if successful)
 *                         accts - an array of accounts
 */
function getPendingAccounts(cb) {
  account.list({all: true}, (err, all_accounts) => {
    if (err) return cb(err);

    var pending = all_accounts.reduce((prev, curr) => {
      if (curr.name === curr.owner_id) {
        prev.push(curr);
      }
      return prev;
    }, []);

    cb(null, pending);
  });
}
