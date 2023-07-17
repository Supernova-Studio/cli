//
//  sync-tokens.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Command, Flags } from "@oclif/core"
import { DesignSystem, DesignSystemVersion, Supernova, SupernovaToolsDesignTokensPlugin } from "@supernovaio/supernova-sdk"
import { FigmaTokensDataLoader } from "../utils/figma-tokens-data-loader"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

interface SyncDesignTokensFlags {
  apiKey: string
  designSystemId: string
  tokenFilePath?: string
  tokenDirPath?: string
  configFilePath: string
  dev: boolean
  dry: boolean
  apiUrl?: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Command that handles synchronization with design tokens plugin */
export class SyncDesignTokens extends Command {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command configuration

  // Command help description
  static description = "Synchronize tokens from Figma Tokens plugin to Supernova workspaces"

  // Examples how to use the command
  static examples = [
    `$ @supernovaio/cli sync-tokens --apiKey="{xxx-xxx-xxx}" --designSystemId={1234} --tokenFilePath "/path/to/tokens.json" --configFilePath "/path/to/config.json"`,
    `$ @supernovaio/cli sync-tokens --apiKey="{xxx-xxx-xxx}" --designSystemId={1234} --tokenDirPath "/path/to/tokens/" --configFilePath "/path/to/config.json"`,
  ]

  // How this command can be run
  static aliases: ["sync-tokens"]

  // Static flags to enable / disable features
  static flags = {
    apiKey: Flags.string({ description: "API key to use for accessing Supernova instance", required: true }),
    designSystemId: Flags.string({ description: "Design System to synchronize contents with", required: true }),
    tokenFilePath: Flags.string({
      description: "Path to JSON file containing token definitions",
      exactlyOne: ["tokenDirPath", "tokenFilePath"],
    }),
    tokenDirPath: Flags.string({
      description: "Path to directory of JSON files containing token definitions",
      exactlyOne: ["tokenDirPath", "tokenFilePath"],
    }),
    configFilePath: Flags.string({ description: "Path to configuration JSON file", required: true, exclusive: [] }),
    dev: Flags.boolean({ description: "When enabled, CLI will target dev server", hidden: true, default: false }),
    dry: Flags.boolean({
      description:
        "When enabled, dry run will be performed and tokens won't write into workspace. This settings overrides settings inside configuration files.",
      hidden: false,
      default: false,
    }),
    apiUrl: Flags.string({ description: "API url to use for accessing Supernova instance, would ignore defaults", hidden: true })
  }

  // Required and optional attributes
  static args = []

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SyncDesignTokens)

    // Get workspace -> design system –> version
    let connected = await this.getWritableVersion(flags)
    let dataLoader = new FigmaTokensDataLoader()
    let configDefinition = dataLoader.loadConfigFromPath(flags.configFilePath)
    let settings = configDefinition.settings
    if (args.dry) {
      settings.dryRun = true
    }

    const buildData = (payload: any) => ({
      connection: { name: "CLI" },
      ...dataLoader.loadConfigFromPathAsIs(flags.configFilePath),
      payload
    })

    if (!flags.tokenFilePath && !flags.tokenDirPath) {
      throw new Error(`Either tokenFilePath or tokenDirPath must be provided`)
    }

    let tokenDefinition = flags.tokenDirPath
      ? await dataLoader.loadTokensFromDirectory(flags.tokenDirPath, flags.configFilePath)
      : await dataLoader.loadTokensFromPath(flags.tokenFilePath!)
    await connected.version.writer().writeTokenStudioData(buildData(tokenDefinition))

    this.log(`Tokens synchronized`)
  }

  async getWritableVersion(flags: SyncDesignTokensFlags): Promise<{
    instance: Supernova
    designSystem: DesignSystem
    version: DesignSystemVersion
  }> {
    if (!flags.apiKey || flags.apiKey.length === 0) {
      throw new Error(`API key must not be empty`)
    }

    if (!flags.designSystemId || flags.designSystemId.length === 0) {
      throw new Error(`Design System ID must not be empty`)
    }

    // Create instance for prod / dev
    const devAPIhost = "https://dev.api2.supernova.io/api/v2"
    // After API V2 deploy to PROD, we need to use this URL.
    // We won't get stats logs in CLI after it, just errors. Same way as TS Plugin.
    // const prodAPIV2host = "https://api.supernova.io/api/v2"

    // We might need to ask people to update CLI before release, so after release all of them use BE call
    // and do not push old tokens into new model.
    // We will make a BE v1 bff/import endpoint to error with "Please, update CLI" message.
    const apiUrl = flags.apiUrl && flags.apiUrl.length > 0 ? flags.apiUrl : flags.dev ? devAPIhost : null
    let sdkInstance = new Supernova(flags.apiKey, apiUrl, null)

    let designSystem = await sdkInstance.designSystem(flags.designSystemId)
    if (!designSystem) {
      throw new Error(`Design system ${flags.designSystemId} not found or not available under provided API key`)
    }

    let version = await designSystem.activeVersion()
    if (!version) {
      throw new Error(`Design system  ${flags.designSystemId} writable version not found or not available under provided API key`)
    }

    return {
      instance: sdkInstance,
      designSystem: designSystem,
      version: version,
    }
  }
}
