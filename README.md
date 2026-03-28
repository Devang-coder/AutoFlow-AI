<div align="center">

# 🌊 AutoFlow AI

### _What if your invoices processed themselves?_

**An autonomous accounts payable system where 8 AI agents debate, vote, and execute payments — then learn from their mistakes.**

[![n8n](https://img.shields.io/badge/n8n-148_Nodes-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n-latest-1ikm.onrender.com)
[![Groq](https://img.shields.io/badge/Groq-9_LLM_Calls-F55036?style=for-the-badge&logo=lightning&logoColor=white)](https://groq.com)
[![React](https://img.shields.io/badge/React_18-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](/)
[![Live](https://img.shields.io/badge/Status-LIVE_🟢-00C853?style=for-the-badge)](https://n8n-latest-1ikm.onrender.com)

<br/>

**ET Gen AI Hackathon 2026 · Team Dev Duo**

<br/>

[🔗 Live n8n Workflow](https://n8n-latest-1ikm.onrender.com) · [📊 Live Database (Google Sheets)](https://docs.google.com/spreadsheets/d/1wPXKW_E7VJuVueJLkusT4NvcRww2GIUr0JwKxWByHTU/edit?gid=0#gid=0)

</div>

---

## 💡 The Problem

Every enterprise processes thousands of invoices monthly. Each one needs to be read, validated, checked for fraud, approved by policy, and paid — a chain of manual steps that costs **$15–40 per invoice** and takes **days**.

What if an AI system could do all of that in **under 30 seconds**, catch fraud humans miss, and get **smarter with every invoice it processes?**

---

## 🚀 What AutoFlow AI Does

Drop an invoice (PDF, image, or raw text) → AutoFlow takes over:

```
📄 Invoice In ──▶ 🔍 OCR ──▶ 🧠 Parse ──▶ 👮 Validate ──▶ 🐝 Swarm Vote ──▶ 💳 Pay ──▶ ✅ Verify
                                                                │
                                                    ┌───────────┼───────────┐
                                                    ▼           ▼           ▼
                                              🔎 Anomaly   💱 Currency  🏢 Vendor
                                              Detection    Risk        Trust
                                                    │           │           │
                                                    └─────── VOTE ──────────┘
                                                          GO / BLOCK
                                                              │
                                                              ▼
                                                    📈 Feedback Loop
                                                   (Self-Improving)
```

**Zero human intervention. Full audit trail. Self-improving accuracy.**

---

## 🏗️ Architecture

<div align="center">

| Layer | What | Why |
|:---:|:---|:---|
| 🖥️ **Frontend** | React 18 + TypeScript + Vite + shadcn/ui | Real-time dashboard with 15s auto-polling |
| ⚡ **Engine** | n8n (148 nodes, self-hosted) | Visual workflow orchestration for 8 AI agents |
| 🧠 **LLM** | Groq — llama-3.1-8b-instant | 9 LLM calls per invoice, sub-second inference |
| 🗄️ **Database** | Google Sheets (6 sheets) | Transparent, zero-config, publicly auditable |
| 🔒 **Persistence** | Neon PostgreSQL (serverless) | n8n internal state + encrypted credentials |
| 🏠 **Hosting** | Render (free tier) + UptimeRobot | 24/7 uptime with 5-min keep-alive pings |

</div>

---

## 🐝 The Swarm — Our Secret Weapon

This isn't a simple LLM chain. AutoFlow AI implements **swarm intelligence** — three specialized agents independently analyze every invoice and cast weighted votes:

<div align="center">

| Agent | What It Does | How It Votes |
|:---:|:---|:---|
| 🔎 **Anomaly Detection** | Z-score analysis + Benford's Law + frequency profiling against real vendor history | GO · REVIEW · BLOCK |
| 💱 **Currency Risk** | Live FX rates + Covered Interest Parity formula for foreign currency exposure | GO · REVIEW · BLOCK |
| 🏢 **Vendor Trust** | Trust score from historical invoice patterns — tenure, volume, variance, consistency | GO · REVIEW · BLOCK |

</div>

### How Consensus Works

```
Each agent votes with a confidence score (0–1)
                    ↓
Swarm Consensus Engine applies ADAPTIVE WEIGHTS
(weights shift based on each agent's historical accuracy)
                    ↓
Weighted risk score is computed
                    ↓
Final decision: GO ✅ │ REVIEW ⚠️ │ BLOCK 🛑
                    ↓
After payment outcome is known...
                    ↓
Feedback Loop evaluates each agent's vote vs. ground truth
                    ↓
Agent weights are updated — good calls rewarded, bad calls penalized
                    ↓
🔄 Next invoice benefits from updated weights
```

> **The system literally learns from every invoice it processes.** An agent that made a bad call last time carries less influence next time. An agent that caught fraud early gets amplified. This is a closed-loop self-improving system — not a static pipeline.

---

## 🤖 The 8 Agents

| # | Agent | Type | Role |
|:---:|:---|:---:|:---|
| 1 | **OCR Correction** | 🧠 LLM | Cleans and enhances raw OCR output |
| 2 | **Document Understanding** | 🧠 LLM | Extracts structured fields — vendor, amount, dates, PO# |
| 3 | **Intake Parser** | 🧠 LLM | Schema enforcement, confidence scoring |
| 4 | **Supervisor** | 🧠 LLM | Quality gate — validates data meets thresholds |
| 5 | **Anomaly Detection** | 🔀 Hybrid | Z-score + Benford's Law + LLM reasoning |
| 6 | **Currency Risk** | 🔀 Hybrid | Live FX + CIP formula + LLM assessment |
| 7 | **Vendor Trust** | 🔀 Hybrid | Statistical trust model + LLM judgment |
| 8 | **CFO Intelligence** | 🧠 LLM + Memory | Multi-turn executive assistant with conversation memory |

Plus: **Payment Execution Agent**, **Verification Agent**, and **Remediation Intelligence** (auto-retries failed payments with error classification).

> **Hybrid = Algorithm + LLM.** The swarm agents don't just ask an LLM — they first run deterministic algorithms (Z-scores, Benford's Law, CIP formula), then feed those results to the LLM for contextual reasoning. Best of both worlds.

---

## 🔬 Technical Depth

<table>
<tr><td>

### Fraud Detection
- **Benford's Law** — flags amounts where leading-digit distribution deviates from expected mathematical distribution
- **Z-Score Analysis** — compares invoice amounts against vendor-specific historical mean and standard deviation
- **Frequency Profiling** — detects unusual invoice submission patterns

</td><td>

### Integrity & Safety
- **SHA-256 Idempotency** — deterministic hash prevents duplicate processing
- **Cascade Delete** — invoice deletion preserves full audit trail
- **Levenshtein Distance** — fuzzy vendor name matching for dedup

</td></tr>
<tr><td>

### Currency Intelligence
- **Live FX Rates** — fetches real-time exchange rates via HTTP
- **Covered Interest Parity** — calculates true currency exposure for foreign invoices
- **Hedging Recommendations** — flags when hedging is advisable

</td><td>

### Self-Improvement
- **Closed Feedback Loop** — payment outcomes feed back to update agent weights
- **Temporal Decay** — recent performance weighted more than old history
- **Per-Agent Accuracy** — each agent tracked independently, not as a group

</td></tr>
</table>

---

## 📊 By The Numbers

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

## 🖥️ Frontend Pages

| Page | What It Shows |
|:---|:---|
| **Home** | Landing page with live pipeline visualization, demo mode, and onboarding |
| **Upload** | Drag-and-drop invoice upload with client-side OCR (Tesseract.js), live pipeline progress |
| **Dashboard** | Real-time invoice monitoring — statuses, confidence scores, trace IDs |
| **Analytics** | Pipeline performance metrics, throughput, success/failure rates |
| **Audit** | Complete immutable audit trail — every agent action on every invoice |
| **Payments** | Payment ledger with execution + verification status |
| **Policy** | Supervisor and policy engine decision log (ALLOW / DENY with reasons) |
| **Errors** | Error log with full context for debugging |
| **CFO AI** | Multi-turn chat interface — ask your CFO agent anything about the pipeline |

---

## 📂 Project Structure

```
AutoFlow AI/
│
├── apps/frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── SwarmViz.tsx          # Swarm vote visualization (GO/REVIEW/BLOCK)
│   │   │   ├── PipelineVisualizer.tsx # Real-time pipeline stage tracker
│   │   │   ├── DemoMode.tsx          # Simulated pipeline demo for landing page
│   │   │   ├── SystemStatusBanner.tsx # n8n health check indicator
│   │   │   └── ui/                   # shadcn/ui primitives
│   │   ├── hooks/
│   │   │   └── use-sheet-data.ts     # Google Sheets GViz API fetcher (15s polling)
│   │   ├── lib/
│   │   │   ├── config.ts            # API base URL, Sheet ID, timeouts
│   │   │   └── ocr.ts              # Tesseract.js + pdfjs-dist (client-side OCR)
│   │   └── pages/                   # 9 pages (Home → CFO AI)
│   ├── dist/                        # Production build (pre-built, ready to deploy)
│   ├── package.json
│   └── vite.config.ts
│
└── services/n8n-workflows/
    └── ET GEN AI 28 MARCH.json      # Full 148-node n8n workflow (importable)
```

---

## 🗄️ Database Schema

**Google Sheets** — 6 sheets, publicly readable, zero-config.

| Sheet | Purpose |
|:---|:---|
| `invoices` | Parsed invoice records (trace_id, vendor, amount, currency, confidence, status) |
| `audit_ledger` | Immutable log of every agent action — the single source of truth |
| `errors` | Error log with agent name, error type, full context |
| `policy_decisions` | Supervisor + policy engine outcomes (ALLOW / DENY + reason) |
| `payment_ledger` | Payment execution records with gateway response |
| `swarm_feedback` | Closed-loop feedback — agent votes, payment outcome, accuracy, weight updates |

> The frontend reads these sheets directly via Google's GViz API — no backend required for reads. Every data point in the UI is pulled live from the sheet.

---

## 🔌 API Endpoints

**Base URL:** `https://n8n-latest-1ikm.onrender.com`

| Method | Endpoint | Purpose |
|:---:|:---|:---|
| POST | `/webhook/intake-invoice` | Submit an invoice for full pipeline processing |
| POST | `/webhook/supervisor-policy` | Trigger supervisor + policy check on parsed data |
| POST | `/webhook/analytics` | Fetch pipeline analytics data |
| POST | `/webhook/delete-invoice` | Delete an invoice (audit trail preserved) |
| POST | `/webhook/mock-payment` | Mock payment gateway for testing |

---

## ⚡ Quick Start — Frontend

### Prerequisites

- **Node.js** ≥ 18 (or **Bun**)

### Install & Run

```bash
# Clone the repo
git clone <repo-url>
cd "AutoFlow AI/apps/frontend"

# Install dependencies
npm install          # or: bun install

# Start dev server (http://localhost:8080)
npm run dev          # or: bun dev

# Build for production
npm run build        # output: ./dist/

# Run tests
npm run test
```

### Configuration

The frontend is **pre-configured** to point at the live n8n instance. No env files, no setup.

To change the API URL at runtime: open the **Upload** page → click **⚙ API Settings** → enter your URL.

To change defaults, edit `src/lib/config.ts`:

```typescript
const DEFAULT_API_URL = "https://n8n-latest-1ikm.onrender.com";
export const SPREADSHEET_ID = "1wPXKW_E7VJuVueJLkusT4NvcRww2GIUr0JwKxWByHTU";
```

---

## 🔧 n8n Workflow Setup

### Option A — Use Our Live Instance (No Setup)

Everything is **already deployed and running**:

```
https://n8n-latest-1ikm.onrender.com
```

The frontend points here by default. Just start the frontend and go.

### Option B — Import Into Your Own n8n

1. Open your n8n instance → **Workflows** → **Import from File**
2. Select `services/n8n-workflows/ET GEN AI 28 MARCH.json`
3. Configure two credentials:

| Credential | Source |
|:---|:---|
| **Google Sheets OAuth2** | Google Cloud Console → APIs & Services → OAuth 2.0 |
| **Groq API Key** | [console.groq.com](https://console.groq.com) (free tier) |

4. Create a Google Sheet with 6 tabs: `invoices`, `audit_ledger`, `errors`, `policy_decisions`, `payment_ledger`, `swarm_feedback`
5. Update the Sheet ID across Google Sheets nodes
6. Activate the workflow

### Infrastructure (How We Deployed It)

| Component | Service | Why |
|:---|:---|:---|
| **n8n engine** | Render (free tier) | Self-hosted Docker container |
| **Keep-alive** | UptimeRobot | Pings every 5 min to prevent Render cold starts |
| **n8n database** | Neon PostgreSQL | Serverless Postgres for workflow state + credentials |
| **App database** | Google Sheets | Zero-config, publicly auditable, GViz API for reads |

---

## 🧪 Test It Yourself

### Submit an Invoice (Full Pipeline)

```bash
curl -X POST https://n8n-latest-1ikm.onrender.com/webhook/intake-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_text": "INVOICE\nInvoice Number: INV-2026-1234\nVendor: Wipro Technologies\nDate: 2026-03-28\nDue Date: 2026-04-20\nAmount: 85000.00\nCurrency: INR\nPO Reference: PO-4421\nDescription: Cloud infrastructure services - March 2026",
    "source_event_id": "test-001"
  }'
```

### Fetch Analytics

```bash
curl -X POST https://n8n-latest-1ikm.onrender.com/webhook/analytics \
  -H "Content-Type: application/json" -d '{}'
```

### Delete an Invoice

```bash
curl -X POST https://n8n-latest-1ikm.onrender.com/webhook/delete-invoice \
  -H "Content-Type: application/json" -d '{"trace_id": "evt_demofinal001"}'
```

> ⏳ First request may take ~30s if Render is cold-starting. Subsequent requests are fast.

---

<div align="center">

**Built with obsession by Team Dev Duo** 🚀

_148 nodes. 8 agents. 1 vision — invoices that process themselves._

</div>
