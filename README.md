# SupplyGuard AI — Supply Chain Disruption Assistant

> **Hackathon Track:** AI | **Team:** SupplyGuard AI

---

## Team

| Role | Name | Email |
|------|------|-------|
| Lead | Hackathon Lead | lead@supplyguard.ai |
| Developer | Developer One | dev1@supplyguard.ai |
| Developer | Developer Two | dev2@supplyguard.ai |

---

## Problem Statement

Supply chain disruptions — weather events, port strikes, geopolitical crises — cascade across hundreds of active shipments in ways that are impossible to track manually. Fleet assets (trucks, containers, vessels) sit idle while other routes are overloaded. Cold-chain shipments (vaccines, perishables) are especially vulnerable — a single temperature excursion across any leg can spoil a $500K+ cargo, but breaches are only discovered at delivery when it is too late.

---

## Solution

**SupplyGuard AI** is an IBM Bob-powered supply chain operations center that provides end-to-end disruption response:

1. **Detects** active disruptions and classifies their severity in real time
2. **Identifies** every affected shipment with AI-driven risk scoring (CRITICAL → LOW)
3. **Recommends** optimal reroutes and carrier alternatives with cost/time trade-offs
4. **Redeploys** idle fleet assets via a proximity + capacity optimizer
5. **Monitors** cold-chain IoT sensor streams and flags temperature excursions before delivery
6. **Answers** operations questions via a natural-language AI Copilot
7. **Generates** executive recovery plans with full KPI impact summaries

---

## Key Features

- 🚨 **Disruption Detection** — Weather, port, strike, and geopolitical event monitoring with severity bands
- 📦 **Affected Shipment Analysis** — Risk classification engine (CRITICAL / HIGH / MEDIUM / LOW) based on cargo type, ETA, and route overlap
- 🔀 **Smart Rerouting** — Multi-route comparison with cost, delay, and carrier reliability scores
- 🚛 **Fleet Optimization** — Idle asset scanner with redeployment recommendations sorted by proximity
- 🌡 **Cold-Chain Monitoring** — Live IoT temperature stream with WHO/FDA regulatory excursion alerts
- 🤖 **AI Copilot** — Natural-language Q&A over live operational data
- 📋 **Recovery Plan Generator** — One-click executive summary with action items and KPI projections

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Copilot | IBM Bob |
| Frontend | HTML5, CSS3, Vanilla JS (ES2022) |
| Charts | Chart.js 4.4 |
| Data Layer | Simulated real-time IoT streams, in-memory state |
| Decision Engine | Rule-based AI (risk classification, rerouting, fleet optimizer) |
| Deployment | Static file — no server required |

---

## How to Run

```bash
# Clone the repo
git clone https://github.com/[your-team]/bob-ai-hackathon-supplyguard.git
cd bob-ai-hackathon-supplyguard/src

# Option 1: Open directly in browser
open index.html

# Option 2: Serve locally (Python)
python -m http.server 8080
# Then open http://localhost:8080

# Option 3: Serve locally (Node)
npx serve .
# Then open http://localhost:3000
```

No build step. No dependencies to install. No environment variables required for the demo.

See [docs/setup-guide.md](docs/setup-guide.md) for full instructions.

---

## Demo

| Resource | Link |
|----------|------|
| 🎥 Demo Video | See `demo/demo-video-link.txt` |
| 🌐 Live Demo | See `demo/live-demo-url.txt` |
| 📸 Screenshots | `demo/screenshots/` |

---

## Known Limitations

- Uses simulated/generated data — no live ERP/TMS/IoT API connections in this demo
- AI Copilot uses rule-based intent matching (not a full LLM) for hackathon speed
- Optimized for desktop browsers (Chrome/Firefox/Edge); mobile layout is functional but not polished
- No authentication layer (demo mode)
- In-memory state only — refreshing the page resets the simulation

---

## What We're Most Proud Of

The **Cold-Chain IoT monitoring module** — live Chart.js sensor streams update every 2 seconds, automatically detecting excursions against WHO/FDA thresholds and classifying their regulatory severity. The **AI Copilot** accurately answers 20+ distinct operational query types using intent detection over live simulated state. And the **Recovery Plan generator** produces a structured, professional executive document in one click.

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full system diagram and component breakdown.
