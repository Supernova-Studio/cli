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

describe("sync-tokens-single-file", () => {
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
      console.log(commandAttributes.join(" "))
    })
    .stdout()
    .command(commandAttributes)
    .catch((error) => {
      throw error
    })
    .it()
})

describe("sync-tokens-single-file-dry", () => {
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
      console.log(commandAttributes.join(" "))
    })
    .stdout()
    .command(commandAttributes)
    .catch((error) => {
      throw error
    })
    .it()
})
