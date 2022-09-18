const childProcess = require("child_process");
const { promisify } = require("util");
const { dirname, resolve } = require("path");
const { docker } = require("@kaholo/plugin-library");

const { pathExists } = require("./helpers");

const DOCKER_IMAGE_NAME = "circleci-kaholo:1.0.0";

const exec = promisify(childProcess.exec);

async function executeJob(params) {
  const {
    workingDirectory,
    jobName,
  } = params;

  const absoluteWorkingDirectory = resolve(workingDirectory);
  if (!await pathExists(absoluteWorkingDirectory)) {
    throw new Error(`Path ${workingDirectory} does not exist on agent!`);
  }

  await buildImage();

  const command = `circleci local execute --job ${jobName}`;
  const workingDirVolumeDefinition = docker.createVolumeDefinition(absoluteWorkingDirectory);
  const environmentVariables = {
    [workingDirVolumeDefinition.mountPoint.name]: workingDirVolumeDefinition.mountPoint.value,
    [workingDirVolumeDefinition.path.name]: workingDirVolumeDefinition.path.value,
  };
  const dockerCommand = docker.buildDockerCommand({
    command: docker.sanitizeCommand(command),
    image: DOCKER_IMAGE_NAME,
    user: "root",
    workingDirectory: `$${workingDirVolumeDefinition.mountPoint.name}`,
    additionalArguments: [
      "--privileged",
      "-t",
      "-v",
      "/var/run/docker.sock:/var/run/docker.sock:ro",
      "-v",
      "/tmp:/tmp:rw",
    ],
    volumeDefinitionsArray: [workingDirVolumeDefinition],
    environmentVariables,
  });

  let stdout;
  let stderr;
  try {
    ({ stdout, stderr } = await exec(dockerCommand, {
      env: environmentVariables,
    }));
  } catch (error) {
    if (error.stderr) {
      throw new Error(error.stderr);
    } else if (error.stdout) {
      throw new Error(error.stdout);
    }
    throw error;
  }

  if (!stdout && stderr) {
    throw new Error(stderr);
  } else if (stderr) {
    console.error(stderr);
  }
  return stdout;
}

async function buildImage() {
  const pluginDirectory = dirname(process.argv[2]);
  await exec(`docker build --tag ${DOCKER_IMAGE_NAME} .`, {
    cwd: pluginDirectory,
  });
}

module.exports = {
  executeJob,
};
