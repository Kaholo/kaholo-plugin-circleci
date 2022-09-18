const { bootstrap } = require("@kaholo/plugin-library");

const circleciService = require("./circleci-service");

module.exports = bootstrap({
  executeJob: circleciService.executeJob,
});
