//
//  describe-design-system.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Command, Flags } from "@oclif/core"
import { DesignSystem, DesignSystemVersion, Supernova } from "@supernovaio/supernova-sdk"
import { Environment, ErrorCode } from "../types/types"
import { environmentAPI } from "../utils/network"
import "colors"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

interface DescribeDesignSystemFlags {
  apiKey: string
  designSystemId: string
  environment: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Command that describes the structure of provided design system */
export class DescribeDesignSystem extends Command {
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
    environment: Flags.string({
      description: "When set, CLI will target a specific environment",
      hidden: true,
      required: false,
      options: Object.values(Environment),
      default: Environment.production,
    }),
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {
    try {
      const { flags } = await this.parse(DescribeDesignSystem)

      // Get workspace -> design system –> version
      let connected = await this.getWritableVersion(flags)

      // Get brands and themes
      let version = connected.version
      let brands = await version.brands()
      let themes = await version.themes()

      this.log(`\n↳ Design system "${connected.designSystem.name}", id: ${connected.designSystem.id}`.cyan)
      for (let brand of brands) {
        this.log(`  ↳ Brand: "${brand.name}", id: ${brand.persistentId}`)
        let brandThemes = themes.filter((t) => t.brandId === brand.persistentId)
        if (brandThemes.length > 0) {
          for (let theme of brandThemes) {
            this.log(`    ↳ Theme: "${theme.name}", id: ${theme.id}`)
          }
        } else {
          this.log(`    ↳ No themes defined in this brand`.gray)
        }
      }

      this.log("\nDone".green)
    } catch (error) {
      // Catch general error
      this.error(`Design system description failed: ${error}`.red, {
        code: ErrorCode.designSystemDescriptionFailed,
      })
    }
  }

  async getWritableVersion(flags: DescribeDesignSystemFlags): Promise<{
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
    let sdkInstance = new Supernova(flags.apiKey, environmentAPI(flags.environment as Environment, undefined), null)

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
