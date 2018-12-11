export async function restart(options) {
  const { cluster, event, events, props, restart } = options

  if (typeof restart !== "string") {
    await events.status(props, {
      fail: true,
      highlight: true,
      msg: "restart flag must contain deployment name",
      op: "kubes",
    })
    process.exit(1)
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

  await events.spawn(props, {
    args: [
      "patch",
      "deployment",
      restart,
      `--cluster=gke_${project}_${zone}_${cluster}`,
      `--patch=${JSON.stringify(patch)}`,
    ],
    command: "kubectl",
  })
}
