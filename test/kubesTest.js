// Packages
import dotEvent from "dot-event"
import dotTask from "@dot-event/task"

// Helpers
import kubes from "../"

async function run(...argv) {
  await events.task({
    argv,
    op: "kubes",
    path: `${__dirname}/fixture`,
  })
}

// Constants
const cancel = ({ event }) => (event.signal.cancel = true)

// Variables
let events

// Tests
beforeEach(async () => {
  events = dotEvent()

  kubes({ events })
  dotTask({ events })

  events.onAny({
    "before.fsWriteYaml": cancel,
  })
})

test("build", async () => {
  const calls = []

  events.onAny("before.fsWriteYaml", ({ event }) =>
    calls.push(event.options)
  )

  await run("--build")

  expect(calls).toContainEqual({
    ensure: true,
    path: `${__dirname}/fixture/build/test.yaml`,
    yaml: { test: true },
  })
})
