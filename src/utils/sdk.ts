import { Brand, DesignSystem, DesignSystemVersion, RemoteWorkspaceVersionIdentifier, Supernova, TokenTheme } from "@supernovaio/sdk"
import { Environment } from "../types/types"
import { environmentAPI } from "../utils/network"
import "colors"

export interface DefaultDesignSystemFlags {
    apiKey: string
    apiUrl?: string
    designSystemId: string
    environment: string
    themeId?: string
    brandId?: string
    proxyUrl?: string
}

export async function getWritableVersion(flags: DefaultDesignSystemFlags, apiVersion: string = "v2"): Promise<{
    instance: Supernova
    designSystem: DesignSystem
    version: DesignSystemVersion
    brand: Brand | null
    theme: TokenTheme | null
    id: RemoteWorkspaceVersionIdentifier
}> {
    if (!flags.apiKey || flags.apiKey.length === 0) {
        throw new Error(`API key must not be empty`)
    }

    if (!flags.designSystemId || flags.designSystemId.length === 0) {
        throw new Error(`Design System ID must not be empty`)
    }

    // Create instance for prod / dev
    let apiUrl = flags.apiUrl && flags.apiUrl.length > 0 ? flags.apiUrl : environmentAPI(flags.environment as Environment, apiVersion)
    let instance = new Supernova(flags.apiKey, { apiUrl, bypassEnvFetch: true, proxyUrl: flags.proxyUrl })

    let designSystem = await instance.designSystems.designSystem(flags.designSystemId)
    if (!designSystem) {
        throw new Error(`Design system ${flags.designSystemId} not found or not available under provided API key`)
    }

    let version = await instance.versions.getActiveVersion(flags.designSystemId)
    if (!version) {
        throw new Error(`Design system  ${flags.designSystemId} writable version not found or not available under provided API key`)
    }

    let id: RemoteWorkspaceVersionIdentifier = {
        designSystemId: flags.designSystemId,
        versionId: version.id,
        workspaceId: designSystem.workspaceId
    };

    let brand: Brand | null = null
    if (flags.brandId) {
        const brands = await instance.brands.getBrands(id)
        brand = brands.find((brand) => brand.id === flags.brandId || brand.idInVersion === flags.brandId) ?? null
        if (!brand) {
            throw new Error(`Brand ${flags.brandId} not found in specified design system`)
        }
    }

    let theme: TokenTheme | null = null
    if (flags.themeId) {
        const themes = await instance.tokens.getTokenThemes(id)
        theme = themes.find((theme) => theme.id === flags.themeId || theme.idInVersion === flags.themeId) ?? null
        if (!theme) {
            throw new Error(`Theme ${flags.themeId} not found in specified brand`)
        }
    }

    return { instance, designSystem, version, brand, theme, id }
}
