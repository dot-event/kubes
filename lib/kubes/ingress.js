export async function ingress(options) {
  const { cluster, event, events, props } = options

  const gcloudConfig = await events.gcloudConfigRead(
    props,
    event.options
  )

  const gcloudCluster = gcloudConfig.clusters[cluster]

  const { ingress, project, zone } = gcloudCluster

  const { out } = await events.spawn(
    [...props, "getIngress"],
    {
      args: [
        "get",
        "ingress",
        ingress,
        `--cluster=gke_${project}_${zone}_${cluster}`,
        "--output=json",
      ],
      command: "kubectl",
      json: true,
    }
  )

  event.signal.returnValue = out
}
