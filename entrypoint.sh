#!/bin/sh

# Wait for the database to be ready
until npx prisma migrate deploy; do
  echo "Migration failed, retrying in 5 seconds..."
  sleep 5
done

# Apply seed again databse
node /app/prisma/seed/seed.js

# Start the application
node /app/main.js
