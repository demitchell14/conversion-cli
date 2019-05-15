conversion-cli
==============

Node CLI Conversion tool used to convert database data

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/conversion-cli.svg)](https://npmjs.org/package/conversion-cli)
[![Downloads/week](https://img.shields.io/npm/dw/conversion-cli.svg)](https://npmjs.org/package/conversion-cli)
[![License](https://img.shields.io/npm/l/conversion-cli.svg)](https://github.com/demitchell14/conversion-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g conversion-cli
$ cli COMMAND
running command...
$ cli (-v|--version|version)
conversion-cli/0.0.0 win32-x64 node-v10.15.3
$ cli --help [COMMAND]
USAGE
  $ cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`cli convert SOURCE DESTINATION`](#cli-convert-source-destination)
* [`cli hello [FILE]`](#cli-hello-file)
* [`cli help [COMMAND]`](#cli-help-command)

## `cli convert SOURCE DESTINATION`

describe the command here

```
USAGE
  $ cli convert SOURCE DESTINATION

ARGUMENTS
  SOURCE       The handler identifier that is used to aggregate data to be converted
  DESTINATION  The handler identifier that is used to tell the program how to convert

OPTIONS
  -E, --errors=errors          File name to output errors to. Leave blank to not receive error logs
  -L, --logs=logs              File name to output conversion information to. Leave blank to not receive conversion logs
  -S, --statements=statements  File name to output query statements to. Leave blank to not receive statement logs
  -h, --help                   show CLI help
  -k, --key=key                This is required in order to offset / limit in SQLExpress. It is the ORDER BY [Key]
  -l, --limit=limit            Number to indicate how many records to import at a time
  -o, --offset=offset          Number to Indicate the start point where to begin importing from
  -s, --selector=selector      String indicating field names to select delimited by a single comma in between

EXAMPLE
  $ cli convert [from] [to] [handler]
       hello world from ./src/hello.ts!
```

_See code: [src\commands\convert.ts](https://github.com/demitchell14/conversion-cli/blob/v0.0.0/src\commands\convert.ts)_

## `cli hello [FILE]`

describe the command here

```
USAGE
  $ cli hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ cli hello
  hello world from ./src/hello.ts!
```

_See code: [src\commands\hello.ts](https://github.com/demitchell14/conversion-cli/blob/v0.0.0/src\commands\hello.ts)_

## `cli help [COMMAND]`

display help for cli

```
USAGE
  $ cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src\commands\help.ts)_
<!-- commandsstop -->
