//
//  sync-tokens.test.ts
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

describe("sync-tokens-single-file", function () {
  this.timeout(30000)
  const commandAttributes = [
    "sync-tokens",
    `--apiKey=${process.env.TEST_API_KEY}`,
    `--designSystemId=${process.env.TEST_DESIGN_SYSTEM_ID}`,
    `--tokenFilePath=${path.join(process.cwd(), "test-resources", "figma-tokens", "single-file-sync", "tokens.json")}`,
    `--configFilePath=${path.join(process.cwd(), "test-resources", "figma-tokens", "single-file-sync", "supernova.settings.json")}`,
    `--environment=${process.env.TEST_ENVIRONMENT}`,
  ]

  test
    .do((ctx) => {
      console.log(commandAttributes.join(" \\\n  "))
    })
    .command(commandAttributes)
    .it()
})

describe("sync-tokens-single-file-dry", function () {
  this.timeout(30000)
  const commandAttributes = [
    "sync-tokens",
    `--apiKey=${process.env.TEST_API_KEY}`,
    `--designSystemId=${process.env.TEST_DESIGN_SYSTEM_ID}`,
    `--tokenFilePath=${path.join(process.cwd(), "test-resources", "figma-tokens", "single-file-sync", "tokens.json")}`,
    `--configFilePath=${path.join(process.cwd(), "test-resources", "figma-tokens", "single-file-sync", "supernova.settings.json")}`,
    `--environment=${process.env.TEST_ENVIRONMENT}`,
    `--dry`,
  ]

  test
    .do((ctx) => {
      console.log(commandAttributes.join(" \\\n  "))
    })
    .command(commandAttributes)
    .it()
})
