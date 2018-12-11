import { basename, dirname, join } from "path"

export async function build(options) {
  const { cwd, event, events, props } = options
  const { glob } = events.get([...props, "kubes"])

  const config = await events.gcloudConfigRead(
    props,
    event.options
  )

  const services = glob
    .map(path => basename(dirname(path)))
    .filter(
      (value, index, self) => self.indexOf(value) === index
    )

  await events.fsRemove(props, { path: join(cwd, "build") })

  const yaml = {}

  await Promise.all(
    glob.map(buildYaml, {
      ...options,
      config,
      services,
      yaml,
    })
  )

  await Promise.all(
    glob.map(processYaml, {
      ...options,
      config,
      services,
      yaml,
    })
  )

  await Promise.all(
    Object.keys(yaml).map(writeYaml, { ...options, yaml })
  )
}

async function processYaml(path) {
  const options = this
  const { services, yaml } = options

  await runProcessor({
    ...options,
    path,
    services,
    yaml,
  })

  const body = yaml[path]

  if (body.kind === "Secret") {
    for (const key in body.data) {
      body.data[key] = Buffer.from(body.data[key]).toString(
        "base64"
      )
    }
  }
}

async function buildYaml(path) {
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

async function writeYaml(path) {
  const { cwd, events, props, yaml } = this

  await events.fsWriteYaml(props, {
    ensure: true,
    path: join(cwd, "build", path.replace(/[^/]+\//i, "")),
    yaml: yaml[path],
  })
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
