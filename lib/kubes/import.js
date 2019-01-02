export async function importData(options) {
  const { cluster, event, events, only, props } = options

  const { services } = events.get([...props, "kubes"])

  const { clusters, pg } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { importBucket, project } = clusters[cluster]

  Promise.all(
    services.map(async service => {
      if (only && only !== service) {
        return
      }

      const pgId = await events.gcloudConfigPgId(props, {
        cluster,
        pg,
        service,
      })

      if (!pgId) {
        return
      }

      const fromPgId = await events.gcloudConfigPgId(
        props,
        {
          cluster: pg[pgId].from,
          pg,
          service,
        }
      )

      await events.gcloudPgImport(props, {
        ...event.options,
        bucket: importBucket,
        dbId: service,
        fromPgId,
        pgId,
        project,
      })
    })
  )
}
