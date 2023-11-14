import { Environment } from "../types/types"

/** Retrieve URL for the DSM access. This can be both used inside extension to configure the internal requests as well as inside pulsar bridge */
export function environmentAPI(environment: Environment, version: string | undefined): string {
  const versionFragment = version ? `/${version}` : ""
  switch (environment) {
    case Environment.production:
      return `https://api.supernova.io/api${versionFragment}`
    case Environment.development:
      return `https://api.dev.supernova.io/api${versionFragment}`
    case Environment.demo:
      return `https://api.demo.supernova.io/api${versionFragment}`
    case Environment.staging:
      return `https://api.staging.supernova.io/api${versionFragment}`
  }
  throw new Error("Unsupported network environment")
}
