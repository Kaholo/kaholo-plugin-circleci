const { bootstrap } = require("@kaholo/plugin-library");
const { promisify } = require("util");
const exec = promisify(require("child-process").exec);

const CIRCLECI_DOCKER_IMAGE = "circleci/circleci-cli";

async function executeJob(params) {
  const {
    workingDirectory,
    jobName,
  } = params;

  const command = `\
docker run --rm \
-v /var/run/docker.sock:/var/run/docker.sock \
-v ${workingDirectory}:/proj \
-w /proj ${CIRCLECI_DOCKER_IMAGE} \
sudo usermod -aG docker circleci; \
circleci local execute --job ${jobName}\
`;

  return exec(command);
}

module.exports = bootstrap({
  executeJob,
});
