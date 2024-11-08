//
//  sync-tokens.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Command, Flags } from "@oclif/core"
import { Environment, ErrorCode } from "../types/types"
import { FigmaTokensDataLoader } from "../utils/figma-tokens-data-loader"
import { getWritableVersion } from "../utils/sdk"
import "colors"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

interface SyncDesignTokensFlags {
  apiKey: string
  designSystemId: string
  tokenFilePath?: string
  tokenDirPath?: string
  configFilePath: string
  apiUrl?: string
  environment: string
  proxyUrl?: string
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
    apiUrl: Flags.string({
      description: "API url to use for accessing Supernova instance, would ignore defaults",
      hidden: true,
    }),
    environment: Flags.string({
      description: "When set, CLI will target a specific environment",
      hidden: true,
      required: false,
      options: Object.values(Environment),
      default: Environment.production,
    }),
    proxyUrl: Flags.string({
      description: "When set, CLI will use provided proxy URL for all requests",
      hidden: true,
      required: false,
    }),
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {
    try {
      const { flags } = await this.parse(SyncDesignTokens)

      // Get workspace -> design system –> version
      let { instance, id } = await getWritableVersion(flags)
      let dataLoader = new FigmaTokensDataLoader()
      let configDefinition = dataLoader.loadConfigFromPath(flags.configFilePath)
      let settings = configDefinition.settings
      if (flags.dry) {
        settings.dryRun = true
      }

      const buildData = (payload: any) => ({
        connection: { name: "CLI" },
        ...dataLoader.loadConfigFromPathAsIs(flags.configFilePath),
        payload,
      })

      if (!flags.tokenFilePath && !flags.tokenDirPath) {
        throw new Error(`Either tokenFilePath or tokenDirPath must be provided`)
      }

      let tokenDefinition = flags.tokenDirPath
        ? await dataLoader.loadTokensFromDirectory(flags.tokenDirPath, flags.configFilePath)
        : await dataLoader.loadTokensFromPath(flags.tokenFilePath!)
      const response = (await instance.versions.writeTokenStudioData(id, buildData(tokenDefinition))) as any
      if (response?.result?.logs && response.result.logs.length > 0) {
        for (const log of response.result.logs) {
          this.log(log)
        }
      }

      this.log(`\nTokens synchronized`.green)
    } catch (error: any) {
      // Catch general export error
      let errorMessage: string | undefined = undefined
      try {
        // Add readable server log, if present as object
        const parsedMessage = JSON.parse(error.message)
        this.log(parsedMessage)
      } catch {
        errorMessage = error.message
      }

      this.error(`Token sync failed${errorMessage ? `: ${errorMessage}` : ""}`.red, {
        code: ErrorCode.tokenSyncFailed,
      })
    }
  }
}
