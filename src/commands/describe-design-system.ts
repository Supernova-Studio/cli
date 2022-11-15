//
//  describe-design-system.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Command, Flags } from "@oclif/core"
import { DesignSystem, DesignSystemVersion, Supernova, SupernovaToolsDesignTokensPlugin } from "@supernovaio/supernova-sdk"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

interface SyncDesignTokensFlags {
  apiKey: string
  designSystemId: string
  dev: boolean
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Command that describes the structure of provided design system */
export class SyncDesignTokens extends Command {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command configuration

  // Command help description
  static description = "Describe structure of single design system by provided ID"

  // Examples how to use the command
  static examples = [`$ @supernovaio/cli describe-design-system --apiKey="{xxx-xxx-xxx}" --designSystemId="{1234}"`]

  // How this command can be run
  static aliases: ["describe-design-system"]

  // Static flags to enable / disable features
  static flags = {
    apiKey: Flags.string({ description: "API key to use for accessing Supernova instance", required: true }),
    designSystemId: Flags.string({ description: "Design System to describe structure of", required: true }),
    dev: Flags.boolean({ description: "When enabled, CLI will target dev server", hidden: true, default: false }),
  }

  // Required and optional attributes
  static args = []

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SyncDesignTokens)

    // Get workspace -> design system –> version
    let connected = await this.getWritableVersion(flags)

    // Get brands and themes
    let version = connected.version
    let brands = await version.brands()
    let themes = await version.themes()

    console.log(`---  Design system "${connected.designSystem.name}", id: ${connected.designSystem.id}:`)
    console.log(`\n`)
    for (let brand of brands) {
        console.log(`  ↳  Brand: "${brand.name}", id: ${brand.persistentId}`)
        let brandThemes = themes.filter(t => t.brandId === brand.persistentId)
        if (brandThemes.length > 0) {
            for (let theme of brandThemes) {
                console.log(`    ↳  Theme: "${theme.name}", id: ${theme.id}`)
            }
        } else {
            console.log(`    ↳  No themes defined in this brand`)
        }
        console.log("\n")
    }
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
    const devAPIhost = "https://dev.api2.supernova.io/api"
    let sdkInstance = new Supernova(flags.apiKey, flags.dev ? devAPIhost : null, null)

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
