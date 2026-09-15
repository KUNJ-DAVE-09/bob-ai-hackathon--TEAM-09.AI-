/* Supply Chain Dashboard — Shared Data Engine & Simulation */
'use strict';

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const CARRIERS = [
  { id:'C01', name:'BlueWave Logistics',     reliability:94, coldChain:true,  hazmat:false },
  { id:'C02', name:'SwiftRoute Express',     reliability:88, coldChain:false, hazmat:false },
  { id:'C03', name:'Arctic Freight Co.',     reliability:96, coldChain:true,  hazmat:false },
  { id:'C04', name:'GlobalBridge Carriers',  reliability:82, coldChain:true,  hazmat:true  },
  { id:'C05', name:'PrimePath Logistics',    reliability:91, coldChain:false, hazmat:false },
  { id:'C06', name:'IceLink Transport',      reliability:97, coldChain:true,  hazmat:false },
  { id:'C07', name:'FastTrack Freight',      reliability:79, coldChain:false, hazmat:false },
  { id:'C08', name:'Meridian Cargo',         reliability:85, coldChain:true,  hazmat:true  },
  { id:'C09', name:'NorthStar Shipping',     reliability:93, coldChain:false, hazmat:false },
  { id:'C10', name:'SilkRoute International',reliability:87, coldChain:true,  hazmat:false },
  { id:'C11', name:'Atlas Freight Network',  reliability:90, coldChain:false, hazmat:false },
  { id:'C12', name:'ThermoHaul Solutions',   reliability:98, coldChain:true,  hazmat:false },
];

// Cities with lat/lng for map display
const CITY_COORDS = {
  'Mumbai':     [19.076, 72.877],
  'Delhi':      [28.704, 77.102],
  'Bangalore':  [12.972, 77.594],
  'Chennai':    [13.083, 80.270],
  'Kolkata':    [22.573, 88.364],
  'Hyderabad':  [17.388, 78.492],
  'Pune':       [18.520, 73.856],
  'Ahmedabad':  [23.023, 72.572],
  'Surat':      [21.170, 72.831],
  'Jaipur':     [26.912, 75.787],
  'Lucknow':    [26.847, 80.947],
  'Kanpur':     [26.449, 80.331],
  'Nagpur':     [21.146, 79.089],
  'Indore':     [22.718, 75.858],
  'Bhopal':     [23.259, 77.413],
  'Patna':      [25.612, 85.144],
  'Vadodara':   [22.307, 73.182],
  'Ludhiana':   [30.901, 75.858],
  'Agra':       [27.176, 78.008],
  'Nashik':     [19.997, 73.790],
  'Faridabad':  [28.408, 77.313],
  'Meerut':     [28.980, 77.706],
  'Rajkot':     [22.308, 70.800],
  'Varanasi':   [25.318, 83.006],
  'Srinagar':   [34.084, 74.797],
  // International
  'New York':   [40.712, -74.006],
  'Los Angeles':[34.052, -118.244],
  'Chicago':    [41.878, -87.630],
  'Houston':    [29.760, -95.370],
  'London':     [51.507, -0.128],
  'Paris':      [48.857, 2.352],
  'Frankfurt':  [50.110, 8.682],
  'Dubai':      [25.205, 55.271],
  'Singapore':  [1.352, 103.820],
  'Tokyo':      [35.690, 139.692],
  'Shanghai':   [31.224, 121.469],
  'Beijing':    [39.905, 116.404],
  'Sydney':     [-33.869, 151.209],
  'Toronto':    [43.653, -79.384],
  'São Paulo':  [-23.550, -46.633],
  'Johannesburg':[-26.204, 28.047],
  'Nairobi':    [-1.292, 36.822],
  'Istanbul':   [41.009, 28.960],
  'Moscow':     [55.756, 37.618],
  'Seoul':      [37.566, 126.978],
};

const CITIES = Object.keys(CITY_COORDS).filter(c => CITY_COORDS[c][0] > 5 || c === 'Nairobi' || c === 'Johannesburg' || c === 'São Paulo' || c === 'Sydney');

