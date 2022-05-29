//
//  CommandSyncDesignTokens.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Command, Flags } from "@oclif/core"
import { Brand, DesignSystem, DesignSystemVersion, Supernova, SupernovaToolsDesignTokensPlugin, Token, TokenGroup } from "@supernovaio/supernova-sdk"
import { DTProcessedTokenNode } from "@supernovaio/supernova-sdk/build/Typescript/src/tools/design-tokens/utilities/SDKDTJSONConverter"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Command that handles synchronization with design tokens plugin */
export class SyncDesignTokens extends Command {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command configuration

  // Command help description
  static description = "Supernova CLI description TODO"

  // Examples how to use the command
  static examples = [
    `$ @supernovaio/cli sync-design-tokens --apiKey="{key}" --workspaceId=123 --designSystemId=456 --brandName="Test" --input "{}"`,
  ]

  // How this command can be run
  static aliases: [
    "sync-design-tokens"
  ]

  // Static flags to enable / disable features
  static flags = {
    apiKey: Flags.string({char: 'k', description: 'API key to use for accessing Supernova instance', required: true}),
    designSystemId: Flags.string({char: 'd', description: 'Design System to synchronize contents with', required: true}),
    brandName: Flags.string({char: 'b', description: 'Brand to synchronize contents with', required: false}),
    input: Flags.string({char: 'i', description: 'Contents of design tokens plugin definition JSON file', required: false, exclusive: ['inputPath']}),
    inputPath: Flags.string({char: 'p', description: 'Contents of design tokens plugin definition JSON file', required: false, exclusive: ['input']}),
    dryRun: Flags.boolean({char: 'r', description: 'When enabled, CLI will validate entire setup including loading/parsing/merging of tokens but will stop before writing them to remote source', required: false }),
    dev: Flags.boolean({description: 'When enabled, CLI will target dev server', hidden: true})
  }

  // Required and optional attributes
  static args = []

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {

    const { args, flags } = await this.parse(SyncDesignTokens)

    // Get workspace -> design system –> version -> brand
    let connected = await this.getWritableBrand(flags)
    let dsTool = new SupernovaToolsDesignTokensPlugin(connected.instance, connected.version, connected.brand)

    // Load from either flag or raw input, depending on what was set
    if (flags.input && flags.inputPath) {
      throw new Error("Unable to use both input and inputPath arguments at the same time. Choose one of them first and then run command again")
    }
    if (!flags.input && !flags.inputPath) {
      throw new Error("Either input or inputPath arguments must be provided and non-empty. Choose one of them first and then run command again")
    }
    let nodes: {
      processedNodes: Array<DTProcessedTokenNode>,
      tokens: Array<Token>,
      groups: Array<TokenGroup>
    }
    this.log(JSON.stringify(flags, null, 2))
    if (flags.input) {
      nodes = await dsTool.loadTokensFromDefinition(flags.input)
    } else if (flags.inputPath) {
      nodes = await dsTool.loadTokensFromPath(flags.inputPath)
    } else {
      throw new Error("Internal input error")
    }

    // Write tokens
    let merged = await dsTool.mergeWithRemoteSource(nodes.processedNodes, !flags.dryRun)
    
    this.log(`Synchronization done | Written or updated ${merged.tokens.length} tokens, ${merged.groups.length} groups`)
  }

  async getWritableBrand(flags: any): Promise<{
    instance: Supernova
    designSystem: DesignSystem,
    version: DesignSystemVersion,
    brand: Brand
  }> {

    // Create instance for prod / dev
    let supernova = new Supernova(flags.apiKey, flags.dev ? "https://dev.api2.supernova.io/api" : null, null) 

    let designSystem = await supernova.designSystem(flags.designSystemId)
    if (!designSystem) {
      throw new Error(`Design system ${flags.designSystemId} not found or not available under provided API key`)
    }

    let version = await designSystem.activeVersion()
    if (!version) {
      throw new Error(`Design system  ${flags.designSystemId} writable version not found or not available under provided API key`)
    }

    let brands = await version.brands()
    let brand: Brand | undefined = undefined
    if (!brands) {
      throw new Error(`Unable to retrieve brands for design system ${flags.designSystemId} or not available under provided API key`)
    }
    if (flags.brandName) {
      brand = brands.filter(f => f.name.trim() === flags.brandName.trim())[0]
    } else {
      brand = brands[0]
    }
    if (!brand) {
      throw new Error(`No usable brand found in design system ${flags.designSystemId}`)
    }

    return {
      instance: supernova,
      designSystem: designSystem,
      version: version,
      brand: brand
    }
  }
}
