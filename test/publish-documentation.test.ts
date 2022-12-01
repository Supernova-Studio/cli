//
//  publis-documentation.test.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { test } from "@oclif/test"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

describe("publish-documentation", () => {
  const commandAttributes = [
    "publish-documentation",
    `--apiKey=${process.env.TEST_API_KEY}`,
    `--designSystemId=${process.env.TEST_DB_DESIGN_SYSTEM_ID}`,
    `--dev`,
  ]

  test
    .do((ctx) => {
      console.log(commandAttributes.join(" "))
    })
    .stdout()
    .command(commandAttributes)
    .catch((error) => {
      console.log(error)
    })
    .it()
})