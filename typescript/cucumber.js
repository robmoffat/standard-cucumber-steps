module.exports = {
  default: {
    paths: ['../features/**/*.feature'],
    require: ['test/cucumber.steps.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    worldParameters: {}
  }
};
