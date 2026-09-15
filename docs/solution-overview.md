# Solution Overview — SupplyGuard AI

## Core Mechanism

SupplyGuard AI is a **decision-support operations center** that transforms raw disruption signals into prioritized, actionable recovery workflows — reducing human time-to-action from hours to minutes.

The system operates as a continuous loop:

```
Detect Disruption → Assess Impact → Classify Risk → Generate Options → Execute / Monitor
```

Every component feeds live state into a shared data layer that the AI Copilot can query in natural language, giving any team member — from operations analyst to C-suite — instant situational awareness without log-diving or report-pulling.

---

## The Seven Modules

### 1. Disruption Detection
Incoming disruption events (weather, port, strike, geopolitical) are ingested and enriched with severity scoring based on geographic radius, duration, and historical impact patterns. Each disruption is geo-matched against active shipment routes in real time.

### 2. Affected Shipment Analysis
Every active shipment is evaluated against the disruption's impact zone using a multi-factor risk engine:

```
Risk = f(cargo_type, temp_sensitive, hours_to_delivery, priority, route_overlap, alternative_routes)
```

Outputs: CRITICAL / HIGH / MEDIUM / LOW classification per shipment, with the reasoning chain visible to operators.

### 3. Rerouting Engine
For each affected shipment, the rerouting engine computes alternative paths using a weighted graph traversal that balances:
- **Delay** (hours added vs. original ETA)
- **Cost** (route premium + carrier rate delta)
- **Carrier reliability** (historical on-time rate)
- **Cargo compatibility** (temperature-controlled capacity, hazmat, etc.)

The top 3 alternatives are surfaced per shipment with a recommended choice and explicit trade-off summary.

### 4. Fleet Optimization
Idle fleet assets are scanned and ranked for redeployment suitability based on:
- Proximity to disruption-affected node
- Load capacity vs. stranded cargo volume
- Asset type compatibility (reefer availability for cold-chain)
- Redeployment cost vs. estimated cargo value saved

### 5. Cold-Chain Monitoring
IoT sensor streams are ingested at 30-second intervals per shipment. Each reading is validated against:
- Cargo-type threshold (configurable per WHO/FDA/USDA requirement)
- Duration of excursion (single-point vs. sustained breach)
- Regulatory severity classification (Advisory / Warning / Critical / Emergency)

Alerts are fired within 2 sensor cycles (~60 seconds) of excursion onset — not at delivery.

### 6. AI Copilot
The natural-language copilot accepts free-text queries and resolves them against live operational state using intent classification. Supported intent categories: disruption status, shipment impact, rerouting recommendations, fleet availability, cold-chain alerts, KPI summaries, and recovery actions. The copilot provides sourced, data-backed answers rather than generic responses.

### 7. Recovery Plan Generator
One-click generation of a structured executive document covering: disruption summary, total financial exposure, shipment action matrix (by risk level), fleet deployment orders, cold-chain intervention summary, KPI impact projections, and a 72-hour recovery timeline.

---

## What Makes It Different

| Naive Alternative | SupplyGuard AI Approach |
|------------------|------------------------|
| Alert-only systems (tell you something is wrong) | Full response loop: detect → classify → recommend → act |
| Siloed views (shipments OR fleet OR cold-chain) | Unified operational picture across all data streams |
| Static reports (generated once, go stale) | Live state — every number on screen reflects the current simulation |
| Manual rerouting (analyst opens TMS, checks carrier, emails back) | Automated ranked alternatives with one-click accept |
| Delivery-time excursion discovery | Sub-2-minute in-transit detection with regulatory classification |

---

## Key Design Decisions

1. **No build toolchain** — The entire application is vanilla HTML/CSS/JS. A judge can open `index.html` and see a running system. No npm install, no build step, no server required.

2. **Rule-based AI for hackathon speed** — The decision engines (risk classification, rerouting, fleet optimizer) use deterministic rule trees that are transparent, explainable, and fast. This is intentional: in production, these rules become the training labels for an ML model.

3. **Simulated real-time data** — All sensor streams, disruption events, and shipment status changes are driven by a JavaScript simulation engine. This allows a convincing, dynamic demo without requiring live API integrations.

4. **IBM Bob as the intelligence layer** — The AI Copilot is designed as the primary Bob integration point: natural-language operational queries route through Bob's reasoning capability to provide contextual, grounded answers against the live data state.
