/* SupplyGuard AI — App Router & Navigation */
'use strict';

(function(){
  const views = ['dashboard','disruptions','shipments','newshipment','rerouting','fleet','coldchain','copilot','recovery'];

  let currentView = 'dashboard';

  function switchView(name) {
    if(!views.includes(name)) return;
    views.forEach(v=>{
      const el = document.getElementById('view-'+v);
      if(el) el.classList.toggle('active', v===name);
    });

    // Update sidebar nav links
    document.querySelectorAll('.nav-link').forEach(link=>{
      link.classList.toggle('active', link.dataset.view===name);
    });

    currentView = name;

    // Render the view
    const fn = window['renderView_'+name];
    if(typeof fn==='function') fn();
  }

  // Sidebar nav link clicks
  document.querySelectorAll('.nav-link').forEach(link=>{
    link.addEventListener('click', e=>{
      e.preventDefault();
      const v = link.dataset.view;
      if(v) switchView(v);
    });
  });

  // Clock
  function updateClock(){
    const el = document.getElementById('topbar-clock');
    if(el) el.textContent = new Date().toLocaleTimeString();
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Alert drawer
  const bell    = document.getElementById('bell-btn');
  const drawer  = document.getElementById('alert-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const closeB  = document.getElementById('drawer-close');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('visible');
    renderAlerts();
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
  }
  if(bell)    bell.addEventListener('click', openDrawer);
  if(closeB)  closeB.addEventListener('click', closeDrawer);
  if(overlay) overlay.addEventListener('click', closeDrawer);

  function renderAlerts() {
    const body = document.getElementById('drawer-body');
    if(!body) return;
    body.innerHTML = APP_STATE.alerts.slice(0,20).map(a=>`
      <div class="alert-item">
        <div class="alert-item-icon">${a.icon}</div>
        <div class="alert-item-text">
          <div class="alert-item-title">${a.title}</div>
          <div class="alert-item-desc">${a.desc}</div>
          <div class="alert-item-time">${APP_STATE.ago(Date.now()-a.time)}</div>
        </div>
      </div>
    `).join('');
  }

  // Update bell badge on tick
  window.addEventListener('sg:tick', ()=>{
    const badge = document.getElementById('bell-badge');
    if(badge) badge.textContent = Math.min(APP_STATE.alerts.length, 99);
    // Update disruption badge
    const dbadge = document.getElementById('nav-badge-disruptions');
    if(dbadge && APP_STATE.disruptions.length > 0){
      dbadge.textContent = APP_STATE.disruptions.length;
      dbadge.style.display = 'inline-block';
    }
  });

  const badge = document.getElementById('bell-badge');
  if(badge) badge.textContent = APP_STATE.alerts.length;

  // Modal
  const modalBg    = document.getElementById('modal-bg');
  const modalClose = document.getElementById('modal-close');
  window.openModal = function(html) {
    document.getElementById('modal-inner').innerHTML = html;
    modalBg.classList.add('open');
  };
  window.closeModal = function() { modalBg.classList.remove('open'); };
  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modalBg)    modalBg.addEventListener('click', e=>{ if(e.target===modalBg) closeModal(); });

  // Initial render
  switchView('dashboard');

  // Expose
  window.switchView = switchView;
})();
