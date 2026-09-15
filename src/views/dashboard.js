/* Dashboard View — Dark Theme */
'use strict';

window.renderView_dashboard = (function(){
  let trendChart = null;
  let riskChart  = null;
  let tickHandler = null;

  function kpiData(){
    const s = APP_STATE;
    const crit  = s.shipments.filter(x=>x.risk==='CRITICAL').length;
    const high  = s.shipments.filter(x=>x.risk==='HIGH').length;
    const breach= s.sensorStreams.filter(x=>x.warningActive).length;
    const idle  = s.fleet.filter(x=>x.status==='IDLE').length;
    const total = s.shipments.filter(x=>x.affectedBy).length;
    const value = s.shipments.filter(x=>['CRITICAL','HIGH'].includes(x.risk)).reduce((a,x)=>a+x.value,0);
    const spikes= s.sensorStreams.filter(x=>x.spike).length;
    return { crit, high, breach, idle, total, value, spikes };
  }

  function fmtValueK(n){
    if(n>=1e9) return '$'+(n/1e9).toFixed(1)+'B';
    if(n>=1e6) return '$'+(n/1e6).toFixed(1)+'M';
    return '$'+(n/1e3).toFixed(0)+'K';
  }

  function updateKpis(){
    const k = kpiData();
    const ids = {
      'kpi-crit': k.crit, 'kpi-high': k.high, 'kpi-idle': k.idle,
      'kpi-breach': k.breach, 'kpi-total': k.total, 'kpi-spikes': k.spikes,
      'kpi-val': fmtValueK(k.value),
    };
    Object.entries(ids).forEach(([id,val])=>{
      const el = document.getElementById(id);
      if(el) el.textContent = val;
    });
  }

  function render(){
    const el = document.getElementById('view-dashboard');
    const k  = kpiData();
    const s  = APP_STATE;

    el.innerHTML = `
<!-- Page Header -->
<div class="page-header">
  <div class="page-header-text">
    <h1>Supply Chain Dashboard</h1>
    <p>Real-time operations overview — ${s.disruptions.length} active disruptions · ${s.shipments.filter(x=>x.affectedBy).length} affected shipments</p>
  </div>
  <div style="display:flex;gap:8px;align-items:center">
    <div style="width:8px;height:8px;border-radius:50%;background:var(--teal);animation:livePulse 1.4s infinite"></div>
    <span style="font-size:12px;color:var(--muted)">Live Monitoring Active</span>
  </div>
</div>

<!-- KPI Grid -->
<div class="kpi-grid" style="grid-template-columns:repeat(6,1fr);margin-bottom:24px">
  <div class="kpi-card red">
    <div class="kpi-label">Critical Shipments</div>
    <div class="kpi-value" id="kpi-crit">${k.crit}</div>
    <div class="kpi-sub">Immediate action</div>
  </div>
  <div class="kpi-card orange">
    <div class="kpi-label">High Risk</div>
    <div class="kpi-value" id="kpi-high">${k.high}</div>
    <div class="kpi-sub">Action within 4h</div>
  </div>
  <div class="kpi-card blue">
    <div class="kpi-label">Total Affected</div>
    <div class="kpi-value" id="kpi-total">${k.total}</div>
    <div class="kpi-sub">All disruption-impacted</div>
  </div>
  <div class="kpi-card teal">
    <div class="kpi-label">Idle Assets</div>
    <div class="kpi-value" id="kpi-idle">${k.idle}</div>
    <div class="kpi-sub">Available for deploy</div>
  </div>
  <div class="kpi-card ${k.breach>0?'red':'green'}">
    <div class="kpi-label">Cold-Chain Warnings</div>
    <div class="kpi-value" id="kpi-breach">${k.breach}</div>
    <div class="kpi-sub">${k.breach>0?'Active excursions':'All nominal'}</div>
  </div>
  <div class="kpi-card purple">
    <div class="kpi-label">Temp Spikes</div>
    <div class="kpi-value" id="kpi-spikes">${k.spikes}</div>
    <div class="kpi-sub">Drastic changes</div>
  </div>
</div>

<!-- Charts row -->
<div class="grid-2" style="margin-bottom:20px">
  <div class="card">
    <div class="card-title">Risk Trend (last 30s)</div>
    <div class="chart-wrap" style="height:180px"><canvas id="trend-chart"></canvas></div>
  </div>
  <div class="card">
    <div class="card-title">Shipment Risk Distribution</div>
    <div class="chart-wrap" style="height:180px"><canvas id="risk-chart"></canvas></div>
  </div>
</div>

<!-- Value at Risk + Quick links -->
<div class="grid-2-1" style="margin-bottom:20px">
  <div class="card">
    <div class="card-title">Active Disruptions</div>
    ${s.disruptions.map(d=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-weight:700;font-size:13px">${d.type}</div>
          <div style="font-size:11px;color:var(--muted);font-family:var(--mono)">${d.hub} · ${d.shipmentsImpacted} shipments · ~${d.expectedResolution}h to resolve</div>
        </div>
        <span class="badge badge-${d.severity.toLowerCase()}">${d.severity}</span>
      </div>
    `).join('')}
    <button class="btn btn-ghost btn-sm mt-12" onclick="window.switchView('disruptions')">View All Disruptions →</button>
  </div>

  <div>
    <div class="card" style="margin-bottom:12px">
      <div class="card-title">Value at Risk</div>
      <div style="font-size:32px;font-weight:700;font-family:var(--mono);color:var(--orange);margin-bottom:4px" id="kpi-val">${fmtValueK(k.value)}</div>
      <div style="font-size:12px;color:var(--muted)">CRITICAL + HIGH shipments</div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="window.switchView('recovery')">Generate Recovery Plan</button>
        <button class="btn btn-ghost btn-sm" onclick="window.switchView('rerouting')">Rerouting</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Cold-Chain Status</div>
      ${s.sensorStreams.slice(0,5).map(s2=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:11px;font-family:var(--mono);font-weight:600">${s2.shipmentId} — ${s2.cargo}</div>
          <div style="text-align:right">
            <span style="font-weight:700;font-family:var(--mono);color:${s2.warningActive?'var(--red)':'var(--teal)'}">${s2.current}°C</span>
            <span class="badge badge-${s2.warningActive?(s2.severity==='EMERGENCY'?'critical':'warn'):s2.inBreach?'info':'ok'}" style="font-size:9px;margin-left:6px">${s2.severity}</span>
          </div>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm mt-8" onclick="window.switchView('coldchain')">Cold Chain Monitor →</button>
    </div>
  </div>
</div>
`;

    // Charts
    setTimeout(()=>{
      const tctx = document.getElementById('trend-chart');
      const rctx = document.getElementById('risk-chart');

      if(tctx){
        if(trendChart) trendChart.destroy();
        const labels = Array.from({length:30},(_,i)=>'-'+(29-i)+'s');
        const critHistory = Array.from({length:30},()=>kpiData().crit + APP_STATE.rnd(-2,2));
        const highHistory = Array.from({length:30},()=>kpiData().high + APP_STATE.rnd(-3,3));
        trendChart = new Chart(tctx,{
          type:'line',
          data:{
            labels,
            datasets:[
              { label:'CRITICAL', data:critHistory, borderColor:'#f85149', backgroundColor:'rgba(248,81,73,.06)', tension:.4, fill:true, pointRadius:0 },
              { label:'HIGH',     data:highHistory, borderColor:'#f0883e', backgroundColor:'rgba(240,136,62,.06)', tension:.4, fill:true, pointRadius:0 },
            ]
          },
          options:{
            responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{ labels:{ color:'#8b949e', boxWidth:12, font:{size:11} } } },
            scales:{
              x:{ ticks:{ color:'#6e7681', font:{size:9}, maxTicksLimit:6 }, grid:{ color:'rgba(48,54,61,.6)' } },
              y:{ ticks:{ color:'#6e7681', font:{size:10} }, grid:{ color:'rgba(48,54,61,.6)' }, beginAtZero:true },
            }
          }
        });
      }

      if(rctx){
        if(riskChart) riskChart.destroy();
        const counts = ['CRITICAL','HIGH','MEDIUM','LOW'].map(r=>APP_STATE.shipments.filter(x=>x.risk===r).length);
        riskChart = new Chart(rctx,{
          type:'doughnut',
          data:{
            labels:['CRITICAL','HIGH','MEDIUM','LOW'],
            datasets:[{ data:counts, backgroundColor:['#f85149','#f0883e','#d29922','#3fb950'], borderWidth:0, borderRadius:4 }]
          },
          options:{
            responsive:true, maintainAspectRatio:false,
            plugins:{
              legend:{ labels:{ color:'#8b949e', boxWidth:12, font:{size:11} } },
              tooltip:{ callbacks:{ label: c=>' '+c.label+': '+c.raw } }
            },
            cutout:'60%',
          }
        });
      }
    }, 50);

    if(tickHandler) window.removeEventListener('sg:tick', tickHandler);
    tickHandler = updateKpis;
    window.addEventListener('sg:tick', tickHandler);
  }

  return render;
})();
