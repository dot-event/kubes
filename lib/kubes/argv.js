export async function argv({ events }) {
  await events.argv({
    alias: {
      a: ["apply"],
      b: ["build"],
      c: ["create"],
      d: ["delete"],
      dta: ["dnsToAws"],
      p: ["project"],
      r: ["restart"],
      s: ["services"],
    },
  })
}
