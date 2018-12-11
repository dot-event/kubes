export async function del(options) {
  const { cluster, cwd, event, events, props } = options

  const { clusters } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { project, zone } = clusters[cluster]

  await events.kubesBuild(props, event.options)

  await events.spawn([...props, "kubectlDelete"], {
    args: [
      "delete",
      `--cluster=gke_${project}_${zone}_${cluster}`,
      "--filename=build/kubes",
      "--recursive",
    ],
    command: "kubectl",
    cwd,
    silent: false,
  })
}
