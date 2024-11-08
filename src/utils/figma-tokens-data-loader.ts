import {
  DTPluginToSupernovaMap,
  DTPluginToSupernovaSettings,
  DTPluginToSupernovaMapPack,
  DTPluginToSupernovaMappingFile,
  DTPluginToSupernovaMapType,
  DTPluginPreciseCopyStrategy,
  DTPluginThemeOverrideStrategy,
  toPreciseCopyStrategy,
} from "@supernovaio/sdk"
import * as fs from "fs"
const path = require("path")

export class FigmaTokensDataLoader {
  /** Load token definitions from path */
  async loadTokensFromPath(pathToFile: string): Promise<object> {
    try {
      if (!(fs.existsSync(pathToFile) && fs.lstatSync(pathToFile).isFile())) {
        throw Error(`Provided token file directory ${pathToFile} is not a file or doesn't exist`)
      }

      let definition = fs.readFileSync(pathToFile, "utf8")
      let parsedDefinition = this.parseDefinition(definition)
      return parsedDefinition
    } catch (error) {
      throw new Error("Unable to load JSON definition file: " + error)
    }
  }

  async loadTokensFromDirectory(pathToDirectory: string, settingsPath: string): Promise<object> {
    try {
      let fullStructuredObject: Record<string, any> = {}

      if (!(fs.existsSync(pathToDirectory) && fs.lstatSync(pathToDirectory).isDirectory())) {
        throw new Error(`Provided data directory ${pathToDirectory} is not a directory or doesn't exist`)
      }

      let jsonPaths = this.getAllJSONFiles(pathToDirectory)
      for (let path of jsonPaths) {
        if (path.endsWith("json") && path !== settingsPath && !path.includes("$")) {
          let result = await this.loadObjectFile(path)
          if (typeof result === "object") {
            // let name = this.getFileNameWithoutExtension(path)
            let name = this.getSetKey(path, pathToDirectory)
            fullStructuredObject[name] = result
          }
        }
      }

      // Try to load themes, if any
      let themePath = pathToDirectory + "/" + "$themes.json"
      if (fs.existsSync(themePath)) {
        let themes = await this.loadObjectFile(themePath)
        fullStructuredObject["$themes"] = themes
      }

      // Try to load metadata, if any
      let metadataPath = pathToDirectory + "/" + "$metadata.json"
      if (fs.existsSync(metadataPath)) {
        let metadata = await this.loadObjectFile(metadataPath)
        fullStructuredObject["$metadata"] = metadata
      }

      return fullStructuredObject
    } catch (error) {
      throw new Error("Unable to load JSON definition file: " + error)
    }
  }

  private getAllJSONFiles(dir: string): string[] {
    const files = fs.readdirSync(dir)
    const jsonFiles = []

    for (const file of files) {
      const filePath = `${dir}/${file}`
      const fileStat = fs.statSync(filePath)

      if (fileStat.isDirectory()) {
        jsonFiles.push(...this.getAllJSONFiles(filePath))
      } else if (fileStat.isFile() && filePath.endsWith(".json")) {
        jsonFiles.push(filePath)
      }
    }

    return jsonFiles
  }

  private getFileNameWithoutExtension(filePath: string): string {
    const fileStat = fs.statSync(filePath)

    if (!fileStat.isFile()) {
      throw new Error(`${filePath} is not a file`)
    }

    return path.basename(filePath, path.extname(filePath))
  }

  private getSetKey(jsonFilePath: string, loadedDirectory: string): string {
    return jsonFilePath.substring(loadedDirectory.length + 1, jsonFilePath.length - 5)
  }

  loadConfigFromPath(pathToFile: string): {
    mapping: DTPluginToSupernovaMapPack
    settings: DTPluginToSupernovaSettings
  } {
    try {
      let parsedDefinition = this.loadConfigFromPathAsIs(pathToFile) as DTPluginToSupernovaMappingFile
      this.weakValidateMapping(parsedDefinition)
      return this.processFileToMapping(parsedDefinition)
    } catch (error) {
      throw new Error("Unable to load JSON definition file: " + error)
    }
  }

  loadConfigFromPathAsIs(pathToFile: string): DTPluginToSupernovaMappingFile {
    try {
      if (!(fs.existsSync(pathToFile) && fs.lstatSync(pathToFile).isFile())) {
        throw new Error(`Provided configuration file directory ${pathToFile} is not a file or doesn't exist`)
      }

      let definition = fs.readFileSync(pathToFile, "utf8")
      let parsedDefinition = this.parseDefinition(definition) as DTPluginToSupernovaMappingFile
      return parsedDefinition
    } catch (error) {
      throw new Error("Unable to load JSON definition file: " + error)
    }
  }

