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
import { DesignSystem, DesignSystemVersion, Supernova, SupernovaToolsDesignTokensPlugin } from "@supernovaio/supernova-sdk"
import { DocumentationEnvironment } from "@supernovaio/supernova-sdk/build/Typescript/src/model/enums/SDKDocumentationEnvironment"
import { Environment, ErrorCode } from "../types/types"
import { environmentAPI } from "../utils/network"
import "colors"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

interface PublishDocumentationFlags {
  apiKey: string
  designSystemId: string
  target: string
  environment: string
}

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
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {
    try {
      const { flags } = await this.parse(PublishDocumentation)

      // Get workspace -> design system –> version
      let connected = await this.getWritableVersion(flags)
      let documentation = await connected.version.documentation()
      let result = await documentation.publish(flags.target as DocumentationEnvironment)

      if (result.status === "Queued") {
        this.log("\nDone: Documentation queued for publishing".green)
      } else if (result.status === "InProgress") {
        this.log("\n Done: Skipped documentation publish as another build is already in progress".green)
      } else if (result.status === "Failure") {
        throw new Error(`Documentation publish failed with unknown failure`)
      }
    } catch (error) {
      // Catch general error
      this.error(`Publishing documentation failed: ${error}`.red, {
        code: ErrorCode.documentationPublishingFailed,
      })
    }
  }

  async getWritableVersion(flags: PublishDocumentationFlags): Promise<{
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
