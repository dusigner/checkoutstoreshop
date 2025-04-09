#!/bin/bash

if [ -z "$1" ]
then
      echo "You need to specify the version example:\n echo $0 1.2.3"
      exit 1
fi

TITLE="## Release v$1 $(date '+%Y-%m-%d')"
HASH_FORK_POINT=$(git merge-base --fork-point develop)

git log $HASH_FORK_POINT..HEAD --pretty='format:- [%an](mailto:%ae) %s%n' > BODY.tmp

if test -f "CHANGELOG.md"; then
    echo "$(echo $TITLE; cat BODY.tmp;cat CHANGELOG.md)" > CHANGELOG.md
else
    touch CHANGELOG.md
    echo "$(echo $TITLE; cat BODY.tmp; cat CHANGELOG.md)" > CHANGELOG.md
fi

rm BODY.tmp