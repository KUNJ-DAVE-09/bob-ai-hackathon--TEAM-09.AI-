# Problem Statement — SupplyGuard AI

## Who Is Affected

**Primary audience:** Supply chain operations managers, fleet managers, compliance officers, and logistics executives at mid-to-large enterprises managing distributed shipment networks — particularly those handling temperature-sensitive cargo (pharmaceuticals, vaccines, perishables).

**Secondary audience:** Customer service teams who must proactively notify customers of disruption-driven delays.

---

## The Core Problem

### 1. Disruption Cascades Are Invisible Until Too Late

When a weather event, port strike, or geopolitical crisis occurs, its impact ripples across a shipment network in minutes — but operations teams only discover affected shipments through manual cross-referencing of TMS records, carrier emails, and static spreadsheets. By the time a human analyst completes impact assessment (typically 4–24 hours), rerouting windows have closed, premium carrier capacity has been taken, and customer SLA violations are already locked in.

### 2. Cold-Chain Breaches Are Discovered at Delivery — Not in Transit

Temperature-sensitive cargo (vaccines: 2–8°C, biological samples: −20°C, perishables: 0–4°C) is monitored with IoT sensors that generate continuous data — but that data often goes unreviewed until delivery inspection. A temperature excursion that began 18 hours ago and could have been remediated (cargo transfer, dry-ice replenishment, reroute to refrigerated carrier) results instead in total cargo loss averaging $500K+ per incident. Regulatory consequences compound the financial loss: FDA 21 CFR Part 11, WHO GDP Guidelines, and EU GMP Annex 15 all require documented excursion response — and "we found out at delivery" is not compliant.

### 3. Fleet Assets Sit Idle While Routes Are Overloaded

During a disruption, the same network that has shipments stuck at an affected node typically has trucks, containers, or vessels sitting idle at other nodes — unassigned, unknown, or waiting for routing instructions. Manual asset tracking means redeployment decisions are made hours after the optimal window, with no systematic view of proximity, capacity, or cost-benefit.

### 4. Why Existing Solutions Don't Solve It

- **TMS/ERP systems** are records systems — they show what happened, not what should happen next
- **Manual monitoring** doesn't scale: one operations manager cannot track 200+ simultaneous shipments during a crisis
- **Reactive alerting** (carrier emails, port authority feeds) provides raw signals with no prioritization, risk classification, or recommended action
- **Siloed data** (shipment data in TMS, fleet data in fleet management, sensor data in IoT platform, disruption data from external feeds) means no system has the full picture

---

## Why This Problem Matters Now

- Global supply chain disruption frequency has increased 3× since 2020 (COVID, Suez Canal, port strikes, geopolitical tensions)
- Cold-chain logistics is the fastest-growing segment of the global supply chain market (~$340B by 2027)
- Regulatory requirements for cold-chain compliance are tightening globally (WHO GDP, EU Falsified Medicines Directive, FDA DSCSA)
- Enterprises are investing in AI operations tools that can act on data, not just display it

---

## Quantified Pain (Industry Benchmarks)

| Metric | Industry Average |
|--------|-----------------|
| Manual impact assessment time per disruption | 4–24 hours |
| Cold-chain shipment loss rate (undetected excursions) | 2–7% of annual cold-chain volume |
| Fleet idle rate during disruption events | 15–30% of available assets |
| Customer SLA violation rate during major disruptions | 20–45% of affected shipments |
| Average cost of a major cold-chain excursion | $350K–$800K (cargo + regulatory) |
