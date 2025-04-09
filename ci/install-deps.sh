#!/bin/bash

set -euo pipefail

yarn install --frozen-lockfile
cd checkout-ui-custom
yarn install --frozen-lockfile
yarn build
cd ../
