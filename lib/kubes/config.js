// Packages
import { join } from "path"

// Helpers
export async function readConfig(options) {
  const { clusters, cwd, events, props } = options

  await events.fsReadYaml([...props, "config"], {
    path: join(cwd, clusters),
    save: true,
  })
}
