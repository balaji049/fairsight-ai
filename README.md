# FairSight AI
**Bias Auditor for India's Public Sector Algorithms**

> Solution Challenge 2026 · Team: DevAI Nexus · Problem: [Unbiased AI Decision]

---

## Project Structure

```
fairsight-ai/                        ← Root repo (push everything here)
│
├── fairsight-backend/               ← Python FastAPI backend
│   ├── main.py                      ← All API endpoints
│   ├── requirements.txt             ← Python dependencies
│   ├── Dockerfile                   ← Cloud Run container
│   ├── generate_demo_data.py        ← Creates demo CSV dataset
│   └── SETUP.sh                     ← Deploy commands reference
│
├── fairsight-frontend/              ← React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── UI.jsx               ← Shared UI primitives (Badge, Button, Card)
│   │   │   ├── Navbar.jsx           ← Top navigation bar
│   │   │   ├── BiasHeatmap.jsx      ← 🌡️ The WOW feature — color-coded DIR grid
│   │   │   ├── GeminiPanel.jsx      ← ✨ Gemini plain-language explanation
│   │   │   └── DPDPPanel.jsx        ← ⚖️ DPDP Act compliance checklist
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx       ← CSV dropzone + domain selector
│   │   │   ├── LoadingPage.jsx      ← Animated progress during audit
│   │   │   └── ResultsPage.jsx      ← Full audit dashboard (tabs)
│   │   ├── services/
│   │   │   └── api.js               ← All API calls to backend
│   │   ├── App.jsx                  ← Root component + state management
│   │   ├── index.js                 ← React entry point
│   │   └── index.css                ← Global styles + CSS variables
│   ├── package.json
│   ├── firebase.json                ← Firebase Hosting config
│   └── .env.example                 ← Environment variable template
│
└── README.md                        ← This file
```

---

## Quick Start (Local Dev)

### 1. Clone and setup

```bash
git clone https://github.com/DevAINexus/fairsight-ai
cd fairsight-ai
```

### 2. Start the backend

```bash
cd fairsight-backend

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API key (free at aistudio.google.com)
export GEMINI_API_KEY="your-key-here"

# Run
uvicorn main:app --reload --port 8000

# Test it
curl http://localhost:8000/health
# → {"status":"healthy"}

# Generate demo dataset
python generate_demo_data.py
# → demo_loan_dataset.csv created
```

### 3. Start the frontend

```bash
cd fairsight-frontend

# Install dependencies
npm install

# Set backend URL
cp .env.example .env.local
# Edit .env.local: REACT_APP_API_URL=http://localhost:8000

# Run
npm start
# → Opens http://localhost:3000
```

### 4. Test the full flow

1. Open http://localhost:3000
2. Select "Loan Approval" domain
3. Upload `fairsight-backend/demo_loan_dataset.csv`
4. Click "Run Bias Audit"
5. See: Heatmap → AI Explanation → DPDP Compliance

---

## Deploy to Production

### Backend → Cloud Run

```bash
cd fairsight-backend

export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

gcloud run deploy fairsight-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-key" \
  --memory 1Gi

# Copy the URL it prints → your API URL
```

### Frontend → Firebase Hosting

```bash
cd fairsight-frontend

# Set the Cloud Run URL in production env
# Edit .env.local: REACT_APP_API_URL=https://fairsight-api-xxxx-uc.a.run.app

npm run build

npm install -g firebase-tools
firebase login
firebase init hosting    # select "build" as public dir
firebase deploy --only hosting

# Copy the hosting URL → your prototype link
```

---

## API Endpoints

| Method | Endpoint       | Description                                  |
|--------|---------------|----------------------------------------------|
| GET    | `/health`      | Health check                                 |
| POST   | `/full-audit`  | Upload CSV → bias + explanation + compliance |
| POST   | `/analyze`     | Compute Disparate Impact Ratios              |
| POST   | `/explain`     | Gemini plain-language explanation            |
| POST   | `/compliance`  | DPDP Act 2023 compliance check               |

Interactive docs: `http://localhost:8000/docs`

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Recharts, Framer Motion   |
| Backend    | Python FastAPI, Pandas, NumPy       |
| AI         | Gemini 2.0 Flash (google-genai)     |
| Deploy     | Google Cloud Run + Firebase Hosting |
| Storage    | Google Cloud Storage + Firestore    |
| Auth       | Firebase Auth                       |

---

## Team

- **Team Name:** DevAI Nexus
- **Team Leader:** Bhairwad Balaji (049balaji@gmail.com)
- **Problem:** [Unbiased AI Decision] Ensuring Fairness and Detecting Bias in Automated Decisions
- **Event:** Solution Challenge 2026 — Build with AI (Hack2Skill × Google)
