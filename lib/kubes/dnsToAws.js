export async function dnsToAws(options) {
  const { cluster, event, events, props } = options

  const { clusters } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { domain } = clusters[cluster]

  const ingress = await events.kubesIngress(
    props,
    event.options
  )

  if (!ingress.status.loadBalancer.ingress) {
    await events.status(props, {
      fail: true,
      highlight: true,
      msg: [
        "ingress does not have IP yet",
        "try again later",
      ],
      op: "kubes",
    })
    process.exit(1)
  }
  const { ip } = ingress.status.loadBalancer.ingress[0]

  const prefixes = ["", "*.", "*.origin."]

  for (const prefix of prefixes) {
    await events.awsDns(props, {
      ...event.options,
      domain: `${prefix}${domain}`,
      ip,
    })
  }
}
