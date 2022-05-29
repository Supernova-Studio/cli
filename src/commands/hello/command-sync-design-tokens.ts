//
//  CommandSyncDesignTokens.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Command, Flags } from "@oclif/core"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Command that handles synchronization with design tokens plugin */
export class CommandSyncDesignTokens extends Command {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command configuration

  // Command help description
  static description = "Supernova CLI description TODO"

  // Examples how to use the command
  static examples = [
    `$ @supernovaio/cli sync-design-tokens --workspaceId=123 --designSystemId=456 --brandName="Test" --input "{}"`,
  ]

  // How this command can be run
  static aliases: [
    "sync-design-tokens"
  ]

  // Static flags to enable / disable features
  static flags = {}

  // Required and optional attributes
  static args = [
    { name: "workspaceId", description: "Workspace to synchronize contents with", required: true },
    { name: "designSystemId", description: "Design System to synchronize contents with", required: true },
    { name: "brandName", description: "Brand to synchronize contents with", required: true },
    { name: "input", description: "Contents of design tokens plugin definition JSON file", required: true },
  ]

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Command runtime

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CommandSyncDesignTokens)
    this.log(JSON.stringify(args, null, 2))
    this.log(JSON.stringify(flags, null, 2))
    this.log("command did run!")
    this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
  }
}
