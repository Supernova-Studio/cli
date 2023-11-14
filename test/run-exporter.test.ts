//
//  run-exporter.test.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { expect, test } from "@oclif/test"
import * as path from "path"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

describe("run-local-exporter", () => {
  const commandAttributes = [
    "run-local-exporter",
    `--apiKey=${process.env.TEST_API_KEY}`,
    `--designSystemId=${process.env.TEST_DB_DESIGN_SYSTEM_ID}`,
    `--exporterDir=${path.join(process.cwd(), "test-resources", "exporter")}`,
    `--outputDir=${path.join(process.cwd(), "test-resources", "exporter", "build")}`,
    `--configPath=${path.join(process.cwd(), "test-resources", "exporter", "config.local.json")}`,
    `--allowOverrides`,
    `--themeId=${process.env.TEST_DB_THEME_ID}`,
    `--brandId=${process.env.TEST_DB_BRAND_ID}`,
  ]
  test
    .do((ctx) => {
      console.log(commandAttributes.join(" "))
    })
    .stdout()
    .command(commandAttributes)
    .catch((error) => {
      throw error
    })
    .it()
})
