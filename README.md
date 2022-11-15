<img src="https://github.com/Supernova-Studio/cli/blob/main/docs/images/cli.png?raw=true" alt="Supernova CLI" style="max-width:100%; margin-bottom: 20px;" />

# Supernova CLI [![All passing](https://img.shields.io/badge/Test-passing-success)]() [![Version 1.0.0](https://img.shields.io/badge/Version-1.0.0-success)]()

The [Supernova](https://supernova.io) CLI enables you to run specific tasks connected with Supernova from your CI/CD pipelines, from your action triggers (GitHub Actions and similar) or from your command line as well. Supernova CLI is powered by a [Supernova SDK](https://github.com/Supernova-Studio/sdk-typescript) that allows access to many more lower-level operations.

CLI is separated into different commands that you can use to automate certain aspects of working with Supernova. More command line options are coming as well, stay tuned for those!

## Installing CLI dependency

To install, simply run:

```bash
npm install --save-dev @supernovaio/supernova-sdk
yarn add --dev @supernovaio/cli
```

In your target environment, or include CLI dependency in your CI/CD pipelines, like this:

```json
{
  "dependencies": {
      "@supernovaio/cli": "latest"
  }
}
```

### Installing CLI globally

You can also install the CLI as global package, and make the CLI globally available under `> supernova` command to your command line. To install the CLI globally, just run the following command:

```
npm install -g @supernovaio/cli
yarn global add @supernovaio/cli
```

You can now test that everything was properly set up by running the `supernova` command:

```
~ % supernova --version
> @supernovaio/cli/1.x.x ...
```

`Node 12.21.0` or newer environment is required to run the Supernova CLI.

### Updating CLI globally

You can update globally installed CLI by running npm update command on the package:

```
npm update -g @supernovaio/cli
yarn global upgrade @supernovaio/cli
```

This will upgrade the CLI to the latest version and make it immediately last default used version.

## Use cases

Following is the list of use cases for Supernova CLI. We will be adding more over time, stay tuned!

- [Synchronize Figma Token Plugin data](./docs/figma-tokens-sync.md)
- [List workspaces, design systems, brands and themes](./docs/list-workspaces.md)

## Contributions

If you have additional ideas about how to make this project better, let us know by opening an issue! You can also open pull requests if you've worked on improving something yourself and would like to contribute back to the community. 

We will be reviewing feature-pull-requests on case-by-case basis, but in general, we are super open to your new ideas and we welcome them! And finally, thank you for your support! You are an amazing community.

Supernova Engineering Team