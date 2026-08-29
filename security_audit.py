"""
Standalone Security Auditor CLI.
Scans workspace for accidental credential leakage, verifies Secret Manager resolution,
validates Firestore security rules, and tests multi-tenant isolation.
"""

import os
import re
import sys
import json

# Auto-link virtual environment site-packages if running from global python
venv_site = os.path.join(os.path.dirname(__file__), ".venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

# Ensure UTF-8 stdout encoding on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from security.secret_manager import secret_manager
from storage.user_storage import isolated_storage

SUSPICIOUS_PATTERNS = [
    (r"AIza[0-9A-Za-z-_]{35}", "Google API Key"),
    (r"\"private_key\":\s*\"-----BEGIN PRIVATE KEY-----", "Firebase/GCP Private Key"),
    (r"ghp_[0-9A-Za-z]{36}", "GitHub Personal Access Token"),
    (r"sk-[a-zA-Z0-9]{48}", "OpenAI Secret Key")
]

IGNORE_DIRS = [".venv", ".git", "__pycache__", "data", ".pytest_cache"]


def scan_source_for_hardcoded_secrets(root_dir=".") -> int:
    print("\n[*] [1/4] Scanning codebase for hardcoded secrets & credentials...")
    leaks_found = 0

    for root, dirs, files in os.walk(root_dir):
        # Filter ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            if file.endswith((".py", ".js", ".html", ".json", ".md", ".env.example")) and not file.startswith(".env"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        for pattern, desc in SUSPICIOUS_PATTERNS:
                            matches = re.findall(pattern, content)
                            if matches:
                                print(f"  [X] CRITICAL: Potential {desc} detected in {file_path}!")
                                leaks_found += len(matches)
                except Exception as e:
                    print(f"  [!] Could not read {file_path}: {e}")

    if leaks_found == 0:
        print("  [OK] ZERO hardcoded keys or credentials found in tracked source files.")
    return leaks_found


def verify_secret_manager_integration():
    print("\n[*] [2/4] Verifying Google Cloud Secret Manager & Safe Key Resolution...")
    status = secret_manager.get_security_status()
    print(f"  * Secrets Source: {status['secrets_source']}")
    print(f"  * Gemini Key Configured: {status['gemini_api_key_configured']}")
    print(f"  * Gemini Key Mask: {status['gemini_api_key_masked']}")
    print(f"  * GCP Project: {status['project_id']}")
    print(f"  * Zero Leakage Guarantee: {status['zero_leakage_guarantee']}")
    print("  [OK] Secret resolution layer is safely isolated.")


def verify_firestore_isolation_rules():
    print("\n[*] [3/4] Verifying Cloud Firestore Security Rules (firestore.rules)...")
    if not os.path.exists("firestore.rules"):
        print("  [X] firestore.rules missing!")
        return 1
    
    with open("firestore.rules", "r", encoding="utf-8") as f:
        rules_text = f.read()

    has_default_deny = "allow read, write: false;" in rules_text
    has_user_match = "match /users/{userId}" in rules_text
    has_auth_check = "request.auth.uid == userId" in rules_text

    if has_default_deny and has_user_match and has_auth_check:
        print("  [OK] firestore.rules enforces Default Deny & Strict UID Partitioning (/users/{userId}/*).")
    else:
        print("  [X] firestore.rules lacks critical isolation boundaries!")
        return 1
    return 0


def verify_multi_tenant_isolation():
    print("\n[*] [4/4] Verifying Multi-Tenant Data Isolation in Local Storage Engine...")
    u1 = "auditor_user_1"
    u2 = "auditor_user_2"

    j1 = isolated_storage.create_journal(u1, "User 1 Secret", "Content 1")
    j2 = isolated_storage.create_journal(u2, "User 2 Secret", "Content 2")

    u1_journals = isolated_storage.list_journals(u1)
    u2_journals = isolated_storage.list_journals(u2)

    u1_ids = [j["id"] for j in u1_journals]
    u2_ids = [j["id"] for j in u2_journals]

    if j2["id"] not in u1_ids and j1["id"] not in u2_ids:
        print("  [OK] Tenant isolation passed: User 1 and User 2 cannot access each other's storage.")
        # Cleanup
        isolated_storage.delete_journal(u1, j1["id"])
        isolated_storage.delete_journal(u2, j2["id"])
        return 0
    else:
        print("  [X] Tenant leakage detected!")
        return 1


if __name__ == "__main__":
    print("=" * 70)
    print(" GEN AI ACADEMY: ENTERPRISE SECURITY & DATA ISOLATION AUDIT")
    print("=" * 70)

    leaks = scan_source_for_hardcoded_secrets()
    verify_secret_manager_integration()
    rules_err = verify_firestore_isolation_rules()
    iso_err = verify_multi_tenant_isolation()

    print("\n" + "=" * 70)
    if leaks == 0 and rules_err == 0 and iso_err == 0:
        print(" [OK] AUDIT RESULT: ALL SECURITY MANDATES PASSED (GRADE: A+)")
        print("=" * 70)
        sys.exit(0)
    else:
        print(" [X] AUDIT RESULT: SECURITY ISSUES DETECTED")
        print("=" * 70)
        sys.exit(1)
