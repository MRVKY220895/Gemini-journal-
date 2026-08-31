# 🌿 Mind Cave — Cognitive Sanctuary & Reflective Studio

[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)](#)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](#)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](#)
[![Google Gemini 2.5](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-4285F4.svg)](#)
[![Security: Zero-Knowledge AES-256-GCM](https://img.shields.io/badge/Security-AES--256--GCM-success.svg)](#)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg)](#)
[![GCP Cloud Run](https://img.shields.io/badge/Deploy-Google%20Cloud%20Run-orange.svg)](#)

> **Hack2skill Ideathon & Google Gen AI Submission**  
> An authenticated, zero-trust cognitive journaling sanctuary and AI brainstorming studio engineered with **Zero-Knowledge client-side encryption**, **Firebase Authentication**, **multi-tenant Cloud Firestore isolation**, **Google Cloud Secret Manager**, **SeamlessM4T Multilingual Speech Translation**, and **Google Gemini 2.5 Flash** reflective intelligence.

---

## 📑 Table of Contents
- [🌟 Key Innovations & Deliverables](#-key-innovations--deliverables)
- [🏛️ System Architecture](#️-system-architecture)
- [🎨 Five Primary Destination Views](#-five-primary-destination-views)
- [🗄️ Daily Habit Tracker & Archive Vault](#️-daily-habit-tracker--archive-vault)
- [📊 100% Authentic Dynamic Analytics Engine](#-100-authentic-dynamic-analytics-engine)
- [🌐 SeamlessM4T Multilingual & Colloquial Engine](#-seamlessm4t-multilingual--colloquial-engine)
- [🛡️ Zero-Knowledge Security & Privacy Architecture](#️-zero-knowledge-security--privacy-architecture)
- [⚡ Zero-Flash Pre-Paint Bootstrapper](#-zero-flash-pre-paint-bootstrapper)
- [📱 Progressive Web App (PWA & Desktop App)](#-progressive-web-app-pwa--desktop-app)
- [🚀 Quickstart & Local Setup](#-quickstart--local-setup)
- [🧪 Testing & Regression Verification](#-testing--regression-verification)
- [📦 Deployment to Google Cloud Run](#-deployment-to-google-cloud-run)
- [🔌 Model Context Protocol (GitMCP)](#-model-context-protocol-gitmcp)

---

## 🌟 Key Innovations & Deliverables

| Deliverable / Feature | Implementation & Solution |
|:---|:---|
| **1. User Authentication** | **Firebase Auth** integration with cryptographic ID Token (JWT) verification on every API request. Zero trusting of client-supplied user IDs. |
| **2. Multi-turn AI Guidance** | **Google Gemini 2.5 Flash** with context retention, dynamic emotional vectoring, and multi-persona prompts (*CBT Reflector, Socratic Brainstormer, Executive Strategist, Shadow Work*). |
| **3. Isolated Data Storage** | **Cloud Firestore** collection hierarchy scoped strictly to `/users/{userId}/*` backed by `firestore.rules` (Default Deny & `request.auth.uid == userId`) with client-scoped `mc_u_<UID>_*` storage keys. |
| **4. Secure Key Management** | **Google Cloud Secret Manager** dynamic resolution (`projects/{id}/secrets/{secret_name}/versions/latest`). Zero API keys in frontend bundles, git history, or logs. |
| **5. SeamlessM4T Voice & Language** | Multilingual speech-to-text with auto-detection for **Tanglish**, **Hinglish**, **Tamil**, **Hindi**, **Spanish**, **Mandarin**, **French**, **German**, **Japanese**, and **English**. |
| **6. MindPulse Dynamic Analytics** | 100% authentic metric calculation across 6 Executive Pillars, Category Focus Allocations, Multi-Horizon Consistency Heatmaps, and 6-Vector Emotional Radars. Zero fake mock data. |
| **7. Habit Tracker & Archive Vault** | Active routine tracking with streak calculation, 7-day completion grids, Archive Vault preservation with historical streaks intact, and permanent deletion controls. |
| **8. Living Timeline & Story Flow** | Fast-path in-place journaling with dual presentation: **Vertical Stream** and full-width swipeable **Story Flow Carousel**. |
| **9. Zero-Knowledge Client Vault** | Client-side **AES-256-GCM** Web Crypto encryption ensuring plain-text thoughts never touch cloud servers unless encrypted with device-derived keys. |
| **10. Zero-Flash Bootstrapper** | Pre-paint DOM mutation observers in `<head>` eliminating visual layout shifts and "Guest" flashes on page reload. |

---

## 🏛️ System Architecture

```
                                  [ Client Browser / PWA ]
                                 (AES-256-GCM Web Crypto)
                                             │
                        1. Firebase Auth JWT │ 2. Bearer Token API
                                             ▼
                                 [ FastAPI Gateway ]
                               (Cryptographic Verifier)
                                       │            │
                3. Fetch Secrets via   │            │ 4. Strictly Scoped by UID
                   Secret Manager SDK  │            │
                                       ▼            ▼
                       [ GCP Secret Manager ]   [ Cloud Firestore ]
                       • gemini-api-key         • /users/{uid}/journals
                       • firebase-credentials   • /users/{uid}/sessions
                                                • /users/{uid}/analytics
                                       │
                                       ▼
                          [ Google AI Studio Engine ]
                          • Gemini 2.5 Flash
                          • Delimiter Boundaries (<user_journal_entry>)
                          • SeamlessM4T Multilingual Translation
                          • PII Sanitization & Prompt Defense
```

---

## 🎨 Five Primary Destination Views

### 1. 🏡 Daily Sanctuary Overview
- **Habit Streaks & Progress**: Real-time habit checkmarks, active day dots, and streak counts.
- **Fast-Path In-Place Capture**: Record thoughts in under 10ms with zero loading delay.
- **Cognitive Reflections Stream**: Live preview of recent entries with mood vector badges.
- **Dynamic Weekly Insights**: Genuine weekly reflection distributions and top pattern themes.

### 2. 📖 Journal & Tracks (Living Timeline)
- **Vertical Stream View**: Chronological hour-by-hour view integrating reflections, Google Calendar events, deadline tasks, and visual memories.
- **Story Flow Carousel View**: Interactive full-width slide-deck to revisit moments via swipe gestures, drag controls, or arrow keys.
- **Daily Habit Tracker & Streaks**: 7-day completion dots, custom streak counters, and direct Archive Vault integration.
- **Notes, Checklists & Smart Tasks**: Interactive checklists with strikethrough completion, deadline task tracking, and personal notes.
- **Visual Memory Lane**: Photo journal integration with authentic date syncing and localized storage.

### 3. 🤖 AI Reflective Studio
- **Adaptive Personas**:
  - 🧠 **CBT Cognitive Reflector**: Identifies thinking traps and provides reframing exercises.
  - 🏛️ **Socratic Brainstormer**: Deep inquiry questioning to unearth root motivations.
  - ⚡ **Executive Strategist**: High-velocity decision matrices and prioritization frameworks.
  - 🌓 **Shadow Work Guide**: Compassionate exploration of hidden patterns and self-doubt.
- **Seamless Multilingual Speech**: Speak in English, Tanglish, Hinglish, or native regional languages.
- **Chat History & Vault**: Multi-session switching and saved reflection bookmarks.

### 4. 📊 MindPulse Insights & Cognitive Analytics
- **6 Executive Pillars**: Goal Velocity, Habits Discipline, Dream Quests, CBT Equilibrium, Diurnal Stamina, and Memory Vault.
- **Category Focus Allocation**: Deep Work, Somatics & Health, Strategic Career, and Mindfulness proportions.
- **6-Vector Cognitive Vectoring**: Radar metrics for Joy, Clarity, Resilience, Focus, Calm, and Optimism.
- **Resilience Trajectory**: Time-series charts comparing daily, weekly, monthly, and yearly emotional velocity.

### 5. ⚙️ Settings & Vault
- **Client-Side Encryption**: Web Crypto API cipher with local device key derivation.
- **Biometric Sensor**: WebAuthn biometric passkey integration for locking/unlocking the vault.
- **Tenant Isolation**: Strict UID separation ensuring data privacy.
- **Data & Reset**: Purge local caches, manage archived habits, or initiate factory resets.

---

## 🗄️ Daily Habit Tracker & Archive Vault

Mind Cave features a complete, non-destructive habit management lifecycle:

```
[ Active Habit Tracker ] ──(Delete)──► [ Archive Vault (Preserved Streaks & 7-Day Tracks) ]
           ▲                                          │                   │
           │                                          │ (Restore)         │ (Delete Permanently)
           └──────────────────────────────────────────┘                   ▼
                                                                  [ Permanently Purged ]
```

1. **Active Tracking**: Track Boolean checkmarks or quantitative numeric targets with streak counters.
2. **Move to Archive**: Removing a habit moves it into the **Archive Vault**, preserving all historical checkmarks, streaks, and timestamps intact across page reloads.
3. **Restore Habit**: 1-tap restoration brings the habit and its exact historical record back into the active tracker, Home Sanctuary, and Analytics.
4. **Delete Permanently**: Permanently removes individual habits or all archived habits from client storage.

---

## 📊 100% Authentic Dynamic Analytics Engine

Mind Cave eliminates all hardcoded mock figures. All metrics are computed dynamically from actual user database logs across four time horizons:

- **Daily Horizon**: 24-hour diurnal activity curve, hourly reflection check-ins, and same-day focus metrics.
- **Weekly Horizon**: Mon–Sun reflection density, 28-day habit continuity grid, and weekly emotional vectoring.
- **Monthly Horizon**: 30-day activity matrix, 4-week cognitive clarity trajectory, and distortion reframing counts.
- **Yearly Horizon**: 52-week annual consistency matrix, 12-month resilience progression, and annual goal velocity.
- **Pristine Zero-States**: Brand new user accounts display clean zero-states (`0% Done`, `0d Streak`, `0 Moments`) without artificial pre-fill.

---

## 🌐 SeamlessM4T Multilingual & Colloquial Engine

Mind Cave integrates **SeamlessM4T-inspired** multilingual speech translation and persona mirroring:

- **Colloquial Mirroring**: Speaks and responds naturally in **Tanglish** (*"Super! Romba nalla progress..."*) and **Hinglish** (*"Bahut badhiya! Let's reflect on this..."*).
- **Supported Languages**: English, Tamil, Hindi, Tanglish, Hinglish, Spanish, French, German, Mandarin, Japanese, Korean, Arabic, Portuguese, and Italian.
- **Automatic Language Detection**: Auto-detects spoken audio language and translates seamlessly into the active journal context.

---

## 🛡️ Zero-Knowledge Security & Privacy Architecture

1. **Client-Side AES-256-GCM Encryption**: Entries are encrypted in the browser with keys derived via PBKDF2/Web Crypto before network transmission.
2. **Prompt Injection Containment**: All AI prompts are bounded by strict `<user_journal_entry>` delimiters to neutralize injection attacks.
3. **PII Sanitization**: Sensitive identifiers (SSNs, credit cards, credentials) are redacted prior to AI processing.
4. **Browser Extension Noise Shield v4**: High-priority capture-phase exception shield prevents Chrome extension message-channel teardown noise from affecting application state.
5. **No Cross-Tenant Data Leaks**: Default-deny Firestore security rules ensure users only read and write documents where `request.auth.uid == resource.data.userId`.

---

## ⚡ Zero-Flash Pre-Paint Bootstrapper

To prevent visual layout shifts (CLS) and fraction-of-a-second "Guest" flashes on reload:
- **Synchronous Auth Bootstrapper in `<head>`**: Reads cached authentication credentials prior to DOM paint.
- **Pre-Paint Mutation Observer**: Binds user avatars and display names the moment elements are parsed, delivering a flicker-free user experience on hard refreshes.

---

## 📱 Progressive Web App (PWA & Desktop App)

Mind Cave is fully PWA-compliant and can be installed as a native desktop or mobile application:

- **Desktop (Windows, macOS, Linux)**: Click the **Install App** button in the header, sidebar, or browser address bar (⊕ / 💻) to launch as a standalone desktop window.
- **iOS (iPhone / iPad)**: Open Safari → Tap **Share (↑)** → Tap **Add to Home Screen**.
- **Android**: Tap the **Install App** button or open Chrome menu (⋮) → **Install app**.
- **Offline Capability**: Service Worker pre-caching ensures full core journaling functionality without internet connectivity.

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Set Up Virtual Environment
```bash
# Clone repository
git clone https://github.com/MRVKY220895/Gemini-journal-.git
cd Gemini-journal-

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
Create a `.env` file in the root directory:
```ini
GEMINI_API_KEY=your_google_ai_studio_api_key_here
PORT=8080
GCP_PROJECT_ID=your_gcp_project_id
```
*(If no API key is provided, the application runs in local sandbox mode with simulated cognitive responses so you can immediately explore the full UI, timeline, and analytics).*

### 3. Start Application Server
```bash
python server.py
```
Open **`http://127.0.0.1:8080`** in your browser.

---

## 🧪 Testing & Regression Verification

Run the comprehensive regression and security suites:

```bash
# 1. Automated Security & Isolation Suite (pytest)
pytest tests/test_security_isolation.py -v

# 2. Full System Regression Suite (9/9 checks)
python run_full_regression_suite.py

# 3. JavaScript Syntax & Token Validation
python validate_js_tokens_with_template_literals.py
```

---

## 📦 Deployment to Google Cloud Run

Deploy directly to Google Cloud Run using the included `Dockerfile` and `cloudbuild.yaml`:

```bash
# Build & Deploy via Google Cloud SDK
gcloud builds submit --tag gcr.io/[PROJECT_ID]/mind-cave-journal
gcloud run deploy mind-cave-journal \
  --image gcr.io/[PROJECT_ID]/mind-cave-journal \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🔌 Model Context Protocol (GitMCP)

Connect AI coding agents directly to this repository's documentation and code using GitMCP:

```json
{
  "mcpServers": {
    "gemini-journal-docs": {
      "serverUrl": "https://gitmcp.io/MRVKY220895/Gemini-journal-"
    }
  }
}
```

---

## 📄 License & Ownership

Developed with pride for the **Hack2skill Ideathon & Google Gen AI Challenge**.  
Licensed under the **MIT License**.
