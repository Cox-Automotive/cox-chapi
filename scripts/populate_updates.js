/**
 *  Reads data from a csv and makes chapi calls to update the accounts
 *
 *  Execute like `node update_from_csv.js path/to/csv/file path/to/profiles/file path/to/names/file`
 */

let fs = require('fs');
let readline = require('readline');
let CloudHealth = require('..');
let filename = process.argv[2];
let profiles_file = process.argv[3];
let names_file = process.argv[4];

if (process.argv.length < 3) {
  CloudHealth.utils.print_response(new Error(
`Invalid number of arguments

usage:
node populate_updates.js path/to/csv path/to/profiles/file path/to/names/file
or
chapi run populate_updates path/to/csv path/to/profiles/file path/to/names/file`
  ));
  process.exit(1);
}

function getData(filename, cb) {
  CloudHealth.utils.find_api_key((err, api_key) => {
    if (err) {
      CloudHealth.utils.print_response(err, api_key);
      return;
    }

    let account = new CloudHealth.Account(api_key);

    let rl = readline.createInterface({
      input: fs.createReadStream(filename),
    });
    let data = [];

    rl.on('line', (line) => {
      let fields = line.split(',');
      fields = fields.map((item) => item.trim());
      data.push(fields);
    });

    rl.on('close', () => {
      // associate constants with columns
      let header = data.shift();
      let columns = {
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
      };

      cb(columns, data.slice(1));
    });
  });
}

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

getData(filename, (columns, rows) => {
  const ID = columns.id;
  const NAME = columns.name;
  const SHORT = columns.short;

  getPendingAccounts((err, accts) => {
    if (err) return CloudHealth.utils.print_response(err, accts);

    let pending = [];
    accts.forEach((acct) => {
      let row = rows.find((row) => row[ID] == acct.owner_id);

      if (row) {
        pending.push(row);
      }
    });

    let profiles = pending.map((acct) => acct[SHORT]).join('\n') + '\n';
    let names = pending.map((acct) => acct[NAME]).join('\n') + '\n';

    fs.appendFile(profiles_file, profiles, (err) => {
      if (err) return CloudHealth.utils.print_response(err);
      console.log('profiles added successfully');
    })

    fs.appendFile(names_file, names, (err) => {
      if (err) return CloudHealth.utils.print_response(err);
      console.log('names added successfully');
    })
  });
});
