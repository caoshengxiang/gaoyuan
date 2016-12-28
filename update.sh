#!/bin/sh
git pull
npm install --production --unsafe-perm
./restart.sh
