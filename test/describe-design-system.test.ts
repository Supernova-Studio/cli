//
//  sync-tokens.test.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { runCommand } from "@oclif/test"
import { expect } from "chai"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

describe("describe-design-system", function () {
  it("should run command", async function () {
    this.timeout(30000)
    const commandAttributes = [
      "describe-design-system",
      `--apiKey=${process.env.TEST_API_KEY}`,
      `--designSystemId=${process.env.TEST_DESIGN_SYSTEM_ID}`,
      `--environment=${process.env.TEST_ENVIRONMENT}`,
    ]

    const result = await runCommand(commandAttributes)
    expect(result.error).to.be.undefined;
  })
})
