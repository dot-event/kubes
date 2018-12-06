export async function argv({ events }) {
  await events.argv({
    alias: {
      a: ["apply"],
      b: ["build"],
      c: ["create"],
      d: ["delete"],
      p: ["project"],
      r: ["restart"],
    },
  })
}
