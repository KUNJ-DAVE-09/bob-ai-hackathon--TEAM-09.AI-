/* Cold-Chain IoT Monitoring View — Enhanced Thresholds + Spike Detection */
'use strict';

window.renderView_coldchain = (function(){
  let charts = {};
  let tickHandler = null;
  let filterMode = 'ALL';

  function isColdCargo(cargo){ return ['Vaccine','Pharmaceutical','Perishable'].includes(cargo); }
  function sevColor(s){ return s==='EMERGENCY'?'var(--red)':s==='CRITICAL'?'var(--red)':s==='WARNING'?'var(--yellow)':s==='MONITORING'?'var(--accent)':'var(--green)'; }
  function sevBadge(s){
    const cls = s==='EMERGENCY'||s==='CRITICAL'?'critical':s==='WARNING'?'warn':s==='MONITORING'?'info':'ok';
    return `<span class="badge badge-${cls}">${s}</span>`;
  }

  function renderSensorChart(stream, canvasId) {
    if(charts[canvasId]) { charts[canvasId].destroy(); delete charts[canvasId]; }
    const ctx = document.getElementById(canvasId);
    if(!ctx) return;
    const labels = stream.history.map((_,i)=>i===stream.history.length-1?'now':'');
    const lineColor = stream.warningActive ? '#f85149' : stream.inBreach ? '#d29922' : '#58a6ff';
    const fillColor = stream.warningActive ? 'rgba(248,81,73,.08)' : stream.inBreach ? 'rgba(210,153,34,.06)' : 'rgba(88,166,255,.06)';

    charts[canvasId] = new Chart(ctx, {
      type:'line',
      data:{
        labels,
        datasets:[
          { label:'Temperature', data:[...stream.history], borderColor:lineColor,
            backgroundColor:fillColor, tension:.35, fill:true, pointRadius:0, borderWidth:2 },
          { label:'Max', data:Array(stream.history.length).fill(stream.tempMax),
            borderColor:'rgba(248,81,73,.4)', borderDash:[4,3], pointRadius:0, fill:false, borderWidth:1 },
          { label:'Min', data:Array(stream.history.length).fill(stream.tempMin),
            borderColor:'rgba(63,185,80,.4)', borderDash:[4,3], pointRadius:0, fill:false, borderWidth:1 },
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false, animation:false,
        plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: c=>c.datasetIndex===0?`${c.raw}°C`:'' } } },
        scales:{
          x:{ display:false },
          y:{ ticks:{ color:'#8b949e', font:{size:9} }, grid:{ color:'rgba(48,54,61,.5)' },
              min: stream.tempMin-3, max: stream.tempMax+8 }
        }
      }
    });
  }

  function updateCharts(){
    APP_STATE.sensorStreams.forEach(stream=>{
      const cid = 'chart-'+stream.sensorId;
      if(charts[cid]) {
        const lineColor = stream.warningActive ? '#f85149' : stream.inBreach ? '#d29922' : '#58a6ff';
        const fillColor = stream.warningActive ? 'rgba(248,81,73,.08)' : stream.inBreach ? 'rgba(210,153,34,.06)' : 'rgba(88,166,255,.06)';
        charts[cid].data.datasets[0].data = [...stream.history];
        charts[cid].data.datasets[0].borderColor = lineColor;
        charts[cid].data.datasets[0].backgroundColor = fillColor;
        charts[cid].update('none');
      }

      const tempEl = document.getElementById('temp-'+stream.sensorId);
      if(tempEl){
        tempEl.textContent = stream.current+'°C';
        tempEl.className = 'sensor-temp '+(stream.warningActive?'breach':stream.inBreach?'warning':'ok');
      }

      const cardEl = document.getElementById('card-'+stream.sensorId);
      if(cardEl){ cardEl.className = 'sensor-card '+(stream.warningActive?'breach':stream.inBreach?'monitoring':''); }

      const badgeEl = document.getElementById('badge-'+stream.sensorId);
      if(badgeEl){ badgeEl.outerHTML = `<span id="badge-${stream.sensorId}">${sevBadge(stream.severity)}</span>`; }

      // Spike indicator
      const spikeEl = document.getElementById('spike-'+stream.sensorId);
      if(spikeEl){
        if(stream.spike){
          spikeEl.style.display='block';
          spikeEl.textContent = `⚡ ${stream.spike.direction==='RISE'?'↑ RISE':'↓ FALL'} ${stream.spike.delta.toFixed(1)}°C`;
        } else {
          spikeEl.style.display='none';
        }
      }
    });

    // Update breach/monitoring counts
    const warnCount  = APP_STATE.sensorStreams.filter(s=>s.warningActive).length;
    const monCount   = APP_STATE.sensorStreams.filter(s=>s.inBreach&&!s.warningActive).length;
    const spikeCount = APP_STATE.sensorStreams.filter(s=>s.spike).length;
    const warnEl = document.getElementById('warn-count');
    const monEl  = document.getElementById('mon-count');
    const spikeEl = document.getElementById('spike-count');
    if(warnEl) warnEl.textContent = warnCount;
    if(monEl)  monEl.textContent  = monCount;
    if(spikeEl) spikeEl.textContent = spikeCount;
  }

  function getFiltered(){
    if(filterMode==='BREACH')    return APP_STATE.sensorStreams.filter(s=>s.warningActive);
    if(filterMode==='MONITOR')   return APP_STATE.sensorStreams.filter(s=>s.inBreach&&!s.warningActive);
    if(filterMode==='SPIKE')     return APP_STATE.sensorStreams.filter(s=>s.spike);
    if(filterMode==='COLD')      return APP_STATE.sensorStreams.filter(s=>isColdCargo(s.cargo));
    if(filterMode==='CONTAINER') return APP_STATE.sensorStreams.filter(s=>!isColdCargo(s.cargo));
    return APP_STATE.sensorStreams;
  }

  function render(){
    const el = document.getElementById('view-coldchain');
    const streams  = APP_STATE.sensorStreams;
    const warned   = streams.filter(s=>s.warningActive);
    const monitor  = streams.filter(s=>s.inBreach&&!s.warningActive);
    const emergency= warned.filter(s=>s.severity==='EMERGENCY');
    const spikes   = streams.filter(s=>s.spike);
    const coldStreams = streams.filter(s=>isColdCargo(s.cargo));
    const contStreams = streams.filter(s=>!isColdCargo(s.cargo));

    el.innerHTML = `
<div class="page-header">
  <div class="page-header-text">
    <h1>Cold-Chain IoT Monitoring</h1>
    <p>Live temperature sensor feeds — ${streams.length} active streams · ${warned.length} warnings · ${spikes.length} spikes</p>
  </div>
</div>

<!-- THRESHOLD LEGEND -->
<div class="cold-threshold-legend">
  <div class="thresh-group cold">
    <div class="thresh-title">🌡 Cold Cargo — IMMEDIATE Alert</div>
    <div class="thresh-rows">
      <div class="thresh-row"><span>Vaccine</span><span>2°C – 8°C</span><span class="badge badge-critical">WHO/FDA</span><span class="thresh-rule">Any breach → instant warning</span></div>
      <div class="thresh-row"><span>Pharmaceutical</span><span>−20°C – 8°C</span><span class="badge badge-critical">FDA/EMA</span><span class="thresh-rule">Any breach → instant warning</span></div>
      <div class="thresh-row"><span>Perishable</span><span>0°C – 4°C</span><span class="badge badge-critical">FDA/USDA</span><span class="thresh-rule">Any breach → instant warning</span></div>
    </div>
  </div>
  <div class="thresh-group container">
    <div class="thresh-title">📦 Container / Normal Goods — 15-min Buffer</div>
    <div class="thresh-rows">
      <div class="thresh-row"><span>Electronics</span><span>5°C – 40°C</span><span class="badge badge-info">IEC-60721</span><span class="thresh-rule">Warning after 15 min breach</span></div>
      <div class="thresh-row"><span>Automotive</span><span>0°C – 50°C</span><span class="badge badge-info">SAE-J1211</span><span class="thresh-rule">Warning after 15 min breach</span></div>
      <div class="thresh-row"><span>Chemical</span><span>−5°C – 30°C</span><span class="badge badge-warn">ADR-2023</span><span class="thresh-rule">Warning after 15 min breach</span></div>
    </div>
  </div>
</div>

<!-- SPIKE ALERT BANNER -->
${spikes.length>0?`
<div style="background:rgba(188,140,255,.1);border:1px solid rgba(188,140,255,.4);border-radius:8px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px">
  <span style="font-size:20px">⚡</span>
  <div>
    <div style="font-weight:700;color:var(--purple)"><span id="spike-count">${spikes.length}</span> Drastic Temperature Spike(s) Detected</div>
    <div style="font-size:12px;color:var(--muted)">Sudden temp changes ≥3°C detected in: ${spikes.slice(0,4).map(s=>`<strong>${s.shipmentId}</strong> (${s.spike.direction} ${s.spike.delta.toFixed(1)}°C)`).join(', ')}. Investigate immediately.</div>
  </div>
  <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="window._ccFilterSpike()">View Spikes</button>
</div>`:'<div id="spike-count" style="display:none">0</div>'}

<!-- WARNING BANNER -->
${warned.length>0?`
<div style="background:rgba(248,81,73,.1);border:1px solid rgba(248,81,73,.4);border-radius:8px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px">
  <span style="font-size:20px">🚨</span>
  <div>
    <div style="font-weight:700;color:var(--red)"><span id="warn-count">${warned.length}</span> Temperature Warnings Active</div>
    <div style="font-size:12px;color:var(--muted)">${emergency.length} EMERGENCY (>5°C above threshold >30min) — Regulatory reporting may be required</div>
  </div>
  <button class="btn btn-danger btn-sm" style="margin-left:auto" onclick="window._ccFilterBreach()">View Warnings Only</button>
</div>`:`<span id="warn-count" style="display:none">${warned.length}</span>`}

<!-- MONITORING BANNER (breach but within buffer) -->
${monitor.length>0?`
<div style="background:rgba(88,166,255,.08);border:1px solid rgba(88,166,255,.3);border-radius:8px;padding:12px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px">
  <span style="font-size:18px">⏱</span>
  <div>
    <div style="font-weight:600;color:var(--accent)"><span id="mon-count">${monitor.length}</span> Shipments in Monitoring Window</div>
    <div style="font-size:12px;color:var(--muted)">Out-of-range but within 15-min buffer. Warning will trigger if breach persists.</div>
  </div>
  <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="window._ccFilterMonitor()">View Monitoring</button>
</div>`:`<span id="mon-count" style="display:none">${monitor.length}</span>`}

<div class="kpi-grid" style="grid-template-columns:repeat(6,1fr);margin-bottom:20px">
  <div class="kpi-card blue">  <div class="kpi-label">All Streams</div><div class="kpi-value">${streams.length}</div></div>
  <div class="kpi-card green"> <div class="kpi-label">OK</div><div class="kpi-value">${streams.length-warned.length-monitor.length}</div></div>
  <div class="kpi-card blue">  <div class="kpi-label">Monitoring</div><div class="kpi-value">${monitor.length}</div></div>
  <div class="kpi-card yellow"><div class="kpi-label">Warning</div><div class="kpi-value">${warned.filter(s=>s.severity==='WARNING').length}</div></div>
  <div class="kpi-card red">   <div class="kpi-label">Critical/Emergency</div><div class="kpi-value">${warned.filter(s=>['CRITICAL','EMERGENCY'].includes(s.severity)).length}</div></div>
  <div class="kpi-card purple"><div class="kpi-label">Spikes</div><div class="kpi-value">${spikes.length}</div></div>
</div>

<div class="filter-bar mb-16">
  <button class="filter-btn ${filterMode==='ALL'?'active':''}"       onclick="window._ccFilterAll()">All Streams</button>
  <button class="filter-btn ${filterMode==='COLD'?'active':''}"      onclick="window._ccFilterCold()">🌡 Cold Cargo</button>
  <button class="filter-btn ${filterMode==='CONTAINER'?'active':''}" onclick="window._ccFilterContainer()">📦 Container Goods</button>
  <button class="filter-btn ${filterMode==='BREACH'?'active':''}"    onclick="window._ccFilterBreach()">🔴 Warnings Active</button>
  <button class="filter-btn ${filterMode==='MONITOR'?'active':''}"   onclick="window._ccFilterMonitor()">⏱ In Buffer Window</button>
  <button class="filter-btn ${filterMode==='SPIKE'?'active':''}"     onclick="window._ccFilterSpike()">⚡ Spikes</button>
</div>

<!-- EXCURSION LOG -->
${warned.length>0?`
<div class="card mb-16">
  <div class="card-title" style="color:var(--red)">⚠ Active Excursion Log</div>
  ${warned.map(s=>`
    <div class="excursion-alert">
      <span class="exc-icon">🌡</span>
      <div class="exc-text">
        <strong>${s.shipmentId}</strong> — ${s.cargo} ${isColdCargo(s.cargo)?'<span style="font-size:10px;color:var(--red)">⚡ IMMEDIATE ALERT</span>':'<span style="font-size:10px;color:var(--yellow)">⏱ 15-MIN BUFFER</span>'} (${s.route})
        <br/><span style="font-size:11px;color:var(--muted)">Current: <strong style="color:var(--red)">${s.current}°C</strong> · Range: ${s.tempMin}–${s.tempMax}°C · Regulator: ${s.regulator} · Breach: ${s.breachDuration}m</span>
      </div>
      <div>${sevBadge(s.severity)}</div>
    </div>
  `).join('')}
</div>`:''}

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
  ${getFiltered().map(stream=>`
    <div class="sensor-card ${stream.warningActive?'breach':stream.inBreach?'monitoring':''}" id="card-${stream.sensorId}">
      <div class="sensor-header">
        <div>
          <div class="sensor-id">${stream.shipmentId} — ${stream.sensorId}</div>
          <div class="sensor-cargo">${stream.cargo} · ${stream.carrier.split(' ')[0]} · ${isColdCargo(stream.cargo)?'<span style="color:var(--red);font-size:10px">⚡ Immediate</span>':'<span style="color:var(--accent);font-size:10px">⏱ 15-min buffer</span>'}</div>
        </div>
        <div style="text-align:right">
          <div class="sensor-temp ${stream.warningActive?'breach':stream.inBreach?'warning':'ok'}" id="temp-${stream.sensorId}">${stream.current}°C</div>
          <span id="badge-${stream.sensorId}">${sevBadge(stream.severity)}</span>
        </div>
      </div>
      ${stream.spike?`<div id="spike-${stream.sensorId}" class="spike-alert">⚡ SPIKE: ${stream.spike.direction==='RISE'?'↑ RISE':'↓ FALL'} ${stream.spike.delta.toFixed(1)}°C</div>`:`<div id="spike-${stream.sensorId}" style="display:none"></div>`}
      <div class="sensor-range">Range: ${stream.tempMin}°C – ${stream.tempMax}°C · ${stream.regulator}</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px">${stream.route}</div>
      <div class="chart-wrap" style="height:80px"><canvas id="chart-${stream.sensorId}"></canvas></div>
    </div>
  `).join('')}
</div>
`;

    window._ccFilterAll       = ()=>{ filterMode='ALL';       render(); };
    window._ccFilterCold      = ()=>{ filterMode='COLD';      render(); };
    window._ccFilterContainer = ()=>{ filterMode='CONTAINER'; render(); };
    window._ccFilterBreach    = ()=>{ filterMode='BREACH';    render(); };
    window._ccFilterMonitor   = ()=>{ filterMode='MONITOR';   render(); };
    window._ccFilterSpike     = ()=>{ filterMode='SPIKE';     render(); };

    getFiltered().forEach(stream=>{
      requestAnimationFrame(()=>renderSensorChart(stream, 'chart-'+stream.sensorId));
    });

    if(tickHandler) window.removeEventListener('sg:tick', tickHandler);
    tickHandler = updateCharts;
    window.addEventListener('sg:tick', tickHandler);
  }

  return render;
})();
