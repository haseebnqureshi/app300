#!/bin/bash

apt-get clean -y
apt-get update -y
apt-get install git wget curl -y
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt-get install nodejs build-essential python-pip -y

# installing pm2 as keep alive process manager for node backup script for rethinkdb data
npm install pm2 -g

# installing pm2 startup hook
# @see https://pm2.io/doc/en/runtime/guide/startup-hook/
echo pm2 startup | bash | bash
