export async function argv({ events }) {
  await events.argv({
    alias: {
      a: ["apply"],
      b: ["build"],
      c: ["create"],
      d: ["deploy"],
      del: ["delete"],
      dta: ["dnsToAws"],
      im: ["import"],
      in: ["ingress"],
      o: ["only"],
      p: ["project"],
      r: ["restart"],
      s: ["services"],
    },
  })
}