// ── CURRENCY MAPPING ──────────────────────────────────────────────────────────
const COUNTRY_CITIES = {
  INR: ['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad','Surat','Jaipur','Lucknow','Kanpur','Nagpur','Indore','Bhopal','Patna','Vadodara','Ludhiana','Agra','Nashik','Faridabad','Meerut','Rajkot','Varanasi','Srinagar'],
  USD: ['New York','Los Angeles','Chicago','Houston'],
  GBP: ['London'],
  EUR: ['Paris','Frankfurt'],
  AED: ['Dubai'],
  SGD: ['Singapore'],
  JPY: ['Tokyo'],
  CNY: ['Shanghai','Beijing'],
  AUD: ['Sydney'],
  CAD: ['Toronto'],
  BRL: ['São Paulo'],
  ZAR: ['Johannesburg'],
  KES: ['Nairobi'],
  TRY: ['Istanbul'],
  RUB: ['Moscow'],
  KRW: ['Seoul'],
};

const CURRENCIES = {
  INR: { name:'Indian Rupee',       symbol:'₹',  code:'INR', rate:83.2   },
  USD: { name:'US Dollar',          symbol:'$',  code:'USD', rate:1      },
  GBP: { name:'British Pound',      symbol:'£',  code:'GBP', rate:0.79   },
  EUR: { name:'Euro',               symbol:'€',  code:'EUR', rate:0.92   },
  AED: { name:'UAE Dirham',         symbol:'د.إ',code:'AED', rate:3.67   },
  SGD: { name:'Singapore Dollar',   symbol:'S$', code:'SGD', rate:1.34   },
  JPY: { name:'Japanese Yen',       symbol:'¥',  code:'JPY', rate:149.5  },
  CNY: { name:'Chinese Yuan',       symbol:'¥',  code:'CNY', rate:7.24   },
  AUD: { name:'Australian Dollar',  symbol:'A$', code:'AUD', rate:1.54   },
  CAD: { name:'Canadian Dollar',    symbol:'CA$',code:'CAD', rate:1.36   },
  BRL: { name:'Brazilian Real',     symbol:'R$', code:'BRL', rate:4.96   },
  ZAR: { name:'South African Rand', symbol:'R',  code:'ZAR', rate:18.9   },
  KES: { name:'Kenyan Shilling',    symbol:'KSh',code:'KES', rate:129.0  },
  TRY: { name:'Turkish Lira',       symbol:'₺',  code:'TRY', rate:30.5   },
  RUB: { name:'Russian Ruble',      symbol:'₽',  code:'RUB', rate:91.0   },
  KRW: { name:'South Korean Won',   symbol:'₩',  code:'KRW', rate:1320   },
};

function getCurrencyForCity(city){
  for(const [code, cities] of Object.entries(COUNTRY_CITIES)){
    if(cities.includes(city)) return CURRENCIES[code];
  }
  return CURRENCIES['USD'];
}

function getCurrencyForRoute(origin, dest){
  // Prefer destination currency if international
  const oc = getCurrencyForCity(origin);
  const dc = getCurrencyForCity(dest);
  // If same currency code → use it; otherwise prefer destination
  return oc.code === dc.code ? oc : dc;
}

function fmtCurLocal(n, city){
  const cur = getCurrencyForCity(city);
  const val = n * cur.rate;
  return `${cur.symbol}${val.toLocaleString(undefined,{maximumFractionDigits:0})} ${cur.code}`;
}

const CARGO_TYPES = ['Vaccine','Pharmaceutical','Perishable','Electronics','Machinery','Textiles','Automotive','Chemical'];
const COLD_CARGO  = ['Vaccine','Pharmaceutical','Perishable'];

// ── ENHANCED TEMP RANGES: separate cold cargo vs container limits ──────────────
const TEMP_RANGES = {
  'Vaccine':       { min:2,   max:8,   unit:'°C', regulator:'WHO/FDA',  immediateAlert:true,  warningBufferMin:0  },
  'Pharmaceutical':{ min:-20, max:8,   unit:'°C', regulator:'FDA/EMA',  immediateAlert:true,  warningBufferMin:0  },
  'Perishable':    { min:0,   max:4,   unit:'°C', regulator:'FDA/USDA', immediateAlert:true,  warningBufferMin:0  },
};

// Container/normal goods temperature limits (15-min buffer before warning)
const CONTAINER_TEMP_RANGES = {
  'Electronics': { min:5,  max:40, unit:'°C', regulator:'IEC-60721', immediateAlert:false, warningBufferMin:15 },
  'Machinery':   { min:-10,max:50, unit:'°C', regulator:'ISO-1461',  immediateAlert:false, warningBufferMin:15 },
  'Textiles':    { min:10, max:35, unit:'°C', regulator:'Standard',  immediateAlert:false, warningBufferMin:15 },
  'Automotive':  { min:0,  max:50, unit:'°C', regulator:'SAE-J1211', immediateAlert:false, warningBufferMin:15 },
  'Chemical':    { min:-5, max:30, unit:'°C', regulator:'ADR-2023',  immediateAlert:false, warningBufferMin:15 },
};

