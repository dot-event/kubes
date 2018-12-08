export async function apply(options) {
  const { cwd, event, events } = options
  const props = [...options.props, "apply"]

  await events.kubesBuild(props, event.options)

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
