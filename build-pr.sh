#!/bin/bash

set -e

source /usr/local/nvm/nvm.sh
nvm install 12.12.0
nvm use 12.12.0


# Install & Build
npm install
npm run-script test
npm run-script lint
npm run-script build
echo Build completed
