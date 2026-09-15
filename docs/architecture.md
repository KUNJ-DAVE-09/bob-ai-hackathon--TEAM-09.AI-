# Architecture

## System Overview

SupplyGuard AI is a fully client-side single-page application. All logic, data, and AI processing runs in the browser — no backend server is required.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                    │
│                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐  │
│  │   index.html │   │   style.css │   │    app.js    │  │
│  │  (UI Shell)  │   │  (Styling)  │   │ (Core Logic) │  │
│  └─────────────┘   └─────────────┘   └──────┬───────┘  │
│                                             │           │
│  ┌──────────────────────────────────────────▼────────┐  │
│  │                   data.js (Data Layer)            │  │
│  │  shipments | disruptions | fleet | IoT sensors   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Chart.js 4.4│  │  IBM Bob     │  │  Decision    │  │
│  │  (Live Charts│  │  AI Copilot  │  │  Engine      │  │
│  │   & KPIs)    │  │  (NL Queries)│  │  (Rules AI)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### `index.html` — UI Shell
Single HTML file containing all 7 module views:
- Disruption Detection panel
- Affected Shipment Analysis table
- Smart Rerouting comparison view
- Fleet Optimization scanner
- Cold-Chain IoT Monitor (Chart.js live charts)
- AI Copilot chat interface (IBM Bob)
- Recovery Plan Generator

### `style.css` — Styling
Full responsive CSS for the dashboard. Desktop-first, with functional mobile layout.

### `app.js` — Core Application Logic
- Module routing and view switching
- Decision engine: risk scoring, rerouting optimizer, fleet matcher
- IoT simulation loop (2-second sensor update interval)
- IBM Bob AI Copilot intent detection and response engine
- Recovery plan document generator

### `data.js` — Data Layer
Simulated in-memory data store containing:
- Active shipments (20+ records with cargo type, route, ETA, carrier)
- Active disruptions (weather, port, strike, geopolitical events)
- Fleet assets (trucks, containers, vessels with location and capacity)
- Cold-chain IoT sensor streams (temperature readings per shipment leg)

---

## Data Flow

```
Simulation Engine (setInterval 2s)
        │
        ▼
data.js (in-memory state update)
        │
        ├──► Risk Engine → Shipment risk scores (CRITICAL/HIGH/MEDIUM/LOW)
        │
        ├──► Rerouting Engine → Alternative route options per shipment
        │
        ├──► Fleet Optimizer → Ranked idle asset redeployment list
        │
        ├──► IoT Monitor → Threshold comparison → Excursion alerts
        │
        └──► IBM Bob Copilot → NL query resolution over live state
                    │
                    ▼
              Chart.js → Live sensor charts + KPI gauges
```

---

## IBM Bob Integration

IBM Bob is integrated as the AI Copilot module. The integration works as follows:

1. User types a natural-language query in the Copilot chat
2. The query is passed to Bob's intent classification layer
3. Bob identifies the query type (disruption status, shipment risk, reroute recommendation, cold-chain alert, KPI summary, etc.)
4. Bob retrieves the relevant live state from `data.js`
5. Bob generates a structured, data-backed natural-language response
6. The response is rendered in the Copilot chat UI

**Supported query categories (20+):**
- Disruption status and severity
- Affected shipment lists by risk level
- Specific shipment status and ETA
- Rerouting recommendations
- Fleet asset availability
- Cold-chain excursion alerts
- KPI summaries
- Recovery plan generation triggers

---

## Deployment

The application is deployed as a static site on **Render**:
- **Live URL:** https://bob-ai-hackathon-team-09-ai-supplyguard.onrender.com
- No server-side logic
- No database
- No environment variables required
