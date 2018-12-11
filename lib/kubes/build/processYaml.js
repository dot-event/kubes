import { basename, dirname, join } from "path"

export async function processYaml(path) {
  const options = this
  const { services, yaml } = options

  await runProcessor({
    ...options,
    path,
    services,
    yaml,
  })
}

async function runProcessor(options) {
  const {
    cluster,
    config,
    cwd,
    events,
    path,
    props,
    yaml,
  } = options

  const { clusters, pg } = config

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
