/**
 *  stringifies json data either piped in from stdin or from the file given as
 *  the first argument into a single-line, minified json string which can then
 *  be used in commands
 *
 *  usage:
 *  cat path/to/file.json | chapi run stringify
 *  or
 *  chapi run stringify path/to/file.json
 *
 *  example:
 *  chapi acct create "$(cat path/to/file.json | chapi run stringify)"
 *  or
 *  chapi acct create "$(chapi run stringify path/to/file.json)"
 */

var fs = require('fs');
var utils = require('..').utils;

function parse_json(data) {
  return JSON.stringify(JSON.parse(data));
}

if (process.argv[2]) {
  fs.readFile(process.argv[2], (err, data) => {
    if (err) return utils.print_response(err, data);
    console.log(parse_json(data));
  });
}
else {
  utils.read_stdin((err, data) => {
    if (err) return utils.print_response(err, data);
    console.log(parse_json(data));
  });
}
