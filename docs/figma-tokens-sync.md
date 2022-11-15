<img src="https://github.com/Supernova-Studio/cli/blob/main/docs/images/ft.png?raw=true" alt="Supernova CLI" style="max-width:100%; margin-bottom: 20px;" />

# Sync Figma Tokens JSON with Supernova

Figma Tokens is a Figma Plugin allowing you to integrate Tokens into your Figma designs. It is also the most advanced in-editor solution to manage your Figma Tokens, and works amazingly well when combined with Supernova's design system management, advanced automation and documentation.

Using Supernova CLI, **you can synchronize tokens from Figma Tokens plugin to Supernova workspaces** using its data defined in JSON format. Make sure that you have Supernova CLI [installed](https://github.com/Supernova-Studio/cli) as global or local dependency before continuing with this tutorial. If you have any questions, don't hesitate to [ask us at our community Discord](https://community.supernova.io)!

## Configuring Supernova <> Figma Tokens integration

Supernova CLI allows you to read Figma Tokens declaration files in JSON format in both single-file and multi-file mode (file or entire directory of token definitions) and synchronize it with design system of your choosing. There are few main steps you must take to setup integration properly:

1. Choose appropriate sync command
2. Obtain `apiKey`
3. Obtain `designSystemId` you want to sync with
4. Get path to `tokens.json` or full directory with token definitions
5. Configure mapping between Supernova and Figma Tokens
6. Run the sync!
7. (optional) setup automated sync

Here is the entire process described step by step. Generally, the entire setup will not take more than few minutes.

### 1. Choose appropriate sync command template

Supernova CLI allows you to synchronize both single JSON file with all token definitions and/or folder with token definitions split into multiple JSON files. Select one of the following templates as a base for your Figma Tokens sync command:

**For single-file mode:**

Use the following command if you are syncing a single file containing all definitions:

```sh
  $ supernova sync-tokens \
    --apiKey="xxx-xxx-xxx" \
    --designSystemId="1234" \
    --tokenFilePath "/path/to/tokens.json" \
    --configFilePath "/path/to/supernova.settings.json"
```

**For multi-file mode:**

Use the following command if you are syncing an entire directory containing the definitions:

```sh
  $ supernova sync-tokens \
    --apiKey="xxx-xxx-xxx" \
    --designSystemId="1234" \
    --tokenDirPath "/path/to/tokens/" \
    --configFilePath "/path/to/supernova.settings.json"
```

### 2. Obtain API Key

Supernova CLI requires API key to authenticate. You can obtain API key from your [Supernova profile](https://cloud.supernova.io/user-profile/general). We strongly recommend keeping your API key in secure storage, either through use of environment variables or key vault if you are using services like GitHub (actions). Never share your API key with anyone!

Use your newly obtained key as the value of `--apiKey` attribute.

![Obtaining API key](./images/get-api-key.png)

### 3. Obtain Design System ID

For sync to work, you also need to obtain ID of Supernova design system you want to target. [Go to your design system](https://cloud.supernova.io/) and anywhere, in any section, obtain ID from the URL of your browser. Make sure you have selected the correct design system before copying the ID.

Use your newly obtained key as the value of `--designSystemId` attribute.

![Obtaining design system ID](./images/get-ds-id.png)

### 4. Get path to token file or directory

Depending on your choice in step #1, fill `--tokenFilePath` or `--tokenDirPath` with path (relative or absolute) to your Figma Token definitions. For single-file mode, you must point to a file path of JSON containing all tokens, for multi-file mode, you must point to a directory with JSON file definition. You can only provide one option at time.

### 5. Configuring mapping between Supernova and Figma Tokens

Finally, you must provide JSON file describing how the sync should work and handle your data. Because the configuration can get complex, [we have dedicated section just for that](./figma-tokens-sync-mapping-examples.md). Once you are done with the mapping, write file called `supernova.settings.json` next to your token definitions.

### 6. Run the sync!

You now have everything you need to properly synchronize data between Supernova and Figma Tokens. Since you installed Supernova CLI, you can use `supernova [command]` as global terminal command. Run the sync using all attributes you have obtained, for example like this:

```sh
  $ supernova sync-tokens \
    --apiKey="sn.generated-api-token-copied-from-your-profile" \
    --designSystemId="420" \
    --tokenFilePath "/data/tokens.js" \
    --configFilePath "/data/supernova.settings.json"
```

If everything went well, you'll see success message celebrating successful sync:

```
$ supernova sync-tokens ...
> Tokens synchronized
```

If there was a problem of any kind, you'll get a detailed error message stating what was it and usually also how to fix it. If you are still unable to run the sync, feel free to [join and ask us at our community Discord](https://community.supernova.io)!

### 7. (optional) Setup automated sync

After you have successfully synced your tokens, you might also want to automate the sync to run every time you push your tokens to a remote repository. We have prepared tutorials to walk you through the setup for most common scenarios:

- [Automated sync with GitHub using Github Actions](./figma-tokens-automations-github-actions.md)
- (coming soon) Automated sync with Azure using Azure Pipelines
- (coming soon) Automated sync with GitLab using GitLab CI/CD

If you would like to contribute more tutorials and help people integrate their own pipelines, please open a pull request!