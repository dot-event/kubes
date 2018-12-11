export async function restart(options) {
  const { cluster, events, restart } = options
  const props = [...options.props, "create"]

  if (typeof restart !== "string") {
    await events.status(props, {
      fail: true,
      highlight: true,
      msg: "restart flag must contain deployment name",
      op: "kubes",
    })
    process.exit(1)
  }

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
      `--cluster=${cluster}`,
      `--patch=${JSON.stringify(patch)}`,
    ],
    command: "kubectl",
  })
}
