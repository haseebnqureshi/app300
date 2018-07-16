#!/bin/bash

source /etc/lsb-release && echo "deb http://download.rethinkdb.com/apt $DISTRIB_CODENAME main" | tee /etc/apt/sources.list.d/rethinkdb.list
wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | apt-key add -
apt-get update -y
apt-get install rethinkdb -y
rethinkdb --version

# starting on system start up
# @see https://rethinkdb.com/docs/start-on-startup/
cp ./config.conf /etc/rethinkdb/instances.d/instance1.conf
/etc/init.d/rethinkdb restart

# installing python driver
pip install rethinkdb
