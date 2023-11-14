//
//  describe-workspaces.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Command, Flags } from "@oclif/core"
import { DesignSystem, DesignSystemVersion, Supernova, Workspace } from "@supernovaio/supernova-sdk"
import { Environment } from "../types/types"
import { environmentAPI } from "../utils/network"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

interface DescribeWorkspacesFlags {
  apiKey: string
  environment: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Command that describes the structure of provided design system */
export class DescribeWorkspaces extends Command {
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
    environment: Flags.string({
      description: "When set, CLI will target a specific environment",
      hidden: true,
      required: false,
      options: Object.values(Environment),
      default: Environment.production,
    }),
  }

  // Required and optional attributes
  static args = {}

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DescribeWorkspaces)

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

  async getWorkspaces(flags: DescribeWorkspacesFlags): Promise<{
    instance: Supernova
    workspaces: Array<Workspace>
  }> {
    if (!flags.apiKey || flags.apiKey.length === 0) {
      throw new Error(`API key must not be empty`)
    }

    // Create instance for prod / dev
    let sdkInstance = new Supernova(flags.apiKey, environmentAPI(flags.environment as Environment, undefined), null)
    let workspaces = await sdkInstance.workspaces()
    return {
      instance: sdkInstance,
      workspaces: workspaces,
    }
  }
}
