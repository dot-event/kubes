export async function services(options) {
  const { cluster, event, events, props } = options
  const { services } = events.get([...props, "kubes"])

  const gcloudConfig = await events.gcloudConfigRead(
    props,
    event.options
  )

  const gcloudCluster = gcloudConfig.clusters[cluster]

  const { project, zone } = gcloudCluster

  const { out } = await events.spawn(
    [...props, "getServices"],
    {
      args: [
        "get",
        "services",
        `--cluster=gke_${project}_${zone}_${cluster}`,
        "--output=json",
      ],
      command: "kubectl",
      json: true,
    }
  )

  event.signal.returnValue = out.items.reduce(
    (memo, item) => {
      const name = item.metadata.name

      if (services.indexOf(name) > -1) {
        memo[name] = item
      }

      return memo
    },
    {}
  )
}
