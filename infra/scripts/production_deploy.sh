#!/bin/bash
set -e

# PerformAI Production Deployment Script
echo "=========================================="
echo "🚀 Preparing Production Deployment"
echo "=========================================="

if ! command -v terraform &> /dev/null
then
    # Try finding the windows executable for bash on windows environments
    if [ -f "/c/ProgramData/chocolatey/bin/terraform.exe" ]; then
        TF_CMD="/c/ProgramData/chocolatey/bin/terraform.exe"
    elif [ -f "/c/ProgramData/chocolatey/lib/terraform/tools/terraform.exe" ]; then
        TF_CMD="/c/ProgramData/chocolatey/lib/terraform/tools/terraform.exe"
    else
        # Force fallback to direct call if running in git bash
        TF_CMD="C:/ProgramData/chocolatey/lib/terraform/tools/terraform.exe"
    fi
else
    TF_CMD="terraform"
fi

PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "No GCP project found. Run 'gcloud init' or 'gcloud config set project YOUR_PROJECT_ID'."
  exit 1
fi

REGION="us-central1"
SERVICE_NAME="performai-backend-prod"

if [ -z "$GEMINI_API_KEY" ]; then
  echo "Please export your GEMINI_API_KEY environment variable."
  echo "run: export GEMINI_API_KEY='your_key_here'"
  exit 1
fi

echo "1) Submitting Docker Backend Image to Google Container Registry..."
cd ../../backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

echo "2) Initializing Terraform..."
cd ../infra/terraform
$TF_CMD init

echo "3) Applying Terraform configuration (this will provision Secret Manager, IAM Service Accounts, and Cloud Run)..."
$TF_CMD apply -var="project_id=$PROJECT_ID" -var="region=$REGION" -var="gemini_api_key=$GEMINI_API_KEY" -var="service_name=$SERVICE_NAME" -auto-approve

echo "=========================================="
echo "✅ Deployment Complete!"
echo "Your Production URL will be printed above."
echo "=========================================="
