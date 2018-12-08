import { join } from "path"

export async function build(options) {
  const { cwd, event, events, props } = options
  const { glob } = events.get([...props, "kubes"])

  const config = await events.gcloudConfigRead(
    props,
    event.options
  )

  await events.fsRemove(props, { path: join(cwd, "build") })

  await Promise.all(
    glob.map(buildPath, { config, options })
  )
}

async function buildPath(path) {
  const { config, options } = this
  const { clusters, pg } = config
  const { cluster, cwd, events, props } = options

  const replace = {
    ...clusters[cluster],
    ...pgConfig({ cluster, pg }),
    cluster,
  }

  const yaml = await events.fsReadYaml(props, {
    path: join(cwd, path),
    replace: match => replace[match],
  })

  if (yaml.kind === "Secret") {
    for (const key in yaml.data) {
      yaml.data[key] = Buffer.from(yaml.data[key]).toString(
        "base64"
      )
    }
  }

  await events.fsWriteYaml(props, {
    ensure: true,
    path: join(cwd, "build", path.replace(/[^/]+\//i, "")),
    yaml,
  })
}

function pgConfig({ cluster, pg }) {
  return Object.keys(pg).reduce((memo, pgId) => {
    const baseId = pgId.replace(/-[^-]+$/, "")

    if (baseId.slice(0, cluster.length) === cluster) {
      mapObj(memo, pg[pgId], `pg.${baseId}`)
    }

    return memo
  }, {})
}

function mapObj(memo, obj, key) {
  for (const k in obj) {
    memo[`${key}.${k}`] = obj[k]
  }
}
