/* New Shipment — 3-Step Dispatch Flow */
'use strict';

window.renderView_newshipment = (function(){

  // ── State ──────────────────────────────────────────────────────────────────
  let step = 1;           // 1 | 2 | 3
  let geocodeTimer = {};  // debounce timers per field
  let originPlace  = null;  // { name, lat, lng, display }
  let destPlace    = null;
  let selectedRouteIdx = null;  // 0|1|2
  let routeOptions = [];
  let routeMapInst = null;
  let formValues = {
    cargo:'', priority:'MEDIUM', weight:'', value:'', specialReqs:{ coldChain:false, hazmat:false, fragile:false },
    shipmentId:'', trackerId:'', customer:'', carrier:'',
  };

  // ── OSM Geocoding ──────────────────────────────────────────────────────────
  function geocode(query, callback){
    if(!query || query.length < 3){ callback([]); return; }
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
    fetch(url, { headers:{ 'Accept-Language':'en' } })
      .then(r=>r.json())
      .then(data=>{
        const results = data.map(d=>({
          name: d.display_name.split(',').slice(0,3).join(', '),
          lat:  parseFloat(d.lat),
          lng:  parseFloat(d.lon),
          display: d.display_name,
        }));
        callback(results);
      })
      .catch(()=>callback([]));
  }

  function debounceGeocode(fieldId, query, listId, onSelect){
    clearTimeout(geocodeTimer[fieldId]);
    const list = document.getElementById(listId);
    if(!list) return;
    if(!query || query.length < 3){ list.innerHTML=''; list.style.display='none'; return; }
    list.innerHTML = '<div class="geo-item geo-loading">Searching…</div>';
    list.style.display = 'block';
    geocodeTimer[fieldId] = setTimeout(()=>{
      geocode(query, results=>{
        if(!results.length){ list.innerHTML='<div class="geo-item geo-empty">No results found</div>'; return; }
        list.innerHTML = results.map((r,i)=>`
          <div class="geo-item" onclick="window._nsGeoSelect('${fieldId}',${i})">${r.name}</div>
        `).join('');
        list._results = results;
        window._nsGeoSelect = (fid, idx)=>{
          const r = list._results[idx];
          onSelect(r);
          const inp = document.getElementById(fid);
          if(inp){ inp.value = r.name; }
          list.innerHTML=''; list.style.display='none';
          updateStep1Preview();
        };
      });
    }, 420);
  }

  // ── Currency ───────────────────────────────────────────────────────────────
  function getCur(place){
    if(!place) return { symbol:'$', code:'USD', rate:1, name:'US Dollar' };
    if(APP_STATE.getCurrencyForCity){
      const name = (place.name||'').split(',')[0].trim();
      return APP_STATE.getCurrencyForCity(name) || { symbol:'$', code:'USD', rate:1 };
    }
    return { symbol:'$', code:'USD', rate:1, name:'US Dollar' };
  }

  // ── AI Route Calculation ───────────────────────────────────────────────────
  function calcRoutes(oPlace, dPlace, cargo, valueUSD){
    const isCold = ['Vaccine','Pharmaceutical','Perishable'].includes(cargo);
    const val = parseFloat(valueUSD)||100000;
    // Haversine distance (km)
    const R = 6371;
    const dLat = (dPlace.lat-oPlace.lat)*Math.PI/180;
    const dLon = (dPlace.lng-oPlace.lng)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(oPlace.lat*Math.PI/180)*Math.cos(dPlace.lat*Math.PI/180)*Math.sin(dLon/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    // Rate per km per mode ($/km/ton, estimate at 1 ton)
    const seaDays  = Math.max(1, Math.round(dist / 800));
    const airHrs   = Math.max(2, Math.round(dist / 900));
    const roadDays = Math.max(1, Math.round(dist / 400));

    const seaCost  = Math.round(dist * 0.04 * 100) * 10;   // cheap
    const airCost  = Math.round(dist * 0.55 * 100) * 10;   // expensive
    const roadCost = Math.round(dist * 0.12 * 100) * 10;   // mid

    const destCur = getCur(dPlace);

    return [
      {
        mode:'ship', icon:'🚢', label:'Maritime Freight',
        tag:'Lowest Cost',  tagColor:'var(--green)',
        carrier: APP_STATE.carriers.find(c=>c.id==='C04')||APP_STATE.carriers[3],
        eta: seaDays + (seaDays===1?' day':' days'),
        etaRaw: seaDays*24,
        costUSD: seaCost,
        costLocal: destCur.symbol + Math.round(seaCost * destCur.rate).toLocaleString() + ' ' + destCur.code,
        score: 96,
        coldChain: false,
        pros: ['Lowest freight cost','Suitable for bulk cargo','Green carbon footprint'],
        cons: ['Slowest option','Not ideal for perishables'],
        recommended: !isCold,
        via: 'Sea route via nearest port hubs',
        dist: Math.round(dist),
        incompatible: isCold,
      },
      {
        mode:'air', icon:'✈️', label:'Air Freight Express',
        tag:'Fastest',      tagColor:'var(--accent)',
        carrier: APP_STATE.carriers.find(c=>c.id==='C06')||APP_STATE.carriers[5],
        eta: airHrs + ' hrs',
        etaRaw: airHrs,
        costUSD: airCost,
        costLocal: destCur.symbol + Math.round(airCost * destCur.rate).toLocaleString() + ' ' + destCur.code,
        score: 91,
        coldChain: true,
        pros: ['Fastest delivery','Cold-chain capable','High reliability'],
        cons: ['Highest freight cost','Carbon intensive'],
        recommended: isCold,
        via: 'Direct air freight via nearest international airports',
        dist: Math.round(dist),
        incompatible: false,
      },
      {
        mode:'road', icon:'🚚', label:'Intermodal Road / Rail',
        tag:'Balanced',     tagColor:'var(--yellow)',
        carrier: APP_STATE.carriers.find(c=>c.id==='C05')||APP_STATE.carriers[4],
        eta: roadDays + (roadDays===1?' day':' days'),
        etaRaw: roadDays*24,
        costUSD: roadCost,
        costLocal: destCur.symbol + Math.round(roadCost * destCur.rate).toLocaleString() + ' ' + destCur.code,
        score: 85,
        coldChain: false,
        pros: ['Flexible pickup & delivery','Door-to-door','No port dependency'],
        cons: ['Route disruptions possible','Moderate speed'],
        recommended: false,
        via: 'Truck + rail intermodal corridor',
        dist: Math.round(dist),
        incompatible: false,
      },
    ];
  }

  // ── Step Renders ───────────────────────────────────────────────────────────
  function renderStepNav(){
    const steps = ['Origin & Destination','AI Route Selection','Register & Activate'];
    return `
<div class="ns-step-nav">
  ${steps.map((s,i)=>`
    <div class="ns-step-item ${step===i+1?'active':step>i+1?'done':''}">
      <div class="ns-step-num">${step>i+1?'✓':i+1}</div>
      <div class="ns-step-label">${s}</div>
    </div>
    ${i<steps.length-1?'<div class="ns-step-line '+(step>i+1?'done':'')+'"></div>':''}
  `).join('')}
</div>`;
  }

  function renderStep1(){
    return `
<div class="ns-step-panel">
  <div class="ns-step-title">📍 Where is this shipment going?</div>
  <p class="ns-step-sub">Enter origin and destination — we'll use real-time geocoding to find the exact location and calculate optimal routes.</p>

  <div class="ns-geo-grid">
    <div class="ns-geo-field">
      <label class="form-label">📦 Origin — From</label>
      <div class="geo-input-wrap">
        <input class="form-input geo-input" id="ns-origin" autocomplete="off" placeholder="City, Port, Airport, Address…"
          oninput="window._nsOriginType(this.value)"/>
        <div class="geo-dropdown" id="geo-origin-list"></div>
      </div>
      <div class="geo-selected" id="geo-origin-info"></div>
    </div>
    <div class="ns-geo-arrow">→</div>
    <div class="ns-geo-field">
      <label class="form-label">🏁 Destination — To</label>
      <div class="geo-input-wrap">
        <input class="form-input geo-input" id="ns-dest" autocomplete="off" placeholder="City, Port, Airport, Address…"
          oninput="window._nsDestType(this.value)"/>
        <div class="geo-dropdown" id="geo-dest-list"></div>
      </div>
      <div class="geo-selected" id="geo-dest-info"></div>
    </div>
  </div>

  <!-- Mini live map -->
  <div id="ns-preview-map" style="height:220px;border-radius:8px;border:1px solid var(--border);margin:16px 0;background:var(--surface2)"></div>

  <!-- Cargo details -->
  <div class="ns-section-card" style="margin-top:0">
    <div class="ns-section-title">Cargo Specification</div>
    <div class="grid-2" style="gap:12px">
      <div class="form-group">
        <label class="form-label">Cargo Type</label>
        <select class="form-input" id="ns-cargo" onchange="window._nsUpdateField('cargo',this.value)">
          <option value="">— Select —</option>
          ${['Vaccine','Pharmaceutical','Perishable','Electronics','Machinery','Textiles','Automotive','Chemical'].map(c=>`<option value="${c}" ${formValues.cargo===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Priority</label>
        <select class="form-input" id="ns-priority" onchange="window._nsUpdateField('priority',this.value)">
          ${['CRITICAL','HIGH','MEDIUM','LOW'].map(p=>`<option value="${p}" ${formValues.priority===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Estimated Weight (kg)</label>
        <input class="form-input" id="ns-weight" type="number" placeholder="e.g. 5000" value="${formValues.weight}"
          oninput="window._nsUpdateField('weight',this.value)"/>
      </div>
      <div class="form-group">
        <label class="form-label">Cargo Value (USD)</label>
        <input class="form-input" id="ns-value" type="number" placeholder="e.g. 150000" value="${formValues.value}"
          oninput="window._nsUpdateField('value',this.value)"/>
        <div id="ns-value-local" style="font-size:11px;color:var(--accent);margin-top:3px"></div>
      </div>
    </div>
    <div style="display:flex;gap:16px;margin-top:10px;flex-wrap:wrap">
      ${[['coldChain','🌡 Cold Chain'],['hazmat','⚠ Hazmat'],['fragile','📦 Fragile']].map(([k,l])=>`
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">
          <input type="checkbox" ${formValues.specialReqs[k]?'checked':''} onchange="window._nsToggleReq('${k}',this.checked)"/>
          ${l}
        </label>
      `).join('')}
    </div>
  </div>

  <div id="ns-step1-err" style="color:var(--red);font-size:12px;margin-top:8px;display:none"></div>

  <div style="display:flex;justify-content:flex-end;margin-top:16px">
    <button class="btn btn-primary" style="padding:12px 32px;font-size:14px" onclick="window._nsStep1Next()">
      FIND LOW COST &amp; BEST ROUTES →
    </button>
  </div>
</div>`;
  }

  function renderStep2(){
    const destCur = getCur(destPlace);
    return `
<div class="ns-step-panel">
  <div class="ns-step-title">🤖 NEXUS AI — Route Recommendations</div>
  <p class="ns-step-sub">
    <strong>${originPlace.name.split(',')[0]}</strong> → <strong>${destPlace.name.split(',')[0]}</strong>
    &nbsp;·&nbsp; ${routeOptions[0]?.dist?.toLocaleString() || '—'} km
    &nbsp;·&nbsp; Cargo: <strong>${formValues.cargo||'—'}</strong>
    &nbsp;·&nbsp; Value: <strong>${destCur.symbol}${(parseFloat(formValues.value||0)*destCur.rate).toLocaleString(undefined,{maximumFractionDigits:0})} ${destCur.code}</strong>
  </p>

  <!-- Route map -->
  <div id="ns-route-map" style="height:240px;border-radius:8px;border:1px solid var(--border);margin-bottom:20px;background:var(--surface2)"></div>

  <!-- Route cards -->
  <div class="ns-route-options">
    ${routeOptions.map((r,i)=>`
      <div class="ns-route-card ${selectedRouteIdx===i?'selected':''} ${r.incompatible?'incompatible':''}"
           id="ns-rcard-${i}" onclick="window._nsSelectRoute(${i})">
        <div class="ns-rc-header">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:28px">${r.icon}</span>
            <div>
              <div style="font-weight:700;font-size:15px">${r.label}</div>
              <div style="font-size:12px;color:var(--muted)">${r.via}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;padding:3px 10px;border-radius:12px;font-weight:700;background:${r.tagColor}22;color:${r.tagColor};border:1px solid ${r.tagColor}44">${r.tag}</div>
            ${r.recommended?'<div style="font-size:10px;color:var(--green);margin-top:4px">★ AI Recommended</div>':''}
            ${r.incompatible?'<div style="font-size:10px;color:var(--red);margin-top:4px">⚠ Not cold-chain safe</div>':''}
          </div>
        </div>
        <div class="ns-rc-stats">
          <div class="ns-rc-stat">
            <div class="ns-rc-stat-label">Freight Cost</div>
            <div class="ns-rc-stat-val" style="color:${r.tagColor}">${r.costLocal}</div>
          </div>
          <div class="ns-rc-stat">
            <div class="ns-rc-stat-label">ETA</div>
            <div class="ns-rc-stat-val">${r.eta}</div>
          </div>
          <div class="ns-rc-stat">
            <div class="ns-rc-stat-label">AI Score</div>
            <div class="ns-rc-stat-val">
              <div style="display:flex;align-items:center;gap:6px">
                <div style="flex:1;background:var(--surface2);border-radius:4px;height:6px;overflow:hidden">
                  <div style="width:${r.score}%;height:100%;background:${r.score>90?'var(--green)':r.score>80?'var(--yellow)':'var(--orange)'};border-radius:4px"></div>
                </div>
                <span style="font-weight:700;color:${r.score>90?'var(--green)':r.score>80?'var(--yellow)':'var(--orange)'}">${r.score}%</span>
              </div>
            </div>
          </div>
          <div class="ns-rc-stat">
            <div class="ns-rc-stat-label">Cold Chain</div>
            <div class="ns-rc-stat-val">${r.coldChain?'✅ Yes':'❌ No'}</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap">
          <div>
            ${r.pros.map(p=>`<div style="font-size:11px;color:var(--green);margin-bottom:2px">✓ ${p}</div>`).join('')}
          </div>
          <div>
            ${r.cons.map(c=>`<div style="font-size:11px;color:var(--muted);margin-bottom:2px">• ${c}</div>`).join('')}
          </div>
        </div>
        ${selectedRouteIdx===i?'<div style="margin-top:10px;font-size:12px;font-weight:700;color:var(--accent)">✓ Selected</div>':''}
      </div>
    `).join('')}
  </div>

  <div id="ns-step2-err" style="color:var(--red);font-size:12px;margin-top:8px;display:none"></div>

  <div style="display:flex;justify-content:space-between;margin-top:20px">
    <button class="btn btn-ghost" onclick="window._nsBack()">← Back</button>
    <button class="btn btn-primary" style="padding:12px 32px;font-size:14px" onclick="window._nsStep2Next()">
      CONFIRM ROUTE SELECTION →
    </button>
  </div>
</div>`;
  }

  function renderStep3(){
    const route = routeOptions[selectedRouteIdx];
    const destCur = getCur(destPlace);
    const autoShipId = 'SC-' + (Math.floor(Math.random()*90000)+10000);
    const autoTrkId  = 'NEXUS-TRK-' + (Math.floor(Math.random()*9000)+1000) + '-IoT';
    if(!formValues.shipmentId) formValues.shipmentId = autoShipId;
    if(!formValues.trackerId)  formValues.trackerId  = autoTrkId;
    return `
<div class="ns-step-panel">
  <div class="ns-step-title">📋 Register Shipment & Activate Tracker</div>
  <p class="ns-step-sub">Confirm identifiers, assign customer & carrier, then activate the live telemetry tracker.</p>

  <!-- Selected route summary -->
  <div style="background:var(--surface2);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:8px;padding:14px 18px;margin-bottom:20px">
    <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Selected Route</div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="font-size:20px">${route.icon}</span>
      <strong>${route.label}</strong>
      <span class="badge badge-info">${route.eta}</span>
      <span class="badge badge-ok">${route.costLocal}</span>
      <span class="badge badge-info">${route.score}% AI Score</span>
    </div>
    <div style="font-size:12px;color:var(--muted);margin-top:6px">${originPlace.name.split(',').slice(0,2).join(',')} → ${destPlace.name.split(',').slice(0,2).join(',')}</div>
  </div>

  <div class="grid-2" style="gap:16px">
    <!-- Shipment ID -->
    <div class="ns-section-card" style="margin:0">
      <div class="ns-section-title">Shipment ID</div>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="form-input" id="ns-ship-id" value="${formValues.shipmentId}" placeholder="SC-XXXXX"
          oninput="window._nsUpdateField('shipmentId',this.value)" style="font-family:monospace;font-weight:700;font-size:15px"/>
        <button class="btn btn-ghost btn-sm" onclick="window._nsRegenId()">↺</button>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">Auto-generated · editable</div>
    </div>

    <!-- Tracker ID -->
    <div class="ns-section-card" style="margin:0">
      <div class="ns-section-title">Telemetry Tracker Sensor ID</div>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="form-input" id="ns-trk-id" value="${formValues.trackerId}" placeholder="NEXUS-TRK-XXXX-IoT"
          oninput="window._nsUpdateField('trackerId',this.value)" style="font-family:monospace;font-size:13px"/>
        <button class="btn btn-ghost btn-sm" onclick="window._nsRegenTrk()">↺</button>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">IoT telemetry unit · will activate on registration</div>
    </div>

    <!-- Customer -->
    <div class="ns-section-card" style="margin:0">
      <div class="ns-section-title">Customer / Consignee</div>
      <input class="form-input" id="ns-customer" value="${formValues.customer}" placeholder="Company name or contact"
        oninput="window._nsUpdateField('customer',this.value)"/>
    </div>

    <!-- Carrier -->
    <div class="ns-section-card" style="margin:0">
      <div class="ns-section-title">Carrier Partner</div>
      <select class="form-input" id="ns-carrier" onchange="window._nsUpdateField('carrier',this.value)">
        <option value="${route.carrier.id||''}">${route.carrier.name} (AI Selected)</option>
        ${APP_STATE.carriers.filter(c=>(route.carrier.id?c.id!==route.carrier.id:true)).map(c=>`
          <option value="${c.id}" ${formValues.carrier===c.id?'selected':''}>${c.name} · ${c.reliability}%</option>
        `).join('')}
      </select>
    </div>
  </div>

  <!-- Cargo + value summary -->
  <div class="ns-section-card" style="margin-top:16px">
    <div class="ns-section-title">Shipment Summary</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;font-size:13px">
      ${[
        ['Origin',      originPlace.name.split(',')[0]],
        ['Destination', destPlace.name.split(',')[0]],
        ['Cargo',       formValues.cargo||'—'],
        ['Priority',    formValues.priority],
        ['Weight',      formValues.weight?formValues.weight+' kg':'—'],
        ['Value',       formValues.value?destCur.symbol+Math.round(parseFloat(formValues.value)*destCur.rate).toLocaleString(undefined,{maximumFractionDigits:0})+' '+destCur.code:'—'],
        ['Distance',    (route.dist||'—')+'  km'],
        ['Currency',    destCur.code+' ('+destCur.name+')'],
      ].map(([k,v])=>`
        <div style="background:var(--surface2);border-radius:6px;padding:10px">
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em">${k}</div>
          <div style="font-weight:600;margin-top:2px">${v}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;margin-top:20px;align-items:center">
    <button class="btn btn-ghost" onclick="window._nsBack()">← Back</button>
    <button class="btn btn-success" style="padding:14px 36px;font-size:15px;font-weight:700" onclick="window._nsRegister()">
      🚀 REGISTER SHIPMENT &amp; ACTIVATE TRACKER
    </button>
  </div>
</div>`;
  }

  function renderSuccess(){
    const route = routeOptions[selectedRouteIdx];
    const destCur = getCur(destPlace);
    return `
<div class="ns-success-screen">
  <div style="font-size:48px;margin-bottom:12px">🚀</div>
  <h2 style="color:var(--green);margin-bottom:6px">Shipment Registered & Tracker Activated!</h2>
  <p style="color:var(--muted);margin-bottom:24px">The shipment is now live on the map and active monitoring has begun.</p>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;max-width:680px;margin:0 auto 24px;text-align:left">
    ${[
      ['Shipment ID',    formValues.shipmentId,  'var(--accent)'],
      ['Tracker ID',     formValues.trackerId,   'var(--green)'],
      ['Route',          route.icon+' '+route.label, 'var(--text)'],
      ['From',           originPlace.name.split(',')[0], 'var(--text)'],
      ['To',             destPlace.name.split(',')[0],   'var(--text)'],
      ['ETA',            route.eta,              'var(--yellow)'],
      ['Freight Cost',   route.costLocal,         'var(--orange)'],
      ['Carrier',        route.carrier.name,      'var(--text)'],
    ].map(([k,v,c])=>`
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px">
        <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">${k}</div>
        <div style="font-weight:700;font-size:14px;color:${c};font-family:${k.includes('ID')?'monospace':'inherit'}">${v}</div>
      </div>
    `).join('')}
  </div>

  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <button class="btn btn-primary" onclick="window.switchView('shipments')">📦 View in Shipments</button>
    <button class="btn btn-ghost"   onclick="window.switchView('coldchain')">🌡 Open Cold Chain Monitor</button>
    <button class="btn btn-ghost"   onclick="window._nsResetAll()">➕ Add Another Shipment</button>
  </div>
</div>`;
  }

  // ── Map helpers ────────────────────────────────────────────────────────────
  function mountPreviewMap(){
    const el = document.getElementById('ns-preview-map');
    if(!el || !window.L) return;
    if(routeMapInst){ routeMapInst.remove(); routeMapInst=null; }
    const center = originPlace ? [originPlace.lat, originPlace.lng] : [20,78];
    routeMapInst = L.map('ns-preview-map', { zoomControl:true, attributionControl:false }).setView(center, 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(routeMapInst);
    if(originPlace) L.marker([originPlace.lat,originPlace.lng]).addTo(routeMapInst).bindPopup('📦 Origin: '+originPlace.name.split(',')[0]);
    if(destPlace)   L.marker([destPlace.lat,destPlace.lng]).addTo(routeMapInst).bindPopup('🏁 Destination: '+destPlace.name.split(',')[0]);
    if(originPlace && destPlace){
      L.polyline([[originPlace.lat,originPlace.lng],[destPlace.lat,destPlace.lng]], { color:'#58a6ff', weight:2, dashArray:'6,4' }).addTo(routeMapInst);
      routeMapInst.fitBounds([[originPlace.lat,originPlace.lng],[destPlace.lat,destPlace.lng]], { padding:[30,30] });
    }
  }

  function mountRouteMap(){
    const el = document.getElementById('ns-route-map');
    if(!el || !window.L) return;
    if(routeMapInst){ routeMapInst.remove(); routeMapInst=null; }
    routeMapInst = L.map('ns-route-map', { zoomControl:true, attributionControl:false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(routeMapInst);
    const modeColors = { ship:'#3fb950', air:'#58a6ff', road:'#f0883e' };
    routeOptions.forEach((r,i)=>{
      if(originPlace && destPlace){
        const offset = (i-1)*0.5;
        const mid1 = { lat:(originPlace.lat+destPlace.lat)/2 + offset*1.5, lng:(originPlace.lng+destPlace.lng)/2 };
        L.polyline([
          [originPlace.lat, originPlace.lng],
          [mid1.lat, mid1.lng],
          [destPlace.lat, destPlace.lng],
        ], { color: modeColors[r.mode]||'#fff', weight: selectedRouteIdx===i?4:2, opacity: selectedRouteIdx===i?1:0.5, dashArray: r.mode==='air'?'6,4':undefined })
          .addTo(routeMapInst)
          .bindTooltip(`${r.icon} ${r.label} · ${r.eta}`, { permanent:false });
      }
    });
    L.marker([originPlace.lat, originPlace.lng]).addTo(routeMapInst).bindPopup('📦 '+originPlace.name.split(',')[0]);
    L.marker([destPlace.lat,   destPlace.lng  ]).addTo(routeMapInst).bindPopup('🏁 '+destPlace.name.split(',')[0]);
    routeMapInst.fitBounds([[originPlace.lat,originPlace.lng],[destPlace.lat,destPlace.lng]], { padding:[40,40] });
  }

  // ── Navigation & logic ─────────────────────────────────────────────────────
  function render(){
    const el = document.getElementById('view-newshipment');
    let content;
    if(step===4){
      content = renderSuccess();
    } else if(step===1){
      content = renderStep1();
    } else if(step===2){
      content = renderStep2();
    } else {
      content = renderStep3();
    }

    el.innerHTML = `
<div class="page-header">
  <div class="page-header-text">
    <h1>DISPATCH NEW SHIPMENT</h1>
    <p>NEXUS AI — 3-step intelligent dispatch with real-time geocoding &amp; route optimization</p>
  </div>
</div>
${step!==4 ? renderStepNav() : ''}
${content}
`;

    // Bind global handlers
    window._nsOriginType = v => debounceGeocode('ns-origin', v, 'geo-origin-list', r=>{ originPlace=r; updateStep1Preview(); });
    window._nsDestType   = v => debounceGeocode('ns-dest',   v, 'geo-dest-list',   r=>{ destPlace=r;   updateStep1Preview(); });
    window._nsUpdateField = (k,v) => { formValues[k]=v; };
    window._nsToggleReq   = (k,v) => { formValues.specialReqs[k]=v; };

    window._nsStep1Next = ()=>{
      const errEl = document.getElementById('ns-step1-err');
      if(!originPlace || !destPlace){
        errEl.textContent='Please select both origin and destination from the suggestions.';
        errEl.style.display='block'; return;
      }
      if(!formValues.cargo){
        errEl.textContent='Please select a cargo type.';
        errEl.style.display='block'; return;
      }
      errEl.style.display='none';
      routeOptions = calcRoutes(originPlace, destPlace, formValues.cargo, formValues.value);
      selectedRouteIdx = routeOptions.findIndex(r=>r.recommended);
      if(selectedRouteIdx<0) selectedRouteIdx=0;
      step=2; render();
      setTimeout(mountRouteMap, 80);
    };

    window._nsStep2Next = ()=>{
      const errEl = document.getElementById('ns-step2-err');
      if(selectedRouteIdx===null||selectedRouteIdx===undefined){
        errEl.textContent='Please select a route.'; errEl.style.display='block'; return;
      }
      if(routeOptions[selectedRouteIdx]?.incompatible){
        errEl.textContent='This route has no cold-chain capability for your cargo. Please choose another.'; errEl.style.display='block'; return;
      }
      errEl.style.display='none';
      step=3; render();
    };

    window._nsBack = ()=>{ step--; render(); if(step===1) setTimeout(()=>{ if(originPlace&&destPlace) mountPreviewMap(); },80); };

    window._nsSelectRoute = (i)=>{
      selectedRouteIdx=i;
      document.querySelectorAll('.ns-route-card').forEach((c,j)=>{
        c.classList.toggle('selected', j===i);
      });
      mountRouteMap();
    };

    window._nsRegenId  = ()=>{ formValues.shipmentId='SC-'+(Math.floor(Math.random()*90000)+10000); document.getElementById('ns-ship-id').value=formValues.shipmentId; };
    window._nsRegenTrk = ()=>{ formValues.trackerId='NEXUS-TRK-'+(Math.floor(Math.random()*9000)+1000)+'-IoT'; document.getElementById('ns-trk-id').value=formValues.trackerId; };

    window._nsRegister = ()=>{
      const sid = (document.getElementById('ns-ship-id')||{}).value || formValues.shipmentId;
      const tid = (document.getElementById('ns-trk-id')||{}).value  || formValues.trackerId;
      if(!sid){ showToast('Enter a Shipment ID','warn'); return; }
      formValues.shipmentId = sid;
      formValues.trackerId  = tid;
      // Add to live shipments state
      const route = routeOptions[selectedRouteIdx];
      const newShip = {
        id: sid,
        origin: originPlace.name.split(',')[0],
        destination: destPlace.name.split(',')[0],
        cargo: formValues.cargo,
        priority: formValues.priority,
        risk: formValues.priority==='CRITICAL'?'CRITICAL':'HIGH',
        carrier: route.carrier.name,
        carrierId: route.carrier.id||'',
        vehicleId: tid,
        status: 'IN_TRANSIT',
        etaHours: route.etaRaw,
        route: originPlace.name.split(',')[0]+' → '+destPlace.name.split(',')[0],
        coldChain: formValues.specialReqs.coldChain || ['Vaccine','Pharmaceutical','Perishable'].includes(formValues.cargo),
        value: parseFloat(formValues.value)||100000,
        currency: APP_STATE.getCurrencyForRoute ? APP_STATE.getCurrencyForRoute(originPlace.name.split(',')[0], destPlace.name.split(',')[0]) : { symbol:'$', code:'USD', rate:1 },
        affectedBy: null,
        lastUpdate: Date.now(),
        originLat: originPlace.lat, originLng: originPlace.lng,
        destLat: destPlace.lat,     destLng: destPlace.lng,
        currentLat: (originPlace.lat+destPlace.lat)/2,
        currentLng: (originPlace.lng+destPlace.lng)/2,
        transportMode: route.mode,
        trackerId: tid,
        registered: true,
      };
      APP_STATE.shipments.unshift(newShip);
      APP_STATE.alerts.unshift({ id:'REG'+Date.now(), icon:'🚀', title:'New Shipment Registered — '+sid, desc:originPlace.name.split(',')[0]+' → '+destPlace.name.split(',')[0]+' via '+route.label, time:Date.now(), severity:'info' });
      showToast('Shipment '+sid+' registered & tracker activated!','ok');
      step=4; render();
    };

    window._nsResetAll = ()=>{
      step=1; originPlace=null; destPlace=null; selectedRouteIdx=null; routeOptions=[];
      formValues={ cargo:'', priority:'MEDIUM', weight:'', value:'', specialReqs:{coldChain:false,hazmat:false,fragile:false}, shipmentId:'', trackerId:'', customer:'', carrier:'' };
      routeMapInst=null;
      render();
    };

    if(step===1 && originPlace && destPlace) setTimeout(mountPreviewMap, 80);
  }

  function updateStep1Preview(){
    const infoO = document.getElementById('geo-origin-info');
    const infoD = document.getElementById('geo-dest-info');
    if(infoO && originPlace) infoO.innerHTML=`<div class="geo-confirmed">📍 ${originPlace.name}</div>`;
    if(infoD && destPlace)   infoD.innerHTML=`<div class="geo-confirmed">📍 ${destPlace.name}</div>`;
    // Update local currency display
    if(originPlace && destPlace){
      const cur = APP_STATE.getCurrencyForRoute ? APP_STATE.getCurrencyForRoute(originPlace.name.split(',')[0], destPlace.name.split(',')[0]) : null;
      const valEl = document.getElementById('ns-value-local');
      const valInp = document.getElementById('ns-value');
      if(cur && valEl && valInp && valInp.value){
        valEl.textContent = `≈ ${cur.symbol}${Math.round(parseFloat(valInp.value)*cur.rate).toLocaleString(undefined,{maximumFractionDigits:0})} ${cur.code}`;
      }
      setTimeout(mountPreviewMap, 80);
    }
  }

  function showToast(msg, type='ok'){
    const tc = document.getElementById('toast-container');
    if(!tc) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    tc.appendChild(t);
    setTimeout(()=>t.classList.add('show'),10);
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); },3500);
  }

  return render;
})();
