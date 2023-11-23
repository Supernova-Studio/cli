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

describe("describe-design-system", function () {
  this.timeout(30000)
  const commandAttributes = [
    "describe-design-system",
    `--apiKey=${process.env.TEST_API_KEY}`,
    `--designSystemId=${process.env.TEST_DESIGN_SYSTEM_ID}`,
    `--environment=${process.env.TEST_ENVIRONMENT}`,
  ]

  test
    .do((ctx) => {
      console.log(commandAttributes.join(" \\\n  "))
    })
    .command(commandAttributes)
    .it()
})
