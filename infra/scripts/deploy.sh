#!/bin/bash

# Ensure user is logged in
echo "Checking gcloud authentication..."
gcloud auth print-access-token > /dev/null 2>&1 || { echo "Please run 'gcloud auth login' first"; exit 1; }

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="performai-backend"

echo "Deploying to Project: $PROJECT_ID | Region: $REGION"

if [ -z "$GEMINI_API_KEY" ]; then
  echo "ERROR: GEMINI_API_KEY environment variable is not set."
  echo "Please set it before deploying: export GEMINI_API_KEY=your_key"
  exit 1
fi

# Go to backend directory
cd ../../backend

echo "Building and Deploying FastAPI Backend to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=$GEMINI_API_KEY" \
  --use-http2 \
  --quiet

echo "Deployment complete! Your WebSocket URL will use 'wss://' instead of 'https://'"
