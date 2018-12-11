export async function apply(options) {
  const { cluster, cwd, event, events, props } = options
  await events.kubesBuild(props, event.options)

  await events.spawn([...props, "kubectlApply"], {
    args: [
      "apply",
      `--cluster=${cluster}`,
      "--filename=build/kubes",
      "--recursive",
    ],
    command: "kubectl",
    cwd,
    silent: false,
  })
}
