$ErrorActionPreference = "Stop"

Write-Host "=========================================="
Write-Host "🚀 Preparing Production Deployment (PowerShell)"
Write-Host "=========================================="

if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Host "Terraform could not be found. Please install Terraform first."
    exit 1
}

$PROJECT_ID = (gcloud config get-value project)
if ([string]::IsNullOrWhiteSpace($PROJECT_ID) -or $PROJECT_ID -match "^\(unset\)") {
    Write-Host "No GCP project found. Run 'gcloud init' or 'gcloud config set project YOUR_PROJECT_ID'."
    exit 1
}

$REGION = "us-central1"
$SERVICE_NAME = "performai-backend-prod"

if ([string]::IsNullOrWhiteSpace($env:GEMINI_API_KEY)) {
    Write-Host "Please set your GEMINI_API_KEY environment variable. For example:"
    Write-Host "`$env:GEMINI_API_KEY = `"your_key`""
    exit 1
}

Write-Host "1) Submitting Docker Backend Image to Google Container Registry..."
Set-Location -Path "..\..\backend"
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME`:latest .

Write-Host "2) Initializing Terraform..."
Set-Location -Path "..\infra\terraform"
terraform init

Write-Host "3) Applying Terraform configuration (this will provision Secret Manager, IAM Service Accounts, and Cloud Run)..."
terraform apply -var="project_id=$PROJECT_ID" -var="region=$REGION" -var="gemini_api_key=$env:GEMINI_API_KEY" -var="service_name=$SERVICE_NAME" -auto-approve

Write-Host "=========================================="
Write-Host "✅ Deployment Complete!"
Write-Host "Your Production URL will be printed above."
Write-Host "=========================================="
