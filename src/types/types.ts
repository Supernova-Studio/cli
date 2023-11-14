//
//  types.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { PLLogger } from "@supernova-studio/pulsar-core"

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
}

export enum Environment {
  production = "production",
  development = "development",
  staging = "staging",
  demo = "demo",
}
