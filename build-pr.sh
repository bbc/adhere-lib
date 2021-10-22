#!/bin/bash

set -e

source /usr/local/nvm/nvm.sh
nvm install 14.18.1
nvm use 14.18.1
nvm install-latest-npm

# Install & Build
npm install
npm run-script test
npm run-script lint
npm run-script build
echo Build completed
