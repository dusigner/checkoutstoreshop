#!/bin/bash

set -euo pipefail

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "Uso: $0 <account_name> --appKey=<app_key> --appToken=<app_token>"
  exit 1
fi

ACCOUNT="$1"
APP_KEY="$2"
APP_TOKEN="$3"

erro_handler() {
  echo "Erro na linha $1: comando '$2' falhou com código $3"
  exit 1
}

trap 'erro_handler $LINENO "$BASH_COMMAND" $?' ERR

echo "Git clone repository ${BITBUCKET_REPO_FULL_NAME}"
GIT_REPO="git@bitbucket.org:${BITBUCKET_REPO_FULL_NAME}.git"

git clone -b $BITBUCKET_BRANCH $GIT_REPO

echo "cd repository ${BITBUCKET_REPO_SLUG}"
cd $BITBUCKET_REPO_SLUG

git config user.email fojlj5ra7srwprh9erckzfg6lib355@bots.bitbucket.org
git remote set-url origin $GIT_REPO

VENDOR=$(node -e "let p=require('./manifest.json'); console.log(p.vendor)")
NAME=$(node -e "let p=require('./manifest.json'); console.log(p.name)")
VERSION=$(node -e "let p=require('./manifest.json'); console.log(p.version)")

vtex login $ACCOUNT --appkey $APP_KEY --apptoken $APP_TOKEN
echo "yes" | vtex install --force $VENDOR.$NAME@$VERSION
echo "Instalado em $ACCOUNT app $VENDOR.$NAME@$VERSION"

./ci/send-logs.sh "Publish version" $BITBUCKET_REPO_SLUG $ACCOUNT $VENDOR.$NAME $VERSION