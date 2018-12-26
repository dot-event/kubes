export async function exportData(options) {
  const { cluster, event, events, props } = options

  const { pg } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { services } = events.get([...props, "kubes"])

  for (const service of services) {
    const pgId = await events.gcloudConfigPgId({
      cluster,
      pg,
      service,
    })

    if (!pg[pgId]) {
      continue
    }

    const { dbs, importBucket } = pg[pgId]

    for (const dbId of dbs) {
      await events.gcloudPgExport(props, {
        ...pg[pgId],
        bucket: importBucket,
        dbId,
        pgId,
      })
    }
  }
}
