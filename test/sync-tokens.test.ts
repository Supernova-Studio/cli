//
//  sync-tokens.test.ts
//  Supernova CLI
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova.io. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { expect, test } from '@oclif/test'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

describe('sync-tokens-single-file', () => {
  test
    .stdout()
    .command(['sync-tokens'])
    .it('runs single-file sync', (ctx) => {
        expect(ctx.stdout).to.equal("Test")
    })
})