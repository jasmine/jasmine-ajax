const path = require('path'),
  jasmineBrowser = require('jasmine-browser-runner');

var config = require(path.resolve('spec/support/jasmine-browser.js'));
config.clearReporters = true;

jasmineBrowser.runSpecs(config).catch(function(error) {
  console.error(error);
  process.exit(1);
});
