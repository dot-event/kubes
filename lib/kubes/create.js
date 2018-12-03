// Helpers
export async function create(options) {
  const { cluster, event, events } = options
  const props = [...options.props, "create"]

  const config = events.get([
    ...options.props,
    "config",
    cluster,
  ])

  await events.kubesBuild(props, {
    ...config.cluster,
    ...event.options,
    cluster,
  })

  const { numNodes, project, zone } = config.cluster

  await events.spawn(props, {
    args: [
      "container",
      "clusters",
      "create",
      cluster,
      `--project=${project}`,
      `--zone=${zone}`,
      `--num-nodes=${numNodes}`,
      "--enable-ip-alias",
      "--create-subnetwork",
      `name=${cluster}-subnet`,
    ],
    command: "gcloud",
    silent: false,
  })
}
