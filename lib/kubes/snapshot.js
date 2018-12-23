export async function snapshot(options) {
  const { cluster, event, events, props } = options

  const { disks } = await events.gcloudConfigRead(
    props,
    event.options
  )

  for (const diskName in disks) {
    if (diskName.slice(0, cluster.length) === cluster) {
      await events.gcloudDisksSnapshot(props, {
        ...disks[diskName],
        diskName,
      })
    }
  }
}
