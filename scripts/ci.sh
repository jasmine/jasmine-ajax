#!/bin/bash -e

set -e
./node_modules/.bin/grunt jshint

# Run tests against all supported browsers except PhantomJS
# (see .circleci/config.yml for that)
scripts/start-sauce-connect sauce-pidfile
set +o errexit
scripts/run-all-browsers
exitcode=$?
set -o errexit
scripts/stop-sauce-connect $(cat sauce-pidfile)
exit $exitcode
