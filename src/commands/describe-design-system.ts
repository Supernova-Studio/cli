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
import { Environment, ErrorCode } from "../types/types"
import { getWritableVersion } from "../utils/sdk"
import "colors"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

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
      const { flags } = await this.parse(DescribeDesignSystem)

      // Get workspace -> design system –> version
      let { instance, id, designSystem } = await getWritableVersion(flags)

      // Get brands and themes
      let brands = await instance.brands.getBrands(id)
      let themes = await instance.tokens.getTokenThemes(id)

      this.log(`\n↳ Design system "${designSystem.name}", id: ${designSystem.id}`.cyan)
      for (let brand of brands) {
        this.log(`  ↳ Brand: "${brand.name}", id: ${brand.idInVersion}`)
        let brandThemes = themes.filter((t) => t.brandId === brand.idInVersion)
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
}
