oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @supernovaio/cli
$ supernova COMMAND
running command...
$ supernova (--version)
@supernovaio/cli/0.1.0 darwin-x64 node-v12.21.0
$ supernova --help [COMMAND]
USAGE
  $ supernova COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`supernova help [COMMAND]`](#supernova-help-command)
* [`supernova plugins`](#supernova-plugins)
* [`supernova plugins:install PLUGIN...`](#supernova-pluginsinstall-plugin)
* [`supernova plugins:inspect PLUGIN...`](#supernova-pluginsinspect-plugin)
* [`supernova plugins:install PLUGIN...`](#supernova-pluginsinstall-plugin-1)
* [`supernova plugins:link PLUGIN`](#supernova-pluginslink-plugin)
* [`supernova plugins:uninstall PLUGIN...`](#supernova-pluginsuninstall-plugin)
* [`supernova plugins:uninstall PLUGIN...`](#supernova-pluginsuninstall-plugin-1)
* [`supernova plugins:uninstall PLUGIN...`](#supernova-pluginsuninstall-plugin-2)
* [`supernova plugins update`](#supernova-plugins-update)
* [`supernova sync-design-tokens`](#supernova-sync-design-tokens)

## `supernova help [COMMAND]`

Display help for supernova.

```
USAGE
  $ supernova help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for supernova.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `supernova plugins`

List installed plugins.

```
USAGE
  $ supernova plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ supernova plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/index.ts)_

## `supernova plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ supernova plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ supernova plugins add

EXAMPLES
  $ supernova plugins:install myplugin 

  $ supernova plugins:install https://github.com/someuser/someplugin

  $ supernova plugins:install someuser/someplugin
```

## `supernova plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ supernova plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ supernova plugins:inspect myplugin
```

## `supernova plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ supernova plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ supernova plugins add

EXAMPLES
  $ supernova plugins:install myplugin 

  $ supernova plugins:install https://github.com/someuser/someplugin

  $ supernova plugins:install someuser/someplugin
```

## `supernova plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ supernova plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ supernova plugins:link myplugin
```

## `supernova plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ supernova plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ supernova plugins unlink
  $ supernova plugins remove
```

## `supernova plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ supernova plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ supernova plugins unlink
  $ supernova plugins remove
```

## `supernova plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ supernova plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ supernova plugins unlink
  $ supernova plugins remove
```

## `supernova plugins update`

Update installed plugins.

```
USAGE
  $ supernova plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `supernova sync-design-tokens`

Supernova CLI description TODO

```
USAGE
  $ supernova sync-design-tokens -k <value> -d <value> [-b <value>] [-i <value> | -p <value>] [-r]

FLAGS
  -b, --brandName=<value>       Brand to synchronize contents with
  -d, --designSystemId=<value>  (required) Design System to synchronize contents with
  -i, --input=<value>           Contents of design tokens plugin definition JSON file
  -k, --apiKey=<value>          (required) API key to use for accessing Supernova instance
  -p, --inputPath=<value>       Contents of design tokens plugin definition JSON file
  -r, --dryRun                  When enabled, CLI will validate entire setup including loading/parsing/merging of tokens
                                but will stop before writing them to remote source

DESCRIPTION
  Supernova CLI description TODO

EXAMPLES
  $ @supernovaio/cli sync-design-tokens --apiKey="{key}" --workspaceId=123 --designSystemId=456 --brandName="Test" --input "{}"
```

_See code: [dist/commands/sync-design-tokens.ts](https://github.com/Supernova-Studio/cli/blob/v0.1.0/dist/commands/sync-design-tokens.ts)_
<!-- commandsstop -->
