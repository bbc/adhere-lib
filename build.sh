#!/bin/bash

set -e

source /usr/local/nvm/nvm.sh
nvm install 12.12.0
nvm use 12.12.0

# Install & Build
npm install
npm run-script test
npm run-script build
echo Build completed

# Git Stuff
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
echo REPO = $REPO
echo SSH_REPO = $SSH_REPO
cd dist
git init
git remote add origin $REPO
git symbolic-ref HEAD refs/heads/gh-pages
git fetch origin gh-pages
git reset
git config user.name "pas-gocd"
git add -A .
git commit -m "Deploy to gh-pages based on main. Build ${GO_PIPELINE_COUNTER}"
git push --set-upstream origin gh-pages -f
