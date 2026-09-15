# Setup Guide

## Prerequisites

None. SupplyGuard AI is a pure client-side application — no Node.js, no Python, no database, no environment variables required.

All you need is a modern web browser (Chrome, Firefox, or Edge recommended).

---

## Option 1: Visit the Live Deployment (Fastest)

Just open the link below in your browser — no setup needed:

**https://bob-ai-hackathon-team-09-ai-supplyguard.onrender.com**

---

## Option 2: Run Locally

### Step 1 — Clone the repository

```bash
git clone https://github.com/KUNJ-DAVE-09/bob-ai-hackathon--TEAM-09.AI-.git
cd bob-ai-hackathon--TEAM-09.AI-/supplyguard/src
```

### Step 2 — Open in browser

**Direct open (simplest):**
```bash
# macOS / Linux
open index.html

# Windows
start index.html
```

**Or serve with Python (recommended to avoid CORS issues):**
```bash
python -m http.server 8080
# Then open http://localhost:8080
```

**Or serve with Node.js:**
```bash
npx serve .
# Then open http://localhost:3000
```

---

## What You'll See

When the app loads:

1. **Dashboard** — KPI summary cards and live disruption overview
2. **Disruptions** — Active disruption events with severity classification
3. **Shipments** — Risk-scored shipment list (CRITICAL → LOW)
4. **Rerouting** — Alternative route recommendations per shipment
5. **Fleet** — Idle asset scanner with redeployment recommendations
6. **Cold-Chain** — Live IoT temperature sensor streams (updates every 2 seconds)
7. **AI Copilot** — Type any supply chain question in natural language
8. **Recovery Plan** — Click "Generate Plan" for a one-click executive summary

---

## Using the AI Copilot

Click the **AI Copilot** tab and type any of these example queries:

- `Which shipments are at critical risk?`
- `Show me rerouting options for the Rotterdam disruption`
- `Are there any cold-chain temperature excursions?`
- `How many idle fleet assets do we have?`
- `Generate a recovery plan summary`
- `What is the current on-time delivery rate?`

---

## No Build Step

There is no `npm install`, no `webpack`, no `build` command. The source files in `src/` are the final files — open `index.html` and everything runs.
