// Helpers
export async function create(options) {
  const { event, events, onlyCluster } = options
  const props = [...options.props, "create"]

  const { clusters, pg } = events.get([
    ...options.props,
    "config",
  ])

  const clusterList = await events.gcloudClusterList(props)
  const clusterIds = clusterList.map(({ name }) => name)

  for (const clusterId in clusters) {
    if (onlyCluster && onlyCluster !== clusterId) {
      continue
    }

    if (clusterIds.indexOf(clusterId) > -1) {
      continue
    }

    const cluster = clusters[clusterId]

    await events.kubesBuild(props, {
      ...cluster,
      ...event.options,
      clusterId,
    })

    const { numNodes, project, zone } = cluster

    await events.gcloudClusterCreate(props, {
      clusterId,
      numNodes,
      project,
      zone,
    })
  }

  const pgList = await events.gcloudPgList(props)
  const pgIds = pgList.map(({ name }) => name)

  for (const pgKey in pg.instances) {
    const {
      cpu,
      id: pgId,
      memory,
      project,
      zone,
    } = pg.instances[pgKey]

    if (pgIds.indexOf(pgId) === -1) {
      await events.gcloudPgCreate(props, {
        cpu,
        memory,
        pgId,
        project,
        zone,
      })
    }

    const dbList = await events.gcloudDbList(props)
    const dbIds = dbList.map(({ name }) => name)

    for (const dbId of pg.dbs) {
      if (dbIds.indexOf(dbId) > -1) {
        continue
      }

      await events.gcloudDbCreate(props, {
        dbId,
        pgId,
        project,
      })
    }
  }
}
