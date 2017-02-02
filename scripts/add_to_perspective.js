/**
 *  Adds an account to a perspective as an example
 */

var CloudHealth = require('..');

var acct_api = process.argv[2];
var pers_api = process.argv[3];
CloudHealth.utils.find_api_key((err, api_key) => {
  if (err) throw err;

  acct_api = new CloudHealth.Account(api_key);
  pers_api = new CloudHealth.Perspective(api_key);

  acct_api.get(acct_id, (err, acct) => {
    if (err) throw err;
    pers_api.get(pers_id, (err, pers) => {
      if (err) throw err;

      add_to_group(pers, acct, 'bens new group');
    });
  });
});

/**
 *  gets an id for a group
 *  @param {object} pers - an object representing a perspective
 *  @param {string} group_name - the name of the group to search for
 *  @return {string} the group id associated with group_name, or group_name if not found
 */
function get_group_id(pers, group_name) {
  // get the groups object from the list of constants
  var groups = pers.constants.find(
    (constant) => constant.type.toLowerCase() === 'group'
  );
  // get the group from the list of groups
  var group = groups.list.find(
    (group) => group.name.toLowerCase() === group_name.toLowerCase()
  );
  // return the id, or name if name didn't match any groups
  if (!group) return group_name;
  return group.ref_id;
}

/**
 *  adds an account to a group in a perspective
 *  @param {object} pers - an object representing the perspective containing the group
 *  @param {object} acct - the account to add to a group
 *  @param {string} group_name - the name of the group to add an account to
 */
function add_to_group(pers, acct, group_name) {
  var group_id = get_group_id(pers, group_name);

  // get the rule specifying accounts that belong to this group
  var rule = pers.rules.find(
    (rule) => rule.asset === 'AwsAccount' && rule.to === group_id
  );

  // if the rule doesn't exist, make a rule
  if (!rule) {
    rule = {
      asset: 'AwsAccount',
      to: group_id,
      type: 'filter',
      condition: {
        clauses: [],
      },
    };
    pers.rules.push(rule);
  }

  if (rule.condition.clauses.length === 1) {
    rule.condition.combine_with = 'OR';
  }

  // add a condition for this account to the rule
  rule.condition.clauses.push({
    asset_ref: acct.id,
    op: '=',
    val: acct.id,
  });

  // update the perspective with the new info
  pers_api.update(pers, CloudHealth.utils.print_response);
}

// This callback was supposed to set the name of the group that was created.
// Unfortunately, the name of a group cannot be set by the API yet
//
// (err, json) => {
//   if (group_name === group_id) {
//     pers_api.get(pers.id, (err, pers) => {
//       var groups = pers.constants.find(
//         (constant) => constant.type.toLowerCase() === 'group'
//       );
//       var group = groups.list.find(
//         (group) => group.name.match(/^Group-[0-9]+$/)
//       );
//       group.name = group_name;
//       console.log(JSON.stringify(pers, null, 2)); return ///
//       pers_api.update(pers, CloudHealth.utils.print_response);
//     });
//   }
//   else {
//     CloudHealth.utils.print_response(err, json);
//   }
// }
