/**
 *  called with
 *  first parameter - the json to parse for the keys
 *  second parameter - the key of the output whose value is the access key
 *  third parameter - the key of the output whose value is the secret key
 *
 *  ie. node get_keys_from_json.js {...} CloudHealthAccessID CloudHealthSecretKey
 */

let json = JSON.parse(process.argv[2]);
let access_key_name = process.argv[3];
let secret_key_name = process.argv[4];

let outputs = (json.Stacks && json.Stacks[0] && json.Stacks[0].Outputs) || [];

let keys = outputs.reduce((keys, curr) => {
  if (curr.OutputKey === access_key_name) {
    keys.access_key = curr.OutputValue
  }
  else if (curr.OutputKey === secret_key_name) {
    keys.secret_key = curr.OutputValue
  }
  return keys;
}, {});

console.log(keys.access_key);
console.log(keys.secret_key);
