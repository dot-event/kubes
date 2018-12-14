export async function restart(options) {
  const {
    all,
    cluster,
    event,
    events,
    props,
    service,
  } = options

  if (all) {
    const { services } = events.get([...props, "kubes"])

    for (const service of services) {
      await events.kubesRestart(props, {
        ...event.options,
        all: undefined,
        service,
      })
    }

    return
  }

  const { clusters } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { project, zone } = clusters[cluster]

  const patch = {
    spec: {
      template: {
        metadata: {
          labels: { date: new Date().getTime().toString() },
        },
      },
    },
  }

  await events.spawn([...props, "patch"], {
    args: [
      "patch",
      "deployment",
      service,
      `--cluster=gke_${project}_${zone}_${cluster}`,
      `--patch=${JSON.stringify(patch)}`,
    ],
    command: "kubectl",
  })
}
