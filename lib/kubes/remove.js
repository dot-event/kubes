export async function remove(options) {
  const { cluster, events } = options
  const props = [...options.props, "remove"]

  const config = events.get([
    ...options.props,
    "config",
    cluster,
  ])

  const { project } = config.cluster

  await events.spawn(props, {
    args: [
      "container",
      "clusters",
      "delete",
      cluster,
      `--project=${project}`,
      "--quiet",
    ],
    command: "gcloud",
    silent: false,
  })
}
