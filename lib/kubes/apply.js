export async function apply(options) {
  const { cluster, cwd, event, events, props } = options

  const { clusters } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { project, zone } = clusters[cluster]

  await events.kubesBuild(props, event.options)

  await events.spawn([...props, "kubectlApply"], {
    args: [
      "apply",
      `--cluster=gke_${project}_${zone}_${cluster}`,
      "--filename=build/kubes",
      "--recursive",
    ],
    command: "kubectl",
    cwd,
    silent: false,
  })
}
