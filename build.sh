#!/bin/sh

PUBLIC_ROOT=0
SECRETS_ROOT=0
BRANCH=0

while [[ $1 == -* ]]; do
  case "$1" in
    -p|--public-root) PUBLIC_ROOT=$2; shift 2;;
    -s|--secrets-root) SECRETS_ROOT=$2; shift 2;;
    -b|--branch) BRANCH=$2; shift 2;;
    --) shift; break;;
    -*) echo "invalid option: $1" 1>&2; show_help; exit 1;;
  esac
done

if [[ $PUBLIC_ROOT != 0 && $SECRETS_ROOT != 0 && $DEPLOYMENT != 0 ]]; then
  mkdir -p $SECRETS_ROOT

  cp -fRT web $PUBLIC_ROOT

  echo "{\"public-root\":\"$PUBLIC_ROOT\",\"secrets-root\":\"$SECRETS_ROOT\",\"branch\":\"$BRANCH\"}" > $PUBLIC_ROOT/deployment.json
fi
