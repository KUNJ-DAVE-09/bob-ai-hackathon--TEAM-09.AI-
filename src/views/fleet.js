/* Fleet Assets View — Dark Theme */
'use strict';

window.renderView_fleet = (function(){
  let statusChart = null;
  let activeFilter = 'ALL';

  function statusBadge(s){
    const m={ IDLE:'ok', IN_TRANSIT:'info', MAINTENANCE:'warn', ASSIGNED:'cyan', UNAVAILABLE:'danger' };
    const label = s.replace('_',' ');
    return `<span class="badge badge-${m[s]||'info'}">${label}</span>`;
  }

  function idleBadge(h){ return `<span class="idle-badge">IDLE ${h}H</span>`; }

  function getFiltered(){
    return APP_STATE.fleet.filter(a=> activeFilter==='ALL'||a.status===activeFilter);
  }

  function renderAssetModal(asset){
    const matchedShipments = APP_STATE.shipments.filter(s=>s.vehicleId===asset.id);
    window.openModal(`
      <h2 style="margin-bottom:4px;font-family:var(--mono)">${asset.id}</h2>
      <p style="color:var(--muted);font-size:13px;margin-bottom:16px">${asset.type} &nbsp;·&nbsp; 📍 ${asset.location}</p>
      <div class="grid-2 gap-12 mb-16">
        <div><div class="kpi-label">Status</div>${statusBadge(asset.status)}</div>
        <div><div class="kpi-label">Cold Chain</div><strong>${asset.coldChain?'✅ Yes':'❌ No'}</strong></div>
        <div><div class="kpi-label">Capacity</div><strong>${APP_STATE.fmtNum(asset.capacity)} kg</strong></div>
        <div><div class="kpi-label">Utilization</div><strong>${asset.utilization}%</strong></div>
        ${asset.idleSince?`<div><div class="kpi-label">Idle Since</div><strong>${asset.idleSince}h ago</strong></div>`:''}
        ${asset.nextAvailable?`<div><div class="kpi-label">Available In</div><strong>${asset.nextAvailable}h</strong></div>`:''}
      </div>
      ${asset.status==='IDLE'?`
        <div class="redeploy-ai-box">
          <div class="redeploy-ai-label">⬡ AI Redeployment Recommendation</div>
          <div style="font-weight:700;margin-bottom:6px">${asset.location} → ${APP_STATE.disruptions[0]?.hub||'Nearest Hub'} Express Corridor</div>
          <div style="display:flex;gap:16px;font-size:12px;color:var(--muted)">
            <span>Gain: <strong style="color:var(--teal)">+${APP_STATE.rnd(8,24)}%</strong></span>
            <span>Exp. Rev: <strong style="color:var(--purple)">$${APP_STATE.rnd(4,18)}K</strong></span>
          </div>
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;letter-spacing:.06em" onclick="window._deployAsset('${asset.id}');window.closeModal()">
          REDEPLOY ASSET →
        </button>
      `:''}
      ${matchedShipments.length>0?`
        <div style="margin-top:14px">
          <div class="kpi-label mb-8">Assigned Shipment</div>
          ${matchedShipments.slice(0,1).map(s=>`<div class="card"><strong style="font-family:var(--mono)">${s.id}</strong> — ${s.origin} → ${s.destination} — ${s.cargo}</div>`).join('')}
        </div>
      `:''}
      <button class="btn btn-ghost mt-12" style="width:100%;justify-content:center" onclick="window.closeModal()">Close</button>
    `);
  }

  function render(){
    const el = document.getElementById('view-fleet');
    const fleet = APP_STATE.fleet;
    const idle  = fleet.filter(a=>a.status==='IDLE');
    const transit=fleet.filter(a=>a.status==='IN_TRANSIT');
    const maint = fleet.filter(a=>a.status==='MAINTENANCE');
    const assign= fleet.filter(a=>a.status==='ASSIGNED');
    const util  = Math.round(((fleet.length-idle.length)/fleet.length)*100);
    const reefers = idle.filter(a=>a.coldChain);

    // Top idle candidates sorted by idle time
    const topIdle = [...idle].sort((a,b)=>(b.idleSince||0)-(a.idleSince||0)).slice(0,4);

    el.innerHTML = `
<div class="page-header">
  <div class="page-header-text">
    <h1>Fleet Assets</h1>
    <p>Fleet utilisation overview — ${fleet.length} total assets · ${idle.length} idle · ${transit.length} in transit</p>
  </div>
  <button class="btn btn-primary" onclick="window._runOptimizer()">
    Run AI Fleet Optimizer
  </button>
</div>

<div style="display:grid;grid-template-columns:300px 1fr;gap:20px;margin-bottom:24px">
  <!-- Utilization breakdown -->
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div class="card-title" style="margin:0">Fleet Utilisation</div>
      <span style="font-size:12px;font-weight:700;color:var(--accent);font-family:var(--mono)">${util}% avg utilisation</span>
    </div>
    <div style="display:flex;align-items:center;gap:20px">
      <div style="position:relative;width:120px;height:120px;flex-shrink:0">
        <canvas id="fleet-status-chart" width="120" height="120"></canvas>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
          <div style="font-size:20px;font-weight:800;font-family:var(--mono)">${util}%</div>
          <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">OPTIMIZED</div>
        </div>
      </div>
      <div style="flex:1">
        ${[
          ['Trucks',     transit.filter(a=>a.type.includes('Truck')).length, fleet.filter(a=>a.type.includes('Truck')).length, 'var(--accent)'],
          ['Containers', assign.filter(a=>a.type.includes('Container')).length, fleet.filter(a=>a.type.includes('Container')).length, 'var(--purple)'],
          ['Vans/Cold',  transit.filter(a=>a.type.includes('Van')).length, fleet.filter(a=>a.type.includes('Van')).length, 'var(--teal)'],
          ['Tankers',    transit.filter(a=>a.type.includes('Tank')).length, fleet.filter(a=>a.type.includes('Tank')).length, 'var(--orange)'],
        ].map(([label,active,total,color])=>{
          const pct = total>0?Math.round((active/total)*100):0;
          const idleN = total-active;
          return `
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
              <span style="font-weight:600">● ${label}</span>
              <span style="font-family:var(--mono);font-weight:700;color:${color}">${pct}%</span>
            </div>
            <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%;background:${color}"></div></div>
            <div style="font-size:10px;color:var(--muted);margin-top:2px">Active: ${active} units &nbsp; <span style="color:var(--orange)">Idle: ${idleN} units</span></div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>

  <!-- Idle redeployment opportunities -->
  <div>
    <div class="card-title">Idle Asset Redeployment Opportunities</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
      ${topIdle.map(a=>`
        <div class="redeploy-card">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#e9d5ff,#c4b5fd);display:flex;align-items:center;justify-content:center;font-size:18px">
                ${a.type.includes('Truck')?'🚛':a.type.includes('Van')?'🚐':a.type.includes('Tank')?'🛢':'📦'}
              </div>
              <div>
                <div style="font-weight:700;font-family:var(--mono);font-size:14px">${a.id}</div>
                <div style="font-size:11px;color:var(--muted)">${a.type}</div>
              </div>
            </div>
            ${idleBadge(a.idleSince||0)}
          </div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px">📍 Location: <strong style="color:var(--text)">${a.location}</strong>${APP_STATE.disruptions.some(d=>d.hub===a.location)?` <span class="badge badge-danger" style="font-size:9px">DISRUPTION ZONE</span>`:''}</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px">Payload Capacity: <strong>${APP_STATE.fmtNum(a.capacity)} kg${a.coldChain?' (Cold Spec)':''}</strong></div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:10px">Current Utilization: <strong style="color:var(--red)">0%</strong></div>

          <div class="redeploy-ai-box">
            <div class="redeploy-ai-label">⬡ AI Redeployment Recommendation:</div>
            <div style="font-weight:700;font-size:13px;margin-bottom:6px">
              ${a.location} → ${APP_STATE.disruptions[0]?.hub||'Nearest Hub'} Express Corridor
            </div>
            <div style="display:flex;justify-content:space-between;font-size:12px">
              <span>Gain: <strong style="color:var(--teal)">+${APP_STATE.rnd(10,30)}%</strong></span>
              <span>Exp. Rev: <strong style="color:var(--purple)">$${APP_STATE.rnd(5,20)}K</strong></span>
            </div>
          </div>

          <button class="btn btn-primary" style="width:100%;justify-content:center;letter-spacing:.06em;margin-top:10px" onclick="window._deployAsset('${a.id}')">
            REDEPLOY ASSET →
          </button>
        </div>
      `).join('')}
    </div>
  </div>
</div>

<!-- KPI Strip -->
<div class="kpi-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px">
  <div class="kpi-card blue">  <div class="kpi-label">Total Assets</div><div class="kpi-value">${fleet.length}</div></div>
  <div class="kpi-card green"> <div class="kpi-label">Idle (Available)</div><div class="kpi-value">${idle.length}</div><div class="kpi-sub">${reefers.length} cold-capable</div></div>
  <div class="kpi-card blue">  <div class="kpi-label">In Transit</div><div class="kpi-value">${transit.length}</div></div>
  <div class="kpi-card yellow"><div class="kpi-label">Maintenance</div><div class="kpi-value">${maint.length}</div></div>
  <div class="kpi-card blue">  <div class="kpi-label">Utilization</div><div class="kpi-value">${util}%</div></div>
</div>

<!-- Filter + Asset Grid -->
<div class="filter-bar">
  ${['ALL','IDLE','IN_TRANSIT','MAINTENANCE','ASSIGNED'].map(f=>`
    <button class="filter-btn ${activeFilter===f?'active':''}" onclick="window._fleetFilter('${f}')">${f.replace('_',' ')}</button>
  `).join('')}
</div>

<div class="asset-grid" id="fleet-asset-grid">
  ${getFiltered().map(a=>`
    <div class="asset-card ${a.status.toLowerCase().replace(/_/g,'-')}" onclick="window._openAsset('${a.id}')">
      <div class="asset-type">${a.type}</div>
      <div class="asset-id">${a.id}</div>
      <div class="asset-loc">📍 ${a.location}</div>
      ${statusBadge(a.status)}
      <div class="asset-cap mt-8">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:3px">
          <span>Capacity</span><span>${a.utilization}%</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:${a.utilization}%;background:${a.status==='IDLE'?'var(--surface2)':'var(--accent)'}"></div></div>
      </div>
      ${a.coldChain?'<div class="mt-8"><span class="badge badge-ok" style="font-size:9px">🌡 Cold Chain</span></div>':''}
      ${a.status==='IDLE'?`<div class="mt-8" style="font-size:10px;font-weight:700;font-family:var(--mono);color:var(--orange)">IDLE ${a.idleSince}H</div>`:''}
    </div>
  `).join('')}
</div>
`;

    window._fleetFilter = (f)=>{ activeFilter=f; render(); };
    window._openAsset   = (id)=>renderAssetModal(APP_STATE.fleet.find(a=>a.id===id));
    window._deployAsset = (id)=>{
      const a = APP_STATE.fleet.find(x=>x.id===id);
      if(a){ a.status='ASSIGNED'; a.utilization=APP_STATE.rnd(60,90); a.idleSince=null; }
      render();
    };
    window._runOptimizer = ()=>{
      // Simulate optimizer deploying all idle assets
      const deployable = APP_STATE.fleet.filter(a=>a.status==='IDLE').slice(0,3);
      deployable.forEach(a=>{ a.status='ASSIGNED'; a.utilization=APP_STATE.rnd(65,92); a.idleSince=null; });
      const tc = document.getElementById('toast-container');
      if(tc){
        const t=document.createElement('div'); t.className='toast toast-ok';
        t.textContent=`AI Optimizer deployed ${deployable.length} assets to disruption hubs`;
        tc.appendChild(t); setTimeout(()=>t.classList.add('show'),10);
        setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); },3500);
      }
      render();
    };

    if(statusChart) statusChart.destroy();
    const ctx = document.getElementById('fleet-status-chart');
    if(ctx){
      statusChart = new Chart(ctx,{
        type:'doughnut',
        data:{
          labels:['IDLE','IN_TRANSIT','ASSIGNED','MAINTENANCE'],
          datasets:[{ data:[idle.length,transit.length,assign.length,maint.length],
            backgroundColor:['#3fb950','#58a6ff','#bc8cff','#d29922'], borderWidth:0 }]
        },
        options:{
          responsive:false, maintainAspectRatio:false,
          plugins:{ legend:{ display:false } },
          cutout:'62%',
        }
      });
    }
  }

  return render;
})();
