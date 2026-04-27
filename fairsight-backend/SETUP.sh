# ─────────────────────────────────────────────────────────────────────────────
# FairSight AI — Backend Setup & Deploy Guide
# ─────────────────────────────────────────────────────────────────────────────

# ── 1. Local dev ─────────────────────────────────────────────────────────────

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API key (get it free at aistudio.google.com)
export GEMINI_API_KEY="your-key-here"

# Run locally
uvicorn main:app --reload --port 8000

# Test it
curl http://localhost:8000/health
# → {"status":"healthy"}

# Generate demo dataset
python generate_demo_data.py
# → demo_loan_dataset.csv created

# Test the full audit (adjust path as needed)
curl -X POST http://localhost:8000/full-audit \
  -F "file=@demo_loan_dataset.csv" \
  -F "domain=loan"


# ── 2. Deploy to Cloud Run ───────────────────────────────────────────────────

# Step 1: Set your GCP project
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs (one-time)
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Step 3: Build and deploy in one command
gcloud run deploy fairsight-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-key-here" \
  --memory 1Gi \
  --cpu 1

# Step 4: Copy the URL it prints — that's your API base URL
# Example: https://fairsight-api-xxxx-uc.a.run.app

# ── 3. API endpoints summary ─────────────────────────────────────────────────

# GET  /              → health check
# GET  /health        → health check
# POST /analyze       → upload CSV + domain → bias results
# POST /explain       → bias results → Gemini plain-language explanation
# POST /compliance    → bias results → DPDP compliance status
# POST /full-audit    → upload CSV + domain → all 3 above in one call

# ── 4. Swagger UI ────────────────────────────────────────────────────────────
# Open in browser after running locally:
# http://localhost:8000/docs
# All endpoints are interactive and testable there.
