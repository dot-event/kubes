import { basename, dirname, join } from "path"

// Helpers
import { processYaml } from "./build/processYaml"
import { readYaml } from "./build/readYaml"
import { writeYaml } from "./build/writeYaml"

export async function build(options) {
  const { cwd, event, events, props } = options
  const { glob } = events.get([...props, "kubes"])

  const config = await events.gcloudConfigRead(
    props,
    event.options
  )

  const services = glob
    .map(path => basename(dirname(path)))
    .filter(
      (value, index, self) => self.indexOf(value) === index
    )

  await events.fsRemove(props, { path: join(cwd, "build") })

  const yaml = {}
  const opts = { ...options, config, services, yaml }

  await Promise.all(glob.map(readYaml, opts))
  await Promise.all(glob.map(processYaml, opts))
  await Promise.all(Object.keys(yaml).map(writeYaml, opts))
}
