export async function deploy(options) {
  const {
    branch,
    cluster,
    event,
    events,
    kubes,
    props,
    service,
  } = options

  const { clusters } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const {
    domain,
    extraBuilds,
    env,
    github,
    project,
    zone,
  } = clusters[cluster]

  if (!service) {
    const { services } = events.get([...props, "kubes"])

    for (const service of services.concat(extraBuilds)) {
      await events.kubesDeploy(props, {
        ...event.options,
        all: undefined,
        service,
      })
    }

    return
  }

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
          "-c",
          `gcr.io/${project}/${service}:${cluster} || exit 0`,
        ],
        entrypoint: "bash",
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
    ],
  }

  if (
    extraBuilds.indexOf(service) === -1 &&
    kubes !== false
  ) {
    yaml.steps.push({
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
    })
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
