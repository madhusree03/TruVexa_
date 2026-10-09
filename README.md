# TRUVEXA — AI-Powered Phishing & Link Safety Platform

> **"Don't Trust Every Link. Verify Before You Click."**  
> *College Cybersecurity Innovation Competition — Track 02 (Cyber Security)*

---

## 1. Executive Summary & Problem Statement

Phishing remains the #1 initial attack vector in cyber breaches globally. Deceptive links often abuse internationalized domain characters (homoglyphs), misleading `@` user authentication syntax, typo-squatted brand names in subdomains, raw IP hosts, or disposable high-risk TLDs.

**TRUVEXA** is a full-stack, multi-layered cyber defense platform that evaluates submitted URLs, identifies malicious and phishing indicators, produces an explainable 0–100% Safety Percentage (and 0–100 risk score), provides detailed threat modeling via Gemini AI, and recommends concrete defensive measures.

---

## 2. Multi-Tier Defense Architecture

```
                                  [ User Submitted URL ]
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │      Layer 1: Lexical & RFC Heuristic Engine  │
                    │  • 16 deterministic structural inspection     │
                    │    rules without network hazards or sandbox   │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │     Layer 2: Google Safe Browsing API v4      │
                    │  • Live threat intelligence lookup            │
                    │  • Graceful fallback if unconfigured          │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │     Layer 3: Gemini 3.8 Flash AI Synthesis    │
                    │  • Plain-English contextual risk explanation  │
                    │  • Attack tactics breakdown & user guidance   │
                    │  • Zero-hallucination prompt guardrails       │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
                              [ Comprehensive Security Report ]
```

---

## 3. The 16 Heuristic Detection Rules

1. **Insecure Transport Protocol**: Plain HTTP without TLS encryption (+15 pts).
2. **Direct IP Address Hostname**: Direct IPv4 or IPv6 numerical addresses (+30 pts).
3. **Known URL Shorteners**: Services masking real destinations (bit.ly, tinyurl, t.co, etc.) (+20 pts).
4. **Credential Authentication / @ Exploit**: UserInfo tricks where browsers ignore text before `@` and navigate to the domain after (+35 pts).
5. **Punycode / IDN Homoglyphs**: Hostnames starting with `xn--` or non-ASCII characters to impersonate legitimate brands (+30 pts).
6. **Excessive Subdomain Stacking**: >3 subdomain levels used to fake enterprise portal hierarchies (+25 pts).
7. **Abnormal URL & Hostname Length**: Extreme lengths used to push deceptive domains outside visible address bars (+10 to +20 pts).
8. **Suspicious Percent-Encoding**: Double percent-encoding (`%25`), directory traversal (`%2e%2e`), or null bytes (`%00`) (+20 pts).
9. **Non-Standard Web Ports**: Ports other than 80 and 443 (+15 pts).
10. **Direct Executable & Script Payloads**: Direct downloads of `.exe`, `.scr`, `.bat`, `.apk`, `.vbs`, `.msi` (+40 pts).
11. **Brand Impersonation & Typosquatting**: Detection of major brands (PayPal, Apple, Google, Chase, Microsoft, etc.) in subdomains or paths on unauthorized registrars (+40 pts) and lookalike character substitutions (+35 pts).
12. **Credential Harvesting Keywords**: Elevated presence of sensitive terms (`login`, `verify`, `banking`, `wallet`, `kyc`, `otp`) on non-major sites (+15 to +25 pts).
13. **High-Risk & Abused TLDs**: Correlation with disposable extensions (`.xyz`, `.top`, `.tk`, `.buzz`, `.icu`, `.work`, etc.) (+15 pts).
14. **Excessive Hyphenation**: >2 hyphens in hostname (+20 pts).
15. **Open Redirect Parameters**: Suspicious bounce parameters (`?redirect=`, `?url=`, `?next=`) (+15 pts).
16. **Verified Threat Intelligence Match**: Explicit confirmation in Google Safe Browsing database (+100 pts, critical override).

---

## 4. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js & Express full-stack service with Vite dev middleware.
- **AI**: Google Gemini 3.8 Flash (`@google/genai`) on the server.
- **Threat Intelligence**: Google Safe Browsing API v4.
- **Visuals**: Custom SVG gauges, stacked distribution charts, and high-fidelity cyber defense assets.

---

## 5. Environment Variables & Setup

Create a `.env` file based on `.env.example`:

```bash
# Required for Gemini AI analysis (injected automatically in AI Studio)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Optional: For live Google Safe Browsing threat lookups
GOOGLE_SAFE_BROWSING_API_KEY="YOUR_SAFE_BROWSING_KEY"

# Server Port (defaults to 3000)
PORT=3000
```

*Note: If no API keys are provided, PhishGuard remains 100% operational using its local heuristic rule engine and deterministic fallback explanations.*

---

## 6. How to Run & Test

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 7. Competition Live Demonstration Guide

To present PhishGuard in a competition setting:

1. **Test Benign Link**: Click **Standard HTTPS Site** (`https://example.com/docs/guide`) to demonstrate the **Low Observed Risk** baseline.
2. **Test Insecure HTTP**: Click **Insecure Login (Plain HTTP)** (`http://example.com/login`) to show transport layer flags.
3. **Test Obfuscated @ Attack**: Click **Misleading @ UserAuth Attack** (`https://secure.bankofamerica.com@evil-phish-domain.xyz/auth/verify`) to show how attackers disguise phishing targets.
4. **Test Homoglyph Mimicry**: Click **Punycode IDN Homograph** (`https://xn--pypal-4ve.com/account/security`) to show Cyrillic letter substitution detection.
5. **Show Report Export**: Demonstrate copying text report to clipboard and exporting JSON.
6. **Show Security Dashboard & History**: Inspect real-time risk distribution metrics and CSV export.
7. **Explore Education Center**: Tour the 4 interactive training modules explaining fake login kits, URL anatomy, and emergency incident protocols.
