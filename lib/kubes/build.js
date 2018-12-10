import { basename, dirname, join } from "path"

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

  for (const path in yaml) {
    const body = yaml[path]

    if (body.kind === "Secret") {
      for (const key in body.data) {
        body.data[key] = Buffer.from(
          body.data[key]
        ).toString("base64")
      }
    }

    await events.fsWriteYaml(props, {
      ensure: true,
      path: join(
        cwd,
        "build",
        path.replace(/[^/]+\//i, "")
      ),
      yaml: body,
    })
  }
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

  const yaml = {
    [path]: await events.fsReadYaml(props, {
      path: join(cwd, path),
      replace: match => replace[match],
    }),
  }

  const processor = events.get([
    ...props,
    "operations",
    "kubes",
    "processor",
  ])

  if (processor) {
    const { kubesProcessor } = require(join(cwd, processor))
    const service = basename(dirname(path))
    const pgId = pgConfig({ cluster, pg, service })

    return await kubesProcessor({
      ...options,
      cluster: clusters[cluster],
      clusterId: cluster,
      pg: pg[pgId],
      pgId,
      service,
      yaml,
    })
  }

  return yaml
}

function pgConfig({ cluster, pg, service }) {
  return Object.keys(pg).find(pgId => {
    const baseId = pgId.replace(/-[^-]+$/, "")

    const clusterMatch =
      baseId.slice(0, cluster.length) === cluster

    if (!clusterMatch) {
      return
    }

    const hasDb = pg[pgId].dbs.indexOf(service) > -1

    if (baseId === cluster && hasDb) {
      return true
    }

    const serviceId = baseId.match(/-([^-])$/)

    if (serviceId) {
      return service === serviceId[1]
    }
  })
}
