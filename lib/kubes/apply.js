export async function apply(options) {
  const { cluster, cwd, event, events } = options
  const props = [...options.props, "apply"]

  const { clusters } = await events.gcloudReadConfig(
    options.props
  )

  await events.kubesBuild(props, {
    ...clusters[cluster],
    ...event.options,
    cluster,
  })

  await events.spawn(props, {
    args: [
      "apply",
      "--filename=build/kubes",
      "--recursive",
    ],
    command: "kubectl",
    cwd,
    silent: false,
  })
}
