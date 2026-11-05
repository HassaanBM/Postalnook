/* ===========================================================
   PostalNook Partner — interactions
   =========================================================== */
(function(){
  'use strict';

  /* ---- sticky nav shadow ---- */
  var nav = document.getElementById('nav');
  var onScroll = function(){ nav.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---- mobile menu ---- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if(burger){
    burger.addEventListener('click', function(){ menu.classList.toggle('open'); });
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ menu.classList.remove('open'); }); });
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---- count-up ---- */
  var counts = document.querySelectorAll('.count');
  var animateCount = function(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals')||'0',10);
    var suffix = el.getAttribute('data-suffix')||'';
    var dur = 1300, start = null;
    var ease = function(t){ return 1 - Math.pow(1-t, 3); };
    var step = function(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var val = target * ease(p);
      el.textContent = val.toFixed(dec) + suffix;
      if(p<1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec) + suffix;
    };
    requestAnimationFrame(step);
  };
  if('IntersectionObserver' in window){
    var io2 = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animateCount(e.target); io2.unobserve(e.target); }
      });
    }, {threshold:0.6});
    counts.forEach(function(el){ io2.observe(el); });
  } else {
    counts.forEach(function(el){ el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix')||''); });
  }

  /* ---- form validation + success ---- */
  var form = document.getElementById('leadForm');
  if(form){
    var setInvalid = function(field, bad){ field.classList.toggle('invalid', bad); };
    var validEmail = function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
    form.querySelectorAll('input,select,textarea').forEach(function(inp){
      inp.addEventListener('input', function(){
        var f = inp.closest('.field'); if(f && f.classList.contains('invalid')) setInvalid(f,false);
      });
    });
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function(inp){
        var f = inp.closest('.field');
        var bad = false;
        if(inp.type === 'checkbox'){ bad = !inp.checked; }
        else if(inp.type === 'email'){ bad = !validEmail(inp.value.trim()); }
        else { bad = !inp.value.trim(); }
        if(f) setInvalid(f, bad);
        if(bad && ok){ ok = false; (f||inp).scrollIntoView ? null : null; inp.focus(); }
        if(bad) ok = false;
      });
      if(!ok) return;
      form.style.display='none';
      var success = document.getElementById('formSuccess');
      if(success) success.classList.add('show');
    });
  }

  /* =========================================================
     FLAG MARQUEE — trusted across countries (inline SVG flags)
     ========================================================= */
  (function(){
    var row = document.getElementById('flagRow');
    if(!row) return;
    var F = {
      us:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#fff"/><g fill="#B22234"><rect width="60" height="3.08" y="0"/><rect width="60" height="3.08" y="6.15"/><rect width="60" height="3.08" y="12.31"/><rect width="60" height="3.08" y="18.46"/><rect width="60" height="3.08" y="24.62"/><rect width="60" height="3.08" y="30.77"/><rect width="60" height="3.08" y="36.92"/></g><rect width="24" height="21.54" fill="#3C3B6E"/><g fill="#fff"><circle cx="4" cy="3.5" r="1"/><circle cx="10" cy="3.5" r="1"/><circle cx="16" cy="3.5" r="1"/><circle cx="22" cy="3.5" r="1"/><circle cx="7" cy="7.5" r="1"/><circle cx="13" cy="7.5" r="1"/><circle cx="19" cy="7.5" r="1"/><circle cx="4" cy="11.5" r="1"/><circle cx="10" cy="11.5" r="1"/><circle cx="16" cy="11.5" r="1"/><circle cx="22" cy="11.5" r="1"/><circle cx="7" cy="15.5" r="1"/><circle cx="13" cy="15.5" r="1"/><circle cx="19" cy="15.5" r="1"/></g></svg>',
      gb:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4"/><rect x="25" width="10" height="40" fill="#fff"/><rect y="15" width="60" height="10" fill="#fff"/><rect x="27" width="6" height="40" fill="#C8102E"/><rect y="17" width="60" height="6" fill="#C8102E"/></svg>',
      de:'<svg viewBox="0 0 60 40"><rect width="60" height="13.34" y="0" fill="#000"/><rect width="60" height="13.33" y="13.34" fill="#DD0000"/><rect width="60" height="13.33" y="26.67" fill="#FFCE00"/></svg>',
      in:'<svg viewBox="0 0 60 40"><rect width="60" height="13.34" y="0" fill="#FF9933"/><rect width="60" height="13.33" y="13.34" fill="#fff"/><rect width="60" height="13.33" y="26.67" fill="#138808"/><circle cx="30" cy="20" r="5" fill="none" stroke="#000080" stroke-width="1"/><circle cx="30" cy="20" r="1" fill="#000080"/></svg>',
      pk:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#01411C"/><rect width="15" height="40" fill="#fff"/><circle cx="36" cy="20" r="8" fill="#fff"/><circle cx="39" cy="18" r="6.6" fill="#01411C"/><path d="M44 16 l1 2.6 2.7.2 -2 1.8 .7 2.7 -2.4-1.5 -2.4 1.5 .7-2.7 -2-1.8 2.7-.2z" fill="#fff"/></svg>',
      ca:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#fff"/><rect width="15" height="40" fill="#FF0000"/><rect x="45" width="15" height="40" fill="#FF0000"/><path fill="#FF0000" d="M30 8 l1.4 4.6 4.4-2.1 -1.6 4.7 4.8.3 -3.6 3 4.3 4.1 -5.6-.9 .8 4.2 -3.1-2.4 -3.1 2.4 .8-4.2 -5.6.9 4.3-4.1 -3.6-3 4.8-.3 -1.6-4.7 4.4 2.1z"/></svg>',
      au:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#00247D"/><g transform="translate(0,0)"><rect width="30" height="20" fill="#00247D"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" stroke-width="4"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" stroke-width="2"/><rect x="12.5" width="5" height="20" fill="#fff"/><rect y="7.5" width="30" height="5" fill="#fff"/><rect x="13.5" width="3" height="20" fill="#C8102E"/><rect y="8.5" width="30" height="3" fill="#C8102E"/></g><g fill="#fff"><path d="M15 26 l.7 2.1 2.2 0 -1.8 1.3 .7 2.1 -1.8-1.3 -1.8 1.3 .7-2.1 -1.8-1.3 2.2 0z"/><circle cx="46" cy="12" r="1.5"/><circle cx="52" cy="20" r="1.5"/><circle cx="46" cy="28" r="1.5"/><circle cx="41" cy="20" r="1.2"/><circle cx="49" cy="26" r="1"/></g></svg>',
      nl:'<svg viewBox="0 0 60 40"><rect width="60" height="13.34" y="0" fill="#AE1C28"/><rect width="60" height="13.33" y="13.34" fill="#fff"/><rect width="60" height="13.33" y="26.67" fill="#21468B"/></svg>',
      fr:'<svg viewBox="0 0 60 40"><rect width="20" height="40" fill="#0055A4"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#EF4135"/></svg>',
      ae:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#fff"/><rect width="60" height="13.34" y="0" fill="#00732F"/><rect width="60" height="13.33" y="26.67" fill="#000"/><rect width="16" height="40" fill="#FF0000"/></svg>',
      jp:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#fff"/><circle cx="30" cy="20" r="10" fill="#BC002D"/></svg>'
    };
    var COUNTRIES = [
      ['United States','us'],['United Kingdom','gb'],['Germany','de'],
      ['India','in'],['Pakistan','pk'],['Canada','ca'],['Australia','au'],
      ['Netherlands','nl'],['France','fr'],['UAE','ae'],['Japan','jp']
    ];
    var chip = function(name,code){
      return '<div class="flag-chip"><span class="flag">'+(F[code]||'')+'</span><span class="cname">'+name+'</span></div>';
    };
    var seq = COUNTRIES.map(function(c){ return chip(c[0],c[1]); }).join('');
    // duplicate the full sequence so translateX(-50%) loops seamlessly
    row.innerHTML = seq + seq;
  })();

  /* =========================================================
     TWEAKS PANEL (vanilla) — host protocol
     ========================================================= */
  var TWEAK_DEFAULTS = {
    ctaCopy: 'Request Partner Info',
    accent: 'Refined',
    urgency: 'Scarcity',
    typeface: 'Archivo'
  };
  var CTA_OPTIONS = ['Request Partner Info','Apply to Partner','Claim Your Territory','Get the Franchise Kit','Start Your Application'];
  var ACCENTS = {
    'Refined': {accent:'#E8622A', a600:'#D2531E'},
    'Bold':    {accent:'#EF5409', a600:'#C9430A'}
  };
  var TYPEFACES = {
    'Archivo':   {display:'"Archivo", system-ui, sans-serif',       body:'"Hanken Grotesk", system-ui, sans-serif'},
    'Editorial': {display:'"Source Serif 4", Georgia, serif',        body:'"Hanken Grotesk", system-ui, sans-serif'},
    'Geometric': {display:'"Space Grotesk", system-ui, sans-serif',  body:'"DM Sans", system-ui, sans-serif'}
  };

  var state = Object.assign({}, TWEAK_DEFAULTS);
  try { var saved = JSON.parse(localStorage.getItem('pn-tweaks')||'{}'); state = Object.assign(state, saved); } catch(e){}

  function applyCta(){
    document.querySelectorAll('.js-ctaLabel').forEach(function(el){ el.textContent = state.ctaCopy; });
  }
  function applyAccent(){
    var a = ACCENTS[state.accent] || ACCENTS.Refined;
    document.documentElement.style.setProperty('--accent', a.accent);
    document.documentElement.style.setProperty('--accent-600', a600safe(a.a600));
  }
  function a600safe(v){ return v; }
  function applyTypeface(){
    var tf = TYPEFACES[state.typeface] || TYPEFACES.Archivo;
    document.documentElement.style.setProperty('--f-display', tf.display);
    document.documentElement.style.setProperty('--f-body', tf.body);
  }
  function applyUrgency(){
    var scarcity = state.urgency === 'Scarcity';
    var h = document.querySelector('h2[data-urgency]');
    var p = document.querySelector('p[data-urgency]');
    if(h) h.textContent = scarcity ? 'First-mover cities are being claimed now.' : 'Be the first PostalNook in your region.';
    if(p) p.textContent = scarcity
      ? "We protect each partner with exclusive territory rights, which means once a city is taken, it's gone. Early partners lock in the best markets and lead their region."
      : "As the first PostalNook in your market, you set the standard, capture early demand, and build the brand before anyone else can. First movers win the best locations and the loyalty that follows.";
  }
  function applyAll(){ applyCta(); applyAccent(); applyTypeface(); applyUrgency(); }
  function persist(){ try{ localStorage.setItem('pn-tweaks', JSON.stringify(state)); }catch(e){} }
  applyAll();

  /* ---- build panel DOM ---- */
  var panel = document.createElement('div');
  panel.id = 'pn-tweaks';
  panel.innerHTML =
    '<div class="tw-head"><span class="tw-title">Tweaks</span><button class="tw-x" aria-label="Close">✕</button></div>'+
    '<div class="tw-body">'+
      '<div class="tw-sec">CTA copy</div>'+
      '<div class="tw-seg" data-key="ctaCopy">'+CTA_OPTIONS.map(function(o){return '<button data-v="'+o+'">'+o+'</button>';}).join('')+'</div>'+
      '<div class="tw-sec">Accent intensity</div>'+
      '<div class="tw-seg tw-row2" data-key="accent">'+Object.keys(ACCENTS).map(function(o){return '<button data-v="'+o+'">'+o+'</button>';}).join('')+'</div>'+
      '<div class="tw-sec">Urgency framing</div>'+
      '<div class="tw-seg tw-row2" data-key="urgency">'+['Scarcity','First-mover'].map(function(o){return '<button data-v="'+o+'">'+o+'</button>';}).join('')+'</div>'+
      '<div class="tw-sec">Typeface</div>'+
      '<div class="tw-seg tw-row2" data-key="typeface">'+Object.keys(TYPEFACES).map(function(o){return '<button data-v="'+o+'">'+o+'</button>';}).join('')+'</div>'+
    '</div>';
  document.body.appendChild(panel);

  var style = document.createElement('style');
  style.textContent =
    '#pn-tweaks{position:fixed; right:18px; bottom:18px; width:280px; z-index:9999; background:#0B2545; color:#EAF0F7;'+
    ' border:1px solid rgba(255,255,255,.12); border-radius:16px; box-shadow:0 24px 60px -18px rgba(0,0,0,.6);'+
    ' font-family:"Hanken Grotesk",system-ui,sans-serif; display:none; overflow:hidden}'+
    '#pn-tweaks.open{display:block; animation:twin .25s ease}'+
    '@keyframes twin{from{opacity:0; transform:translateY(10px)}to{opacity:1; transform:none}}'+
    '#pn-tweaks .tw-head{display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.10)}'+
    '#pn-tweaks .tw-title{font-family:"Space Mono",monospace; font-size:12px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#FF8A5C}'+
    '#pn-tweaks .tw-x{background:transparent; border:0; color:#8EA2BC; cursor:pointer; font-size:14px; padding:4px}'+
    '#pn-tweaks .tw-x:hover{color:#fff}'+
    '#pn-tweaks .tw-body{padding:14px 16px 18px}'+
    '#pn-tweaks .tw-sec{font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:#7E93AE; font-family:"Space Mono",monospace; margin:14px 0 8px}'+
    '#pn-tweaks .tw-sec:first-child{margin-top:0}'+
    '#pn-tweaks .tw-seg{display:flex; flex-direction:column; gap:6px}'+
    '#pn-tweaks .tw-seg.tw-row2{flex-direction:row}'+
    '#pn-tweaks .tw-seg.tw-row2 button{flex:1}'+
    '#pn-tweaks .tw-seg button{font-family:inherit; font-size:13px; font-weight:600; text-align:left; color:#C3D0E1;'+
    ' background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.10); border-radius:9px; padding:9px 12px; cursor:pointer; transition:.15s}'+
    '#pn-tweaks .tw-seg.tw-row2 button{text-align:center}'+
    '#pn-tweaks .tw-seg button:hover{background:rgba(255,255,255,.10); color:#fff}'+
    '#pn-tweaks .tw-seg button.on{background:#E8622A; border-color:#E8622A; color:#fff}';
  document.head.appendChild(style);

  function syncButtons(){
    panel.querySelectorAll('.tw-seg').forEach(function(seg){
      var key = seg.getAttribute('data-key');
      seg.querySelectorAll('button').forEach(function(b){
        b.classList.toggle('on', b.getAttribute('data-v') === state[key]);
      });
    });
  }
  panel.querySelectorAll('.tw-seg').forEach(function(seg){
    var key = seg.getAttribute('data-key');
    seg.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click', function(){
        state[key] = b.getAttribute('data-v');
        syncButtons(); applyAll(); persist();
      });
    });
  });
  syncButtons();

  /* ---- host protocol ---- */
  var openPanel = function(v){ panel.classList.toggle('open', v); };
  panel.querySelector('.tw-x').addEventListener('click', function(){
    openPanel(false);
    try{ window.parent.postMessage({type:'__edit_mode_dismissed'}, '*'); }catch(e){}
  });
  window.addEventListener('message', function(e){
    var t = e && e.data && e.data.type;
    if(t === '__activate_edit_mode') openPanel(true);
    else if(t === '__deactivate_edit_mode') openPanel(false);
  });
  try{ window.parent.postMessage({type:'__edit_mode_available'}, '*'); }catch(e){}

})();
