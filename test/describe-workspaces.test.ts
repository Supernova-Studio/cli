//
//  sync-tokens.test.ts
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

describe("describe-workspaces", function () {
  this.timeout(1200000)
  const commandAttributes = ["describe-workspaces", `--apiKey=${process.env.TEST_API_KEY}`, `--environment=${process.env.TEST_ENVIRONMENT}`]

  test
    .do((ctx) => {
      console.log(commandAttributes.join(" \\\n  "))
    })
    .command(commandAttributes)
    .it()
})
