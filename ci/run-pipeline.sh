#!/bin/bash

if [ -z "$BITBUCKET_REPO_FULL_NAME" ]
then
      echo "You need to specify the env var BITBUCKET_REPO_FULL_NAME"
      exit 1
fi
if [ -z "$BOT_USERNAME" ]
then
      echo "You need to specify the env var BOT_USERNAME"
      exit 1
fi
if [ -z "$BOT_PASSWORD" ]
then
      echo "You need to specify the App Password env var BOT_PASSWORD"
      exit 1
fi
if [ -z "$1" ]
then
      echo "You need to specify the name of branch to run"
      exit 1
fi

echo "Repo: $BITBUCKET_REPO_FULL_NAME"
echo "Username: $BOT_USERNAME"
echo "Branch: $1"
curl -X POST \
  --url "https://api.bitbucket.org/2.0/repositories/$BITBUCKET_REPO_FULL_NAME/pipelines/" \
  -u $BOT_USERNAME:$BOT_PASSWORD  \
  -H 'Content-Type: application/json' \
  -d "
  {
    \"target\": {
      \"ref_type\": \"branch\",
      \"type\": \"pipeline_ref_target\",
      \"ref_name\": \"$1\"
    }
  }" -v
