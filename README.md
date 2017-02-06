# chapi

Note: This node module is developed entirely separate from the CloudHealth application and APIs (https://github.com/CloudHealth/cht_api_guide). This module is not guaranteed to always function properly with CloudHealth's API due to the potential of their API changing and the fact that this module is not maintained by the same developers that developed the CloudHealth application or API. However, we are in contact with CloudHealth and will update this tool to cover changes to their API.

## Installation

This package can be installed as a command-line util by running

```bash
npm install -g cox-chapi
```

or as a module to be used in a node.js project

```bash
npm install cox-chapi --save
```

which can then be used in a Node.js script by requiring `cox-chapi`

## Usage

The main export of this module is the CloudHealth namespace. It contains classes such as Account, Asset, and Perspective from which objects can be instantiated that contain functions to make API calls to CloudHealth. Instantiating each class takes one argument: your CloudHealth api key. This key can be reset by calling the object's set_api_key method with your api key as the first argument. A valid api key is required for any of the object's methods to work.

To use the module in Node.js, first require the module:

```javascript
var CloudHealth = require('cox-chapi');
```

Then instantiate an object from the class of whichever CloudHealth API you want to use:

```javascript
var account = new CloudHealth.Account('<your-cloudhealth-api-key>');
```

Now you can begin calling the object's methods. Each method takes a requestCallback that will be given two items: an error and the return data. If the call succeeds, the error will be null and the data field will contain your data, otherwise the error will be an error object and the data field may contain information useful for debugging. For example, the following script will get and print an account with the id '1234567890' on success, or throw an error on failure:

```javascript
var CloudHealth = require('cox-chapi');
var account = new CloudHealth.Account('sdafa-asdf-dsfasdf-asdf');

account.get(1234567890, function(err, data) {
  if (err) {
    throw err;
  }
  else {
    console.log(JSON.stringify(data));
  }
});
```

For further documentation of methods, see [Documentation](./doc/DOC.md)

This module can also be used from the command-line. To see how to use this module from the command-line see [Command Line](#command-line)

#### Extra Utilities

Some of the functions used by this module can be found in the utils/chapi.js file. In Node.js, these functions can be accessed through

```javascript
var CloudHealth = require('cox-chapi');
var utils = CloudHealth.utils;
```

## Examples

Examples can be found in the examples folder under the folder for their component name (ie. Account examples are in examples/account). The examples assume the existence of the file examples/config.js which contains a JSON object like `{"api_key": "<your-api-key>"}`. Create this file with your api key if you wish to see the examples work. You may also need to change some of the dummy data used in the examples in order for them to grab actual data

## Documentation

HTML pages containing documentation for all components of this module can be found at https://cox-automotive.github.io/cox-chapi/docs/cox-chapi/1.0.0/ or the same information can be found in a markdown file at `docs/Doc.md`.

## Command Line

#### Setup

On top of being an npm module that can be used with other node.js code, this module creates a command-line utility called `chapi`. To get this command line utility, run `npm install -g <the-name-of-this-repo>`.

The utility works by first setting up your API key by getting an API key from CloudHealth and calling

```bash
chapi set_api_key <your-cloudhealth-api-key>
```

This only needs to be done once. This command will create a json object named .cloudhealthapi.json in your home directory containing your API key for use in future calls to the chapi command-line tool.

#### Usage

The chapi command can be used as follows:

```bash
chapi <component-name> <function-name> [<flags>] [<parameters>]
```

Excluding "set_api_key" which only takes a String, all of the functions in this module that can be called from the command line can take an optional flags object and at most one parameter followed by a callback. The chapi command line utility takes care of the callback for you, printing either an error or the JSON result of whichever function you specified.

Some functions can take a flags object as first parameter, which can be specified as key-value pairs in the form `--key="value"`. The quotes are optional unless the value contains spaces. For example:

```bash
chapi account list --all="true"
```

Note: flags with a value of true can be specified without a value and run just the same (ie. --all="true" is equivalent to --all)

Furthermore, some functions can take a flags object as well as another parameter, and in those cases both flags and parameters can be specified in the same command, like this:

```javascript
chapi perspective destroy --force 1234567890
```

Piped-in JSON data can also be given to functions to make it easier to pass in large JSON data. For instance, assume we have a file account.json:
```json
{
  "name": "Example Account",
  "authentication": {
    "protocol": "access_key",
    "access_key": "QQQQQQQQQQQQQQQ",
    "secret_key": "sosososososososososososososoSecret"
  },
  "billing": {
    "bucket": "my-fake-billing-bucket"
  },
  "cloudtrail": {
    "enabled": "true",
    "bucket": "my-fake-cloudtrail-bucket"
  },
  "aws_config": {
    "enabled": "true",
    "bucket": "my-fake-aws-config-bucket",
    "prefix": "foo"
  },
  "tags": [
    {"key": "Environment", "value": "Production"}
  ]
}
```

We can give this data to our chapi command like this:

```bash
cat account.json | chapi account create
```

To see a full list of commands, refer to the [Documentation](doc/DOC.md)
