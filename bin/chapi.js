#!/usr/bin/env node
/**
 *  @overview provides a command-line inteface for this module
 *  @author Ben Watson <ben.watson@coxautoinc.com>
 */

var commands = require('../utils/commands');
commands.resolve_inputs(process.argv.slice(2));
