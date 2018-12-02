export async function argv({ events }) {
  await events.argv({
    alias: {
      a: ["apply"],
      b: ["build"],
      c: ["cluster"],
      d: ["dry"],
    },
  })
}
