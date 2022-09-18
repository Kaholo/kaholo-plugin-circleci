const { stat } = require("fs/promises");
const fs = require("fs");

async function pathExists(path) {
  try {
    await stat(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  pathExists,
};
