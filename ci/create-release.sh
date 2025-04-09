#!/bin/bash

git remote set-url origin git@bitbucket.org:${BITBUCKET_REPO_FULL_NAME}.git
git config user.email fojlj5ra7srwprh9erckzfg6lib355@bots.bitbucket.org
VERSION=$(git log --pretty='format:%h' -1)
BRANCH_RELEASE="release/$VERSION"
git checkout -b $BRANCH_RELEASE
git push origin $BRANCH_RELEASE
