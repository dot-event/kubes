// Packages
import dotArgv, { argvRelay } from "@dot-event/argv"
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStore from "@dot-event/store"

// Helpers
import { apply } from "./kubes/apply"
import { argv } from "./kubes/argv"
import { build } from "./kubes/build"
import { glob } from "./kubes/glob"
import { cluster } from "./kubes/cluster"

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
  dotStore({ events })

  events.onAny({
    kubes: argvRelay,
    kubesApply: apply,
    kubesBuild: [glob, build],
    kubesCluster: cluster,
    kubesSetupOnce: argv,
  })

  return options
}
