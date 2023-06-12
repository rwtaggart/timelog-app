#!/usr/bin/env bash
#############################
# RUN DEVELOPMENT ENVIRONMENT
# 2023.Jun.12
# 
#############################

export ELECTRON_IS_DEV=1
npm run devb &

echo "Execute the following (copied onto clipboard):"
echo "npm run deve"

pbcopy < "npm run deve"
