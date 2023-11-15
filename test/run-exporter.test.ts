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

describe("run-local-exporter", function () {
  this.timeout(10000)
  let commandAttributes = [
    "run-local-exporter",
    `--apiKey=${process.env.TEST_API_KEY}`,
    `--designSystemId=${process.env.TEST_DESIGN_SYSTEM_ID}`,
    `--exporterDir=${path.join(process.cwd(), "test-resources", "exporter")}`,
    `--outputDir=${path.join(process.cwd(), "test-resources", "exporter-output")}`,
    `--environment=${process.env.TEST_ENVIRONMENT}`,
    `--allowOverridingOutput`,
  ]

  if (process.env.TEST_THEME_ID) {
    commandAttributes.push(`--themeId=${process.env.TEST_THEME_ID}`)
  }
  if (process.env.TEST_BRAND_ID) {
    commandAttributes.push(`--brandId=${process.env.TEST_BRAND_ID}`)
  }

  test
    .do((ctx) => {
      console.log(commandAttributes.join(" \\\n  "))
    })
    .command(commandAttributes)
    .it()
})
