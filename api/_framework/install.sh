#!/bin/bash

# first installing our framework dependencies
npm install

# now moving up to our api directory
cd ..

  # installing npm dependencies
  npm install

  # ensuring tables are created, if any
  # npm run tables

  # adding our script onto pm2 processes
  pm2 start index.js --name api

  # saving our pm2 processes
  pm2 save

# going back to our framework directory
cd _framework
