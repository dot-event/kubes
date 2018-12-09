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
    glob.map(buildPath, { ...options, config })
  )
}

async function buildPath(path) {
  const options = this
  const { cwd, events, props } = options

  const yaml = await processYaml({ ...options, path })

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

async function processYaml(options) {
  const {
    cluster,
    config,
    cwd,
    events,
    path,
    props,
  } = options

  const { clusters, pg } = config

  const replace = {
    ...clusters[cluster],
    cluster,
  }

  const yaml = await events.fsReadYaml(props, {
    path: join(cwd, path),
    replace: match => replace[match],
  })

  const processor = events.get([
    ...props,
    "operations",
    "kubes",
    "processor",
  ])

  if (processor) {
    const { kubesProcessor } = require(join(cwd, processor))

    return await kubesProcessor({
      ...options,
      pg: pgConfig({ cluster, pg }),
      yaml,
    })
  }

  return yaml
}

function pgConfig({ cluster, pg }) {
  return Object.keys(pg).reduce((memo, pgId) => {
    const baseId = pgId.replace(/-[^-]+$/, "")

    if (baseId.slice(0, cluster.length) === cluster) {
      memo[baseId] = pg[pgId]
    }

    return memo
  }, {})
}
