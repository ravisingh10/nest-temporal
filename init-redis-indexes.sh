#!/bin/bash

# Redis Index Initialization Script
# This script creates Redis indexes to prevent application startup issues

set -e  # Exit on any error

# Default Redis connection settings
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_PASSWORD=${REDIS_PASSWORD:-1234}

# Redis CLI command with optional password
if [ -n "$REDIS_PASSWORD" ]; then
    REDIS_CLI="redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD"
else
    REDIS_CLI="redis-cli -h $REDIS_HOST -p $REDIS_PORT"
fi

echo "Initializing Redis indexes..."
echo "Connecting to Redis at $REDIS_HOST:$REDIS_PORT"

# Test Redis connection
if ! $REDIS_CLI ping > /dev/null 2>&1; then
    echo "Error: Cannot connect to Redis server at $REDIS_HOST:$REDIS_PORT"
    exit 1
fi

echo "Redis connection successful"

# Drop existing hotel index if it exists (to handle any inconsistencies)
echo "Dropping existing hotel index if it exists..."
$REDIS_CLI FT.DROPINDEX hotel:index > /dev/null 2>&1 || echo "No existing hotel index found (this is expected on first run)"

# Create hotel index based on the schema from hotel.model.ts
echo "Creating hotel index..."
$REDIS_CLI FT.CREATE hotel:index \
    ON JSON \
    PREFIX 1 hotel: \
    SCHEMA \
    $.name AS name TEXT SORTABLE \
    $.city AS city TEXT SORTABLE \
    $.rating AS rating NUMERIC SORTABLE \
    $.price AS price TEXT \
    $.commissionPct AS commissionPct NUMERIC SORTABLE

if [ $? -eq 0 ]; then
    echo "Hotel index created successfully!"
else
    echo "Error: Failed to create hotel index"
    exit 1
fi

# Verify the index was created
echo "Verifying index creation..."
INDEX_INFO=$($REDIS_CLI FT.INFO hotel:index 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "Index verification successful!"
    echo "Index details:"
    echo "$INDEX_INFO" | grep -E "(index_name|num_docs|num_terms)"
else
    echo "Warning: Could not verify index creation"
fi

echo "Redis index initialization completed successfully!"
echo ""
echo "To run this script with custom Redis settings:"
echo "  REDIS_HOST=your-host REDIS_PORT=6379 REDIS_PASSWORD=your-password ./init-redis-indexes.sh"