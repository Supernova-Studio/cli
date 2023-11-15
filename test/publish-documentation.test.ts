//
//  publis-documentation.test.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { test } from "@oclif/test"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

describe("publish-documentation", function () {
  this.timeout(10000)
  const commandAttributes = [
    "publish-documentation",
    `--apiKey=${process.env.TEST_API_KEY}`,
    `--designSystemId=${process.env.TEST_DESIGN_SYSTEM_ID}`,
    `--target=${process.env.TEST_DOC_ENVIRONMENT}`,
    `--environment=${process.env.TEST_ENVIRONMENT}`,
  ]

  test
    .do((ctx) => {
      console.log(commandAttributes.join(" \\\n  "))
    })
    .command(commandAttributes)
    .it()
})
