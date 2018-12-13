export async function importData(options) {
  const {
    cluster,
    importGlob,
    event,
    events,
    only,
    props,
  } = options

  const { services } = events.get([...props, "kubes"])

  const { clusters, pg } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { importBucket, project } = clusters[cluster]

  for (const service of services) {
    if (only && only !== service) {
      continue
    }

    const pgId = await events.gcloudConfigPgId(props, {
      cluster,
      pg,
      service,
    })

    if (!pgId) {
      continue
    }

    await events.gcloudPgImport(props, {
      ...event.options,
      bucket: importBucket,
      dbId: service,
      importGlob,
      pgId,
      project,
    })
  }
}
