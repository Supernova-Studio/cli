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
import { RemoteVersionIdentifier, Supernova, Workspace } from "@supernovaio/sdk"
import { Environment, ErrorCode } from "../types/types"
import { environmentAPI } from "../utils/network"
import "colors"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

interface DescribeWorkspacesFlags {
  apiKey: string
  environment: string
  proxyUrl?: string
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
      const { flags } = await this.parse(DescribeWorkspaces)

      // Get workspaces
      let { workspaces, instance } = await this.getWorkspaces(flags)
      this.log(`\n`)

      for (let workspace of workspaces) {
        // Get design systems and log
        let designSystems = await instance.designSystems.designSystems(workspace.id)
        this.log(
          `↳ Workspace "${workspace.profile.name}", handle: "${workspace.profile.handle}", id: ${workspace.id}`.magenta,
        )
        for (let designSystem of designSystems) {
          this.log(`  ↳ Design system "${designSystem.name}", id: ${designSystem.id}`.cyan)
          let version = await instance.versions.getActiveVersion(designSystem.id)
          if (!version) {
            this.log(
              `Design system  ${designSystem.id} active version not found or not available under provided API key`,
            )
            continue
          }
          let id: RemoteVersionIdentifier = { designSystemId: designSystem.id, versionId: version.id }
          let brands = await instance.brands.getBrands(id)
          let themes = await instance.tokens.getTokenThemes(id)
          for (let brand of brands) {
            this.log(`    ↳ Brand: "${brand.name}", id: ${brand.id}`)
            let brandThemes = themes.filter(t => t.brandId === brand.id)
            if (brandThemes.length > 0) {
              for (let theme of brandThemes) {
                this.log(`      ↳ Theme: "${theme.name}", id: ${theme.id}`.gray)
              }
            } else {
              this.log(`      ↳ No themes defined in this brand`.gray)
            }
          }
        }
      }
      this.log("\nDone".green)
    } catch (error) {
      // Catch general error
      this.error(`Workspace description failed: ${error}`.red, {
        code: ErrorCode.workspaceDescriptionFailed,
      })
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
    let apiUrl = environmentAPI(flags.environment as Environment, "v2")
    let sdkInstance = new Supernova(flags.apiKey, { apiUrl, bypassEnvFetch: true, proxyUrl: flags.proxyUrl })
    let user = await sdkInstance.me.me()
    let workspaces = await sdkInstance.workspaces.workspaces(user.id)
    return {
      instance: sdkInstance,
      workspaces: workspaces,
    }
  }
}
