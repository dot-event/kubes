import { basename, dirname } from "path"

// Helpers
export async function glob(options) {
  const { cwd, events, glob, props } = options

  const paths = await events.glob(
    [...props, "kubes", "glob"],
    {
      cwd,
      pattern: glob,
      save: true,
    }
  )

  const services = paths
    .map(path => basename(dirname(path)))
    .filter(
      (value, index, self) =>
        self.indexOf(value) === index &&
        value !== "ingress" &&
        value.indexOf("-redis") === -1
    )

  await events.set(
    [...props, "kubes", "services"],
    services
  )
}
