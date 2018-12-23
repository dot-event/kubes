export async function deploy(options) {
  const { cluster, event, events, props, service } = options

  const { clusters } = await events.gcloudConfigRead(
    props,
    event.options
  )

  const { extraBuilds, project } = clusters[cluster]

  if (!service) {
    const { services } = events.get([...props, "kubes"])

    for (const service of services.concat(extraBuilds)) {
      await events.kubesDeploy(props, {
        ...event.options,
        service,
      })
    }

    return
  }

  const allOptions = {
    ...options,
    ...clusters[cluster],
  }

  const path = await cloneTmp(allOptions)

  const yaml = {}

  yaml["cloudbuild.yaml"] = dockerBuild(allOptions)

  if (service === "flatiron") {
    yaml["cloudbuild.assets.yaml"] = assetsBuild(allOptions)
  }

  for (const base in yaml) {
    await events.fsWriteYaml(props, {
      path: `${path}/${service}/${base}`,
      yaml: yaml[base],
    })
  }

  for (const base in yaml) {
    await events.spawn([...props, "buildSubmit"], {
      args: [
        "builds",
        "submit",
        ".",
        "--async",
        `--config=${base}`,
        `--project=${project}`,
      ],
      command: "gcloud",
      cwd: `${path}/${service}`,
      silent: false,
    })
  }
}

async function cloneTmp(options) {
  const { events, branch, github, props, service } = options

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

  return path
}

function assetsBuild(options) {
  const { assetBucket, domain, env } = options

  const envVars = [
    `DOMAIN=${domain}`,
    `ENV=${env}`,
    `NODE_ENV=${env}`,
  ]

  return {
    steps: [
      {
        args: ["install"],
        name: "gcr.io/cloud-builders/npm",
      },
      {
        args: ["run", "gulp:build"],
        env: envVars,
        name: "gcr.io/cloud-builders/npm",
      },
      {
        args: [
          "-m",
          "-h",
          "Cache-Control: max-age=3600, s-maxage=604800",
          "cp",
          "-a",
          "public-read",
          "-Z",
          "dist/app/versions/*",
          `gs://${assetBucket}`,
        ],
        name: "gcr.io/cloud-builders/gsutil",
      },
      {
        args: [
          "-m",
          "-h",
          "Cache-Control: max-age=3600, s-maxage=604800",
          "cp",
          "-a",
          "public-read",
          "-Z",
          "dist/app/fonts/*",
          `gs://${assetBucket}/fonts`,
        ],
        name: "gcr.io/cloud-builders/gsutil",
      },
    ],
  }
}

function dockerBuild(options) {
  const {
    cluster,
    domain,
    env,
    extraBuilds,
    kubes,
    project,
    service,
    zone,
  } = options

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
    const patch = {
      spec: {
        template: {
          metadata: {
            labels: {
              date: new Date().getTime().toString(),
            },
          },
        },
      },
    }

    yaml.steps.push({
      args: [
        "patch",
        "deployment",
        service,
        `--patch=${JSON.stringify(patch)}`,
      ],
      env: [
        `CLOUDSDK_COMPUTE_ZONE=${zone}`,
        `CLOUDSDK_CONTAINER_CLUSTER=${cluster}`,
      ],
      name: "gcr.io/cloud-builders/kubectl",
    })
  }

  return yaml
}
