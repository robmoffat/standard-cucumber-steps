module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: [
      'node_modules/@finos/cucumber-testing-steps/dist/support/setup.js',
      'src/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' }
  }
};
