# Solution Overview

## What We Built

**SupplyGuard AI** is an IBM Bob-powered supply chain operations center — a single-page web application that gives operations teams a real-time, AI-assisted command center for detecting, responding to, and recovering from supply chain disruptions.

---

## How It Works

### 1. 🚨 Disruption Detection
The system continuously monitors for active disruptions — weather events, port closures, strikes, and geopolitical crises. Each disruption is classified by severity (CRITICAL / HIGH / MEDIUM / LOW) and displayed with affected routes, estimated delay, and impacted shipment count.

### 2. 📦 Affected Shipment Analysis
When a disruption is detected, SupplyGuard AI automatically identifies every shipment on the affected route and scores it for risk using a multi-factor engine that considers:
- Cargo type (pharmaceuticals, perishables, standard)
- Days until ETA
- Route overlap percentage
- Carrier reliability score

### 3. 🔀 Smart Rerouting
For each affected shipment, the system generates 2–3 alternative route options ranked by a composite score of cost delta, additional delay, and carrier reliability. Operations teams can compare options side-by-side and select the optimal reroute.

### 4. 🚛 Fleet Optimization
The idle fleet scanner identifies all unassigned trucks, containers, and vessels across the network and ranks them by proximity to disruption nodes and available capacity — enabling rapid redeployment of stranded assets.

### 5. 🌡 Cold-Chain IoT Monitoring
A live sensor dashboard streams temperature readings every 2 seconds for all active cold-chain shipments. The system automatically compares readings against regulatory thresholds (WHO GDP: 2–8°C for vaccines, −20°C for biologics, 0–4°C for perishables) and triggers excursion alerts with regulatory severity classification before delivery.

### 6. 🤖 AI Copilot (Powered by IBM Bob)
A natural-language interface lets operations staff ask questions over live data:
- *"Which shipments are at critical risk right now?"*
- *"What's the best reroute for shipment SG-1042?"*
- *"Are any cold-chain shipments showing temperature excursions?"*
- *"Generate a recovery summary for the Rotterdam disruption."*

The Copilot handles 20+ distinct query types using intent detection over the live operational state.

### 7. 📋 Recovery Plan Generator
One click generates a structured executive recovery document including:
- Active disruption summary
- Affected shipment count and risk breakdown
- Recommended actions with ownership
- KPI impact projections (on-time delivery rate, revenue at risk, assets redeployed)

---

## Why IBM Bob?

IBM Bob powers the AI Copilot — the natural-language layer that makes all of SupplyGuard AI's data accessible to operations staff without requiring them to navigate complex dashboards. Bob's intent detection and context awareness allow the Copilot to answer nuanced operational questions over live state, making it the most differentiating feature of the submission.

---

## Architecture Summary

| Layer | What It Does |
|---|---|
| **UI (HTML/CSS/JS)** | Single-page operations dashboard with 7 functional modules |
| **Data Engine** | In-memory simulated state — shipments, disruptions, fleet, IoT sensors |
| **AI Copilot** | IBM Bob-powered intent detection and response generation |
| **Decision Engine** | Rule-based risk scoring, rerouting optimizer, fleet matcher |
| **Chart Layer** | Chart.js 4.4 live sensor streams and KPI visualizations |

See [architecture.md](architecture.md) for the full system diagram.
