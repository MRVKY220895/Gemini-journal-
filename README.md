# 🛡️ Gemini Secure Cognitive Journal & Brainstorming Studio

> **Google Gen AI Academy Challenge Submission**  
> An authenticated, multi-turn AI journaling and brainstorming web application engineered with **zero-trust security boundaries**, **Firebase Authentication**, **isolated Cloud Firestore storage**, **Google Cloud Secret Manager**, and **Google AI Studio** system instructions designed by a security engineer.

---

## 🌟 Mandatory Deliverables & Architectural Solutions

| Mandatory Deliverable | Implementation & Security Boundary |
|---|---|
| **1. User Authentication** | **Firebase Auth** integration with cryptographic ID Token (JWT) verification on every API request. No trusting client-supplied user IDs. |
| **2. Multi-turn AI Interaction** | **Google GenAI / Gemini 2.5 Flash** with context retention, multi-persona guidance (CBT Reflector, Socratic Brainstormer, Executive Strategist, Shadow Work), and streaming support. |
| **3. Isolated Data Storage** | **Cloud Firestore** collection hierarchy scoped strictly to `/users/{userId}/*` backed by `firestore.rules` (Default Deny & `request.auth.uid == userId`) with zero cross-tenant leakage. |
| **4. Secure Key Management** | **Google Cloud Secret Manager** dynamic resolution (`projects/{id}/secrets/{secret_name}/versions/latest`). Zero keys in frontend bundles, git history, or logs. |
| **5. Original Feature** | **MindPulse: AI Cognitive Journaling & Emotion Intelligence Matrix**: Multi-vector emotional tracking (Joy, Clarity, Resilience, Focus, Calm, Optimism), CBT cognitive distortion detection (Catastrophizing, All-or-Nothing, Should statements), and actionable micro-commitments with Chart.js visual analytics. |

---

## 🏗️ System Architecture

```
                                  [ Client Browser ]
                                          │
                         1. Firebase Auth │ 2. Bearer JWT
                                          ▼
                             [ FastAPI Backend Gateway ]
                           (Cryptographic Token Verifier)
                                   │            │
            3. Fetch Secrets via   │            │ 4. Strictly Scoped by UID
               Secret Manager SDK  │            │
                                   ▼            ▼
                   [ GCP Secret Manager ]   [ Cloud Firestore ]
                   • gemini-api-key         • /users/{uid}/journals
                   • firebase-creds         • /users/{uid}/sessions
                                            • /users/{uid}/analytics
                                   │
                                   ▼
                       [ Google AI Studio Engine ]
                       • Security-Engineered System Prompt
                       • Delimiter Boundaries (<user_journal_entry>)
                       • Prompt Injection Neutralization
                       • PII Sanitization & Redaction
```

---

## 🚀 Quickstart Guide

### 1. Setup Virtual Environment & Install Dependencies
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(If no API key is provided, the application runs in local sandbox demo mode with built-in cognitive responses so you can immediately evaluate the full UI, multi-tenant isolation, and analytics).*

### 3. Run the Application Server
```bash
python server.py
```
Open your browser and navigate to: **`http://127.0.0.1:8000`**

---

## 🧪 Automated Testing & Security Verification

Run the automated test suite verifying tenant isolation, JWT auth boundaries, and prompt injection defense:

```bash
# Run test suite
.\.venv\Scripts\pytest tests/test_security_isolation.py -v

# Run standalone security audit CLI
python security_audit.py
```

---

## 🔒 Security Engineering in Google AI Studio

The Google AI Studio system instructions (`security/ai_studio_system_instruction.md`) and configuration (`security/ai_studio_security_config.json`) enforce:
1. **Prompt Injection Containment**: User input is wrapped in strict `<user_journal_entry>` delimiters.
2. **Adversarial Neutralization**: Refuses attempts to jailbreak, override system constraints, or exfiltrate prompts.
3. **PII Sanitization**: Automatically strips SSNs, credit card numbers, and API keys before AI processing.
4. **Structured Output Schemas**: Analytical evaluations are returned in validated JSON schemas.

---

## 📦 Deployment to Google Cloud Run

See [`deploy/cloud_run_guide.md`](file:///c:/Users/HP/Downloads/tango-local/Gemini%20journal/deploy/cloud_run_guide.md) for complete instructions on building the Docker image and deploying to Cloud Run with Secret Manager environment injection.

---

## 🔌 Model Context Protocol (GitMCP)

Connect AI tools and coding assistants directly to this repository's live documentation via GitMCP:

- **GitMCP Server URL**: `https://gitmcp.io/MRVKY220895/Gemini-journal-`

```json
{
  "mcpServers": {
    "gemini-journal-docs": {
      "serverUrl": "https://gitmcp.io/MRVKY220895/Gemini-journal-"
    }
  }
}
```
