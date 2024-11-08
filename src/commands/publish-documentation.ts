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
import { DocumentationEnvironment } from "@supernovaio/sdk"

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
    target: Flags.string({
      description: "Environment to use for publishing: Live or Preview",
      required: false,
      default: "Live",
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
      const { flags } = await this.parse(PublishDocumentation)

      const environment = tryParseDocsEnvironment(flags.target)
      if (!environment) {
        const supportedEnvs = [DocumentationEnvironment.live, DocumentationEnvironment.preview]
        this.error(`Unknown target ${flags.target}, must be one of [${supportedEnvs.join(", ")}]`)
      }

      // Get workspace -> design system –> version
      let { instance, id } = await getWritableVersion(flags)
      let result = await instance.documentation.publishDrafts(id, environment, {
        pagePersistentIds: [],
        groupPersistentIds: [],
      })

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

function tryParseDocsEnvironment(targetArg: string) {
  switch (targetArg.toLowerCase()) {
    case "live":
      return DocumentationEnvironment.live
    case "preview":
      return DocumentationEnvironment.preview

    default:
      return null
  }
}
