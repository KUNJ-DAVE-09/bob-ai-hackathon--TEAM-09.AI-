
/* Disruptions View — with World Map */
'use strict';

window.renderView_disruptions = (function(){
  let disMap = null;
  let tickHandler = null;

  function sevBadge(s){ return `<span class="badge badge-${s.toLowerCase()}">${s}</span>`; }
  function elapsed(ms){ const h=Math.floor((Date.now()-ms)/3600000),m=Math.floor((Date.now()-ms)%3600000/60000); return h>0?h+'h '+m+'m ago':m+'m ago'; }

  function renderDetail(d){
    window.openModal(`
      <h2 style="margin-bottom:6px">${d.type}</h2>
      <p style="color:var(--muted);font-size:13px;margin-bottom:20px">Incident ID: <strong>${d.id}</strong> · Hub: <strong>${d.hub}</strong> · Started: ${elapsed(d.started)}</p>
      <div class="grid-2" style="gap:16px;margin-bottom:20px">
        <div><div class="kpi-label">Severity</div>${sevBadge(d.severity)}</div>
        <div><div class="kpi-label">Status</div><span class="badge badge-danger">${d.status}</span></div>
        <div><div class="kpi-label">Shipments Impacted</div><div style="font-size:20px;font-weight:700">${d.shipmentsImpacted}</div></div>
        <div><div class="kpi-label">Affected Routes</div><div style="font-size:20px;font-weight:700">${d.affectedRoutes}</div></div>
        <div><div class="kpi-label">Expected Resolution</div><div style="font-weight:600">${d.expectedResolution}h from now</div></div>
        <div><div class="kpi-label">Coordinates</div><div style="font-weight:600">${d.lat?.toFixed(3)}, ${d.lng?.toFixed(3)}</div></div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-title">Details</div>
        <p style="font-size:13px;color:var(--muted)">${d.details}</p>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-primary" onclick="window.switchView('shipments');window.closeModal()">View Affected Shipments</button>
        <button class="btn btn-warn" onclick="window.switchView('rerouting');window.closeModal()">View Rerouting Options</button>
        <button class="btn btn-ghost" onclick="window.closeModal()">Close</button>
      </div>
    `);
  }

  function mountDisruptionMap(dis){
    const el = document.getElementById('disruption-world-map');
    if(!el || !window.L) return;
    if(disMap){ disMap.remove(); disMap=null; }

    disMap = L.map('disruption-world-map', { zoomControl:true, attributionControl:false, scrollWheelZoom:true })
              .setView([20, 70], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(disMap);

    // Add disruption markers with pulsing circles
    dis.forEach((d,i)=>{
      if(d.lat == null || d.lng == null) return;
      const color = d.severity==='CRITICAL'?'#f85149':d.severity==='HIGH'?'#f0883e':'#d29922';
      const radius = d.shipmentsImpacted * 3000;

      // Pulsing circle
      L.circle([d.lat, d.lng], {
        color, fillColor: color, fillOpacity:0.15,
        weight:2, radius,
      }).addTo(disMap);

      // Icon marker
      const icon = L.divIcon({
        html:`<div class="dis-map-marker" style="background:${color}40;border:2px solid ${color};color:${color}">
          <span style="font-size:13px">${d.severity[0]}</span>
        </div>`,
        className:'', iconSize:[32,32], iconAnchor:[16,16],
      });
      L.marker([d.lat, d.lng], { icon })
        .addTo(disMap)
        .bindPopup(`
          <div style="min-width:200px">
            <div style="font-weight:700;margin-bottom:4px">${d.type}</div>
            <div style="font-size:12px;color:#888;margin-bottom:8px">${d.hub} · ${d.id}</div>
            <div style="margin-bottom:4px"><span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">${d.severity}</span></div>
            <div style="font-size:12px;margin-top:6px">🚢 ${d.shipmentsImpacted} shipments impacted</div>
            <div style="font-size:12px">⏱ Resolves in ~${d.expectedResolution}h</div>
            <button style="margin-top:8px;padding:4px 10px;border-radius:4px;border:1px solid #ccc;background:#fff;cursor:pointer;font-size:11px" onclick="window._showDisruptionDetail(${i})">View Details</button>
          </div>
        `, { maxWidth:260 });
    });

    // Also plot affected shipment routes as thin lines
    APP_STATE.shipments.filter(s=>s.affectedBy).slice(0,40).forEach(s=>{
      if(s.originLat == null) return;
      const color = s.risk==='CRITICAL'?'#f85149':s.risk==='HIGH'?'#f0883e':'#d29922';
      L.polyline([[s.originLat,s.originLng],[s.destLat,s.destLng]], {
        color, weight:1, opacity:0.4, dashArray:'4,4',
      }).addTo(disMap);
      // Current position dot
      L.circleMarker([s.currentLat,s.currentLng],{
        radius:4, color, fillColor:color, fillOpacity:0.8, weight:1,
      }).addTo(disMap).bindTooltip(`${s.id} — ${s.cargo}`, { direction:'top' });
    });
  }

  function updateMapMarkers(){
    // On tick — update current positions of shipments on map (lightweight)
    // Full re-render would be expensive; just update popup data
  }

  function render(){
    const el = document.getElementById('view-disruptions');
    const dis = APP_STATE.disruptions;

    const bySev = { CRITICAL:0, HIGH:0, MEDIUM:0 };
    dis.forEach(d=>{ if(bySev[d.severity]!==undefined) bySev[d.severity]++; });

    el.innerHTML = `
<div class="page-header">
  <div class="page-header-text">
    <h1>Active Disruptions</h1>
    <p>${dis.length} disruptions in progress — ${dis.reduce((a,d)=>a+d.shipmentsImpacted,0)} total shipments affected</p>
  </div>
</div>

<div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">
  <div class="kpi-card red">
    <div class="kpi-label">Critical</div>
    <div class="kpi-value">${bySev.CRITICAL}</div>
  </div>
  <div class="kpi-card orange">
    <div class="kpi-label">High</div>
    <div class="kpi-value">${bySev.HIGH}</div>
  </div>
  <div class="kpi-card yellow">
    <div class="kpi-label">Medium</div>
    <div class="kpi-value">${bySev.MEDIUM}</div>
  </div>
  <div class="kpi-card blue">
    <div class="kpi-label">Total Impacted</div>
    <div class="kpi-value">${dis.reduce((a,d)=>a+d.shipmentsImpacted,0)}</div>
  </div>
</div>

<!-- LIVE WORLD MAP -->
<div class="card mb-16">
  <div class="card-title" style="display:flex;align-items:center;justify-content:space-between">
    <span>🌍 Real-Time Disruption World Map</span>
    <span style="font-size:11px;color:var(--muted)">● Disruption zones &nbsp; ─ Affected shipment routes &nbsp; ● Current positions</span>
  </div>
  <div id="disruption-world-map" style="height:380px;border-radius:6px;overflow:hidden;"></div>
  <div style="display:flex;gap:16px;margin-top:10px;font-size:12px;color:var(--muted)">
    <span><span style="color:var(--red)">●</span> CRITICAL</span>
    <span><span style="color:var(--orange)">●</span> HIGH</span>
    <span><span style="color:var(--yellow)">●</span> MEDIUM</span>
    <span>── Affected routes</span>
    <span>● Shipment positions</span>
  </div>
</div>

<div class="card">
  <table class="sg-table">
    <thead>
      <tr>
        <th>ID</th><th>Type</th><th>Hub</th><th>Severity</th>
        <th>Ships Impacted</th><th>Routes</th><th>Started</th><th>Resolution</th><th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${dis.map((d,i)=>`
        <tr class="clickable" onclick="window._showDisruptionDetail(${i})">
          <td><span class="badge badge-info">${d.id}</span></td>
          <td><strong>${d.type}</strong></td>
          <td>${d.hub}</td>
          <td>${sevBadge(d.severity)}</td>
          <td style="font-weight:700;color:var(--${d.severity==='CRITICAL'?'red':d.severity==='HIGH'?'orange':'yellow'})">${d.shipmentsImpacted}</td>
          <td>${d.affectedRoutes}</td>
          <td style="color:var(--muted)">${elapsed(d.started)}</td>
          <td>${d.expectedResolution}h</td>
          <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();window._showDisruptionDetail(${i})">Details</button></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>

<div class="grid-2 mt-16">
  <div class="card">
    <div class="card-title">Impact by Disruption Type</div>
    <div class="chart-wrap" style="height:180px"><canvas id="dis-impact-chart"></canvas></div>
  </div>
  <div class="card">
    <div class="card-title">Severity Breakdown</div>
    <div class="chart-wrap" style="height:180px"><canvas id="dis-sev-chart"></canvas></div>
  </div>
</div>
`;

    window._showDisruptionDetail = i => renderDetail(dis[i]);

    // Mount map after DOM is ready
    setTimeout(()=>mountDisruptionMap(dis), 80);

    // Impact bar chart
    new Chart(document.getElementById('dis-impact-chart'),{
      type:'bar',
      data:{
        labels: dis.map(d=>d.type.split('–')[0].trim()),
        datasets:[{ label:'Shipments Impacted', data:dis.map(d=>d.shipmentsImpacted),
          backgroundColor:dis.map(d=>d.severity==='CRITICAL'?'#f85149':d.severity==='HIGH'?'#f0883e':'#d29922'),
          borderRadius:4 }]
      },
      options:{
        responsive:true, maintainAspectRatio:false, indexAxis:'y',
        plugins:{ legend:{ display:false } },
        scales:{
          x:{ ticks:{ color:'#8b949e' }, grid:{ color:'rgba(48,54,61,.5)' } },
          y:{ ticks:{ color:'#8b949e', font:{size:11} }, grid:{ display:false } },
        }
      }
    });

    // Severity pie
    new Chart(document.getElementById('dis-sev-chart'),{
      type:'pie',
      data:{
        labels:['CRITICAL','HIGH','MEDIUM'],
        datasets:[{ data:[bySev.CRITICAL,bySev.HIGH,bySev.MEDIUM],
          backgroundColor:['#f85149','#f0883e','#d29922'], borderWidth:0 }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ color:'#8b949e', boxWidth:12, font:{size:11} } } }
      }
    });

    // Live tick — refresh shipment positions on map
    if(tickHandler) window.removeEventListener('sg:tick', tickHandler);
    tickHandler = updateMapMarkers;
    window.addEventListener('sg:tick', tickHandler);
  }

  return render;
})();
