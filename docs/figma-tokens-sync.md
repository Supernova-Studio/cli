# Sync Figma Tokens JSON with Supernova

Figma Tokens is a Figma Plugin allowing you to integrate Tokens into your Figma designs. It is also the most advanced in-editor solution to manage your Figma Tokens, and works amazingly well when combined with Supernova's design system management, advanced automation and documentation.

Using Supernova CLI, **you can synchronize tokens from Figma Tokens plugin to Supernova workspaces** using its data defined in JSON format. Make sure that you have Supernova CLI [installed](https://github.com/Supernova-Studio/cli) as global or local dependency before continuing with this tutorial.

## How does Supernova <> Figma Tokens sync work

[TODO]

## Configuring Supernova <> Figma Tokens mapping

[TODO]

## Synchronization commands

To synchronize a single token file (for single file mode), use the following command:

```sh
  $ @supernovaio/cli sync-tokens \
    --apiKey="xxx-xxx-xxx" \
    --designSystemId="1234" \
    --tokenFilePath "/path/to/tokens.json" \
    --configFilePath "/path/to/supernova.settings.json"
```

To synchronize multiple token files (for multi-file mode), use the following command:

```sh
  $ @supernovaio/cli sync-tokens \
    --apiKey="xxx-xxx-xxx" \
    --designSystemId="1234" \
    --tokenDirPath "/path/to/tokens/" \
    --configFilePath "/path/to/supernova.settings.json"
```

Note that it is not possible to combine single-file and multi-file mode. If you do need to synchronize your tokens using different approaches, run as many commands as you have your targets with different configuration.


## Command Options

Following are all the command options you can use to change behavior of the token sync. All options must start with `--{key}` followed by the value, usually string in quotes.

**apiKey (required)**

API key to use for accessing Supernova instance. You can obtain API key from your [Supernova profile](https://cloud.supernova.io/user-profile/general). We strongly recommend keeping your API key in secure storage, either in environment files or key vault if you are using services like GitHub (actions). Never share your API key with anyone!

```
  --apiKey=<value>        
```

**configFilePath (required)**

Path to configuration JSON file. 

```
  --configFilePath=<value> 
```

**designSystemId (required)**

Design System to synchronize contents of token files with. You can get your design system ID from the URL address when you are visiting Supernova Cloud. For example, url such as this: https://cloud.supernova.io/ws/design-systems/ds/1234-main/latest contains design system id `1234`, so use that for whatever design system you are targeting.

```
  --designSystemId=<value>
```

**tokenDirPath (one of)**

Path to directory of JSON files containing token definitions. If you are synchronizing tokens from entire directory, use this option. The data in the path must only be tokens and optional metadata.

```
  --tokenDirPath=<value>
```

**tokenFilePath (one of)**

Path to JSON file containing token definitions. If you are synchronizing tokens from a single file, use this option. The path must point to a file containing all definitions.

```
  --tokenFilePath=<value> 
```
