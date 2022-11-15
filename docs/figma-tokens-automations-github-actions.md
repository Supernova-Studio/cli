# Automate Figma Tokens sync with GitHub Actions

If you are using [GitHub Actions](https://github.com/features/actions) to process your design tokens, run transformers such as Style Dictionary or any other pipeline processing for tokens, you might want to add Supernova as an extra step to this workflow. We have prepared an example GitHub Action that you can just copy paste that will sync your tokens every time new data is pushed into GitHub repository.

## Action template

```yaml
name: Supernova <> Figma Token sync
on:
  # Any branch you want
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  sync_tokens:
    runs-on: ubuntu-latest
    steps:
      # Check out repository under $GITHUB_WORKSPACE, so the CLI utility can read it
      - uses: actions/checkout@v3

      # Setup node to use with CLI. 14+ is required
      - uses: actions/setup-node@v3
        with:
          node-version: 14
      
      # Install Supernova CLI
      - name: Install Supernova CLI dependency
        run: npm install --g @supernovaio/cli

      # Sync tokens
      - name: Synchronize tokens with Supernova 
        run: supernova sync-tokens \
        --apiKey=${{ secrets.ACCESS_TOKENS}} \
        --designSystemId=1234 \
        --tokenFilePath="${{ github.workspace }}/data/tokens.json" \
        --configFilePath="${{ github.workspace }}/data/supernova.settings.json" \
```

Your `run` command will look differently depending on your configuration - follow [configuration tutorial](./figma-tokens-sync.md) to learn more. Once you have your `run` command assembled, commit new GitHub Action to your repository under `.github/workflows` action and each change into token definition will be automatically synchronized with Supernova!

### Examples in action

We have prepared a repository to see the GitHub Actions.. in action (pun intended)! [See it for yourself](https://github.com/JiriTrecak/design-tokens-sync-test).