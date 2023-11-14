//
//  run-exporter.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Command, Flags } from "@oclif/core"
import {
  PCPulsar,
  PCPulsarExporterMode,
  PCExporterEnvironment,
  PCEngineExporterProcessingResult,
  PLLogger,
} from "@supernova-studio/pulsar-core"
import { Brand, DesignSystem, DesignSystemVersion, Supernova, TokenTheme } from "@supernovaio/supernova-sdk"
import { Environment } from "../types/types"
import { environmentAPI } from "../utils/network"
import { exportConfiguration } from "../utils/run-exporter/exporter-utils"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definition

interface RunLocalExporterFlags {
  apiKey: string
  designSystemId: string
  themeId?: string
  brandId?: string
  exporterDir: string
  outputDir: string
  configPath?: string
  forceClearOutputDir: boolean
  environment: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Command that describes the structure of provided design system */
export class RunLocalExporter extends Command {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command configuration

  // Command help description
  static description = "Run local exporter package"

  // Examples how to use the command
  static examples = [
    `$ @supernovaio/cli run-local-exporter --apiKey="{xxx-xxx-xxx}" --designSystemId="{1234}" --themeId="{1234}" --brandId="{1234}" --exporterDir="{./path/to/exporter/dir}" --outputDir="{./path/to/output/dir}"`,
  ]

  // How this command can be run
  static aliases: ["run-local-exporter"]

  // Static flags to enable / disable features
  static flags = {
    apiKey: Flags.string({ description: "API key to use for accessing Supernova instance", required: true }),
    designSystemId: Flags.string({ description: "Design System to export from", required: true }),
    exporterDir: Flags.string({ description: "Path to exporter package", required: true }),
    outputDir: Flags.string({ description: "Path to output folder. Must be empty, unless `forceClearOutputDir` is set", required: true }),
    configPath: Flags.string({
      description: "Path to config file. When provided, the options set will override the default ones",
      required: false,
    }),

    themeId: Flags.string({
      description: "Theme to export. Will only be used when exporter has usesThemes: true, and is optional",
      required: false,
    }),
    brandId: Flags.string({
      description: "Brand to export. Will only be used when exporter has usesBrands: true, but then it is required to be provided",
      required: false,
    }),
    forceClearOutputDir: Flags.boolean({
      description:
        "When enabled, CLI will delete the output folder first, if it exists and then create a new empty one in its place. The exporter can only write into empty folder.",
      default: false,
      required: false,
    }),
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
    const { args, flags } = await this.parse(RunLocalExporter)

    // Get workspace -> design system –> version
    let connected = await this.getWritableVersion(flags)

    // Get brands and themes if needed
    let version = connected.version
    let brands = await version.brands()
    let themes = await version.themes()
  }

  async getWritableVersion(flags: RunLocalExporterFlags): Promise<{
    instance: Supernova
    designSystem: DesignSystem
    brand: Brand | null
    theme: TokenTheme | null
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
      throw new Error(`Design system  ${flags.designSystemId} version not found or not available under provided API key`)
    }

    // Get themes and brands if provided
    if (flags.themeId && !flags.brandId) {
      throw new Error(`Brand ID must be provided when theme ID is provided as well`)
    }

    let brand: Brand | null = null
    if (flags.brandId) {
      const brands = await version.brands()
      brand = brands.find((brand) => brand.id === flags.brandId || brand.persistentId === flags.brandId) ?? null
      if (!brand) {
        throw new Error(`Brand ${flags.brandId} not found in specified design system`)
      }
    }

    let theme: TokenTheme | null = null
    if (flags.themeId) {
      const themes = await brand!.themes()
      theme = themes.find((theme) => theme.id === flags.themeId || theme.versionedId === flags.themeId) ?? null
      if (!theme) {
        throw new Error(`Theme ${flags.themeId} not found in specified brand`)
      }
    }

    return {
      instance: sdkInstance,
      designSystem: designSystem,
      brand: brand,
      theme: theme,
      version: version,
    }
  }

  async executeExporter(
    flags: RunLocalExporterFlags,
    versionId: string,
    environment: Environment
  ): Promise<{
    logger: PLLogger
    result: PCEngineExporterProcessingResult | Error
    success: boolean
  }> {
    // Log engine
    const logger = new PLLogger()

    // Initialize pulsar engine and export
    let pulsarEngine = new PCPulsar(PCPulsarExporterMode.full, logger)
    try {
      // Load pulsar with local URL
      await pulsarEngine.initiateWithLocalFolderURL(flags.exporterDir, PCExporterEnvironment.ci)

      // Prepare configuration
      const config = exportConfiguration({
        apiKey: flags.apiKey,
        dsId: flags.designSystemId,
        versionId: versionId,
        environment: environment,
        exportPath: flags.exporterDir,
        brandId: flags.brandId,
        themeId: flags.themeId,
        logger: logger,
      })

      // Set logo overrides
      let result = await pulsarEngine.executeExporter(config, false)

      // Note: No cleaning! This would remove the local directory of the user that they work on :)
      // Retrieve result
      return {
        logger: logger,
        result: result,
        success: true,
      }
    } catch (error: any) {
      return {
        logger: logger,
        result: error,
        success: false,
      }
    }
  }
}
