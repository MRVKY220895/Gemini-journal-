# Production Deployment Guide: Google Cloud Run & Secret Manager

This guide walks you through deploying the **Gemini Secure Journal & Cognitive Brainstorming Web App** to **Google Cloud Run**, wiring up **Google Cloud Secret Manager** and **Firebase Authentication**.

---

## 1. Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated:
  ```bash
  gcloud auth login
  gcloud config set project YOUR_PROJECT_ID
  ```
- Enable Required GCP Services:
  ```bash
  gcloud services enable run.googleapis.com \
                         secretmanager.googleapis.com \
                         firestore.googleapis.com \
                         cloudbuild.googleapis.com
  ```

---

## 2. Store Secrets in Google Cloud Secret Manager

Never pass plain-text keys in build arguments or environment variables. Store them in Secret Manager:

```bash
# 1. Store Gemini API Key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"

# 2. Store Firebase Service Account (JSON)
gcloud secrets create firebase-service-account \
    --data-file=./serviceAccountKey.json \
    --replication-policy="automatic"
```

---

## 3. Deploy Cloud Firestore Security Rules

Deploy `firestore.rules` to enforce database isolation:

```bash
firebase deploy --only firestore:rules
```

---

## 4. Build & Deploy to Google Cloud Run

Deploy directly using Cloud Build and Cloud Run with Secret Manager environment injection:

```bash
# Build and Deploy
gcloud run deploy gemini-journal \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars GCP_PROJECT_ID="YOUR_PROJECT_ID",USE_SECRET_MANAGER="true" \
    --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
    --set-secrets FIREBASE_SERVICE_ACCOUNT=firebase-service-account:latest
```

---

## 5. Security Checklist Validation
- [x] Zero keys stored in git repositories (`.gitignore` enforced)
- [x] Backend runs as unprivileged `appuser` (non-root) in Docker
- [x] Firebase JWT authentication verified on every API request
- [x] Firestore security rules block cross-tenant queries (`/users/{uid}/*`)
- [x] Prompt injection defenses and PII sanitization enabled
