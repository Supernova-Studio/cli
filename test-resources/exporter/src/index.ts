import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration } from "../config"
import { indexOutputFile } from "./files/index-file"
import { styleOutputFile } from "./files/style-file"

/** Exporter configuration. Adheres to the `ExporterConfiguration` interface and its content comes from the resolved default configuration + user overrides of various configuration keys */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

/**
 * Export entrypoint.
 * When running `export` through extensions or pipelines, this function will be called.
 * Context contains information about the design system and version that is currently being exported.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Fetch data from design system that is currently being exported (context)
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // Fetch the necessary data
  let tokens = await sdk.tokens.getTokens(remoteVersionIdentifier)
  let tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier)

  // Filter by brand, if specified
  if (context.brandId) {
    const brands = await sdk.brands.getBrands(remoteVersionIdentifier)
    const brand = brands.find((brand) => brand.id === context.brandId || brand.idInVersion === context.brandId)
    if (!brand) {
      throw new Error(`Unable to find brand ${context.brandId}.`)
    }

    tokens = tokens.filter((token) => token.brandId === brand.id)
    tokenGroups = tokenGroups.filter((tokenGroup) => tokenGroup.brandId === brand.id)
  }

  // Apply theme, if specified
  if (context.themeId) {
    const themes = await sdk.tokens.getTokenThemes(remoteVersionIdentifier)
    const theme = themes.find((theme) => theme.id === context.themeId || theme.idInVersion === context.themeId)
    if (theme) {
      tokens = await sdk.tokens.computeTokensByApplyingThemes(tokens, [theme])
    } else {
      // Don't allow applying theme which doesn't exist in the system
      throw new Error("Unable to apply theme which doesn't exist in the system.")
    }
  }

  // Generate output files
  return [
    // One file per token type
    ...(Object.values(TokenType)
      .map((type) => styleOutputFile(type, tokens, tokenGroups))
      .filter((f) => f !== null) as Array<AnyOutputFile>),
    // One file that imports all other files, if enabled
    indexOutputFile(tokens),
  ]
})
