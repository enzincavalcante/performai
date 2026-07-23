terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "secretmanager_api" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

# Create a Secret for the Gemini API Key
resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "gemini-api-key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager_api]
}

resource "google_secret_manager_secret_version" "gemini_api_key_data" {
  secret      = google_secret_manager_secret.gemini_api_key.id
  secret_data = var.gemini_api_key
}

# Dedicated Service Account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "performai-run-sa"
  display_name = "PerformAI Cloud Run Service Account"
}

# Grant the Service Account access to read the Secret
resource "google_secret_manager_secret_iam_member" "secret_accessor" {
  secret_id = google_secret_manager_secret.gemini_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Optional: Add Firestore capability depending on exact DB layout
# resource "google_project_iam_member" "firestore_user" {
#   project = var.project_id
#   role    = "roles/datastore.user"
#   member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
# }

# Cloud Run Service Deployment
resource "google_cloud_run_v2_service" "backend" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run_sa.email
    
    # Force single concurrecy to match python websocket limitations initially, or rely on FastAPI scale
    max_instance_request_concurrency = 80
    
    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }

    containers {
      image = "gcr.io/${var.project_id}/${var.service_name}:latest" # Ensure you build and push to GCR/Artifact Registry prior to tf apply
      
      ports {
        container_port = 8000
        # For true Websockets using Cloud Run, you HTTP2 is naturally supported, standard ports fine
      }
      
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.gemini_api_key.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.run_api,
    google_secret_manager_secret_iam_member.secret_accessor
  ]
}

# Make Service Publicly Accessible
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.backend.name
  location = google_cloud_run_v2_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "cloud_run_url" {
  value = google_cloud_run_v2_service.backend.uri
}
