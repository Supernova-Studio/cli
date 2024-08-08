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

describe("describe-workspaces", function () {
  it("should run command", async function () {
    this.timeout(1200000)
    const commandAttributes = ["describe-workspaces", `--apiKey=${process.env.TEST_API_KEY}`, `--environment=${process.env.TEST_ENVIRONMENT}`]

    const result = await runCommand(commandAttributes)
    if (result.error) console.error(result.error);
    expect(result.error).to.be.undefined;
  })
});
