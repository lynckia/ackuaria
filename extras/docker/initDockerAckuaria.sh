#!/usr/bin/env bash
SCRIPT=`pwd`/$0
ROOT=/opt/ackuaria
ASSETS=/opt/assets

copy_assets(){
  if [ -d "$ASSETS" ]; then
    echo "copying ackuaria assets"
    cp $ASSETS/*.js $ROOT
  fi
}

run_ackuaria() {
  echo "running ackuaria"
  npm start
}

cd $ROOT
copy_assets
run_ackuaria
