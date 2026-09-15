/* AI Copilot View */
'use strict';

window.renderView_copilot = (function(){
  const SUGGESTIONS = [
    'How many critical shipments?',
    'Any cold-chain breaches?',
    'Any temperature spikes?',
    'How many idle assets?',
    'What disruptions are active?',
    'Total cargo value at risk?',
    'Currency info',
    'Summary of current situation',
    'What rerouting options exist?',
    'How many vaccines affected?',
    'Fleet utilization?',
    'Help',
  ];

  let messages = [
    {
      role:'bot',
      html:`Welcome to <strong>NEXUS AI Copilot</strong> 🤖<br/>
I have real-time access to all disruption data, affected shipments, cold-chain sensor streams, fleet status, and multi-currency cargo values.<br/><br/>
Ask me anything about your supply chain operations, or pick a suggestion below.`,
      time: new Date(),
    }
  ];

  function ts(d){ return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }

  function appendMessage(role, html){
    messages.push({ role, html, time:new Date() });
    renderMessages();
  }

  function renderMessages(){
    const container = document.getElementById('copilot-msgs');
    if(!container) return;
    container.innerHTML = messages.map(m=>`
      <div class="msg msg-${m.role}">
        <div class="msg-bubble">${m.html}</div>
        <div class="msg-meta">${m.role==='bot'?'🤖 NEXUS AI':'You'} · ${ts(m.time)}</div>
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  }

  function showTyping(){
    const container = document.getElementById('copilot-msgs');
    if(!container) return;
    const el = document.createElement('div');
    el.id = 'typing-indicator';
    el.className = 'msg msg-bot';
    el.innerHTML = '<div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }
  function hideTyping(){
    const el = document.getElementById('typing-indicator');
    if(el) el.remove();
  }

  function handleSend(q){
    if(!q.trim()) return;
    appendMessage('user', q);
    const input = document.getElementById('copilot-input');
    if(input) input.value = '';
    showTyping();
    setTimeout(()=>{
      hideTyping();
      const resp = APP_STATE.copilotRespond(q, APP_STATE);
      appendMessage('bot', resp);
    }, 700 + Math.random()*600);
  }

  function render(){
    const el = document.getElementById('view-copilot');
    el.innerHTML = `
<div class="page-header">
  <div class="page-header-text">
    <h1>NEXUS AI Copilot</h1>
    <p>Natural-language operations assistant — powered by <strong>NEXUS AI</strong></p>
  </div>
  <div style="display:flex;gap:8px;align-items:center">
    <div class="status-dot pulse-green"></div>
    <span style="font-size:12px;color:var(--muted)">Connected to live data</span>
  </div>
</div>

<div class="copilot-wrap">
  <div class="copilot-messages" id="copilot-msgs"></div>
  <div class="copilot-suggestions" id="copilot-sugg">
    ${SUGGESTIONS.map(s=>`<button class="suggestion-chip" onclick="window._copilotSend('${s}')">${s}</button>`).join('')}
  </div>
  <div class="copilot-input-row">
    <input class="copilot-input" id="copilot-input" placeholder="Ask about disruptions, shipments, cold-chain, fleet…" autocomplete="off"
      onkeydown="if(event.key==='Enter')window._copilotSend(this.value)"/>
    <button class="btn btn-primary" onclick="window._copilotSend(document.getElementById('copilot-input').value)">Send ↵</button>
    <button class="btn btn-ghost" onclick="window._copilotClear()">Clear</button>
  </div>
</div>
`;

    window._copilotSend  = (q)=>handleSend(q);
    window._copilotClear = ()=>{
      messages = [messages[0]]; // Keep welcome
      renderMessages();
    };

    renderMessages();
    const input = document.getElementById('copilot-input');
    if(input) setTimeout(()=>input.focus(), 100);
  }

  return render;
})();
