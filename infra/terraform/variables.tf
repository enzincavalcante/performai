variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "The Google Cloud Region (e.g., us-central1)"
  type        = string
  default     = "us-central1"
}

variable "gemini_api_key" {
  description = "Gemini API Key to store securely in Secret Manager"
  type        = string
  sensitive   = true
}

variable "service_name" {
  description = "The name of the Cloud Run service"
  type        = string
  default     = "performai-backend-prod"
}
