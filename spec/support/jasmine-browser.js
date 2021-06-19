// jshint ignore:start
module.exports = {
  srcDir: 'src',
  srcFiles: [
      'requireAjax.js',
      '[^b]*.js',
      'boot.js'
  ],
  specDir: 'spec',
  specFiles: ['**/*[Ss]pec.js'],
  helpers: [
    'helpers/spec-helper.js'
  ],
  random: true,
  browser: {
    name: process.env.JASMINE_BROWSER || 'firefox',
    useSauce: process.env.USE_SAUCE === 'true',
    sauce: {
      name: `jasmine-ajax ${new Date().toISOString()}`,
      os: process.env.SAUCE_OS,
      browserVersion: process.env.SAUCE_BROWSER_VERSION,
      build: `jasmine-ajax ${process.env.CIRCLE_WORKFLOW_ID || 'Ran locally'}`,
      tags: ['jasmine-ajax'],
      tunnelIdentifier: process.env.SAUCE_TUNNEL_IDENTIFIER,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY
    }
  }
};