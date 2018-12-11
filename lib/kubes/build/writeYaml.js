import { join } from "path"

export async function writeYaml(path) {
  const { cwd, events, props, yaml } = this

  const body = yaml[path]

  if (body.kind === "Secret") {
    for (const key in body.data) {
      body.data[key] = Buffer.from(body.data[key]).toString(
        "base64"
      )
    }
  }

  await events.fsWriteYaml(props, {
    ensure: true,
    path: join(cwd, "build", path.replace(/[^/]+\//i, "")),
    yaml: yaml[path],
  })
}
