// Packages
import dotArgv, { argvRelay } from "@dot-event/argv"
import dotAws from "@dot-event/aws"
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
import { deploy } from "./kubes/deploy"
import { dnsToAws } from "./kubes/dnsToAws"
import { glob } from "./kubes/glob"
import { importData } from "./kubes/import"
import { ingress } from "./kubes/ingress"
import { restart } from "./kubes/restart"
import { services } from "./kubes/services"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("kubes")) {
    return options
  }

  dotArgv({ events })
  dotAws({ events })
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
    kubesDeploy: deploy,
    kubesDnsToAws: [glob, dnsToAws],
    kubesImport: [glob, importData],
    kubesIngress: ingress,
    kubesRestart: restart,
    kubesServices: services,
    kubesSetupOnce: argv,
  })

  return options
}
