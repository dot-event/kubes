import { join } from "path"

export async function build(options) {
  const { cwd, events, props } = options
  const { glob } = events.get([...props, "kubes"])

  await events.fsRemove(props, { path: join(cwd, "build") })

  await Promise.all(glob.map(buildPath, options))
}

async function buildPath(path) {
  const options = this
  const { cwd, events, props } = options

  const yaml = await events.fsReadYaml(props, {
    path: join(cwd, path),
    replace: match => options[match],
  })

  if (yaml.kind === "Secret") {
    for (const key in yaml.data) {
      yaml.data[key] = Buffer.from(yaml.data[key]).toString(
        "base64"
      )
    }
  }

  await events.fsWriteYaml(props, {
    ensure: true,
    path: join(cwd, "build", path.replace(/[^/]+\//i, "")),
    yaml,
  })
}
