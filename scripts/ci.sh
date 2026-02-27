#!/bin/bash -e

npm run lint

# Run tests against all supported browsers that are available on Saucelabs
# (see run-sauce-browsers for the list)
export SAUCE_TUNNEL_NAME=$CIRCLE_WORKFLOW_JOB_ID
scripts/start-sauce-connect
set +o errexit
scripts/run-sauce-browsers
exitcode=$?
set -o errexit
scripts/stop-sauce-connect
exit $exitcode
