/* Recovery Plan View */
'use strict';

window.renderView_recovery = (function(){
  let planGenerated = false;
  let kpiChart = null;

  function render(){
    const el = document.getElementById('view-recovery');

    el.innerHTML = `
<div class="page-header">
  <div class="page-header-text">
    <h1>Recovery Plan Generator</h1>
    <p>AI-generated executive recovery plan from current operational state</p>
  </div>
  ${!planGenerated?`<button class="btn btn-primary" id="gen-plan-btn" onclick="window._generatePlan()">📋 Generate Recovery Plan</button>`
   :`<div style="display:flex;gap:8px">
      <button class="btn btn-ghost" onclick="window._printPlan()">🖨 Print / Export</button>
      <button class="btn btn-ghost" onclick="window._regenerate()">↺ Regenerate</button>
    </div>`}
</div>

${!planGenerated ? renderPromptState() : renderPlan()}
`;

    if(planGenerated && !kpiChart){
      setTimeout(()=>mountKpiChart(), 100);
    }

    window._generatePlan = ()=>{ planGenerated=true; render(); };
    window._regenerate   = ()=>{ planGenerated=false; kpiChart=null; render(); };
    window._printPlan    = ()=>window.print();
  }

  function renderPromptState(){
    const s = APP_STATE;
    const crit = s.shipments.filter(x=>x.risk==='CRITICAL').length;
    const high = s.shipments.filter(x=>x.risk==='HIGH').length;
    const breach = s.sensorStreams.filter(x=>x.inBreach).length;
    const idle = s.fleet.filter(x=>x.status==='IDLE').length;
    const val = s.shipments.filter(x=>['CRITICAL','HIGH'].includes(x.risk)).reduce((a,x)=>a+x.value,0);
    return `
<div class="card" style="text-align:center;padding:48px 32px">
  <div style="font-size:48px;margin-bottom:16px">📋</div>
  <h2 style="margin-bottom:8px">Generate Executive Recovery Plan</h2>
  <p style="color:var(--muted);max-width:480px;margin:0 auto 24px">
    Analyzes all active disruptions, affected shipments, cold-chain breaches, and fleet status to produce a structured recovery action plan.
  </p>
  <div class="grid-4" style="max-width:600px;margin:0 auto 28px;gap:12px">
    <div class="kpi-card red">    <div class="kpi-label">Critical</div><div class="kpi-value">${crit}</div></div>
    <div class="kpi-card orange"> <div class="kpi-label">High Risk</div><div class="kpi-value">${high}</div></div>
    <div class="kpi-card red">    <div class="kpi-label">Breaches</div><div class="kpi-value">${breach}</div></div>
    <div class="kpi-card green">  <div class="kpi-label">Idle Fleet</div><div class="kpi-value">${idle}</div></div>
  </div>
  <p style="color:var(--muted);font-size:13px;margin-bottom:24px">Total cargo value at risk: <strong style="color:var(--orange)">${APP_STATE.fmtCur(val)}</strong></p>
  <button class="btn btn-primary" style="padding:12px 32px;font-size:15px" onclick="window._generatePlan()">📋 Generate Plan Now</button>
</div>
`;
  }

  function renderPlan(){
    const s   = APP_STATE;
    const now = new Date();
    const critical = s.shipments.filter(x=>x.risk==='CRITICAL').slice(0,6);
    const high     = s.shipments.filter(x=>x.risk==='HIGH').slice(0,6);
    const breached = s.sensorStreams.filter(x=>x.inBreach);
    const idle     = s.fleet.filter(x=>x.status==='IDLE').slice(0,5);
    const val      = s.shipments.filter(x=>['CRITICAL','HIGH'].includes(x.risk)).reduce((a,x)=>a+x.value,0);
    const reroutes = s.reroutes.length;

    return `
<div class="recovery-plan">
  <!-- HEADER -->
  <div class="recovery-header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:12px;color:var(--accent);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">CONFIDENTIAL — Executive Use Only</div>
        <h2>Supply Chain Disruption Recovery Plan</h2>
        <div class="meta" style="margin-top:8px">Generated: ${now.toLocaleString()} &nbsp;·&nbsp; Supply Chain Dashboard v1.0 &nbsp;·&nbsp; Auto-generated from live operational data</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;color:var(--muted)">Incident Level</div>
        <span class="badge badge-critical" style="font-size:14px;padding:6px 14px">CRITICAL</span>
      </div>
    </div>
  </div>

  <!-- SECTION 1: EXECUTIVE SUMMARY -->
  <div class="recovery-section">
    <h3>1. Executive Summary</h3>
    <div class="grid-4 mb-16">
      <div class="kpi-card red">    <div class="kpi-label">Active Disruptions</div><div class="kpi-value">${s.disruptions.length}</div></div>
      <div class="kpi-card orange"> <div class="kpi-label">Affected Shipments</div><div class="kpi-value">${s.shipments.filter(x=>x.affectedBy).length}</div></div>
      <div class="kpi-card red">    <div class="kpi-label">Cold-Chain Breaches</div><div class="kpi-value">${breached.length}</div></div>
      <div class="kpi-card purple"> <div class="kpi-label">Value at Risk</div><div class="kpi-value" style="font-size:16px">${APP_STATE.fmtCur(val)}</div></div>
    </div>
    <p style="font-size:13px;line-height:1.8;color:var(--muted)">
      As of <strong style="color:var(--text)">${now.toLocaleString()}</strong>, the supply chain network is experiencing 
      <strong style="color:var(--text)">${s.disruptions.length} concurrent disruptions</strong> — including 
      <strong style="color:var(--red)">${s.disruptions.filter(d=>d.severity==='CRITICAL').length} CRITICAL severity events</strong> 
      (${s.disruptions.filter(d=>d.severity==='CRITICAL').map(d=>d.type+' at '+d.hub).join('; ')}).
      A total of <strong style="color:var(--text)">${s.shipments.filter(x=>x.affectedBy).length} shipments</strong> are disruption-affected.
      <strong style="color:var(--red)">${critical.length} CRITICAL-risk shipments</strong> require immediate intervention — 
      ${critical.filter(x=>x.coldChain).length} carrying temperature-sensitive cargo (vaccines, pharmaceuticals, perishables).
      <strong style="color:var(--text)">${breached.length} cold-chain excursions</strong> are active with 
      ${breached.filter(x=>x.severity==='EMERGENCY').length} classified as EMERGENCY-level.
      Total estimated cargo value at risk: <strong style="color:var(--orange)">${APP_STATE.fmtCur(val)}</strong>.
    </p>
  </div>

  <!-- SECTION 2: DISRUPTION STATUS -->
  <div class="recovery-section">
    <h3>2. Active Disruption Status</h3>
    <table class="action-matrix">
      <thead><tr><th>ID</th><th>Type</th><th>Hub</th><th>Severity</th><th>Ships Impacted</th><th>Est. Resolution</th></tr></thead>
      <tbody>
        ${s.disruptions.map(d=>`
          <tr>
            <td><strong>${d.id}</strong></td>
            <td>${d.type}</td>
            <td>${d.hub}</td>
            <td><span class="badge badge-${d.severity.toLowerCase()}">${d.severity}</span></td>
            <td style="font-weight:700">${d.shipmentsImpacted}</td>
            <td>${d.expectedResolution}h</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- SECTION 3: SHIPMENT ACTION MATRIX -->
  <div class="recovery-section">
    <h3>3. Shipment Action Matrix — CRITICAL Priority</h3>
    <table class="action-matrix">
      <thead><tr><th>Shipment</th><th>Cargo</th><th>Route</th><th>Risk</th><th>ETA</th><th>Value</th><th>Recommended Action</th></tr></thead>
      <tbody>
        ${critical.map(sh=>`
          <tr>
            <td><strong>${sh.id}</strong></td>
            <td>${sh.cargo} ${sh.coldChain?'🌡':''}</td>
            <td style="font-size:11px">${sh.origin} → ${sh.destination}</td>
            <td><span class="badge badge-critical">CRITICAL</span></td>
            <td>${sh.etaHours}h</td>
            <td>${APP_STATE.fmtCur(sh.value)}</td>
            <td style="font-size:12px">${sh.coldChain?'Emergency cold-chain reroute via reefer carrier':'Reroute via alternative hub — approve within 2h'}</td>
          </tr>
        `).join('')}
        ${high.map(sh=>`
          <tr>
            <td><strong>${sh.id}</strong></td>
            <td>${sh.cargo} ${sh.coldChain?'🌡':''}</td>
            <td style="font-size:11px">${sh.origin} → ${sh.destination}</td>
            <td><span class="badge badge-high">HIGH</span></td>
            <td>${sh.etaHours}h</td>
            <td>${APP_STATE.fmtCur(sh.value)}</td>
            <td style="font-size:12px">Review rerouting options — action within 4h</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- SECTION 4: COLD-CHAIN INTERVENTIONS -->
  ${breached.length>0?`
  <div class="recovery-section">
    <h3>4. Cold-Chain Intervention Plan</h3>
    <div style="background:rgba(248,81,73,.06);border:1px solid rgba(248,81,73,.2);border-radius:6px;padding:12px;margin-bottom:14px;font-size:13px;color:var(--muted)">
      ⚠ <strong style="color:var(--red)">${breached.filter(x=>x.severity==='EMERGENCY').length} EMERGENCY excursions</strong> detected. 
      WHO GDP and FDA 21 CFR Part 11 require documented incident response within 24h.
    </div>
    <table class="action-matrix">
      <thead><tr><th>Sensor ID</th><th>Cargo</th><th>Current Temp</th><th>Range</th><th>Severity</th><th>Duration</th><th>Action Required</th></tr></thead>
      <tbody>
        ${breached.map(b=>`
          <tr>
            <td><strong>${b.sensorId}</strong></td>
            <td>${b.cargo}</td>
            <td style="color:var(--red);font-weight:700">${b.current}°C</td>
            <td>${b.tempMin}–${b.tempMax}°C</td>
            <td><span class="badge badge-${b.severity==='EMERGENCY'?'critical':'warn'}">${b.severity}</span></td>
            <td>${b.breachDuration}m</td>
            <td style="font-size:12px">${b.severity==='EMERGENCY'?'Immediate cargo transfer + regulatory notification':'Monitor — if >30min, initiate carrier alert'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`:''}

  <!-- SECTION 5: FLEET DEPLOYMENT ORDERS -->
  <div class="recovery-section">
    <h3>${breached.length>0?'5':'4'}. Fleet Redeployment Orders</h3>
    <table class="action-matrix">
      <thead><tr><th>Asset ID</th><th>Type</th><th>Location</th><th>Idle (h)</th><th>Cold Chain</th><th>Deployment Order</th></tr></thead>
      <tbody>
        ${idle.map(a=>`
          <tr>
            <td><strong>${a.id}</strong></td>
            <td>${a.type}</td>
            <td>${a.location}</td>
            <td style="color:var(--yellow)">${a.idleSince}h</td>
            <td>${a.coldChain?'✅':'—'}</td>
            <td style="font-size:12px">
              ${APP_STATE.disruptions.some(d=>d.hub===a.location)?
                `Dispatch to disruption hub ${a.location} — critical priority`:
                `Pre-position to nearest disruption zone: ${APP_STATE.disruptions[0].hub}`}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- SECTION 6: KPI IMPACT -->
  <div class="recovery-section">
    <h3>${breached.length>0?'6':'5'}. KPI Impact Projection</h3>
    <div class="grid-1-2">
      <div>
        <div class="chart-wrap" style="height:200px"><canvas id="kpi-impact-chart"></canvas></div>
      </div>
      <div>
        <div style="font-size:13px;line-height:1.9;color:var(--muted)">
          <div>📈 <strong style="color:var(--text)">Response Time:</strong> Target &lt;30min vs. current 4–24h manual process</div>
          <div>📦 <strong style="color:var(--text)">SLA Compliance:</strong> Projected +18% improvement on affected shipments</div>
          <div>🌡 <strong style="color:var(--text)">Cold-Chain Save Rate:</strong> 85% estimated vs. 0% at-delivery discovery</div>
          <div>🚛 <strong style="color:var(--text)">Fleet Utilization:</strong> +${APP_STATE.rnd(8,15)}% via idle asset redeployment</div>
          <div>💰 <strong style="color:var(--text)">Cargo Loss Reduction:</strong> Est. ${APP_STATE.fmtCur(APP_STATE.rnd(200,600)*1000)} savings this incident</div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 7: 72-HOUR TIMELINE -->
  <div class="recovery-section">
    <h3>${breached.length>0?'7':'6'}. 72-Hour Recovery Timeline</h3>
    ${[
      { color:'var(--red)', time:'0–2h', text:'Approve CRITICAL shipment reroutes ('+critical.length+' shipments). Notify cold-chain carrier of '+breached.length+' active excursions.' },
      { color:'var(--orange)', time:'2–6h', text:'Deploy '+idle.slice(0,3).length+' idle fleet assets to disruption hubs. Implement HIGH-risk rerouting decisions.' },
      { color:'var(--yellow)', time:'6–24h', text:'Monitor all rerouted shipments for secondary disruption. File regulatory excursion reports for EMERGENCY cold-chain breaches.' },
      { color:'var(--accent)', time:'24–48h', text:'Reassess MEDIUM-risk shipments. Update ETA communications to customers. Review carrier performance.' },
      { color:'var(--green)', time:'48–72h', text:'Verify cargo delivery for CRITICAL shipments. Close incident reports. Update carrier reliability scores.' },
    ].map(t=>`
      <div class="timeline-item">
        <div class="timeline-dot" style="background:${t.color}"></div>
        <div class="timeline-time">${t.time}</div>
        <div class="timeline-text">${t.text}</div>
      </div>
    `).join('')}
  </div>

  <!-- FOOTER -->
  <div class="recovery-section" style="background:var(--surface2);border-top:2px solid var(--border)">
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--muted)">
      <div>Generated by <strong style="color:var(--accent)">Supply Chain Dashboard</strong> · ChainMind AI · ${now.toLocaleString()}</div>
      <div>Next review: +6 hours from generation</div>
    </div>
  </div>
</div>
`;
  }

  function mountKpiChart(){
    const ctx = document.getElementById('kpi-impact-chart');
    if(!ctx) return;
    if(kpiChart) kpiChart.destroy();
    kpiChart = new Chart(ctx,{
      type:'bar',
      data:{
        labels:['Response Time','SLA Compliance','Cold-Chain Save','Fleet Util.','Cost Savings'],
        datasets:[
          { label:'Before', data:[100,55,0,62,0], backgroundColor:'rgba(248,81,73,.5)', borderRadius:3 },
          { label:'After',  data:[10,73,85,74,100], backgroundColor:'rgba(63,185,80,.5)', borderRadius:3 },
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ color:'#8b949e', boxWidth:12, font:{size:11} } } },
        scales:{
          x:{ ticks:{ color:'#8b949e', font:{size:10} }, grid:{ display:false } },
          y:{ ticks:{ color:'#8b949e' }, grid:{ color:'rgba(48,54,61,.5)' }, beginAtZero:true, max:100,
              title:{ display:true, text:'Score / Index', color:'#8b949e', font:{size:11} } },
        }
      }
    });
  }

  return render;
})();
