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
    useRemoteSeleniumGrid: process.env.USE_SAUCE === 'true',
    remoteSeleniumGrid: {
      url: 'https://ondemand.saucelabs.com/wd/hub',
      browserVersion: process.env.SAUCE_BROWSER_VERSION,
      platformName: process.env.SAUCE_OS,
      'sauce:options': {
        name: `jasmine-ajax ${new Date().toISOString()}`,
        build: `jasmine-ajax ${process.env.CIRCLE_WORKFLOW_ID || 'Ran locally'}`,
        tags: ['jasmine-ajax'],
        tunnelName: process.env.SAUCE_TUNNEL_NAME,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
      }
    }
  }
};