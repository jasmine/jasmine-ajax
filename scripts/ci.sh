#!/bin/bash -e

set -e
./node_modules/.bin/grunt jshint

# Run tests against all supported browsers
# (see .circleci/config.yml for that)
export SAUCE_TUNNEL_NAME=$CIRCLE_WORKFLOW_JOB_ID
scripts/start-sauce-connect
set +o errexit
scripts/run-sauce-browsers
exitcode=$?
set -o errexit
scripts/stop-sauce-connect
exit $exitcode
