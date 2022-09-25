const pty = require("node-pty");
const { promisify } = require("util");
const { resolve } = require("path");

const { pathExists } = require("./helpers");

async function executeJob(params) {
  const {
    workingDirectory,
    jobName,
  } = params;

  const absoluteWorkingDirectory = resolve(workingDirectory);
  if (!await pathExists(absoluteWorkingDirectory)) {
    throw new Error(`Path ${workingDirectory} does not exist on agent!`);
  }

  const command = "circleci";
  const commandArgs = ["local", "execute", "--job", jobName];

  const circleciProcess = pty.spawn(command, commandArgs, {
    cwd: absoluteWorkingDirectory,
  });

  const dataChunks = [];
  circleciProcess.onData((chunk) => {
    dataChunks.push(String(chunk));
  });

  try {
    await promisify(circleciProcess.onExit.bind(circleciProcess))();
  } catch (error) {
    console.error("Child process exit code:", error);
  }

  return dataChunks.join("");
}

module.exports = {
  executeJob,
};
