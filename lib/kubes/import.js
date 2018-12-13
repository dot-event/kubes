export async function importData(options) {
  const {
    cluster,
    importGlob,
    event,
    events,
    props,
  } = options

  const { services } = events.get([...props, "kubes"])

  const { clusters, pg } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { importBucket, project } = clusters[cluster]

  for (const service of services) {
    const pgId = await events.gcloudConfigPgId(props, {
      cluster,
      pg,
      service,
    })

    if (!pgId) {
      continue
    }

    await events.gcloudPgImport(props, {
      bucket: importBucket,
      dbId: service,
      importGlob,
      pgId,
      project,
    })
  }
}
