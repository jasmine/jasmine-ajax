#!/bin/bash -e

if [ $USE_SAUCE == true ]
then
  if [ $TRAVIS_SECURE_ENV_VARS == true ]
  then
    curl -L https://gist.github.com/santiycr/5139565/raw/sauce_connect_setup.sh | bash
  else
    echo "skipping tests since we can't use sauce"
    exit 0
  fi
fi

set -e
grunt jshint
bundle exec rake jasmine:ci
JASMINE_CONFIG_PATH=spec/support/jasmine_combined.yml bundle exec rake jasmine:ci
