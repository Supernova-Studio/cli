# Supernova CLI

The [Supernova](https://supernova.io) CLI enables you to run specific tasks connected with Supernova from your CI/CD pipelines, from your action triggers (GitHub Actions and similar) or from your command line as well. Supernova CLI is powered by a [Supernova SDK](https://github.com/Supernova-Studio/sdk-typescript) that allows access to many more lower-level operations.

## Use cases

There is currently only one use case, with additional ones on a way:

## Sync tokens from Figma Tokens plugin 

Using Supernova CLI, you can synchronize tokens from Figma Tokens plugin to Supernova workspaces.


### USAGE
```
  $ supernova sync-tokens 
    --apiKey <value> 
    --designSystemId <value> 
    --configFilePath <value> 
    --tokenFilePath <value>  OR  --tokenDirPath <value>
```

### FLAGS
```
  --apiKey=<value>          (required) API key to use for accessing Supernova instance
  --configFilePath=<value>  (required) Path to configuration JSON file
  --designSystemId=<value>  (required) Design System to synchronize contents with
  --tokenDirPath=<value>    Path to directory of JSON files containing token definitions
  --tokenFilePath=<value>   Path to JSON file containing token definitions
```

### EXAMPLES
```
  $ @supernovaio/cli sync-tokens --apiKey="{xxx-xxx-xxx}" --designSystemId={1234} --tokenFilePath "/path/to/tokens.json" --configFilePath "/path/to/config.json"

  $ @supernovaio/cli sync-tokens --apiKey="{xxx-xxx-xxx}" --designSystemId={1234} --tokenDirPath "/path/to/tokens/" --configFilePath "/path/to/config.json"
```
