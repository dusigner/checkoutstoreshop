#!/bin/bash

git remote set-url origin https://x-token-auth:${ACCESS_TOKEN_BITBUCKET}@bitbucket.org/sdsla/samsungbr.store-checkout.git
git config user.email ${EMAIL_BOT_BITBUCKET}
VERSION=$(git log --pretty='format:%h' -1)
BRANCH_RELEASE="release/$VERSION"
git checkout -b $BRANCH_RELEASE
git push origin $BRANCH_RELEASE
