#!/bin/bash

# Write the SSH private key to a file
echo "$SSH_PRIVATE_KEY" >key.pem

# Set correct permissions for the SSH key file
chmod 600 key.pem

# Ensure the target directory exists on the server before copying
echo "Ensuring the target directory exists..."
ssh -i key.pem -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p /home/xafpay/wallet"

# Create .env file
echo "$ENV_FILE" >.env
echo "REGISTRY_PASSWORD=$REGISTRY_PASSWORD" >>.env
echo "REGISTRY_USERNAME=$REGISTRY_USERNAME" >>.env
chmod 600 .env
echo "Environment variables updated!"

# Copy compose.yml to the server
echo "Copying compose.yml to the server..."
scp -i key.pem -o StrictHostKeyChecking=no compose.yml .env $SERVER_USER@$SERVER_IP:/home/xafpay/wallet/

# SSH into the server and execute docker-compose commands
echo "Starting deployment on the server..."
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
