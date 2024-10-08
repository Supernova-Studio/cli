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
import * as path from "path"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

describe("sync-tokens-single-file", function () {
  it("should run command", async function () {
    this.timeout(30000)
    const commandAttributes = [
      "sync-tokens",
      `--apiKey=${process.env.TEST_API_KEY}`,
      `--designSystemId=${process.env.TEST_SYNC_DESIGN_SYSTEM_ID}`,
      `--tokenFilePath=${path.join(process.cwd(), "test-resources", "figma-tokens", "single-file-sync", "tokens.json")}`,
      `--configFilePath=${path.join(process.cwd(), "test-resources", "figma-tokens", "single-file-sync", "supernova.settings.json")}`,
      `--environment=${process.env.TEST_ENVIRONMENT}`,
    ]

    const result = await runCommand(commandAttributes);
    if (result.error) {
      console.error("Command has failed")
      console.error(commandAttributes.join("\n"))
      console.error(result.error);
    }
    expect(result.error).to.be.undefined;
  })
})
