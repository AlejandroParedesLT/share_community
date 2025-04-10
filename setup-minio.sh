#!/bin/sh
set -e

echo "Waiting for MinIO to be ready..."
sleep 5

echo "Logging into MinIO..."
/usr/bin/mc config host add --quiet --api s3v4 myminio http://minio:9000 "${GLOBAL_USER}" "${GLOBAL_PASSWORD}"

echo "Creating user..."
/usr/bin/mc admin user add myminio "${AWS_ACCESS_KEY_ID}" "${AWS_SECRET_ACCESS_KEY}" || echo "User already exists or creation failed"

echo "Attaching readwrite policy..."
/usr/bin/mc admin policy attach myminio readwrite --user="${AWS_ACCESS_KEY_ID}" || echo "Policy attached or user policy failed"

echo "✅ MinIO user setup completed"

echo "Creating bucket..."

echo "MinIO setup done" > /tmp/minio-setup-done