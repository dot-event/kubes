import { join } from "path"

export async function writeYaml(path) {
  const { cwd, events, props, yaml } = this

  await events.fsWriteYaml(props, {
    ensure: true,
    path: join(cwd, "build", path.replace(/[^/]+\//i, "")),
    yaml: yaml[path],
  })
}
