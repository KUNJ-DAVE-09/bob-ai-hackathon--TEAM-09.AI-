/* Affected Shipments View — with Route Map */
'use strict';

window.renderView_shipments = (function(){
  let activeFilter = 'ALL';
  let searchQ = '';
  let shipMap = null;

  function riskBadge(r){ return `<span class="badge badge-${r.toLowerCase()}">${r}</span>`; }
  function statusColor(s){ return s==='DELAYED'?'var(--red)':s==='AT_RISK'?'var(--orange)':s==='DIVERTED'?'var(--yellow)':'var(--green)'; }

  function fmtValue(sh){
    if(!sh.value) return '—';
    const cur = sh.currency || { symbol:'$', code:'USD', rate:1 };
    return `${cur.symbol}${Math.round(sh.value*cur.rate).toLocaleString(undefined,{maximumFractionDigits:0})} ${cur.code}`;
  }

  function renderShipmentModal(sh){
    const coldInfo = sh.coldChain?`
      <div class="card mt-12" style="border-color:${sh.risk==='CRITICAL'?'var(--red)':'var(--border)'}">
        <div class="card-title" style="color:var(--accent)">🌡 Cold-Chain Details</div>
        <div class="grid-2">
          <div><div class="kpi-label">Temp Range</div><strong>${sh.tempMin}°C – ${sh.tempMax}°C</strong></div>
          <div><div class="kpi-label">Regulator</div><strong>${sh.regulator}</strong></div>
          <div><div class="kpi-label">Alert Mode</div><strong>${sh.immediateAlert?'⚡ Immediate (no buffer)':'⏱ 15-min buffer'}</strong></div>
        </div>
      </div>`:'';

    const reroutes = APP_STATE.reroutes.find(r=>r.shipmentId===sh.id);
    const rerouteSection = reroutes?`
      <div class="mt-16">
        <div class="card-title">Rerouting Options Available</div>
        ${reroutes.options.map(o=>`
          <div class="route-card ${o.recommended?'recommended':''}" style="margin-bottom:8px">
            <div class="route-header">
              <div class="route-name">${o.carrier}</div>
              <span class="badge badge-${o.score>85?'ok':o.score>70?'warn':'danger'}">${o.score}% score</span>
            </div>
            <div style="font-size:12px;color:var(--muted);margin-bottom:8px">${o.route}</div>
            <div class="route-stats">
              <div class="route-stat"><span class="route-stat-label">Delay:</span><span class="route-stat-val">+${o.delay}h</span></div>
              <div class="route-stat"><span class="route-stat-label">Cost delta:</span><span class="route-stat-val" style="color:${o.costDelta>0?'var(--red)':'var(--green)'}">${o.costDelta>0?'+':''}${APP_STATE.fmtCur(o.costDelta)}</span></div>
              <div class="route-stat"><span class="route-stat-label">Cold-chain:</span><span class="route-stat-val">${o.coldChain?'✅':'❌'}</span></div>
            </div>
          </div>
        `).join('')}
      </div>`:'';

    window.openModal(`
      <h2 style="margin-bottom:4px">${sh.id}${sh.trackerId?` <span style="font-family:monospace;font-size:12px;color:var(--muted)">${sh.trackerId}</span>`:''}</h2>
      <p style="color:var(--muted);font-size:13px;margin-bottom:16px">${sh.origin} → ${sh.destination} &nbsp;·&nbsp; ${sh.carrier}</p>
      <div class="grid-2 gap-12" style="margin-bottom:16px">
        <div><div class="kpi-label">Risk</div>${riskBadge(sh.risk)}</div>
        <div><div class="kpi-label">Status</div><span style="font-weight:700;color:${statusColor(sh.status)}">${sh.status}</span></div>
        <div><div class="kpi-label">Cargo</div><strong>${sh.cargo}</strong></div>
        <div><div class="kpi-label">Priority</div>${riskBadge(sh.priority)}</div>
        <div><div class="kpi-label">ETA</div><strong>${sh.etaHours}h</strong></div>
        <div><div class="kpi-label">Cargo Value</div><strong>${fmtValue(sh)}</strong></div>
        <div><div class="kpi-label">Vehicle / Tracker</div><strong>${sh.vehicleId}</strong></div>
        <div><div class="kpi-label">Disruption</div><span class="badge badge-danger">${sh.affectedBy||'—'}</span></div>
        <div><div class="kpi-label">Transport Mode</div><strong>${{road:'🚚 Road',air:'✈️ Air',ship:'🚢 Sea'}[sh.transportMode]||sh.transportMode||'—'}</strong></div>
        <div><div class="kpi-label">Currency</div><strong>${sh.currency?.code||'USD'}</strong></div>
      </div>
      <div class="card"><div class="kpi-label">Route</div><div style="font-size:13px;margin-top:4px">${sh.route}</div></div>
      ${coldInfo}
      ${rerouteSection}
      <div class="flex gap-8 mt-16">
        ${reroutes?`<button class="btn btn-primary" onclick="window.switchView('rerouting');window.closeModal()">View Full Rerouting</button>`:''}
        <button class="btn btn-ghost" onclick="window.closeModal()">Close</button>
      </div>
    `);
  }

  function filteredShipments(){
    return APP_STATE.shipments
      .filter(s=>s.affectedBy)
      .filter(s=> activeFilter==='ALL' || s.risk===activeFilter)
      .filter(s=> !searchQ || s.id.toLowerCase().includes(searchQ) || s.cargo.toLowerCase().includes(searchQ) || s.origin.toLowerCase().includes(searchQ) || s.destination.toLowerCase().includes(searchQ));
  }

  function renderTable(){
    const list = filteredShipments();
    document.getElementById('ship-count').textContent = list.length+' shipments';
    const tbody = document.getElementById('ship-tbody');
    if(!tbody) return;
    tbody.innerHTML = list.slice(0,60).map((sh,i)=>`
      <tr class="clickable" onclick="window._openShipment(${APP_STATE.shipments.indexOf(sh)})">
        <td><strong>${sh.id}</strong></td>
        <td>${sh.origin}</td>
        <td>${sh.destination}</td>
        <td>${sh.cargo} ${sh.coldChain?'🌡':''}</td>
        <td>${riskBadge(sh.risk)}</td>
        <td style="color:${statusColor(sh.status)};font-weight:600">${sh.status}</td>
        <td>${sh.etaHours}h</td>
        <td style="font-size:12px">${fmtValue(sh)}</td>
        <td>${sh.carrier.split(' ')[0]}</td>
        <td><span class="badge badge-danger">${sh.affectedBy}</span></td>
      </tr>
    `).join('');
  }

  function mountShipmentMap(list){
    const el = document.getElementById('shipment-route-map');
    if(!el || !window.L) return;
    if(shipMap){ shipMap.remove(); shipMap=null; }

    shipMap = L.map('shipment-route-map', { zoomControl:true, attributionControl:false }).setView([20,70], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(shipMap);

    // Plot disruption zones
    APP_STATE.disruptions.forEach(d=>{
      if(d.lat == null) return;
      const color = d.severity==='CRITICAL'?'#f85149':d.severity==='HIGH'?'#f0883e':'#d29922';
      L.circle([d.lat, d.lng], { color, fillColor:color, fillOpacity:0.1, weight:1, radius:d.shipmentsImpacted*2500 }).addTo(shipMap);
    });

    // Plot shipment routes
    list.slice(0,80).forEach(sh=>{
      if(sh.originLat == null || sh.destLat == null) return;
      const color = sh.risk==='CRITICAL'?'#f85149':sh.risk==='HIGH'?'#f0883e':sh.risk==='MEDIUM'?'#d29922':'#3fb950';
      const modeIcon = sh.transportMode==='air'?'✈️':sh.transportMode==='ship'?'🚢':'🚚';

      // Origin → Dest line
      L.polyline([[sh.originLat,sh.originLng],[sh.destLat,sh.destLng]], {
        color, weight:1.5, opacity:0.6,
        dashArray: sh.transportMode==='air'?'5,5':undefined,
      }).addTo(shipMap);

      // Origin marker
      L.circleMarker([sh.originLat,sh.originLng], { radius:3, color:'#8b949e', fillColor:'#8b949e', fillOpacity:0.6, weight:0 }).addTo(shipMap);

      // Current position
      const divIcon = L.divIcon({
        html:`<div style="font-size:11px;line-height:1">${modeIcon}</div>`,
        className:'', iconSize:[16,16], iconAnchor:[8,8],
      });
      L.marker([sh.currentLat, sh.currentLng], { icon:divIcon })
        .addTo(shipMap)
        .bindTooltip(`${sh.id} · ${sh.cargo} · ${sh.risk}`, { direction:'top', offset:[0,-4] });

      // Destination marker
      L.circleMarker([sh.destLat,sh.destLng], { radius:4, color, fillColor:color, fillOpacity:0.9, weight:1 }).addTo(shipMap);
    });
  }

  function render(){
    const el = document.getElementById('view-shipments');
    const affected = APP_STATE.shipments.filter(s=>s.affectedBy);
    const counts = { CRITICAL:0, HIGH:0, MEDIUM:0, LOW:0 };
    affected.forEach(s=>counts[s.risk]++);

    el.innerHTML = `
<div class="page-header">
  <div class="page-header-text">
    <h1>Affected Shipments</h1>
    <p>AI risk classification across all disruption-impacted shipments</p>
  </div>
</div>

<div class="kpi-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px">
  <div class="kpi-card blue">   <div class="kpi-label">Total Affected</div><div class="kpi-value">${affected.length}</div></div>
  <div class="kpi-card red">    <div class="kpi-label">Critical</div><div class="kpi-value">${counts.CRITICAL}</div></div>
  <div class="kpi-card orange"> <div class="kpi-label">High</div><div class="kpi-value">${counts.HIGH}</div></div>
  <div class="kpi-card yellow"> <div class="kpi-label">Medium</div><div class="kpi-value">${counts.MEDIUM}</div></div>
  <div class="kpi-card green">  <div class="kpi-label">Low</div><div class="kpi-value">${counts.LOW}</div></div>
</div>

<!-- ROADSIDE / ROUTE MAP -->
<div class="card mb-16">
  <div class="card-title" style="display:flex;align-items:center;justify-content:space-between">
    <span>🗺 Affected Shipments — Live Route Map</span>
    <span style="font-size:11px;color:var(--muted)">✈️ Air &nbsp; 🚢 Sea &nbsp; 🚚 Road &nbsp; ● Current position</span>
  </div>
  <div id="shipment-route-map" style="height:340px;border-radius:6px;overflow:hidden;"></div>
  <div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:var(--muted)">
    <span><span style="color:var(--red)">─</span> CRITICAL</span>
    <span><span style="color:var(--orange)">─</span> HIGH</span>
    <span><span style="color:var(--yellow)">─</span> MEDIUM</span>
    <span><span style="color:var(--green)">─</span> LOW / IN_TRANSIT</span>
  </div>
</div>

<div class="filter-bar">
  <button class="filter-btn ${activeFilter==='ALL'?'active':''}"     onclick="window._shipFilter('ALL')">All</button>
  <button class="filter-btn ${activeFilter==='CRITICAL'?'active':''}" onclick="window._shipFilter('CRITICAL')">🔴 Critical</button>
  <button class="filter-btn ${activeFilter==='HIGH'?'active':''}"     onclick="window._shipFilter('HIGH')">🟠 High</button>
  <button class="filter-btn ${activeFilter==='MEDIUM'?'active':''}"   onclick="window._shipFilter('MEDIUM')">🟡 Medium</button>
  <button class="filter-btn ${activeFilter==='LOW'?'active':''}"      onclick="window._shipFilter('LOW')">🟢 Low</button>
  <input class="search-input" id="ship-search" placeholder="Search ID, cargo, city…" value="${searchQ}" oninput="window._shipSearch(this.value)"/>
  <span class="text-muted text-sm" id="ship-count"></span>
</div>

<div class="card" style="overflow-x:auto">
  <table class="sg-table">
    <thead>
      <tr><th>ID</th><th>Origin</th><th>Destination</th><th>Cargo</th><th>Risk</th><th>Status</th><th>ETA</th><th>Value</th><th>Carrier</th><th>Disruption</th></tr>
    </thead>
    <tbody id="ship-tbody"></tbody>
  </table>
</div>
`;

    window._shipFilter = (f)=>{ activeFilter=f; renderTable(); render(); };
    window._shipSearch = (q)=>{ searchQ=q.toLowerCase(); renderTable(); };
    window._openShipment = (i)=>renderShipmentModal(APP_STATE.shipments[i]);

    renderTable();
    setTimeout(()=>mountShipmentMap(filteredShipments()), 80);
  }

  return render;
})();
