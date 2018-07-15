#!/bin/bash

apt-get clean -y
apt-get update -y
apt-get install git wget curl -y
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt-get install nodejs build-essential -y
