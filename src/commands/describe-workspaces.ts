//
//  describe-workspaces.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Command, Flags } from "@oclif/core"
import { DesignSystem, DesignSystemVersion, Supernova, Workspace } from "@supernovaio/supernova-sdk"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

interface SyncDesignTokensFlags {
  apiKey: string
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
  static description =
    "Describe structure of all workspaces and design systems available under those workspaces available for specified API key"

  // Examples how to use the command
  static examples = [`$ @supernovaio/cli describe-workspaces --apiKey="{xxx-xxx-xxx}"`]

  // How this command can be run
  static aliases: ["describe-workspaces"]

  // Static flags to enable / disable features
  static flags = {
    apiKey: Flags.string({ description: "API key to use for accessing Supernova instance", required: true }),
    dev: Flags.boolean({ description: "When enabled, CLI will target dev server", hidden: true, default: false }),
  }

  // Required and optional attributes
  static args = []

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SyncDesignTokens)

    // Get workspaces
    let connected = await this.getWorkspaces(flags)

    for (let workspace of connected.workspaces) {
      // Get design systems and log
      let designSystems = await workspace.designSystems()
      console.log(`\n`)
      console.log(`---  Workspace "${workspace.name}", handle: "${workspace.handle}":`)
      for (let designSystem of designSystems) {
        console.log(`\n`)
        console.log(`  ↳  DS "${designSystem.name}", id: ${designSystem.id}:`)
        let version = await designSystem.activeVersion()
        let brands = await version.brands()
        let themes = await version.themes()
        for (let brand of brands) {
          console.log(`    ↳  Brand: "${brand.name}", id: ${brand.persistentId}`)
          let brandThemes = themes.filter((t) => t.brandId === brand.persistentId)
          if (brandThemes.length > 0) {
            for (let theme of brandThemes) {
              console.log(`      ↳ Theme: "${theme.name}", id: ${theme.id}`)
            }
          } else {
            console.log(`      ↳ No themes defined in this brand`)
          }
        }
      }
    }
  }

  async getWorkspaces(flags: SyncDesignTokensFlags): Promise<{
    instance: Supernova
    workspaces: Array<Workspace>
  }> {
    if (!flags.apiKey || flags.apiKey.length === 0) {
      throw new Error(`API key must not be empty`)
    }

    // Create instance for prod / dev
    const devAPIhost = "https://dev.api2.supernova.io/api"
    let sdkInstance = new Supernova(flags.apiKey, flags.dev ? devAPIhost : null, null)
    let workspaces = await sdkInstance.workspaces()
    return {
      instance: sdkInstance,
      workspaces: workspaces,
    }
  }
}
