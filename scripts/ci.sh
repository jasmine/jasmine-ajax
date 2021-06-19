#!/bin/bash -e

set -e
./node_modules/.bin/grunt jshint

# PhantomJS isn't supported by jasmine-browser-runner,
# so use jasmine-selenium-runner for that.
JASMINE_BROWSER=phantomjs JASMINE_CONFIG_PATH=spec/support/jasmine_combined.yml bundle exec rake jasmine:ci

# jasmine-selenium-runner doesn't work with current Sauce Connect,
# so use jasmine-browser-runner for everything but PhantomJS.
scripts/start-sauce-connect sauce-pidfile
set +o errexit
scripts/run-all-browsers
exitcode=$?
set -o errexit
scripts/stop-sauce-connect $(cat sauce-pidfile)
exit $exitcode
