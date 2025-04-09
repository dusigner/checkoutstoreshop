#!/bin/bash

set -euo pipefail

# Validate required environment variables
if [ -z "$VTEX_APP_KEY_SHOP" ]; then
  echo "Error: VTEX_APP_KEY_SHOP environment variable is not set"
  exit 1
fi

if [ -z "$VTEX_APP_TOKEN_SHOP" ]; then
  echo "Error: VTEX_APP_TOKEN_SHOP environment variable is not set"
  exit 1
fi

if [ -z "$BITBUCKET_BRANCH" ]; then
  echo "Error: BITBUCKET_BRANCH environment variable is not set"
  exit 1
fi

vtex login samsungbrshop --appkey=$VTEX_APP_KEY_SHOP --apptoken=$VTEX_APP_TOKEN_SHOP

# Extract the relevant part of the branch
BRANCH_NAME=$(echo "$BITBUCKET_BRANCH" | awk -F'/' '{print $NF}' | tr -cd '[:alnum:]')

# Create workspace name in the desired format
WORKSPACE_NAME="${BRANCH_NAME}pipeline"

# Use the workspace
echo "yes" | vtex use $WORKSPACE_NAME
echo "yes" | vtex link --no-watch