const DISRUPTION_TYPES = ['Weather – Cyclone','Port Strike','Geopolitical Crisis','Flood Warning','Road Closure','Carrier Capacity Shortage','Customs Delay'];

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function rnd(a,b)    { return Math.floor(Math.random()*(b-a+1))+a; }
function pick(arr)   { return arr[Math.floor(Math.random()*arr.length)]; }
function fmtNum(n)   { return n.toLocaleString(); }
function fmtCur(n)   { return '$'+fmtNum(n); }
function ago(ms)     {
  const m = Math.floor(ms/60000), h = Math.floor(ms/3600000);
  if(h>0) return h+'h ago'; if(m>0) return m+'m ago'; return 'Just now';
}
function fmtTime(d)  {
  return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function etaHours()  { return rnd(8,96); }
function routePath(from,to){
  const mids = CITIES.filter(c=>c!==from&&c!==to);
  return from+' → '+pick(mids)+' → '+to;
}

function getCoords(city){
  return CITY_COORDS[city] || [20.0, 78.0];
}

// ── DISRUPTIONS ───────────────────────────────────────────────────────────────
function makeDisruption(id, overrides={}) {
  const type = overrides.type || pick(DISRUPTION_TYPES);
  const hub  = overrides.hub || pick(Object.keys(CITY_COORDS));
  const coords = getCoords(hub);
  return {
    id,
    type,
    hub,
    lat: coords[0],
    lng: coords[1],
    severity: overrides.severity || pick(['CRITICAL','HIGH','MEDIUM']),
    started:  Date.now() - rnd(1,360)*60000,
    expectedResolution: rnd(6,48),
    affectedRoutes: rnd(3,12),
    shipmentsImpacted: rnd(12,45),
    status: 'ACTIVE',
    details: `${type} impacting routes through ${hub} and surrounding zones. ${rnd(3,8)} carrier services suspended. Estimated ${rnd(6,48)}h to resolution.`,
    ...overrides
  };
}

const BASE_DISRUPTIONS = [
  makeDisruption('D001',{ type:'Weather – Cyclone',          severity:'CRITICAL', hub:'Chennai',   shipmentsImpacted:47 }),
  makeDisruption('D002',{ type:'Port Strike',                severity:'HIGH',     hub:'Mumbai',    shipmentsImpacted:31 }),
  makeDisruption('D003',{ type:'Geopolitical Crisis',        severity:'HIGH',     hub:'Delhi',     shipmentsImpacted:22 }),
  makeDisruption('D004',{ type:'Flood Warning',              severity:'MEDIUM',   hub:'Kolkata',   shipmentsImpacted:15 }),
  makeDisruption('D005',{ type:'Carrier Capacity Shortage',  severity:'MEDIUM',   hub:'Bangalore', shipmentsImpacted:9  }),
  makeDisruption('D006',{ type:'Port Strike',                severity:'HIGH',     hub:'Dubai',     shipmentsImpacted:28 }),
  makeDisruption('D007',{ type:'Weather – Cyclone',          severity:'MEDIUM',   hub:'Singapore', shipmentsImpacted:18 }),
];

// ── SHIPMENTS ────────────────────────────────────────────────────────────────
function makeShipment(i, disruption) {
  const allCities = Object.keys(CITY_COORDS);
  const origin   = pick(allCities);
  const destPool = allCities.filter(c=>c!==origin);
  const dest     = pick(destPool);
  const cargo    = pick(CARGO_TYPES);
  const isCold   = COLD_CARGO.includes(cargo);
  const etaH     = etaHours();
  const prio     = pick(['CRITICAL','HIGH','HIGH','MEDIUM','MEDIUM','LOW']);
  const affected = !!disruption;
  const oCoords  = getCoords(origin);
  const dCoords  = getCoords(dest);

  let risk;
  if(isCold && etaH<24 && prio==='CRITICAL')          risk='CRITICAL';
  else if(affected && (prio==='CRITICAL'||etaH<24))   risk='CRITICAL';
  else if(affected && (prio==='HIGH'||etaH<48))        risk='HIGH';
  else if(affected && etaH<96)                         risk='MEDIUM';
  else if(affected)                                    risk='LOW';
  else                                                 risk='LOW';

  const carrierId = pick(CARRIERS).id;
  const carrier   = CARRIERS.find(c=>c.id===carrierId);
  const vid       = (cargo==='Vaccine'||cargo==='Pharmaceutical'||cargo==='Perishable'?'T':'C')+'-'+String(rnd(10,99));
  const value     = rnd(50,800)*1000;
  const tempRange = isCold ? TEMP_RANGES[cargo] : (CONTAINER_TEMP_RANGES[cargo]||null);

  return {
    id: 'SH'+String(100+i).padStart(3,'0'),
    origin, destination:dest, cargo, priority:prio, risk,
    carrier: carrier.name, carrierId,
    vehicleId:vid,
    status: affected?pick(['DELAYED','AT_RISK','DIVERTED']):'IN_TRANSIT',
    etaHours: etaH,
    route: routePath(origin,dest),
    coldChain: isCold,
    tempMin: tempRange?tempRange.min:null,
    tempMax: tempRange?tempRange.max:null,
    regulator: tempRange?tempRange.regulator:null,
    immediateAlert: tempRange?tempRange.immediateAlert:false,
    warningBufferMin: tempRange?tempRange.warningBufferMin:999,
    value,
    currency: getCurrencyForRoute(origin,dest),
    affectedBy: disruption?disruption.id:null,
    disruption: disruption||null,
    lastUpdate: Date.now() - rnd(0,30)*60000,
    originLat: oCoords[0],
    originLng: oCoords[1],
    destLat:   dCoords[0],
    destLng:   dCoords[1],
    // Current position — simulated midpoint with slight deviation
    currentLat: (oCoords[0]+dCoords[0])/2 + (Math.random()-0.5)*2,
    currentLng: (oCoords[1]+dCoords[1])/2 + (Math.random()-0.5)*2,
    transportMode: pick(['road','air','ship']),
  };
}

function generateShipments() {
  const list = [];
  for(let i=0;i<65;i++){
    const dis = pick(BASE_DISRUPTIONS);
    list.push(makeShipment(i+1, dis));
  }
  for(let i=65;i<200;i++){
    list.push(makeShipment(i+1, null));
  }
  return list;
}

// ── FLEET ASSETS ─────────────────────────────────────────────────────────────
function makeAsset(i) {
  const types = ['Truck (Standard)','Truck (Reefer)','Container 20ft','Container 40ft','Van (Cold)','Tanker'];
  const statusOpts = ['IDLE','IDLE','IN_TRANSIT','ASSIGNED','MAINTENANCE'];
  const type   = pick(types);
  const status = pick(statusOpts);
  const city   = pick(CITIES);
  const coords = getCoords(city);
  return {
    id: (type.startsWith('Truck')?'T':type.startsWith('Van')?'V':type.startsWith('Tank')?'TK':'C')+'-'+String(10+i).padStart(2,'0'),
    type,
    status,
    location: city,
    lat: coords[0] + (Math.random()-0.5)*0.5,
    lng: coords[1] + (Math.random()-0.5)*0.5,
    capacity: type.includes('40ft')?40000:type.includes('20ft')?20000:type.includes('Tanker')?30000:12000,
    coldChain: type.includes('Reefer')||type.includes('Cold'),
    idleSince: status==='IDLE'?rnd(1,72):null,
    utilization: status==='IDLE'?0:rnd(40,95),
    nextAvailable: status==='MAINTENANCE'?rnd(4,24):null,
  };
}

function generateFleet() {
  const fleet = [];
  for(let i=0;i<48;i++) fleet.push(makeAsset(i));
  return fleet;
}

// ── COLD-CHAIN SENSOR STREAMS ─────────────────────────────────────────────────
function makeStream(shipment) {
  const isCold = COLD_CARGO.includes(shipment.cargo);
  const range  = isCold
    ? TEMP_RANGES[shipment.cargo]
    : (CONTAINER_TEMP_RANGES[shipment.cargo] || { min:5, max:40, immediateAlert:false, warningBufferMin:15, regulator:'Standard' });

  const nominal = (range.min+range.max)/2;
  const inBreach= Math.random()<0.25;
  const history = [];

  for(let i=29;i>=0;i--){
    let t;
    if(inBreach && i<=5) {
      t = range.max + rnd(1,6) + (Math.random()-0.5)*0.5;
    } else {
      t = nominal + (Math.random()-0.5)*1.5;
    }
    history.push(parseFloat(t.toFixed(1)));
  }

  // Detect drastic temperature spikes (rise or fall ≥ 3°C in 2 readings)
  const spike = detectTempSpike(history);

  // Warning buffer: for vaccines/perishables = 0 min (immediate); others = 15 min
  const breachDur = inBreach ? rnd(1,4)*30 : 0;
  const bufMin    = range.warningBufferMin || 0;
  const warningActive = inBreach && (range.immediateAlert || breachDur >= bufMin);

  return {
    shipmentId:   shipment.id,
    sensorId:     'SNS-'+shipment.id,
    cargo:        shipment.cargo,
    route:        shipment.origin+' → '+shipment.destination,
    carrier:      shipment.carrier,
    tempMin:      range.min,
    tempMax:      range.max,
    regulator:    range.regulator,
    immediateAlert: range.immediateAlert || false,
    warningBufferMin: bufMin,
    history,
    current:      history[history.length-1],
    inBreach,
    warningActive,
    breachDuration: breachDur,
    severity:     warningActive
      ? (history[history.length-1]>range.max+5?'EMERGENCY':history[history.length-1]>range.max+2?'CRITICAL':'WARNING')
      : (inBreach && !warningActive ? 'MONITORING' : 'OK'),
    spike,
  };
}

function detectTempSpike(history){
  if(history.length < 3) return null;
  const window = 3; // look at last 3 readings
  const recent = history.slice(-window);
  const maxDelta = 3.0; // °C threshold for drastic change
  let maxRise = 0, maxFall = 0, idx = -1, dir = null;
  for(let i=1;i<recent.length;i++){
    const delta = recent[i]-recent[i-1];
    if(delta > maxRise){ maxRise=delta; if(delta>=maxDelta){ dir='RISE'; idx=i; } }
    if(delta < maxFall){ maxFall=delta; if(Math.abs(delta)>=maxDelta){ dir='FALL'; idx=i; } }
  }
  if(dir) return { direction:dir, delta: dir==='RISE'?maxRise:Math.abs(maxFall) };
  return null;
}

function generateSensorStreams(shipments) {
  // Include both cold cargo AND container cargo for monitoring
  const monitorable = shipments.filter(s=> COLD_CARGO.includes(s.cargo) || CONTAINER_TEMP_RANGES[s.cargo]).slice(0,24);
  return monitorable.map(s=>makeStream(s));
}

// ── REROUTING OPTIONS ─────────────────────────────────────────────────────────
function generateReroutes(shipments) {
  const critical = shipments.filter(s=>['CRITICAL','HIGH'].includes(s.risk)).slice(0,15);
  return critical.map(sh=>{
    const c1 = pick(CARRIERS.filter(c=>c.id!==sh.carrierId));
    const c2 = pick(CARRIERS.filter(c=>c.id!==sh.carrierId&&c.id!==c1.id));
    const mid1 = pick(CITIES.filter(c=>c!==sh.origin&&c!==sh.destination));
    const mid2 = pick(CITIES.filter(c=>c!==sh.origin&&c!==sh.destination&&c!==mid1));
    return {
      shipmentId:   sh.id,
      cargo:        sh.cargo,
      origin:       sh.origin,
      destination:  sh.destination,
      risk:         sh.risk,
      value:        sh.value,
      currency:     sh.currency,
      originalCarrier: sh.carrier,
      originLat:    sh.originLat,
      originLng:    sh.originLng,
      destLat:      sh.destLat,
      destLng:      sh.destLng,
      options: [
        { id:'R1', route: sh.origin+' → '+mid1+' → '+sh.destination, carrier:c1.name, delay:rnd(4,18),  costDelta:rnd(2000,8000),   score:rnd(75,92), recommended:false, coldChain:c1.coldChain },
        { id:'R2', route: sh.origin+' → '+mid2+' → '+sh.destination, carrier:c2.name, delay:rnd(18,36), costDelta:-rnd(1000,4000),  score:rnd(60,80), recommended:false, coldChain:c2.coldChain },
        { id:'R3', route: sh.origin+' → '+sh.destination+' (Direct / Air)', carrier:pick(CARRIERS).name, delay:rnd(0,4), costDelta:rnd(8000,25000), score:rnd(85,98), recommended:true, coldChain:true },
      ]
    };
  });
}

// ── ALERTS ───────────────────────────────────────────────────────────────────
const INIT_ALERTS = [
  { id:'A1', icon:'🌀', title:'Cyclone Alert — Chennai',      desc:'47 shipments at risk. Immediate action required.',    time: Date.now()-5*60000,  severity:'critical' },
  { id:'A2', icon:'🌡', title:'Cold-Chain Breach — SH112',    desc:'Vaccine cargo exceeding 8°C for 45 minutes.',          time: Date.now()-12*60000, severity:'critical' },
  { id:'A3', icon:'⚓', title:'Port Strike — Mumbai',         desc:'31 shipments blocked. Carrier alternatives available.',time: Date.now()-28*60000, severity:'high'     },
  { id:'A4', icon:'🌡', title:'Temperature Warning — SH089',  desc:'Pharmaceutical approaching upper threshold.',          time: Date.now()-41*60000, severity:'high'     },
  { id:'A5', icon:'📦', title:'SLA Risk — 12 Shipments',      desc:'Estimated delivery breach in next 24 hours.',          time: Date.now()-55*60000, severity:'medium'   },
];

// ── COPILOT INTENTS & RESPONSES (NexusAI) ─────────────────────────────────────
const COPILOT_INTENTS = [
  {
    patterns: ['how many critical','critical shipment','critical cargo'],
    respond: (state) => {
      const n = state.shipments.filter(s=>s.risk==='CRITICAL').length;
      return `There are currently <strong>${n} CRITICAL shipments</strong> in the network. ${state.shipments.filter(s=>s.risk==='CRITICAL'&&s.coldChain).length} of these carry temperature-sensitive cargo (vaccines, pharma, or perishables) requiring immediate rerouting or asset redeployment.`;
    }
  },
  {
    patterns: ['idle fleet','idle asset','available truck','available vehicle'],
    respond: (state) => {
      const idle = state.fleet.filter(s=>s.status==='IDLE');
      const reefers = idle.filter(s=>s.coldChain);
      return `<strong>${idle.length} fleet assets</strong> are currently idle across the network. <strong>${reefers.length}</strong> are temperature-controlled (reefers/cold vans), suitable for cold-chain redeployment. Cities with highest idle concentration: ${[...new Set(idle.map(a=>a.location))].slice(0,3).join(', ')}.`;
    }
  },
  {
    patterns: ['disruption','active incident','how many disruption','current disruption'],
    respond: (state) => {
      const d = state.disruptions;
      const critical = d.filter(x=>x.severity==='CRITICAL').length;
      return `There are <strong>${d.length} active disruptions</strong>: <span class="badge badge-critical">${critical} CRITICAL</span>, <span class="badge badge-high">${d.filter(x=>x.severity==='HIGH').length} HIGH</span>, <span class="badge badge-medium">${d.filter(x=>x.severity==='MEDIUM').length} MEDIUM</span>. Total shipments impacted: <strong>${d.reduce((a,x)=>a+x.shipmentsImpacted,0)}</strong>. Most severe: <strong>${d.find(x=>x.severity==='CRITICAL')?.type} at ${d.find(x=>x.severity==='CRITICAL')?.hub}</strong>.`;
    }
  },
  {
    patterns: ['cold chain breach','temperature breach','excursion','temp alert'],
    respond: (state) => {
      const breached = state.sensorStreams.filter(s=>s.warningActive);
      const emergency = breached.filter(s=>s.severity==='EMERGENCY');
      return `<strong>${breached.length} cold-chain streams</strong> have active warnings. <strong>${emergency.length}</strong> classified as EMERGENCY. Note: Vaccines and perishables trigger <strong>immediate alerts</strong>; other goods have a 15-minute buffer before warnings are raised. Affected: ${[...new Set(breached.map(s=>s.cargo))].join(', ')}.`;
    }
  },
  {
    patterns: ['spike','temperature spike','drastic','sudden temperature'],
    respond: (state) => {
      const spikes = state.sensorStreams.filter(s=>s.spike);
      return spikes.length
        ? `<strong>${spikes.length} sensor streams</strong> show drastic temperature changes: ${spikes.map(s=>`<strong>${s.shipmentId}</strong> (${s.spike.direction} ${s.spike.delta.toFixed(1)}°C)`).join(', ')}. Investigate immediately to prevent cargo loss.`
        : `No drastic temperature spikes detected currently across all monitored streams.`;
    }
  },
  {
    patterns: ['reroute','alternative route','carrier alternative','re-route'],
    respond: (state) => {
      const r = state.reroutes.length;
      const avg = state.reroutes.reduce((a,x)=>a+x.options[2].delay,0)/r;
      return `<strong>${r} shipments</strong> have active rerouting options. Average fast-track delay: <strong>${Math.round(avg)}h</strong>. ${state.reroutes.filter(x=>x.options.some(o=>o.coldChain&&o.recommended)).length} reroutes include cold-chain options. Click Rerouting in the sidebar to review.`;
    }
  },
  {
    patterns: ['total value','cargo value','financial exposure','at risk value'],
    respond: (state) => {
      const total = state.shipments.filter(s=>['CRITICAL','HIGH'].includes(s.risk)).reduce((a,s)=>a+s.value,0);
      const cold  = state.shipments.filter(s=>s.risk==='CRITICAL'&&s.coldChain).reduce((a,s)=>a+s.value,0);
      return `Total cargo value at risk (CRITICAL + HIGH): <strong>${fmtCur(total)}</strong>. Cold-chain CRITICAL exposure: <strong>${fmtCur(cold)}</strong>. Highest single shipment: <strong>${fmtCur(Math.max(...state.shipments.filter(s=>s.risk==='CRITICAL').map(s=>s.value)))}</strong>.`;
    }
  },
  {
    patterns: ['summary','what is happening','status','overview','situation'],
    respond: (state) => {
      const crit = state.shipments.filter(s=>s.risk==='CRITICAL').length;
      const high = state.shipments.filter(s=>s.risk==='HIGH').length;
      const idle = state.fleet.filter(s=>s.status==='IDLE').length;
      const breach = state.sensorStreams.filter(s=>s.warningActive).length;
      const spikes = state.sensorStreams.filter(s=>s.spike).length;
      return `<strong>Current Operations Summary:</strong><br/>
• <strong>${state.disruptions.length}</strong> active disruptions affecting <strong>${state.disruptions.reduce((a,d)=>a+d.shipmentsImpacted,0)}</strong> shipments<br/>
• <strong>${crit} CRITICAL</strong> + <strong>${high} HIGH</strong> risk shipments require action<br/>
• <strong>${breach}</strong> cold-chain warnings active | <strong>${spikes}</strong> temperature spikes detected<br/>
• <strong>${idle}</strong> idle fleet assets available for redeployment<br/>
• Most urgent: <strong>${state.disruptions[0]?.type}</strong> at <strong>${state.disruptions[0]?.hub}</strong>`;
    }
  },
  {
    patterns: ['recovery plan','generate plan','executive summary'],
    respond: () => `Generate a full executive recovery plan from the <strong>"Recovery Plan"</strong> section. It includes: disruption summary, shipment action matrix, fleet redeployment orders, cold-chain intervention log, KPI projections, and a 72-hour action timeline.`
  },
  {
    patterns: ['vaccine','pharmaceutical','pharma','perishable'],
    respond: (state) => {
      const v = state.sensorStreams.filter(s=>s.cargo==='Vaccine');
      const vBreach = v.filter(s=>s.warningActive).length;
      return `Monitoring <strong>${v.length} vaccine streams</strong>. <strong>${vBreach}</strong> in active warning. Vaccines trigger <strong>immediate alerts</strong> (no buffer) — any breach is reported instantly per WHO GDP requirements. Status: ${vBreach?'<span class="badge badge-danger">ACTIVE EXCURSION</span>':'<span class="badge badge-ok">ALL WITHIN RANGE</span>'}.`;
    }
  },
  {
    patterns: ['fleet utilization','utilization','asset usage'],
    respond: (state) => {
      const idle = state.fleet.filter(s=>s.status==='IDLE').length;
      const total = state.fleet.length;
      const util = Math.round(((total-idle)/total)*100);
      return `Fleet utilization: <strong>${util}%</strong> (${total-idle}/${total} assets active). <strong>${idle} idle</strong> — est. idle cost: <strong>${fmtCur(idle*2800)}/day</strong>. ${state.fleet.filter(s=>s.status==='MAINTENANCE').length} in maintenance.`;
    }
  },
  {
    patterns: ['currency','price','cost','value in'],
    respond: (state) => {
      const sample = state.shipments.slice(0,3).map(s=>`${s.id}: ${s.currency.symbol}${(s.value*s.currency.rate).toLocaleString(undefined,{maximumFractionDigits:0})} ${s.currency.code}`).join('<br/>');
      return `Cargo values are displayed in the destination country's currency. Sample values:<br/>${sample}<br/>Exchange rates are updated relative to USD baseline.`;
    }
  },
  {
    patterns: ['help','what can you do','capabilities','commands'],
    respond: () => `I can answer questions about:<br/>
• 🚨 <strong>Disruptions</strong> — "How many disruptions are active?"<br/>
• 📦 <strong>Shipments</strong> — "How many critical shipments?"<br/>
• 🌡 <strong>Cold Chain</strong> — "Any temperature breaches?" / "Any spikes?"<br/>
• 🔀 <strong>Rerouting</strong> — "What rerouting options exist?"<br/>
• 🚛 <strong>Fleet</strong> — "How many idle trucks?"<br/>
• 💰 <strong>Financials</strong> — "What is the total value at risk?" / "Currency info"<br/>
• 📋 <strong>Recovery</strong> — "Generate a recovery plan"<br/><br/>
Ask in natural language — I'll find the answer from live operational data.`
  },
];

function copilotRespond(input, state) {
  const q = input.toLowerCase();
  for(const intent of COPILOT_INTENTS) {
    if(intent.patterns.some(p=>q.includes(p))) {
      return intent.respond(state);
    }
  }
  return `I couldn't match a specific intent for "<em>${input}</em>". Try asking about: disruptions, critical shipments, cold-chain breaches, temperature spikes, idle fleet, rerouting options, cargo value at risk. Type <strong>help</strong> for the full list.`;
}

// ── STATE INITIALISATION ──────────────────────────────────────────────────────
const SHIPMENTS  = generateShipments();
const FLEET      = generateFleet();
const SENSOR_STREAMS = generateSensorStreams(SHIPMENTS);
const REROUTES   = generateReroutes(SHIPMENTS);

window.APP_STATE = {
  disruptions:   [...BASE_DISRUPTIONS],
  shipments:     SHIPMENTS,
  fleet:         FLEET,
  sensorStreams: SENSOR_STREAMS,
  reroutes:      REROUTES,
  alerts:        [...INIT_ALERTS],
  carriers:      CARRIERS,
  copilotRespond,
  fmtCur, fmtNum, fmtTime, ago, pick, rnd,
  TEMP_RANGES,
  CONTAINER_TEMP_RANGES,
  CITY_COORDS,
  getCurrencyForCity,
  getCurrencyForRoute,
  fmtCurLocal,
  getCoords,
};

// ── SIMULATION TICK ───────────────────────────────────────────────────────────
setInterval(()=>{
  APP_STATE.sensorStreams.forEach(stream=>{
    const range = { min:stream.tempMin, max:stream.tempMax };
    const nominal = (range.min+range.max)/2;
    let newTemp;
    const prevTemp = stream.history[stream.history.length-1];
    if(stream.inBreach) {
      newTemp = parseFloat((prevTemp + (Math.random()-0.3)*0.4).toFixed(1));
      if(Math.random()<0.08) { stream.inBreach=false; }
      else {
        stream.breachDuration += 2;
        // Re-evaluate warningActive based on buffer
        stream.warningActive = stream.immediateAlert || stream.breachDuration >= stream.warningBufferMin;
        if(stream.warningActive){
          stream.severity = newTemp>range.max+5?'EMERGENCY':newTemp>range.max+2?'CRITICAL':'WARNING';
        } else {
          stream.severity = 'MONITORING';
        }
      }
    } else {
      newTemp = parseFloat((nominal + (Math.random()-0.5)*1.2).toFixed(1));
      if(Math.random()<0.02) { stream.inBreach=true; stream.breachDuration=0; stream.severity='MONITORING'; stream.warningActive=false; }
    }
    stream.history.push(newTemp);
    if(stream.history.length>60) stream.history.shift();
    stream.current = newTemp;

    // Update spike detection
    stream.spike = detectTempSpike(stream.history.slice(-6));

    // Push alert if drastic spike
    if(stream.spike && stream.spike.delta >= 3.5 && Math.random()<0.1){
      APP_STATE.alerts.unshift({
        id:'SP'+Date.now(),
        icon:'🌡',
        title:`Temp ${stream.spike.direction} — ${stream.shipmentId}`,
        desc:`${stream.cargo}: ${stream.spike.direction==='RISE'?'+':'-'}${stream.spike.delta.toFixed(1)}°C sudden change detected.`,
        time: Date.now(),
        severity:'critical',
      });
      if(APP_STATE.alerts.length>20) APP_STATE.alerts.pop();
    }
  });

  // Update a few shipment statuses randomly
  const toUpdate = APP_STATE.shipments.filter(s=>s.affectedBy).slice(0,3);
  toUpdate.forEach(s=>{
    if(Math.random()<0.1) s.lastUpdate = Date.now();
  });

  window.dispatchEvent(new CustomEvent('sg:tick'));
}, 2000);
