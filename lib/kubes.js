// Packages
import dotArgv, { argvRelay } from "@dot-event/argv"
import dotFs from "@dot-event/fs"
import dotGcloud from "@dot-event/gcloud"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStatus from "@dot-event/status"
import dotStore from "@dot-event/store"

// Helpers
import { apply } from "./kubes/apply"
import { argv } from "./kubes/argv"
import { build } from "./kubes/build"
import { del } from "./kubes/del"
import { glob } from "./kubes/glob"
import { restart } from "./kubes/restart"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("kubes")) {
    return options
  }

  dotArgv({ events })
  dotFs({ events })
  dotGcloud({ events })
  dotLog({ events })
  dotSpawn({ events })
  dotStatus({ events })
  dotStore({ events })

  events.onAny({
    kubes: argvRelay,
    kubesApply: apply,
    kubesBuild: [glob, build],
    kubesDelete: del,
    kubesRestart: restart,
    kubesSetupOnce: argv,
  })

  return options
}
