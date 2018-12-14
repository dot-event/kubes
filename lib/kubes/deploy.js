export async function deploy(options) {
  const {
    all,
    branch,
    cluster,
    event,
    events,
    props,
    service,
  } = options

  if (all) {
    const { services } = events.get([...props, "kubes"])

    for (const service of services) {
      await events.kubesDeploy(props, {
        ...event.options,
        all: undefined,
        service,
      })
    }

    return
  }

  const { clusters } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { domain, env, github, project, zone } = clusters[
    cluster
  ]

  const { path } = await events.fsEnsureDir(props, {
    temp: true,
  })

  await events.spawn([...props, "cloneTmp"], {
    args: [
      "clone",
      "--depth",
      "1",
      `git@github.com:${github}/${service}.git`,
      "-b",
      branch || "master",
    ],
    command: "git",
    cwd: path,
  })

  const yaml = {
    steps: [
      {
        args: [
          "pull",
          `gcr.io/${project}/${service}:${cluster}`,
        ],
        name: "gcr.io/cloud-builders/docker",
      },
      {
        args: [
          "build",
          "--build-arg",
          `DOMAIN=${domain}`,
          "--build-arg",
          `ENV=${env}`,
          "--build-arg",
          `NODE_ENV=${env}`,
          "--build-arg",
          `MIX_ENV=${env}`,
          "-t",
          `gcr.io/${project}/${service}:${cluster}`,
          "--cache-from",
          `gcr.io/${project}/${service}:${cluster}`,
          ".",
        ],
        name: "gcr.io/cloud-builders/docker",
        timeout: "600s",
      },
      {
        args: [
          "push",
          `gcr.io/${project}/${service}:${cluster}`,
        ],
        name: "gcr.io/cloud-builders/docker",
      },
      {
        args: [
          "set",
          "image",
          `deployment/${service}`,
          `${service}=gcr.io/${project}/${service}:${cluster}`,
        ],
        env: [
          `CLOUDSDK_COMPUTE_ZONE=${zone}`,
          `CLOUDSDK_CONTAINER_CLUSTER=${cluster}`,
        ],
        name: "gcr.io/cloud-builders/kubectl",
      },
    ],
  }

  await events.fsWriteYaml(props, {
    path: `${path}/${service}/cloudbuild.yaml`,
    yaml,
  })

  await events.spawn([...props, "buildSubmit"], {
    args: [
      "builds",
      "submit",
      ".",
      "--async",
      `--project=${project}`,
    ],
    command: "gcloud",
    cwd: `${path}/${service}`,
    silent: false,
  })
}
