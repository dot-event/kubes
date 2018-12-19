export async function restart(options) {
  const { cluster, event, events, props, service } = options

  if (!service) {
    const { services } = events.get([...props, "kubes"])

    for (const service of services) {
      await events.kubesRestart(props, {
        ...event.options,
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