  private weakValidateMapping(mapping: DTPluginToSupernovaMappingFile) {
    if (
      !mapping.hasOwnProperty("mode") ||
      typeof mapping.mode !== "string" ||
      (mapping.mode !== "multi-file" && mapping.mode !== "single-file")
    ) {
      throw new Error("Unable to load mapping file: `mode` must be provided [single-file or multi-file]`")
    }
    if (!mapping.mapping || !(mapping.mapping instanceof Array)) {
      throw new Error("Unable to load mapping file: `mapping` key must be present and array.")
    }
    let mapPack = mapping.mapping
    for (let map of mapPack) {
      if (typeof map !== "object") {
        throw new Error("Unable to load mapping file: `mapping` must contain objects only")
      }
      if (!map.tokenSets && !map.tokensTheme) {
        throw new Error("Unable to load mapping file: `mapping` must contain either `tokensTheme` or `tokenSets`")
      }
      if (map.tokenSets && map.tokensTheme) {
        throw new Error("Unable to load mapping file: `mapping` must not contain both `tokensTheme` or `tokenSets`")
      }
      if (map.tokenSets && (!(map.tokenSets instanceof Array) || (map.tokenSets as Array<any>).length === 0)) {
        throw new Error("Unable to load mapping file: `mapping`.`tokenSets` must be an Array with at least one entry")
      }

      if (
        map.tokensTheme &&
        ((typeof map.tokensTheme !== "string" && !Array.isArray(map.tokensTheme)) || map.tokensTheme.length === 0)
      ) {
        throw new Error(
          "Unable to load mapping file: `mapping`.`tokensTheme` must be a non-empty string or non-empty array of strings"
        )
      }
      if (!map.supernovaBrand || typeof map.supernovaBrand !== "string" || map.supernovaBrand.length === 0) {
        throw new Error("Unable to load mapping file: `supernovaBrand` must be a non-empty string")
      }
      if (map.supernovaTheme && (typeof map.supernovaTheme !== "string" || map.supernovaTheme.length === 0)) {
        throw new Error(
          "Unable to load mapping file: `supernovaTheme` may be empty but must be non-empty string if not"
        )
      }
    }

    if (mapping.settings) {
      if (typeof mapping.settings !== "object") {
        throw new Error("Unable to load mapping file: `settings` must be an object")
      }
      if (mapping.settings.hasOwnProperty("dryRun") && typeof mapping.settings.dryRun !== "boolean") {
        throw new Error("Unable to load mapping file: `dryRun` must be of boolean type")
      }
      if (mapping.settings.hasOwnProperty("verbose") && typeof mapping.settings.verbose !== "boolean") {
        throw new Error("Unable to load mapping file: `verbose` must be of boolean type")
      }
      if (
        mapping.settings.hasOwnProperty("preciseCopy") &&
        typeof mapping.settings.preciseCopy !== "boolean" &&
        typeof mapping.settings.preciseCopy !== "string"
      ) {
        throw new Error("Unable to load mapping file: `preciseCopy` must be of boolean or string type")
      }
    }
  }

  private processFileToMapping(mapping: DTPluginToSupernovaMappingFile): {
    mapping: DTPluginToSupernovaMapPack
    settings: DTPluginToSupernovaSettings
  } {
    let result = new Array<DTPluginToSupernovaMap>()
    for (let map of mapping.mapping) {
      result.push({
        type: map.tokenSets ? DTPluginToSupernovaMapType.set : DTPluginToSupernovaMapType.theme,
        pluginSets: map.tokenSets ?? null,
        pluginTheme: map.tokensTheme ?? null,
        bindToBrand: map.supernovaBrand,
        bindToTheme: map.supernovaTheme ?? null,
        nodes: null,
        processedNodes: null,
        processedGroups: null,
      })
    }

    let settings: DTPluginToSupernovaSettings = {
      ...(mapping.settings ?? {}),
      dryRun: mapping.settings?.dryRun ?? false,
      verbose: mapping.settings?.verbose ?? false,
      preciseCopy: toPreciseCopyStrategy(mapping.settings?.preciseCopy),
      themeOverridesStrategy: mapping.settings?.themeOverridesStrategy ?? "default" as DTPluginThemeOverrideStrategy,
    }

    return {
      mapping: result,
      settings: settings,
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - File Parser

  private parseDefinition(definition: string): object {
    try {
      let object = JSON.parse(definition)
      if (typeof object !== "object") {
        throw new Error("Invalid Supernova mapping definition JSON file - root level entity must be object")
      }
      return object
    } catch (error) {
      throw new Error("Invalid Supernova mapping definition JSON file - file structure invalid")
    }
  }

  private async loadObjectFile(pathToFile: string): Promise<object> {
    try {
      if (!(fs.existsSync(pathToFile) && fs.lstatSync(pathToFile).isFile())) {
        throw new Error(`Provided token file directory ${pathToFile} is not a file or doesn't exist`)
      }

      let definition = fs.readFileSync(pathToFile, "utf8")
      let parsedDefinition = this.parseDefinition(definition)
      return parsedDefinition
    } catch (error) {
      throw new Error("Unable to load JSON definition file: " + error)
    }
  }
}
