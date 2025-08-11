// EduLink PWA demo app.js - offline demo, judge mode, fake users, fake chat, booking
(() => {
  // fake dataset - student-focused services
  const SERVICES = [
    {id:1,title:'Math & Science Tutoring',desc:'One-on-one tutoring for calculus and physics.',price:'₹200/hr',rating:4.8,tag:'Tutoring',avail:'Available today'},
    {id:2,title:'Assignment Proofreading',desc:'Grammar, structure, and formatting fixes.',price:'₹150',rating:4.6,tag:'Proofreading',avail:'Available tomorrow'},
    {id:3,title:'Presentation & Poster Design',desc:'Eye-catching slides and posters for submissions.',price:'₹250',rating:4.7,tag:'Design',avail:'Booked till Thursday'},
    {id:4,title:'Video Editing for Projects',desc:'Trim, add subtitles, and final render for submission.',price:'₹300',rating:4.5,tag:'Video',avail:'Available today'},
    {id:5,title:'Hackathon Mentorship',desc:'Idea feedback, pitching practice, and dev help.',price:'₹400',rating:4.9,tag:'Mentorship',avail:'Limited slots'},
    {id:6,title:'Public Speaking Coaching',desc:'Pitching, debate, and presentation coaching.',price:'₹180',rating:4.4,tag:'Coaching',avail:'Available this week'}
  ];

  const FAKE_USERS = [
    {name:'Aarav',univ:'Delhi University'}, {name:'Priya',univ:'IIT Bombay'}, {name:'Rohan',univ:'IIT Delhi'},
    {name:'Sana',univ:'JNU'}, {name:'Kabir',univ:'IISc'}, {name:'Maya',univ:'Jadavpur'}, {name:'Neil',univ:'Amity'}
  ];

  // state
  let installsupported = false;
  let deferredPrompt = null;
  let judgeMode = false;
  let logoTapCount = 0;
  let liveBase = Math.floor(Math.random()*100)+20; // 20-119
  const liveEl = document.getElementById('live-users');
  const logo = document.getElementById('logo');

  // register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(()=>console.log('sw registered')).catch(()=>{});
  }

  // install prompt handling
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    installsupported = true;
    document.getElementById('install-btn').classList.remove('hidden');
  });

  document.getElementById('install-btn').onclick = ()=>{
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(()=>deferredPrompt = null);
    } else {
      showInstallBanner();
    }
  };

  // show install banner after 5s
  setTimeout(()=>{ showInstallBanner(); }, 5000);
  function showInstallBanner(){
    const b = document.getElementById('install-banner');
    b.classList.remove('hidden');
    document.getElementById('install-accept').onclick = ()=>{
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(()=>deferredPrompt = null);
      } else {
        alert('Install from browser menu (Add to Home Screen).');
      }
      b.classList.add('hidden');
    };
    document.getElementById('install-dismiss').onclick = ()=>{ b.classList.add('hidden'); };
  }

  // update live users counter
  function updateLive(){
    const variance = Math.floor(Math.random()*6)-3;
    liveBase = Math.max(5, liveBase + variance);
    liveEl.textContent = '● ' + liveBase;
  }
  setInterval(updateLive, 3500);

  // clicking live users opens modal with fake names
  liveEl.onclick = ()=>{
    const list = FAKE_USERS.map(u=>`<div class="card"><strong>${u.name}</strong><div class="muted">${u.univ}</div></div>`).join('');
    showModal('Active students', list);
  };

  // render services
  function renderServices(filterText=''){
    const container = document.getElementById('services-list');
    container.innerHTML = '';
    const items = SERVICES.filter(s=> (s.title + s.desc + s.tag).toLowerCase().includes(filterText.toLowerCase()));
    items.forEach(s=>{
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<h3>${s.title}</h3><div class="muted">${s.desc}</div><div class="tag">${s.tag}</div><div class="price">${s.price} • ${s.rating}★</div>
        <div class="action-row"><button class="btn small" data-id="${s.id}" onclick="window.app.openProfile(${s.id})">View</button>
        <button class="btn small primary" data-id="${s.id}" onclick="window.app.bookNow(${s.id})">Book</button></div>`;
      container.appendChild(el);
    });
    if (items.length===0) container.innerHTML = '<div class="card">No results.</div>';
  }

  // search
  document.getElementById('search').addEventListener('input', (e)=> renderServices(e.target.value));

  // tabs
  document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click', (e)=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    e.target.classList.add('active');
    const tab = e.target.dataset.tab;
    document.querySelectorAll('.tabpane').forEach(tp=>tp.classList.add('hidden'));
    document.getElementById(tab + '-tab').classList.remove('hidden');
  }));

  // expose functions to window for inline onclicks
  window.app = {
    openProfile: (id) => {
      const s = SERVICES.find(x=>x.id===id);
      if(!s) return;
      showModal(s.title, `<p>${s.desc}</p><p class="tag">${s.tag}</p><p class="price">${s.price} • ${s.rating}★</p>
        <div class="action-row"><button class="btn small primary" onclick="window.app.bookNow(${s.id})">Book</button>
        <button class="btn small" onclick="alert('Calling...')">Call</button>
        <button class="btn small" onclick="openChat('${s.title}')">Chat</button></div>`);
    },
    bookNow: (id) => {
      const s = SERVICES.find(x=>x.id===id);
      if(!s) return;
      showModal('Book ' + s.title, `<p>Enter details to book:</p>
        <div style="display:flex;flex-direction:column;gap:8px">
        <input id="bk-name" placeholder="Your name" style="padding:8px;border-radius:8px"/><input id="bk-email" placeholder="Email / contact" style="padding:8px;border-radius:8px"/>
        <input id="bk-note" placeholder="Notes (deadline / location)" style="padding:8px;border-radius:8px"/></div>
        <div style="margin-top:10px"><button class="btn primary" id="confirm-book">Confirm Booking</button></div>`, true);
      document.getElementById('confirm-book').onclick = ()=>{
        const name = document.getElementById('bk-name').value || 'You';
        const email = document.getElementById('bk-email').value || '—';
        const note = document.getElementById('bk-note').value || '—';
        // fake booking save
        const booking = {id:Date.now(),name,service:s.title,email,note,when:new Date().toLocaleString()};
        const list = JSON.parse(localStorage.getItem('edu_bookings')||'[]');
        list.unshift(booking);
        localStorage.setItem('edu_bookings', JSON.stringify(list));
        closeModal();
        alert('Booking confirmed! Check Bookings tab.');
        renderBookings();
      };
    }
  };

  // bookings
  function renderBookings(){
    const container = document.getElementById('bookings-list');
    const list = JSON.parse(localStorage.getItem('edu_bookings')||'[]');
    if(list.length===0){ container.innerHTML = '<div class="card">No bookings yet.</div>'; return;}
    container.innerHTML = '';
    list.forEach(b=>{
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<h3>${b.service}</h3><div class="muted">By ${b.name} • ${b.when}</div><p>${b.note}</p>`;
      container.appendChild(el);
    });
  }

  // chat basic
  const chatWindow = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  function appendMsg(text, right=false, userName='') {
    const el = document.createElement('div'); el.className='chat-bubble ' + (right?'bubble-right':'bubble-left');
    el.innerHTML = (userName?('<strong>'+userName+'</strong><br/>'):'') + text;
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  chatSend.onclick = ()=>{
    const text = chatInput.value.trim();
    if(!text) return;
    appendMsg(text, true, 'You');
    chatInput.value='';
    // fake reply
    setTimeout(()=>{
      const fu = FAKE_USERS[Math.floor(Math.random()*FAKE_USERS.length)];
      appendMsg('Nice! I can help with that. When do you need it?', false, fu.name);
    }, 1600);
  };

  function openChat(topic){
    document.querySelector('[data-tab="chat"]').click();
    appendMsg('Opened chat about: ' + topic, true, 'You');
  }

  // modal utility
  function showModal(title, html, showClose=false){
    const md = document.createElement('div'); md.className='modalwrap';
    md.innerHTML = `<div class="modal"><h3>${title}</h3><div>${html}</div>${showClose?'<div style="margin-top:10px"><button class="btn" id="modal-close">Close</button></div>':''}</div>`;
    document.body.appendChild(md);
    if(showClose) document.getElementById('modal-close').onclick = ()=>{ closeModal(); };
    md.onclick = (e)=>{ if(e.target===md) closeModal(); };
  }
  function closeModal(){ const m=document.querySelector('.modalwrap'); if(m) m.remove(); }

  // load initial UI
  document.getElementById('open-app').onclick = ()=>{
    document.getElementById('landing').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    renderServices();
    renderBookings();
  };
  // clicking logo x5 -> judge mode
  logo.addEventListener('click', ()=>{
    logoTapCount++;
    setTimeout(()=>{ logoTapCount=0; }, 1200);
    if(logoTapCount>=5){
      activateJudgeMode();
    }
  });

  function activateJudgeMode(){
    judgeMode = true;
    document.getElementById('judge-badge').classList.remove('hidden');
    // ramp live users
    liveBase += 40;
    // auto-run demo sequence
    document.getElementById('open-app').click();
    setTimeout(()=>{ // open first service and book
      window.app.openProfile(1);
      setTimeout(()=>{ window.app.bookNow(1); document.getElementById('bk-name').value='Demo User'; document.getElementById('bk-email').value='demo@edulink.test'; document.getElementById('bk-note').value='Need help for tonight'; document.getElementById('confirm-book').click(); }, 1200);
    }, 800);
    setTimeout(()=>{
      // open chat and simulate messages
      document.querySelector('[data-tab="chat"]').click();
      setTimeout(()=>{ appendMsg('Hi! I can help you with that assignment, when\'s the deadline?', false, FAKE_USERS[0].name); }, 800);
      setTimeout(()=>{ appendMsg('Tomorrow night. Can you review my draft?', true, 'You'); }, 1800);
      setTimeout(()=>{ appendMsg('Sure — sending notes now 📚', false, FAKE_USERS[1].name); }, 3000);
    }, 3600);
    setTimeout(()=>{
      // final splash
      showModal('Thanks!', '<p>Thanks for trying EduLink — hope you enjoyed the demo!</p><p><em>Judge Mode demo complete.</em></p>', true);
    }, 9000);
  }

  // expose helper for external code (bookings from window)
  window.__edu_render = { renderServices, renderBookings };

  // small helpers for modal styles appended
  const style = document.createElement('style'); style.innerHTML = `
  .modalwrap{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);z-index:9999}
  .modal{background:white;padding:18px;border-radius:12px;max-width:520px;box-shadow:0 20px 60px rgba(0,0,0,0.25)}
  .muted{color:#6b6b6b;font-size:13px}
  `; document.head.appendChild(style);

  // service worker friendly: cache data via fetch fallback if offline
  window.addEventListener('load', ()=>{
    // initial render if coming with app open
    if(!document.getElementById('landing').classList.contains('hidden')){ /* still landing */ }
    // small periodic live boost when judge mode active
    setInterval(()=>{ if(judgeMode) liveBase += Math.floor(Math.random()*3); }, 4000);
  });

  // simple exposure for booking from onclicks
  window.openChat = openChat;

})();