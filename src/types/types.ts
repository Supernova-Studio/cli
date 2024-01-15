//
//  types.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { PLLogger } from "@supernova-studio/pulsar-language"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export interface ExportConfiguration {
  apiUrl: string
  apiVersion?: string
  accessToken: string
  designSystemId: string
  designSystemVersionId: string
  brandId?: string
  themeId?: string
  exportPath: string
  debugMode?: boolean
  logger: PLLogger
  proxyUrl?: string
}

export enum Environment {
  production = "production",
  development = "development",
  staging = "staging",
  demo = "demo",
}

export enum ErrorCode {
  exportFailed = "ERR_EXPORT_FAILED",
  tokenSyncFailed = "ERR_TOKEN_SYNC_FAILED",
  designSystemDescriptionFailed = "ERR_DESIGN_SYSTEM_DESCRIPTION_FAILED",
  workspaceDescriptionFailed = "ERR_WORKSPACE_DESCRIPTION_FAILED",
  documentationPublishingFailed = "ERR_DOCUMENTATION_PUBLISHING_FAILED",
}
