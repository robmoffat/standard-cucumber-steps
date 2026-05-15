module.exports = {
  default: {
    paths: ['../features/**/*.feature'],
    require: ['src/support/*.ts', 'src/steps/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    worldParameters: {}
  }
};
