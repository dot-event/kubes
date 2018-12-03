// Packages
import dotArgv, { argvRelay } from "@dot-event/argv"
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStatus from "@dot-event/status"
import dotStore from "@dot-event/store"

// Helpers
import { apply } from "./kubes/apply"
import { argv } from "./kubes/argv"
import { build } from "./kubes/build"
import { readConfig } from "./kubes/config"
import { create } from "./kubes/create"
import { glob } from "./kubes/glob"
import { remove } from "./kubes/remove"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("kubes")) {
    return options
  }

  dotArgv({ events })
  dotFs({ events })
  dotLog({ events })
  dotSpawn({ events })
  dotStatus({ events })
  dotStore({ events })

  events.onAny({
    kubes: argvRelay,
    kubesApply: apply,
    kubesBuild: [glob, build],
    kubesCreate: [readConfig, create],
    kubesRemove: [readConfig, remove],
    kubesSetupOnce: argv,
  })

  return options
}
