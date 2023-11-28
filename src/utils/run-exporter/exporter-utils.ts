//
//  exporter-utils.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { PLLogger } from "@supernova-studio/pulsar-language"
import { Environment, ExportConfiguration } from "../../types/types"
import { environmentAPI } from "../network"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Utils

export function exportConfiguration(setup: {
  apiKey: string
  dsId: string
  versionId: string
  brandId?: string
  themeId?: string
  environment: Environment
  exportPath: string
  logger: PLLogger
}): ExportConfiguration {
  return {
    apiUrl: environmentAPI(setup.environment, undefined),
    apiVersion: "0.2",
    accessToken: setup.apiKey,
    designSystemId: setup.dsId,
    designSystemVersionId: setup.versionId,
    brandId: setup.brandId,
    themeId: setup.themeId,
    exportPath: setup.exportPath,
    logger: setup.logger,
  }
}
