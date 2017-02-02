## Modules

<dl>
<dt><a href="#module_cox-chapi">cox-chapi</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#get_package_json">get_package_json(cb)</a></dt>
<dd><p>Gets the package.json file</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#objectCallback">objectCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#arrayCallback">arrayCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#stringCallback">stringCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#mixedCallback">mixedCallback</a> : <code>function</code></dt>
<dd></dd>
</dl>

<a name="module_cox-chapi"></a>

## cox-chapi

* [cox-chapi](#module_cox-chapi)
    * [.Account](#module_cox-chapi.Account)
        * [new Account([api_key])](#new_module_cox-chapi.Account_new)
        * [.set_api_key(api_key)](#module_cox-chapi.Account+set_api_key)
        * [.list([flags], cb)](#module_cox-chapi.Account+list)
        * [.get(id, cb)](#module_cox-chapi.Account+get)
        * [.find_by(field, value, [list], cb)](#module_cox-chapi.Account+find_by)
        * [.create(account, cb)](#module_cox-chapi.Account+create)
        * [.update(account, cb)](#module_cox-chapi.Account+update)
        * [.destroy(id, cb)](#module_cox-chapi.Account+destroy)
    * [.Asset](#module_cox-chapi.Asset)
        * [new Asset([api_key])](#new_module_cox-chapi.Asset_new)
        * [.set_api_key(api_key)](#module_cox-chapi.Asset+set_api_key)
        * [.list_types(cb)](#module_cox-chapi.Asset+list_types)
        * [.fields_for(asset_type, cb)](#module_cox-chapi.Asset+fields_for)
        * [.query(match, cb)](#module_cox-chapi.Asset+query)
    * [.Perspective](#module_cox-chapi.Perspective)
        * [new Perspective([api_key])](#new_module_cox-chapi.Perspective_new)
        * [.set_api_key(api_key)](#module_cox-chapi.Perspective+set_api_key)
        * [.get([flags], id, cb)](#module_cox-chapi.Perspective+get)
        * [.list_groups(pers, cb)](#module_cox-chapi.Perspective+list_groups)
        * [.add_to_group(pers, accts, group_name, cb)](#module_cox-chapi.Perspective+add_to_group)
        * [.list([flags], cb)](#module_cox-chapi.Perspective+list)
        * [.create(perspective, cb)](#module_cox-chapi.Perspective+create)
        * [.update(perspective, cb)](#module_cox-chapi.Perspective+update)
        * [.destroy([flags], id, cb)](#module_cox-chapi.Perspective+destroy)
    * [.Report](#module_cox-chapi.Report)
        * [new Report([api_key])](#new_module_cox-chapi.Report_new)
        * [.set_api_key(api_key)](#module_cox-chapi.Report+set_api_key)
        * [.list([flags], [topic], cb)](#module_cox-chapi.Report+list)
        * [.get(id, cb)](#module_cox-chapi.Report+get)
        * [.dimensions([flags], base, cb)](#module_cox-chapi.Report+dimensions)
        * [.generate(base, x, y, category, [interval], cb)](#module_cox-chapi.Report+generate)
    * [.Tag](#module_cox-chapi.Tag)
        * [new Tag([api_key])](#new_module_cox-chapi.Tag_new)
        * [.set_api_key(api_key)](#module_cox-chapi.Tag+set_api_key)
        * [.set(aws_id, [asset_id], tags, cb)](#module_cox-chapi.Tag+set)
        * [.delete(aws_id, [asset_id], tags, cb)](#module_cox-chapi.Tag+delete)
    * [.utils](#module_cox-chapi.utils) : <code>object</code>
        * [.execute(component, func, params, [cb])](#module_cox-chapi.utils.execute)
        * [.find_api_key(cb)](#module_cox-chapi.utils.find_api_key)
        * [.find_cache(cb)](#module_cox-chapi.utils.find_cache)
        * ~~[.find_creds(cb)](#module_cox-chapi.utils.find_creds)~~
        * [.parse_chapi(params)](#module_cox-chapi.utils.parse_chapi) ⇒ <code>Array</code>
        * [.print_response(err, res)](#module_cox-chapi.utils.print_response)
        * [.read_stdin(cb)](#module_cox-chapi.utils.read_stdin)
        * [.run(script)](#module_cox-chapi.utils.run) ⇒ <code>EventEmitter</code>
        * [.send_request([flags], options, send_data, cb)](#module_cox-chapi.utils.send_request)
        * [.set_api_key(api_key, [cb])](#module_cox-chapi.utils.set_api_key)
        * [.set_cache(cache_name, cache, [cb])](#module_cox-chapi.utils.set_cache)
        * ~~[.set_creds(api_key, [cb])](#module_cox-chapi.utils.set_creds)~~
    * [.commands](#module_cox-chapi.commands) : <code>object</code>
        * [.make_api_call(component_name, func_name, params, cb)](#module_cox-chapi.commands.make_api_call)
        * [.resolve_component(name, [api_key])](#module_cox-chapi.commands.resolve_component) ⇒ <code>object</code>
        * [.resolve_inputs(args)](#module_cox-chapi.commands.resolve_inputs)
        * [.resolve_func(component, func_name)](#module_cox-chapi.commands.resolve_func) ⇒ <code>function</code>
        * [.run_script(name)](#module_cox-chapi.commands.run_script)
        * [.set_api_key(api_key)](#module_cox-chapi.commands.set_api_key)
        * [.show_help()](#module_cox-chapi.commands.show_help)
        * [.show_version()](#module_cox-chapi.commands.show_version)
        * [.use_api(args)](#module_cox-chapi.commands.use_api)


-

<a name="module_cox-chapi.Account"></a>

### cox-chapi.Account
**Kind**: static class of <code>[cox-chapi](#module_cox-chapi)</code>  

* [.Account](#module_cox-chapi.Account)
    * [new Account([api_key])](#new_module_cox-chapi.Account_new)
    * [.set_api_key(api_key)](#module_cox-chapi.Account+set_api_key)
    * [.list([flags], cb)](#module_cox-chapi.Account+list)
    * [.get(id, cb)](#module_cox-chapi.Account+get)
    * [.find_by(field, value, [list], cb)](#module_cox-chapi.Account+find_by)
    * [.create(account, cb)](#module_cox-chapi.Account+create)
    * [.update(account, cb)](#module_cox-chapi.Account+update)
    * [.destroy(id, cb)](#module_cox-chapi.Account+destroy)


-

<a name="new_module_cox-chapi.Account_new"></a>

#### new Account([api_key])

| Param | Type |
| --- | --- |
| [api_key] | <code>string</code> | 


-

<a name="module_cox-chapi.Account+set_api_key"></a>

#### account.set_api_key(api_key)
sets the api key to use when making calls to CloudHealth's API

**Kind**: instance method of <code>[Account](#module_cox-chapi.Account)</code>  

| Param | Type |
| --- | --- |
| api_key | <code>string</code> | 


-

<a name="module_cox-chapi.Account+list"></a>

#### account.list([flags], cb)
gets a JSON object containing all the accounts

**Kind**: instance method of <code>[Account](#module_cox-chapi.Account)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [flags] | <code>object</code> | an object specifying the following options |
| [flags.page] | <code>number</code> | the page number of the page to get |
| [flags.page_count] | <code>number</code> | the number of accounts to list per page |
| [flags.all] | <code>boolean</code> | if true, return complete list (all pages) but this may take longer |
| [flags.stats] | <code>boolean</code> | if true, the page count, number of entries per                                   page, and number of pages will be given in an                                   object rather than the array of accounts |
| cb | <code>[arrayCallback](#arrayCallback)</code> | called with an array of accounts |


-

<a name="module_cox-chapi.Account+get"></a>

#### account.get(id, cb)
gets a JSON object containing data for a single account

**Kind**: instance method of <code>[Account](#module_cox-chapi.Account)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | the id of the account |
| cb | <code>[objectCallback](#objectCallback)</code> | called with the account |


-

<a name="module_cox-chapi.Account+find_by"></a>

#### account.find_by(field, value, [list], cb)
gets accounts such that field matches the value

**Kind**: instance method of <code>[Account](#module_cox-chapi.Account)</code>  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | the name of the field to search by |
| value | <code>string</code> | the value to match |
| [list] | <code>Array</code> | an optional array of accounts to search (if given,                          the search will not make http requests, improving                          speed) |
| cb | <code>[arrayCallback](#arrayCallback)</code> | called with an array containing the matching                              accounts |


-

<a name="module_cox-chapi.Account+create"></a>

#### account.create(account, cb)
Creates an account from the json object

**Kind**: instance method of <code>[Account](#module_cox-chapi.Account)</code>  

| Param | Type | Description |
| --- | --- | --- |
| account | <code>object</code> | an object specifying fields for the new account |
| cb | <code>[objectCallback](#objectCallback)</code> | called with the new account |


-

<a name="module_cox-chapi.Account+update"></a>

#### account.update(account, cb)
Updates fields for the account with the specified id to match the given object

**Kind**: instance method of <code>[Account](#module_cox-chapi.Account)</code>  

| Param | Type | Description |
| --- | --- | --- |
| account | <code>object</code> | an object specifying fields with updated values |
| account.id | <code>number</code> | the id of the account |
| cb | <code>[objectCallback](#objectCallback)</code> | called with the updated account |


-

<a name="module_cox-chapi.Account+destroy"></a>

#### account.destroy(id, cb)
Deletes the account with the specified id

**Kind**: instance method of <code>[Account](#module_cox-chapi.Account)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | the id of the account |
| cb | <code>[stringCallback](#stringCallback)</code> | called with a success message |


-

<a name="module_cox-chapi.Asset"></a>

### cox-chapi.Asset
**Kind**: static class of <code>[cox-chapi](#module_cox-chapi)</code>  

* [.Asset](#module_cox-chapi.Asset)
    * [new Asset([api_key])](#new_module_cox-chapi.Asset_new)
    * [.set_api_key(api_key)](#module_cox-chapi.Asset+set_api_key)
    * [.list_types(cb)](#module_cox-chapi.Asset+list_types)
    * [.fields_for(asset_type, cb)](#module_cox-chapi.Asset+fields_for)
    * [.query(match, cb)](#module_cox-chapi.Asset+query)


-

<a name="new_module_cox-chapi.Asset_new"></a>

#### new Asset([api_key])

| Param | Type |
| --- | --- |
| [api_key] | <code>string</code> | 


-

<a name="module_cox-chapi.Asset+set_api_key"></a>

#### asset.set_api_key(api_key)
sets the api key to use when making calls to CloudHealth's API

**Kind**: instance method of <code>[Asset](#module_cox-chapi.Asset)</code>  

| Param | Type |
| --- | --- |
| api_key | <code>string</code> | 


-

<a name="module_cox-chapi.Asset+list_types"></a>

#### asset.list_types(cb)
gets an array of names of object types that can be searched for

**Kind**: instance method of <code>[Asset](#module_cox-chapi.Asset)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[arrayCallback](#arrayCallback)</code> | called with an array of types (as strings) |


-

<a name="module_cox-chapi.Asset+fields_for"></a>

#### asset.fields_for(asset_type, cb)
gets an object containing field names, the name of the asset, and an array
 of relation fields

**Kind**: instance method of <code>[Asset](#module_cox-chapi.Asset)</code>  

| Param | Type | Description |
| --- | --- | --- |
| asset_type | <code>string</code> | the asset type to list fields for |
| cb | <code>[arrayCallback](#arrayCallback)</code> | called with an array of objects detailing the fields |


-

<a name="module_cox-chapi.Asset+query"></a>

#### asset.query(match, cb)
Queries the list of assets of a given type for those matching specified fields

**Kind**: instance method of <code>[Asset](#module_cox-chapi.Asset)</code>  

| Param | Type | Description |
| --- | --- | --- |
| match | <code>object</code> | an object where the keys are field names and the    values are the values to match for that field (leave null to get all    assets of the given type) |
| match.asset_type | <code>string</code> | the type of asset to search for |
| cb | <code>[arrayCallback](#arrayCallback)</code> | called with an array of asset objects |


-

<a name="module_cox-chapi.Perspective"></a>

### cox-chapi.Perspective
**Kind**: static class of <code>[cox-chapi](#module_cox-chapi)</code>  

* [.Perspective](#module_cox-chapi.Perspective)
    * [new Perspective([api_key])](#new_module_cox-chapi.Perspective_new)
    * [.set_api_key(api_key)](#module_cox-chapi.Perspective+set_api_key)
    * [.get([flags], id, cb)](#module_cox-chapi.Perspective+get)
    * [.list_groups(pers, cb)](#module_cox-chapi.Perspective+list_groups)
    * [.add_to_group(pers, accts, group_name, cb)](#module_cox-chapi.Perspective+add_to_group)
    * [.list([flags], cb)](#module_cox-chapi.Perspective+list)
    * [.create(perspective, cb)](#module_cox-chapi.Perspective+create)
    * [.update(perspective, cb)](#module_cox-chapi.Perspective+update)
    * [.destroy([flags], id, cb)](#module_cox-chapi.Perspective+destroy)


-

<a name="new_module_cox-chapi.Perspective_new"></a>

#### new Perspective([api_key])

| Param | Type |
| --- | --- |
| [api_key] | <code>string</code> | 


-

<a name="module_cox-chapi.Perspective+set_api_key"></a>

#### perspective.set_api_key(api_key)
sets the api key to use when making calls to CloudHealth's API

**Kind**: instance method of <code>[Perspective](#module_cox-chapi.Perspective)</code>  

| Param | Type |
| --- | --- |
| api_key | <code>string</code> | 


-

<a name="module_cox-chapi.Perspective+get"></a>

#### perspective.get([flags], id, cb)
gets a JSON object containing data for a perspective

**Kind**: instance method of <code>[Perspective](#module_cox-chapi.Perspective)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [flags] | <code>object</code> | an optional flags object |
| [flags.cache] | <code>boolean</code> | if true, this method will re-use a stored list                                   of perspectives from the last time the --cache                                   flag wasn't used when looking up ids from names |
| id | <code>number</code> | the id of the perspective |
| cb | <code>[objectCallback](#objectCallback)</code> | called with an object representing the perspective |


-

<a name="module_cox-chapi.Perspective+list_groups"></a>

#### perspective.list_groups(pers, cb)
gets an array of groups for a perspective

**Kind**: instance method of <code>[Perspective](#module_cox-chapi.Perspective)</code>  

| Param | Type | Description |
| --- | --- | --- |
| pers | <code>object</code> &#124; <code>string</code> | an object representing a perspective, or                                the perspective's id |
| cb | <code>[arrayCallback](#arrayCallback)</code> | an array of groups for the perspective |


-

<a name="module_cox-chapi.Perspective+add_to_group"></a>

#### perspective.add_to_group(pers, accts, group_name, cb)
adds an account to a group in a perspective

**Kind**: instance method of <code>[Perspective](#module_cox-chapi.Perspective)</code>  

| Param | Type | Description |
| --- | --- | --- |
| pers | <code>object</code> &#124; <code>string</code> | an object representing the perspective, or                                the perspective's id |
| accts | <code>mixed</code> | the account to add to a group, the account's id, or                        an array of a mixture of those |
| group_name | <code>string</code> | the name of the group to add an account to |
| cb | <code>[objectCallback](#objectCallback)</code> | called with the updated perspective |


-

<a name="module_cox-chapi.Perspective+list"></a>

#### perspective.list([flags], cb)
gets a JSON object containing all the perspectives

**Kind**: instance method of <code>[Perspective](#module_cox-chapi.Perspective)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [flags] | <code>object</code> | an optional flags object |
| [flags.cache] | <code>boolean</code> | if true, this method will re-use a stored list                                   of perspectives from the last time the --cache                                   flag wasn't used |
| cb | <code>[objectCallback](#objectCallback)</code> | called with an object with an array of perspective names/ids |


-

<a name="module_cox-chapi.Perspective+create"></a>

#### perspective.create(perspective, cb)
Creates an perspective from the json object

**Kind**: instance method of <code>[Perspective](#module_cox-chapi.Perspective)</code>  

| Param | Type | Description |
| --- | --- | --- |
| perspective | <code>object</code> | an object specifying fields for the new perspective |
| cb | <code>[objectCallback](#objectCallback)</code> | called with the new perspective |


-

<a name="module_cox-chapi.Perspective+update"></a>

#### perspective.update(perspective, cb)
Updates fields for the perspective with the specified id to match the given object

**Kind**: instance method of <code>[Perspective](#module_cox-chapi.Perspective)</code>  

| Param | Type | Description |
| --- | --- | --- |
| perspective | <code>object</code> | an object holding new data to update the perspective with |
| perspective.id | <code>number</code> | the id of the perspective |
| cb | <code>[objectCallback](#objectCallback)</code> | called with the updated perspective |


-

<a name="module_cox-chapi.Perspective+destroy"></a>

#### perspective.destroy([flags], id, cb)
Deletes the perspective with the specified id

**Kind**: instance method of <code>[Perspective](#module_cox-chapi.Perspective)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [flags] | <code>object</code> | leave null/undefined if not specifying options |
| [flags.force] | <code>boolean</code> | if true, delete regardless of dependencies |
| [flags.hard_delete] | <code>boolean</code> | if true, skips archiving the perspective before deletion |
| id | <code>number</code> | the id of the perspective |
| cb | <code>[stringCallback](#stringCallback)</code> | called with a success message |


-

<a name="module_cox-chapi.Report"></a>

### cox-chapi.Report
**Kind**: static class of <code>[cox-chapi](#module_cox-chapi)</code>  

* [.Report](#module_cox-chapi.Report)
    * [new Report([api_key])](#new_module_cox-chapi.Report_new)
    * [.set_api_key(api_key)](#module_cox-chapi.Report+set_api_key)
    * [.list([flags], [topic], cb)](#module_cox-chapi.Report+list)
    * [.get(id, cb)](#module_cox-chapi.Report+get)
    * [.dimensions([flags], base, cb)](#module_cox-chapi.Report+dimensions)
    * [.generate(base, x, y, category, [interval], cb)](#module_cox-chapi.Report+generate)


-

<a name="new_module_cox-chapi.Report_new"></a>

#### new Report([api_key])

| Param | Type |
| --- | --- |
| [api_key] | <code>string</code> | 


-

<a name="module_cox-chapi.Report+set_api_key"></a>

#### report.set_api_key(api_key)
sets the api key to use when making calls to CloudHealth's API

**Kind**: instance method of <code>[Report](#module_cox-chapi.Report)</code>  

| Param | Type |
| --- | --- |
| api_key | <code>string</code> | 


-

<a name="module_cox-chapi.Report+list"></a>

#### report.list([flags], [topic], cb)
gets a list of topics (or reports for a topic if a topic id is specified)

**Kind**: instance method of <code>[Report](#module_cox-chapi.Report)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [flags] | <code>object</code> | an optional object specifying the following options |
| [flags.nest] | <code>boolean</code> | if true, each topic will have a "reports"    field containing the result of calling this function for that topic |
| [flags.all] | <code>boolean</code> | same as nest |
| [topic] | <code>string</code> | the topic to list subtopics for |
| cb | <code>[arrayCallback](#arrayCallback)</code> | called with an array of objects, each containing    a name and id field for a topic |


-

<a name="module_cox-chapi.Report+get"></a>

#### report.get(id, cb)
gets data for the report with the given id

**Kind**: instance method of <code>[Report](#module_cox-chapi.Report)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | the id of the report |
| cb | <code>[objectCallback](#objectCallback)</code> | yields the report data |


-

<a name="module_cox-chapi.Report+dimensions"></a>

#### report.dimensions([flags], base, cb)
lists the possible dimensions for generating a report under a base

**Kind**: instance method of <code>[Report](#module_cox-chapi.Report)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [flags] | <code>object</code> | an object containing flags |
| [flags.short] | <code>boolean</code> | specifies to yield only the name and label    of dimensions and measures |
| base | <code>string</code> | the category/sub-category for the report to show in    the form "category/sub-category" (ie. "usage/instance" or "cost/history") |
| cb | <code>[objectCallback](#objectCallback)</code> | yields an object containing dimensions (used    for x-axis or category) and measures (used for y-axis) |


-

<a name="module_cox-chapi.Report+generate"></a>

#### report.generate(base, x, y, category, [interval], cb)
returns data for a custom report built from the parameters you specify

**Kind**: instance method of <code>[Report](#module_cox-chapi.Report)</code>  

| Param | Type | Description |
| --- | --- | --- |
| base | <code>string</code> | the category/sub-category for the report to show in    the form "category/sub-category" (ie. "usage/instance" or "cost/history") |
| x | <code>string</code> | the id of the dimension to use for the x-axis |
| y | <code>string</code> | the id of the measure to use for the y-axis |
| category | <code>string</code> | the id of the dimension to use for categorizing    the report's data |
| [interval] | <code>stirng</code> | the time interval by which to break up the data    (only use if either the x or category dimensions are "time") |
| cb | <code>[objectCallback](#objectCallback)</code> | yields an object containing data for the report    as well as data about the report (including dimensions, filters, interval,    measures, report name, status, and the last time the report was updated) |


-

<a name="module_cox-chapi.Tag"></a>

### cox-chapi.Tag
**Kind**: static class of <code>[cox-chapi](#module_cox-chapi)</code>  

* [.Tag](#module_cox-chapi.Tag)
    * [new Tag([api_key])](#new_module_cox-chapi.Tag_new)
    * [.set_api_key(api_key)](#module_cox-chapi.Tag+set_api_key)
    * [.set(aws_id, [asset_id], tags, cb)](#module_cox-chapi.Tag+set)
    * [.delete(aws_id, [asset_id], tags, cb)](#module_cox-chapi.Tag+delete)


-

<a name="new_module_cox-chapi.Tag_new"></a>

#### new Tag([api_key])

| Param | Type |
| --- | --- |
| [api_key] | <code>string</code> | 


-

<a name="module_cox-chapi.Tag+set_api_key"></a>

#### tag.set_api_key(api_key)
sets the api key to use when making calls to CloudHealth's API

**Kind**: instance method of <code>[Tag](#module_cox-chapi.Tag)</code>  

| Param | Type |
| --- | --- |
| api_key | <code>string</code> | 


-

<a name="module_cox-chapi.Tag+set"></a>

#### tag.set(aws_id, [asset_id], tags, cb)
adds/updates tags for an account or asset

**Kind**: instance method of <code>[Tag](#module_cox-chapi.Tag)</code>  

| Param | Type | Description |
| --- | --- | --- |
| aws_id | <code>number</code> | the aws id (owner_id) of the account |
| [asset_id] | <code>string</code> | the id of the asset |
| tags | <code>object</code> | the tags to set |
| cb | <code>[stringCallback](#stringCallback)</code> | called with a message saying how many tags were set |


-

<a name="module_cox-chapi.Tag+delete"></a>

#### tag.delete(aws_id, [asset_id], tags, cb)
delete tags from an account or asset

**Kind**: instance method of <code>[Tag](#module_cox-chapi.Tag)</code>  

| Param | Type | Description |
| --- | --- | --- |
| aws_id | <code>number</code> | the aws id (owner_id) of the account |
| [asset_id] | <code>string</code> | the id of the asset |
| tags | <code>Array.&lt;string&gt;</code> &#124; <code>object</code> | the tags to delete |
| cb | <code>[stringCallback](#stringCallback)</code> | called with a message saying how many tags were deleted |


-

<a name="module_cox-chapi.utils"></a>

### cox-chapi.utils : <code>object</code>
**Kind**: static namespace of <code>[cox-chapi](#module_cox-chapi)</code>  

* [.utils](#module_cox-chapi.utils) : <code>object</code>
    * [.execute(component, func, params, [cb])](#module_cox-chapi.utils.execute)
    * [.find_api_key(cb)](#module_cox-chapi.utils.find_api_key)
    * [.find_cache(cb)](#module_cox-chapi.utils.find_cache)
    * ~~[.find_creds(cb)](#module_cox-chapi.utils.find_creds)~~
    * [.parse_chapi(params)](#module_cox-chapi.utils.parse_chapi) ⇒ <code>Array</code>
    * [.print_response(err, res)](#module_cox-chapi.utils.print_response)
    * [.read_stdin(cb)](#module_cox-chapi.utils.read_stdin)
    * [.run(script)](#module_cox-chapi.utils.run) ⇒ <code>EventEmitter</code>
    * [.send_request([flags], options, send_data, cb)](#module_cox-chapi.utils.send_request)
    * [.set_api_key(api_key, [cb])](#module_cox-chapi.utils.set_api_key)
    * [.set_cache(cache_name, cache, [cb])](#module_cox-chapi.utils.set_cache)
    * ~~[.set_creds(api_key, [cb])](#module_cox-chapi.utils.set_creds)~~


-

<a name="module_cox-chapi.utils.execute"></a>

#### utils.execute(component, func, params, [cb])
Executes func on component with params as parameters

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| component | <code>object</code> |  |
| func | <code>function</code> |  |
| params | <code>Array.&lt;string&gt;</code> |  |
| [cb] | <code>[mixedCallback](#mixedCallback)</code> | called with the result of func (required if func takes a callback) |


-

<a name="module_cox-chapi.utils.find_api_key"></a>

#### utils.find_api_key(cb)
gets the api_key for the current environment

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[objectCallback](#objectCallback)</code> | called with the api_key |


-

<a name="module_cox-chapi.utils.find_cache"></a>

#### utils.find_cache(cb)
gets the cache with the given cache_name from the settings file if it exists

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[mixedCallback](#mixedCallback)</code> | called with the cache value |


-

<a name="module_cox-chapi.utils.find_creds"></a>

#### ~~utils.find_creds(cb)~~
***Deprecated***

gets the creds object from the settings file if it exists

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[objectCallback](#objectCallback)</code> | called with the credentials object |


-

<a name="module_cox-chapi.utils.parse_chapi"></a>

#### utils.parse_chapi(params) ⇒ <code>Array</code>
parses an array of key-value pairs (ie. --key=value) into a javscript object

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  
**Returns**: <code>Array</code> - an array whose first parameter is an object containing the
                 key-value pairs, and the remaining parameters are any non-key-value
                 pairs in the order that they were given  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Array.&lt;string&gt;</code> | an array of chapi strings of the form "--key=value" |


-

<a name="module_cox-chapi.utils.print_response"></a>

#### utils.print_response(err, res)
prints the contents of a json object or an error message. Intended
 as a callback

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type |
| --- | --- |
| err | <code>object</code> | 
| res | <code>mixed</code> | 


-

<a name="module_cox-chapi.utils.read_stdin"></a>

#### utils.read_stdin(cb)
Reads from stdin and sends data through callback

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[stringCallback](#stringCallback)</code> | called with the data that was read in |


-

<a name="module_cox-chapi.utils.run"></a>

#### utils.run(script) ⇒ <code>EventEmitter</code>
executes a script in the scripts folder with the given arguments

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  
**Returns**: <code>EventEmitter</code> - an EventEmitter for the child process  

| Param | Type | Description |
| --- | --- | --- |
| script | <code>string</code> | the name of the script to run (without .js) |


-

<a name="module_cox-chapi.utils.send_request"></a>

#### utils.send_request([flags], options, send_data, cb)
function for sending an HTTPS call for CloudHealth's API

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [flags] | <code>object</code> | an optional flags object |
| [flags.headers] | <code>boolean</code> | if true, yield only the headers returned |
| options | <code>object</code> | options to use for the https.request function |
| send_data | <code>string</code> | data to send |
| cb | <code>[objectCallback](#objectCallback)</code> | called with the parsed json response body |


-

<a name="module_cox-chapi.utils.set_api_key"></a>

#### utils.set_api_key(api_key, [cb])
sets the api_key for an environment

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| api_key | <code>string</code> | the api_key to use for CloudHealth |
| [cb] | <code>[objectCallback](#objectCallback)</code> | called with the api_key |


-

<a name="module_cox-chapi.utils.set_cache"></a>

#### utils.set_cache(cache_name, cache, [cb])
sets a cache with the given cache_name object by writing to a settings file

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cache_name | <code>string</code> | the name of the cache variable to set |
| cache | <code>mixed</code> | the new cache variable |
| [cb] | <code>[mixedCallback](#mixedCallback)</code> | called with the new cache variable |


-

<a name="module_cox-chapi.utils.set_creds"></a>

#### ~~utils.set_creds(api_key, [cb])~~
***Deprecated***

sets the credentials object by writing to a settings file

**Kind**: static method of <code>[utils](#module_cox-chapi.utils)</code>  

| Param | Type | Description |
| --- | --- | --- |
| api_key | <code>string</code> | the api_key to use for CloudHealth |
| [cb] | <code>[objectCallback](#objectCallback)</code> | called with the credentials object |


-

<a name="module_cox-chapi.commands"></a>

### cox-chapi.commands : <code>object</code>
**Kind**: static namespace of <code>[cox-chapi](#module_cox-chapi)</code>  

* [.commands](#module_cox-chapi.commands) : <code>object</code>
    * [.make_api_call(component_name, func_name, params, cb)](#module_cox-chapi.commands.make_api_call)
    * [.resolve_component(name, [api_key])](#module_cox-chapi.commands.resolve_component) ⇒ <code>object</code>
    * [.resolve_inputs(args)](#module_cox-chapi.commands.resolve_inputs)
    * [.resolve_func(component, func_name)](#module_cox-chapi.commands.resolve_func) ⇒ <code>function</code>
    * [.run_script(name)](#module_cox-chapi.commands.run_script)
    * [.set_api_key(api_key)](#module_cox-chapi.commands.set_api_key)
    * [.show_help()](#module_cox-chapi.commands.show_help)
    * [.show_version()](#module_cox-chapi.commands.show_version)
    * [.use_api(args)](#module_cox-chapi.commands.use_api)


-

<a name="module_cox-chapi.commands.make_api_call"></a>

#### commands.make_api_call(component_name, func_name, params, cb)
makes an api call by calling <component_name>#<func_name> with params

**Kind**: static method of <code>[commands](#module_cox-chapi.commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| component_name | <code>string</code> | the name of the component to call func_name on |
| func_name | <code>string</code> | the name of the function to call |
| params | <code>Array.&lt;string&gt;</code> | an array of parameters to give to func_name |
| cb | <code>[mixedCallback](#mixedCallback)</code> | yields the result of the api call |


-

<a name="module_cox-chapi.commands.resolve_component"></a>

#### commands.resolve_component(name, [api_key]) ⇒ <code>object</code>
resolves a name of a component and retrieves the actual component

**Kind**: static method of <code>[commands](#module_cox-chapi.commands)</code>  
**Returns**: <code>object</code> - the component object  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | the name of the component |
| [api_key] | <code>string</code> | the api_key to use when creating the component |


-

<a name="module_cox-chapi.commands.resolve_inputs"></a>

#### commands.resolve_inputs(args)
calls the appropriate command based on the given arguments

**Kind**: static method of <code>[commands](#module_cox-chapi.commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array.&lt;string&gt;</code> | and array of arguments |


-

<a name="module_cox-chapi.commands.resolve_func"></a>

#### commands.resolve_func(component, func_name) ⇒ <code>function</code>
retrieves the function with the given name for the given component

**Kind**: static method of <code>[commands](#module_cox-chapi.commands)</code>  
**Returns**: <code>function</code> - the function  

| Param | Type | Description |
| --- | --- | --- |
| component | <code>object</code> | the component object containing the desired function |
| func_name | <code>string</code> | the name of the function to retrieve |


-

<a name="module_cox-chapi.commands.run_script"></a>

#### commands.run_script(name)
executes a script in the scripts folder with the given arguments

**Kind**: static method of <code>[commands](#module_cox-chapi.commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | the name of the script |


-

<a name="module_cox-chapi.commands.set_api_key"></a>

#### commands.set_api_key(api_key)
sets the api key and prints a message on success

**Kind**: static method of <code>[commands](#module_cox-chapi.commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| api_key | <code>string</code> | the api key to set |


-

<a name="module_cox-chapi.commands.show_help"></a>

#### commands.show_help()
prints a message explaining the usage of the tool

**Kind**: static method of <code>[commands](#module_cox-chapi.commands)</code>  

-

<a name="module_cox-chapi.commands.show_version"></a>

#### commands.show_version()
prints the name and version number of this tool

**Kind**: static method of <code>[commands](#module_cox-chapi.commands)</code>  

-

<a name="module_cox-chapi.commands.use_api"></a>

#### commands.use_api(args)
reads parameters from stdin (if any), adds them to the list of params, and
 makes an api call based on the given args

**Kind**: static method of <code>[commands](#module_cox-chapi.commands)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array.&lt;string&gt;</code> | an array in the form [component, function, parameters] |


-

<a name="get_package_json"></a>

## get_package_json(cb)
Gets the package.json file

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[objectCallback](#objectCallback)</code> | yields an object containing package.json data |


-

<a name="objectCallback"></a>

## objectCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | an error object |
| obj | <code>object</code> | a simple object |


-

<a name="arrayCallback"></a>

## arrayCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | an error object |
| arr | <code>Array</code> | an array |


-

<a name="stringCallback"></a>

## stringCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | an error object |
| str | <code>string</code> | a string |


-

<a name="mixedCallback"></a>

## mixedCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | an error object |
| data | <code>mixed</code> | some data (may be string, object, array, or other type) |


-

