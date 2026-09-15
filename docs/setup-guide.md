# Setup Guide — SupplyGuard AI

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Modern web browser | Chrome 90+, Firefox 88+, Edge 90+ | Run the application |
| Python (optional) | 3.7+ | Local development server |
| Node.js (optional) | 16+ | Alternative local server |

**No npm install. No build step. No environment variables required for the demo.**

---

## Quick Start (30 seconds)

### Option A — Open Directly in Browser (Simplest)

```bash
# Navigate to the src directory
cd bob-ai-hackathon-supplyguard/src

# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

> ⚠️ **Note:** Some browsers restrict ES module imports when opening `file://` URLs directly. If the app appears blank, use Option B or C instead.

---

### Option B — Python Local Server (Recommended)

```bash
cd bob-ai-hackathon-supplyguard/src

# Python 3
python -m http.server 8080

# Python 2 (fallback)
python -m SimpleHTTPServer 8080
```

Open your browser at: **http://localhost:8080**

---

### Option C — Node.js Local Server

```bash
cd bob-ai-hackathon-supplyguard/src

# Install serve globally (one time)
npm install -g serve

# Start server
serve . -p 3000
```

Open your browser at: **http://localhost:3000**

---

## Verifying It Works

Once the page loads, you should see:

1. ✅ A dark-themed sidebar with 8 navigation items
2. ✅ The **Dashboard** view with 6 KPI cards showing live numbers
3. ✅ A pulsing green "Live Monitoring Active" indicator in the sidebar
4. ✅ Numbers on the dashboard updating every ~5 seconds (live simulation)
5. ✅ A notification bell with an active alert count

If any of these are missing, check the **Troubleshooting** section below.

---

## Demo Walkthrough

Follow this sequence to see all features:

| Step | View | What to Do |
|------|------|-----------|
| 1 | Dashboard | Review KPI cards and the live trend chart |
| 2 | Disruptions | Click any disruption row to see its detail panel |
| 3 | Affected Shipments | Use the risk filter (CRITICAL / HIGH) to see worst-affected cargo |
| 4 | Rerouting | Click "View Alternatives" on any HIGH/CRITICAL shipment |
| 5 | Fleet Assets | Click "Redeploy" on an IDLE asset |
| 6 | Cold Chain | Watch live temperature charts — observe a breach trigger |
| 7 | AI Copilot | Type: "How many critical shipments are affected?" |
| 8 | Recovery Plan | Click "Generate Recovery Plan" and review the output |

---

## Environment Variables

No environment variables are needed for the demo. The `.env.example` file lists variables that would be needed for a production deployment with live API integrations.

See `src/.env.example` for details.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank page after opening `index.html` | Browser blocks `file://` imports | Use Python or Node server (Options B/C) |
| Charts not rendering | Chart.js CDN blocked | Ensure internet access, or download Chart.js locally and update the `<script>` tag |
| "APP_STATE is not defined" in console | Scripts loaded out of order | Ensure `data.js` is loaded before view scripts — check `index.html` |
| Sidebar navigation doesn't switch views | JavaScript error on load | Open browser DevTools (F12) → Console tab, share the error |
| Numbers not updating | Simulation loop not starting | Check console for errors; hard-refresh with Ctrl+Shift+R |

---

## File Structure

```
src/
├── index.html          ← Entry point
├── style.css           ← All styles (single file)
├── data.js             ← Simulated data + state engine
├── app.js              ← Router, nav, alerts, modal
├── views/
│   ├── dashboard.js    ← KPI overview
│   ├── disruptions.js  ← Active disruption list
│   ├── shipments.js    ← Affected shipment analysis
│   ├── rerouting.js    ← Rerouting recommendations
│   ├── fleet.js        ← Fleet asset optimizer
│   ├── coldchain.js    ← Cold-chain IoT monitoring
│   ├── copilot.js      ← AI Copilot chat
│   └── recovery.js     ← Recovery plan generator
└── .env.example        ← Production env var template
```
