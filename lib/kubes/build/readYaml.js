import { join } from "path"

export async function readYaml(path) {
  const { cluster, config, cwd, events, props, yaml } = this
  const { clusters } = config

  const replace = {
    ...clusters[cluster],
    cluster,
  }

  yaml[path] = await events.fsReadYaml(props, {
    path: join(cwd, path),
    replace: match => replace[match],
  })
}
