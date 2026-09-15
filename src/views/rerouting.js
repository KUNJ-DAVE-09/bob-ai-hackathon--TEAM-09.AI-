/* Rerouting View */
'use strict';

window.renderView_rerouting = (function(){
  let scoreChart = null;

  function scoreBg(s){ return s>=85?'var(--green)':s>=70?'var(--yellow)':'var(--red)'; }

  function render(){
    const el = document.getElementById('view-rerouting');
    const rr = APP_STATE.reroutes;
    const critRR = rr.filter(r=>r.risk==='CRITICAL');
    const highRR = rr.filter(r=>r.risk==='HIGH');

    el.innerHTML = `
<div class="page-header">
  <div class="page-header-text">
    <h1>Rerouting & Carrier Alternatives</h1>
    <p>${rr.length} shipments with active rerouting options · ${critRR.length} CRITICAL priority</p>
  </div>
</div>

<div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">
  <div class="kpi-card red">   <div class="kpi-label">Critical Reroutes</div><div class="kpi-value">${critRR.length}</div></div>
  <div class="kpi-card orange"><div class="kpi-label">High Reroutes</div><div class="kpi-value">${highRR.length}</div></div>
  <div class="kpi-card blue">  <div class="kpi-label">Cold-Chain Options</div><div class="kpi-value">${rr.filter(r=>r.options.some(o=>o.coldChain&&o.recommended)).length}</div></div>
  <div class="kpi-card green"> <div class="kpi-label">Avg Best Score</div><div class="kpi-value">${Math.round(rr.reduce((a,r)=>a+Math.max(...r.options.map(o=>o.score)),0)/rr.length)}%</div></div>
</div>

<div class="grid-2-1">
  <div>
    <div class="card-title mb-16">Rerouting Queue — sorted by risk priority</div>
    ${rr.map((r,i)=>{
      const best = r.options.find(o=>o.recommended)||r.options[0];
      return `
      <div class="card" style="margin-bottom:12px;border-left:3px solid ${r.risk==='CRITICAL'?'var(--red)':'var(--orange)'}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div>
            <span class="badge badge-info" style="margin-right:8px">${r.shipmentId}</span>
            <span class="badge badge-${r.risk.toLowerCase()}">${r.risk}</span>
            ${r.cargo==='Vaccine'||r.cargo==='Pharmaceutical'||r.cargo==='Perishable'?'<span class="badge badge-purple" style="margin-left:6px">COLD CHAIN</span>':''}
          </div>
          <div style="font-size:12px;color:var(--muted)">${APP_STATE.fmtCur(r.value)}</div>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:10px">${r.origin} → ${r.destination} &nbsp;·&nbsp; Current carrier: ${r.originalCarrier}</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${r.options.map(o=>`
            <div style="background:var(--surface2);border:1px solid ${o.recommended?'var(--green)':'var(--border)'};border-radius:6px;padding:10px;cursor:pointer" onclick="window._routeDetail(${i})">
              ${o.recommended?'<div style="font-size:10px;color:var(--green);font-weight:700;margin-bottom:4px">★ RECOMMENDED</div>':''}
              <div style="font-size:12px;font-weight:700;margin-bottom:4px">${o.carrier.split(' ')[0]}</div>
              <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${o.route.split('→').join('→<br/>')}</div>
              <div style="font-size:11px">
                <span style="color:var(--muted)">Delay </span><strong>+${o.delay}h</strong><br/>
                <span style="color:var(--muted)">Cost </span><strong style="color:${o.costDelta>0?'var(--red)':'var(--green)'}">${o.costDelta>0?'+':''}${APP_STATE.fmtCur(o.costDelta)}</strong>
              </div>
              <div class="mt-8">
                <div class="score-bar-row">
                  <div class="score-bar-track" style="flex:1"><div class="score-bar-fill" style="width:${o.score}%;background:${scoreBg(o.score)}"></div></div>
                  <span class="score-bar-val" style="color:${scoreBg(o.score)}">${o.score}%</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="flex gap-8 mt-12">
          <button class="btn btn-success btn-sm" onclick="window._acceptRoute(${i})">✓ Approve Best Route</button>
          <button class="btn btn-ghost btn-sm" onclick="window._routeDetail(${i})">Full Analysis</button>
        </div>
      </div>
      `;
    }).join('')}
  </div>

  <div>
    <div class="card mb-16">
      <div class="card-title">Carrier Reliability Scores</div>
      <div class="chart-wrap" style="height:250px"><canvas id="carrier-score-chart"></canvas></div>
    </div>
    <div class="card">
      <div class="card-title">Decision Framework</div>
      <div style="font-size:12px;color:var(--muted);line-height:1.8">
        <div style="margin-bottom:8px"><strong style="color:var(--red)">CRITICAL:</strong> Prioritize speed — accept cost premium up to 30%</div>
        <div style="margin-bottom:8px"><strong style="color:var(--orange)">HIGH:</strong> Balance speed/cost — prefer <24h delay options</div>
        <div style="margin-bottom:8px"><strong style="color:var(--yellow)">MEDIUM:</strong> Cost-optimize — delay up to 48h acceptable</div>
        <div><strong style="color:var(--green)">Cold Chain:</strong> Carrier must have verified reefer capability</div>
      </div>
    </div>
  </div>
</div>
`;

    window._acceptRoute = (i)=>{
      const r = APP_STATE.reroutes[i];
      const sh = APP_STATE.shipments.find(s=>s.id===r.shipmentId);
      if(sh){ sh.status='DIVERTED'; sh.risk='MEDIUM'; }
      APP_STATE.reroutes.splice(i,1);
      render();
    };

    window._routeDetail = (i)=>{
      const r = APP_STATE.reroutes[i];
      window.openModal(`
        <h3>${r.shipmentId} — Full Route Analysis</h3>
        <p style="color:var(--muted);font-size:13px;margin:8px 0 20px">${r.origin} → ${r.destination} &nbsp;|&nbsp; Cargo: ${r.cargo} &nbsp;|&nbsp; Value: ${APP_STATE.fmtCur(r.value)}</p>
        ${r.options.map(o=>`
          <div class="route-card ${o.recommended?'recommended':''}">
            <div class="route-header"><div class="route-name">${o.carrier}</div>${o.recommended?'<span class="badge badge-ok">Recommended</span>':''}</div>
            <div style="font-size:12px;color:var(--muted);margin-bottom:10px">${o.route}</div>
            <div class="grid-4">
              <div><div class="kpi-label">Delay</div><strong>+${o.delay}h</strong></div>
              <div><div class="kpi-label">Cost Delta</div><strong style="color:${o.costDelta>0?'var(--red)':'var(--green)'}">${o.costDelta>0?'+':''}${APP_STATE.fmtCur(o.costDelta)}</strong></div>
              <div><div class="kpi-label">Score</div><strong style="color:${scoreBg(o.score)}">${o.score}%</strong></div>
              <div><div class="kpi-label">Cold Chain</div><strong>${o.coldChain?'✅ Yes':'❌ No'}</strong></div>
            </div>
          </div>
        `).join('')}
        <div class="flex gap-8 mt-16">
          <button class="btn btn-success" onclick="window._acceptRoute(${i});window.closeModal()">Approve Recommended Route</button>
          <button class="btn btn-ghost" onclick="window.closeModal()">Cancel</button>
        </div>
      `);
    };

    // Carrier reliability chart
    const top8 = APP_STATE.carriers.slice(0,8);
    if(scoreChart) scoreChart.destroy();
    scoreChart = new Chart(document.getElementById('carrier-score-chart'),{
      type:'bar',
      data:{
        labels: top8.map(c=>c.name.split(' ')[0]),
        datasets:[{ label:'Reliability %', data:top8.map(c=>c.reliability),
          backgroundColor: top8.map(c=>c.reliability>=90?'#3fb950':c.reliability>=80?'#d29922':'#f0883e'),
          borderRadius:4 }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{
          x:{ ticks:{ color:'#8b949e', font:{size:10} }, grid:{ display:false } },
          y:{ min:60, max:100, ticks:{ color:'#8b949e' }, grid:{ color:'rgba(48,54,61,.5)' } },
        }
      }
    });
  }

  return render;
})();
