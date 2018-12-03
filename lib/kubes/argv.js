export async function argv({ events }) {
  await events.argv({
    alias: {
      a: ["apply"],
      b: ["build"],
      c: ["create"],
      d: ["dry"],
      p: ["project"],
      r: ["restart"],
      rm: ["remove"],
    },
  })
}
