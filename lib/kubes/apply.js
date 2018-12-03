export async function apply(options) {
  const { cluster, cwd, event, events } = options
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
