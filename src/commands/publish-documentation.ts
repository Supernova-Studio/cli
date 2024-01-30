//
//  publish-documentation.ts
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

/** Command that publishes documentation */
export class PublishDocumentation extends Command {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command configuration

  // Command help description
  static description = "Publish latest version of the documentation"

  // Examples how to use the command
  static examples = [`$ @supernovaio/cli publish-documentation --apiKey="{xxx-xxx-xxx}" --designSystemId="{1234}"`]

  // How this command can be run
  static aliases: ["publish-documentation"]

  // Static flags to enable / disable features
  static flags = {
    apiKey: Flags.string({ description: "API key to use for accessing Supernova instance", required: true }),
    designSystemId: Flags.string({ description: "Design System to publish the documentation", required: true }),
    dev: Flags.boolean({ description: "When enabled, CLI will target dev server", hidden: true, default: false }),
    target: Flags.string({ description: "Environment to use for publishing: Live or Preview", required: false, default: "Live" }),
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
      const { flags } = await this.parse(PublishDocumentation)

      // Get workspace -> design system –> version
      let { instance, id } = await getWritableVersion(flags)
      let documentation = await instance.documentation.getDocumentation(id)
      let result = await instance.documentation.publish(id, flags.target as any)

      if (result.status === "Success") {
        this.log("\nDone: Documentation queued for publishing".green)
      } else if (result.status === "InProgress") {
        this.log("\n Done: Skipped documentation publish as another build is already in progress".green)
      } else if (result.status === "Failed") {
        throw new Error(`Documentation publish failed with unknown failure`)
      }
    } catch (error) {
      // Catch general error
      this.error(`Publishing documentation failed: ${error}`.red, {
        code: ErrorCode.documentationPublishingFailed,
      })
    }
  }
}
