#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="db_backup_$TIMESTAMP.sql"
CONTAINER_NAME="paxta-klasteri-db-1" # Match your docker-compose service name

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

echo "Starting database backup..."

# Run pg_dump inside the docker container
docker exec $CONTAINER_NAME pg_dump -U postgres paxta_db > $BACKUP_DIR/$BACKUP_NAME

# Keep only last 7 days of backups to save space
find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete

echo "Backup completed successfully: $BACKUP_DIR/$BACKUP_NAME"
