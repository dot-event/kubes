export async function del(options) {
  const {
    cluster,
    cwd,
    event,
    events,
    force,
    props,
    service,
  } = options

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
      `--filename=build/kubes${
        service ? `/${service}` : ""
      }`,
      "--recursive",
      "--ignore-not-found",
    ].concat(force ? [] : ["--selector=delete!=force"]),
    command: "kubectl",
    cwd,
    silent: false,
  })
}
