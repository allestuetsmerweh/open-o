#!/bin/sh

mkdir -p build
mkdir -p build/private_files
REPO_ROOT="$(pwd)"
PUBLIC_ROOT="$(pwd)/build/public_html"
SECRETS_ROOT="$(pwd)/build/private_files"

echo "<?php phpinfo(); ?>" > $PUBLIC_ROOT/info.php

ln -sfn $REPO_ROOT/web/ $PUBLIC_ROOT

echo "{\"public-root\":\"$PUBLIC_ROOT\",\"secrets-root\":\"$SECRETS_ROOT\",\"branch\":\"dev\"}" > $PUBLIC_ROOT/deployment.json

php -S 127.0.0.1:30270 -t $PUBLIC_ROOT
