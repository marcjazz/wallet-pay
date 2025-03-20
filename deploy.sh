#!/bin/bash

echo "Starting deployment on the server..."
# SSH into the server and execute docker-compose commands
ssh -i key.pem -T -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP <<'EOF'
  # Change to the target directory where compose.yml is located
  cd /home/xafpay/wallet
  
  # Source the .env file to export variables
  source .env

  # Login to the container registry
  echo "$REGISTRY_PASSWORD" | docker login ghcr.io -u "$REGISTRY_USERNAME" --password-stdin

  # Pull the latest Docker images
  docker compose pull

  # Start and wait for containers to be in running mode
  docker compose up --wait
EOF

# Capture the exit status of the SSH command
EXIT_STATUS=$?

# Check if the remote script executed successfully
if [ $EXIT_STATUS -ne 0 ]; then
  echo "Deployment failed. Exiting."
  exit $EXIT_STATUS
fi

echo "Deployment completed!"
