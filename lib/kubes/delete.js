export async function del(options) {
  const { cluster, events, props } = options

  const config = events.get([
    ...options.props,
    "config",
    cluster,
  ])

  const { project } = config.cluster

  await events.gcloudClusterDelete(props, { project })
}
