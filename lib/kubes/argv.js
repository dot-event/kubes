export async function argv({ events }) {
  await events.argv({
    alias: {
      a: ["apply"],
      b: ["build"],
      c: ["create"],
      d: ["delete"],
      dta: ["dnsToAws"],
      im: ["import"],
      in: ["ingress"],
      p: ["project"],
      r: ["restart"],
      s: ["services"],
    },
  })
}
