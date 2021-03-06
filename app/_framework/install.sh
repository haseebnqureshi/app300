#!/bin/bash

# first installing our framework dependencies
npm install

# now moving up to our api directory
cd ..

  # installing npm dependencies
  npm install

  # adding our script onto pm2 processes
  pm2 start index.js --name app

  # saving our pm2 processes
  pm2 save

# going back to our framework directory
cd _framework
