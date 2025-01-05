#!/bin/bash

# Sync schema and database
npx prisma migrate deploy

# Start application
node apps/wallet-api/dist/main.js