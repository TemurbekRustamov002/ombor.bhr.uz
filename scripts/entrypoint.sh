#!/bin/sh

# Wait for DB to be ready
echo "Waiting for database to be ready..."
# npx prisma db push is used sparingly, migrate deploy is preferred for production
# But for first run, we'll ensure schema is updated without data loss
npx prisma migrate deploy || npx prisma db push --accept-data-loss=false

# Start the application
echo "Starting application..."
node server.js
