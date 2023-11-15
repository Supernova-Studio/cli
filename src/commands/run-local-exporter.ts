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
  PCEngineFileDescriptor,
} from "@supernova-studio/pulsar-core"
import { Brand, DesignSystem, DesignSystemVersion, Supernova, TokenTheme } from "@supernovaio/supernova-sdk"
import { Environment } from "../types/types"
import { environmentAPI } from "../utils/network"
import { exportConfiguration } from "../utils/run-exporter/exporter-utils"
import * as fs from "fs"
import * as path from "path"
import axios from "axios"
import "colors"

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
  allowOverridingOutput: boolean
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
    allowOverridingOutput: Flags.boolean({
      description:
        "When enabled, CLI will override output in the output directory if same files where present. When disabled, encountering the same file with throw an error.",
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

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {
    const { flags } = await this.parse(RunLocalExporter)

    // Execute exporter
    try {
      // Get workspace -> design system –> version
      let connected = await this.getWritableVersion(flags)
      const result = await this.executeExporter(flags, connected.version.id)

      // Log user logs from the execution
      // Note this is currently not used because console.log is directly routed to the stdout and we have no control over it. Pulsar must be updated before this is doable
      if (flags.log) {
        this.logRun(flags, result.logger)
      }

      if (result.success) {
        // Write result to output
        await this.writeToBuildPath(result.result as PCEngineExporterProcessingResult, flags)
        this.log("Export finished successfully".green)
      } else {
        // Catch write error
        this.error(`Export failed: ${(result.result as Error).message}`.red, {
          code: "ERR_EXPORT_FAILED",
        })
      }
    } catch (error: any) {
      // Catch general export error
      this.error(`Export failed: ${error.message}`.red, {
        code: "ERR_EXPORT_FAILED",
      })
    }
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
    versionId: string
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
        environment: flags.environment as Environment,
        exportPath: flags.exporterDir,
        brandId: flags.brandId,
        themeId: flags.themeId,
        logger: logger,
      })

      // Set logo overrides
      let result = await pulsarEngine.executeExporter(config, false)
      return {
        logger: logger,
        result: result,
        success: true,
      }
    } catch (error: any) {
      // Return error
      return {
        logger: logger,
        result: error,
        success: false,
      }
    }
  }

  private async writeToBuildPath(result: PCEngineExporterProcessingResult, flags: RunLocalExporterFlags) {
    // Create build directory if it doesn't exist, otherwise keep as it is. It should never be deleted!
    if (!fs.existsSync(flags.outputDir)) {
      this.ensureDirectoryExists(flags.outputDir)
    }

    // If overriding is disabled, test every possible file and if it exists, throw an error
    if (!flags.allowOverridingOutput) {
      for (const file of result.emittedFiles) {
        const destination = path.join(flags.outputDir, file.path)
        if (fs.existsSync(destination)) {
          throw new Error(
            `Exporter produced file for destination ${destination} but that file already exists. Enable --allowOverridingOutput option to allow overriding`
          )
        }
      }
    }

    // Temporary structure to hold file contents
    const filesToWrite: { filePath: string; content: string | Buffer }[] = []

    // Function to process a single file
    const processFile = async (file: PCEngineFileDescriptor) => {
      let filePath = path.join(flags.outputDir, ...file.path.split("/"))
      let fileDirectory = path.dirname(filePath)
      this.ensureDirectoryExists(fileDirectory)

      if (file.type === "string") {
        filesToWrite.push({ filePath, content: file.content })
      } else if (file.type === "copy_file") {
        const fileContent = fs.readFileSync(file.content)
        filesToWrite.push({ filePath, content: fileContent })
      } else if (file.type === "copy_file_remote") {
        const fileContent = await this.downloadFileToMemory(file.content)
        filesToWrite.push({ filePath, content: fileContent })
      }
    }

    // Process all files in chunks to speed up the process
    const chunkSize = 4
    for (let i = 0; i < result.emittedFiles.length; i += chunkSize) {
      const chunk = result.emittedFiles.slice(i, i + chunkSize)
      await Promise.all(chunk.map((file) => processFile(file)))
    }

    // Write all files from the temporary structure to the filesystem as a final step - this is to avoid partial writes
    filesToWrite.forEach(({ filePath, content }) => {
      fs.writeFileSync(filePath, content)
    })
  }

  /** Download file into memory using Axios */
  private async downloadFileToMemory(fileUrl: string): Promise<Buffer> {
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "arraybuffer",
    })

    return Buffer.from(response.data)
  }

  /** Ensure directory exists - if it doesn't create it, recursively */
  private ensureDirectoryExists(filePath: string, forceLastFragmentIsDirectory: boolean = false) {
    // If the last fragment of path is forced, even paths without / are treated as dirs
    if (forceLastFragmentIsDirectory) {
      if (!filePath.endsWith("/")) {
        filePath = filePath + "/"
      }
    }
    // Only make directory if it doesn't exist
    if (fs.existsSync(filePath)) {
      return
    }
    fs.mkdirSync(filePath, { recursive: true })
  }

  /** Log run to output */
  private logRun(flags: RunLocalExporterFlags, logger: PLLogger) {
    for (const log of logger.logs) {
      let message = log.message.trim()
      if (message.startsWith('"')) {
        message = message.substring(1)
      }
      if (message.endsWith('"')) {
        message = message.substring(0, message.length - 1)
      }
      console.log(`[user]`.gray + message.white)
    }
  }
}
