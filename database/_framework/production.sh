#!/bin/bash

# starting on system start up
# @see https://rethinkdb.com/docs/start-on-startup/
cp ./config.production.conf /etc/rethinkdb/instances.d/instance1.conf
/etc/init.d/rethinkdb restart

# adding our database s3 backups script onto pm2 processes
pm2 start dump.js --name db-backups

# saving our pm2 processes
pm2 save
