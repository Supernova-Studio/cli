//
//  run-exporter.test.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { runCommand } from "@oclif/test"
import { expect } from "chai"
import * as path from "path"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

describe("run-local-exporter", function () {
  it("should run command", async function () {
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

    const result = await runCommand(commandAttributes);
    expect(result.error).to.be.undefined;
  })
})
