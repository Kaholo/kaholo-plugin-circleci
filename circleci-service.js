const childProcess = require("child_process");
const { promisify } = require("util");
const { resolve } = require("path");

const { pathExists } = require("./helpers");

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

  const command = `circleci local execute --job ${jobName}`;

  let stdout;
  let stderr;
  try {
    ({ stdout, stderr } = await exec(command, {
      cwd: absoluteWorkingDirectory,
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

module.exports = {
  executeJob,
};
