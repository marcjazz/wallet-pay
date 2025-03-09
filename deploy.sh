#!/bin/bash

# Write the SSH private key to a file
echo "$SSH_PRIVATE_KEY" >key.pem

# Set correct permissions for the SSH key file
chmod 600 key.pem

# Copy docker-compose.yml to the server
echo "Copying docker-compose.yml to the server..."
scp -i key.pem -o StrictHostKeyChecking=no compose.yml $SERVER_USER@$SERVER_IP:/home/xafpay/wallet

# SSH into the server and execute docker-compose commands
echo "Starting deployment on the server..."
ssh -i key.pem -T -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP <<'EOF'
  # Change to the target directory where compose.yml is located
  mkdir -p /home/xafpay/wallet
  cd /home/xafpay/wallet
  
  # Pull the latest Docker images
  docker compose pull

  # Source the .env file to export variables
  echo "$ENV_FILE" > .env
  chmod 600 .env
  echo "Environment variables updated!"

  # Start and wait for containers to be in running mode
  docker compose up --wait --build
EOF

# Capture the exit status of the SSH command
EXIT_STATUS=$?

# Check if the remote script executed successfully
if [ $EXIT_STATUS -ne 0 ]; then
  echo "Deployment failed. Exiting."
  exit $EXIT_STATUS
fi

echo "Deployment completed!"
