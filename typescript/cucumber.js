module.exports = {
  default: {
    paths: ['../features/**/*.feature'],
    require: ['src/steps/*.ts', 'src/support/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    worldParameters: {}
  }
};
