import { basename, join } from "path"

export async function readYaml(path) {
  const { cluster, config, cwd, events, props, yaml } = this
  const { clusters, services } = config
  const { env } = clusters[cluster]

  const service = services[env][
    basename(join(path, "../"))
  ] || { replicas: 2 }

  const replace = {
    ...clusters[cluster],
    ...service,
    cluster,
  }

  yaml[path] = await events.fsReadYaml(props, {
    path: join(cwd, path),
    replace: match => replace[match],
  })
}
