#!/usr/bin/env sh
set -e

npm run migration:run

exec node dist/main.js
