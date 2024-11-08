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
import { DocumentationEnvironment, ExportBuildStatus } from "@supernovaio/sdk"
import { sleep } from "../utils/common"

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
    awaitPublishJob: Flags.boolean({
      description:
        "Whether to block the process until the publishing is done. " +
        "Setting the flag to false will exit with success as long as documentation publish was successfully triggered, " +
        "but before the publish is completed. Setting the flag to true will exit once the publish is complete and will " +
        "throw if documentation publish is not successful.",
      default: true,
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
      const { instance, id, designSystem } = await getWritableVersion(flags)

      this.log(`Queueing documentation publish in ${designSystem.name}...`)

      let publishJob = await instance.documentation.publishDrafts(id, environment, {
        pagePersistentIds: [],
        groupPersistentIds: [],
      })

      this.log(`Documentation queued for publishing`.green);

      if (!flags.awaitPublishJob) {
        this.log(`Documentation publish await is disabled, exiting before the publish is finished.`.yellow)
        return;
      } else {
        this.log(`Waiting for the documentation publish to be finished...`); 
      }

      // Timeout is roughly 30 minutes
      for (let i = 0; i < 30 * 60; i++) {
        await sleep(1000)
        publishJob = await instance.documentation.getDocumentationBuild(designSystem.workspaceId, publishJob.id)
        if (isJobStatusDone(publishJob.status)) break
      }

      if (publishJob.status === "Success") {
        this.log("\nDone: Documentation queued for publishing".green)
      } else if (publishJob.status === "Failed") {
        throw new Error(`Documentation publish failed`)
      } else if (publishJob.status === "Timeout") {
        throw new Error(`Documentation publish timed out`)
      } else {
        throw new Error(`Error awaiting publish job`)
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

function isJobStatusDone(status: ExportBuildStatus): boolean {
  return (
    status === ExportBuildStatus.Failed || status === ExportBuildStatus.Success || status === ExportBuildStatus.Timeout
  )
}
