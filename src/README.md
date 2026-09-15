# Source Code — Supply Chain Dashboard

## Layout

```
src/
├── index.html          ← Entry point — single-page application shell
├── style.css           ← Complete design system (dark theme, component library)
├── data.js             ← All simulated data + real-time state engine
├── app.js              ← Router, navigation, alert panel, modal manager
├── views/
│   ├── dashboard.js    ← KPI overview: live counts, trend charts, mini map
│   ├── disruptions.js  ← Active disruption list with severity classification
│   ├── shipments.js    ← Affected shipment risk analysis (CRITICAL→LOW)
│   ├── rerouting.js    ← Rerouting recommendations with cost/delay comparison
│   ├── fleet.js        ← Fleet asset scanner + redeployment optimizer
│   ├── coldchain.js    ← Live IoT temperature streams + excursion detection
│   ├── copilot.js      ← Natural-language AI Copilot (intent-based)
│   └── recovery.js     ← Executive recovery plan generator
└── .env.example        ← Production environment variable template
```

## No Build Step Required

Open `index.html` in a browser or serve with any static file server. See `../docs/setup-guide.md` for instructions.

## Architecture Decisions

- **Zero dependencies** except Chart.js (loaded via CDN) — no npm, no webpack
- **Shared state** via `window.APP_STATE` object mutated by the simulation loop
- **Views** are render functions that write to their designated `<div id="view-*">` containers
- **Simulation** runs on `setInterval` — sensor data, disruption progression, shipment status
