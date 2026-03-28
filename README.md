<div align="center">

# AutoFlow AI

### What if your invoices processed themselves?

**An autonomous accounts payable system where 8 AI agents debate, vote, and execute payments — then learn from their mistakes.**

<br/>

[![n8n](https://img.shields.io/badge/n8n-148_Nodes-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n-latest-1ikm.onrender.com)
[![Groq](https://img.shields.io/badge/Groq-9_LLM_Calls_Per_Invoice-F55036?style=for-the-badge&logo=lightning&logoColor=white)](https://groq.com)
[![React](https://img.shields.io/badge/React_18-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](/)
[![Live](https://img.shields.io/badge/Status-LIVE-00C853?style=for-the-badge)](https://n8n-latest-1ikm.onrender.com)

<br/>

**ET Gen AI Hackathon 2026 · Team Dev Duo**

<br/>

[Live n8n Workflow](https://n8n-latest-1ikm.onrender.com) · [Live Database — Google Sheets](https://docs.google.com/spreadsheets/d/1wPXKW_E7VJuVueJLkusT4NvcRww2GIUr0JwKxWByHTU/edit?gid=0#gid=0)

</div>

---

## The Problem

Every enterprise processes thousands of invoices monthly. Each one needs to be read, validated, checked for fraud, approved by policy, and paid — a chain of manual steps that costs **$15–40 per invoice** and takes **days**.

What if an AI system could do all of that in **under 30 seconds**, catch fraud humans miss, and get **smarter with every invoice it processes?**

---

## What AutoFlow AI Does

Drop an invoice (PDF, image, or raw text). AutoFlow takes over.

```
Invoice In ── OCR ── Parse ── Validate ── Swarm Vote ── Pay ── Verify
                                              |
                                  +-----------+-----------+
                                  |           |           |
                              Anomaly    Currency     Vendor
                              Detection  Risk         Trust
                                  |           |           |
                                  +------ VOTE -----------+
                                        GO / BLOCK
                                            |
                                            v
                                      Feedback Loop
                                     (Self-Improving)
```

**Zero human intervention. Full audit trail. Self-improving accuracy.**

---

## Architecture

<div align="center">

| Layer | Technology | Purpose |
|:---:|:---|:---|
| **Frontend** | React 18 + TypeScript + Vite + shadcn/ui | Real-time dashboard with 15s auto-polling |
| **Workflow Engine** | n8n (148 nodes, self-hosted on Render) | Visual orchestration for 8 AI agents |
| **LLM Provider** | Groq — llama-3.1-8b-instant | 9 LLM calls per invoice, sub-second inference |
| **Application Database** | Google Sheets (6 sheets) | Transparent, zero-config, publicly auditable |
| **Internal Persistence** | Neon PostgreSQL (serverless) | n8n workflow state + encrypted credentials |
| **Uptime** | Render (free tier) + UptimeRobot | 24/7 availability via 5-min keep-alive pings |

</div>

---

## The Swarm Consensus Engine

This is not a simple LLM chain. AutoFlow AI implements **swarm intelligence** — three specialized agents independently analyze every invoice and cast weighted votes.

<div align="center">

| Agent | Analysis Method | Output |
|:---:|:---|:---|
| **Anomaly Detection** | Z-score analysis + Benford's Law + frequency profiling against real vendor history | GO / REVIEW / BLOCK |
| **Currency Risk** | Live FX rates + Covered Interest Parity formula for foreign currency exposure | GO / REVIEW / BLOCK |
| **Vendor Trust** | Trust score from historical invoice patterns — tenure, volume, variance, consistency | GO / REVIEW / BLOCK |

</div>

### How Consensus Works

```
Each agent votes with a confidence score (0-1)
                    |
Swarm Consensus Engine applies ADAPTIVE WEIGHTS
(weights shift based on each agent's historical accuracy)
                    |
Weighted risk score is computed
                    |
Final decision:  GO  |  REVIEW  |  BLOCK
                    |
After payment outcome is known...
                    |
Feedback Loop evaluates each agent's vote against ground truth
                    |
Agent weights are updated — correct calls rewarded, incorrect calls penalized
                    |
Next invoice benefits from updated weights
```

The system learns from every invoice it processes. An agent that made a bad call carries less influence next time. An agent that caught fraud early gets amplified. This is a closed-loop self-improving system — not a static pipeline.

---

## The 8 Agents

| # | Agent | Type | Role |
|:---:|:---|:---:|:---|
| 1 | **OCR Correction** | LLM | Cleans and enhances raw OCR output |
| 2 | **Document Understanding** | LLM | Extracts structured fields — vendor, amount, dates, PO number |
| 3 | **Intake Parser** | LLM | Schema enforcement and confidence scoring |
| 4 | **Supervisor** | LLM | Quality gate — validates parsed data meets processing thresholds |
| 5 | **Anomaly Detection** | Hybrid | Z-score + Benford's Law + LLM contextual reasoning |
| 6 | **Currency Risk** | Hybrid | Live FX + CIP formula + LLM risk assessment |
| 7 | **Vendor Trust** | Hybrid | Statistical trust model + LLM judgment |
| 8 | **CFO Intelligence** | LLM + Memory | Multi-turn conversational agent with persistent conversation memory |

Supporting agents: **Payment Execution**, **Verification**, and **Remediation Intelligence** (auto-retries failed payments with error classification).

> **Hybrid** means the agent runs deterministic algorithms first (Z-scores, Benford's Law, Covered Interest Parity), then feeds those computed results to the LLM for contextual reasoning. Algorithmic precision combined with LLM flexibility.

---

## Technical Depth

<table>
<tr><td>

### Fraud Detection
- **Benford's Law** — flags amounts where leading-digit distribution deviates from the expected mathematical distribution
- **Z-Score Analysis** — compares invoice amounts against vendor-specific historical mean and standard deviation
- **Frequency Profiling** — detects unusual invoice submission patterns per vendor

</td><td>

### Integrity and Safety
- **SHA-256 Idempotency** — deterministic hash prevents duplicate processing across the entire pipeline
- **Cascade Delete** — invoice deletion preserves full audit trail entries
- **Levenshtein Distance** — fuzzy vendor name matching for deduplication

</td></tr>
<tr><td>

### Currency Intelligence
- **Live FX Rates** — fetches real-time exchange rates via HTTP at processing time
- **Covered Interest Parity** — calculates true currency exposure for foreign invoices
- **Hedging Recommendations** — flags when hedging is advisable based on exposure thresholds

</td><td>

### Self-Improvement Loop
- **Closed Feedback Loop** — payment outcomes feed back into agent weight adjustments automatically
- **Temporal Decay** — recent agent performance weighted more heavily than older history
- **Per-Agent Accuracy Tracking** — each agent evaluated independently against ground truth

</td></tr>
</table>

---

## Scale

<div align="center">

| Metric | Value |
|:---|:---:|
| Total n8n nodes | **148** |
| Code nodes (custom logic) | **44** |
| Google Sheets operations | **33** |
| AI / LangChain nodes | **19** |
| LLM calls per invoice | **9** |
| Webhook endpoints | **5** |
| Specialized agents | **8** |
| Swarm voting agents | **3** |
| Database sheets | **6** |
| Frontend pages | **9** |

</div>

---

## Frontend

| Page | Description |
|:---|:---|
| **Home** | Landing page with live pipeline visualization, interactive demo mode, and onboarding flow |
| **Upload** | Drag-and-drop invoice upload with client-side OCR (Tesseract.js), real-time pipeline progress |
| **Dashboard** | Live invoice monitoring — statuses, confidence scores, trace IDs |
| **Analytics** | Pipeline performance metrics, throughput, success and failure rates |
| **Audit** | Complete immutable audit trail — every agent action on every invoice |
| **Payments** | Payment ledger with execution and verification status |
| **Policy** | Supervisor and policy engine decision log with reasoning |
| **Errors** | Error log with full context for debugging |
| **CFO AI** | Multi-turn chat interface — ask the CFO agent anything about the pipeline |

---

## Project Structure

```
AutoFlow AI/
|
├── apps/frontend/                    React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── SwarmViz.tsx          Swarm vote visualization (GO / REVIEW / BLOCK)
│   │   │   ├── PipelineVisualizer.tsx Real-time pipeline stage tracker
│   │   │   ├── DemoMode.tsx          Simulated pipeline demo for landing page
│   │   │   ├── SystemStatusBanner.tsx n8n health check indicator
│   │   │   └── ui/                   shadcn/ui primitives
│   │   ├── hooks/
│   │   │   └── use-sheet-data.ts     Google Sheets GViz API fetcher (15s polling)
│   │   ├── lib/
│   │   │   ├── config.ts            API base URL, Sheet ID, timeouts
│   │   │   └── ocr.ts              Tesseract.js + pdfjs-dist (client-side OCR)
│   │   └── pages/                   9 pages (Home through CFO AI)
│   ├── dist/                        Production build (pre-built, ready to deploy)
│   ├── package.json
│   └── vite.config.ts
|
└── services/n8n-workflows/
    └── ET GEN AI 28 MARCH.json      Full 148-node n8n workflow (importable)
```

---

## Database Schema

**Google Sheets** — 6 sheets, publicly readable, zero configuration required.

| Sheet | Purpose |
|:---|:---|
| `invoices` | Parsed invoice records — trace_id, vendor, amount, currency, confidence, status |
| `audit_ledger` | Immutable log of every agent action — the single source of truth |
| `errors` | Error log with agent name, error type, and full context |
| `policy_decisions` | Supervisor and policy engine outcomes — ALLOW or DENY with reasoning |
| `payment_ledger` | Payment execution records with gateway response |
| `swarm_feedback` | Closed-loop feedback — agent votes, payment outcome, accuracy scores, weight updates |

The frontend reads these sheets directly via Google's GViz API — no backend required for reads. Every data point in the UI is pulled live from the sheet.

---

## API Endpoints

**Base URL:** `https://n8n-latest-1ikm.onrender.com`

All endpoints are **live and accepting requests** right now.

| Method | Endpoint | Purpose |
|:---:|:---|:---|
| POST | `/webhook/intake-invoice` | Submit an invoice for full pipeline processing |
| POST | `/webhook/supervisor-policy` | Trigger supervisor and policy check on parsed data |
| POST | `/webhook/analytics` | Fetch pipeline analytics data |
| POST | `/webhook/delete-invoice` | Delete an invoice (audit trail preserved) |
| POST | `/webhook/mock-payment` | Mock payment gateway for testing |

---

## Quick Start — Frontend

### Prerequisites

- **Node.js** version 18 or higher (or **Bun**)

### Install and Run

```bash
# Clone the repository
git clone <repo-url>
cd "AutoFlow AI/apps/frontend"

# Install dependencies
npm install          # or: bun install

# Start development server (http://localhost:8080)
npm run dev          # or: bun dev

# Build for production
npm run build        # output goes to ./dist/

# Run tests
npm run test
```

### Configuration

The frontend is **pre-configured** to point at the live n8n instance. No environment files needed, no additional setup.

To change the API URL at runtime: open the **Upload** page, click **API Settings** in the top-right corner, enter your custom n8n base URL, and save.

To change defaults in code, edit `src/lib/config.ts`:

```typescript
const DEFAULT_API_URL = "https://n8n-latest-1ikm.onrender.com";
export const SPREADSHEET_ID = "1wPXKW_E7VJuVueJLkusT4NvcRww2GIUr0JwKxWByHTU";
```

---

## n8n Workflow Setup

### Option A — Use the Live Instance (No Setup Required)

The entire workflow is **already deployed and running** at:

```
https://n8n-latest-1ikm.onrender.com
```

The frontend points here by default. Start the frontend and everything works out of the box.

### Option B — Import Into Your Own n8n Instance

1. Open your n8n instance and navigate to **Workflows**, then **Import from File**
2. Select `services/n8n-workflows/ET GEN AI 28 MARCH.json`
3. Configure the following credentials:

| Credential | Where To Get It |
|:---|:---|
| **Google Sheets OAuth2** | Google Cloud Console — APIs and Services — OAuth 2.0 Client ID |
| **Groq API Key** | [console.groq.com](https://console.groq.com) — free tier available |

4. Create a new Google Sheet with 6 tabs: `invoices`, `audit_ledger`, `errors`, `policy_decisions`, `payment_ledger`, `swarm_feedback`
5. Update the Sheet ID across all Google Sheets nodes in the workflow
6. Activate the workflow

### Infrastructure — How It Is Deployed

| Component | Service | Role |
|:---|:---|:---|
| **n8n Engine** | Render (free tier) | Self-hosted Docker container running the 148-node workflow |
| **Keep-Alive** | UptimeRobot | Sends HTTP ping every 5 minutes to prevent Render free-tier spin-down |
| **n8n Database** | Neon PostgreSQL (serverless) | Stores workflow definitions, encrypted credentials, and execution history |
| **Application Database** | Google Sheets | All invoice data, audit logs, decisions, and feedback — publicly auditable |

---

## Test It Live

### Submit an Invoice — Full End-to-End Pipeline

```bash
curl -X POST https://n8n-latest-1ikm.onrender.com/webhook/intake-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_text": "INVOICE\nInvoice Number: INV-2026-1234\nVendor: Wipro Technologies\nDate: 2026-03-28\nDue Date: 2026-04-20\nAmount: 85000.00\nCurrency: INR\nPO Reference: PO-4421\nDescription: Cloud infrastructure services - March 2026",
    "source_event_id": "test-001"
  }'
```

### Fetch Pipeline Analytics

```bash
curl -X POST https://n8n-latest-1ikm.onrender.com/webhook/analytics \
  -H "Content-Type: application/json" -d '{}'
```

> The first request after inactivity may take approximately 30 seconds as Render spins up the container. Subsequent requests are fast.

---

<div align="center">

<br/>

**Team Dev Duo**

148 nodes. 8 agents. 1 vision — invoices that process themselves.

<br/>

</div>
