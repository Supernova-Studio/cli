//
//  sync-tokens.test.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { expect, test } from "@oclif/test"
import * as path from "path"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

describe("sync-tokens-single-file", () => {
  test
    .stdout()
    .command([
      "sync-tokens",
      `--apiKey=${process.env.TEST_API_KEY}`,
      `--designSystemId=${process.env.TEST_DB_DESIGN_SYSTEM_ID}`,
      `--tokenDirPath="${path.join(process.cwd(), "test-resources", "figma-tokens", "single-file-sync", "tokens.json")}"`,
      `--configFilePath="${path.join(process.cwd(), "test-resources", "figma-tokens", "single-file-sync", "supernova.settings.json")}"`,
      `--dev`
    ])
    .it("runs single-file sync", (ctx) => {
      console.log("x")
      expect(ctx.stdout).to.equal("Test")
      console.log("y")
    })
})
