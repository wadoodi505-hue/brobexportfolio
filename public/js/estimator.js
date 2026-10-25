/* BROBEX estimator — transparent regional pricing, resilient state and brief generation. */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('brobexEstimator');
  if (!root || root.dataset.estimatorReady === 'true') return;
  root.dataset.estimatorReady = 'true';

  // In-memory only: survives client-side route changes, but naturally clears on document reload.
  const MEMORY_KEY = '__BROBEX_ESTIMATOR_STATE__';
  const CONFIG = {
    discount: 0.40,
    currency: {
      US:{code:'USD',locale:'en-US',label:'United States',symbol:'$'},
      GB:{code:'GBP',locale:'en-GB',label:'United Kingdom',symbol:'£'},
      PK:{code:'PKR',locale:'en-PK',label:'Pakistan',symbol:'Rs'},
      IN:{code:'INR',locale:'en-IN',label:'India',symbol:'₹'},
      IT:{code:'EUR',locale:'it-IT',label:'Italy',symbol:'€'},
      DE:{code:'EUR',locale:'de-DE',label:'Germany',symbol:'€'},
      FR:{code:'EUR',locale:'fr-FR',label:'France',symbol:'€'},
      ES:{code:'EUR',locale:'es-ES',label:'Spain',symbol:'€'},
      CA:{code:'CAD',locale:'en-CA',label:'Canada',symbol:'C$'},
      AU:{code:'AUD',locale:'en-AU',label:'Australia',symbol:'A$'},
      AE:{code:'AED',locale:'ar-AE',label:'United Arab Emirates',symbol:'د.إ'},
      SA:{code:'SAR',locale:'ar-SA',label:'Saudi Arabia',symbol:'ر.س'}
    },
    /* These are independent, editable local-market estimates, not FX conversions or verified market averages.
       Review them against current local quotes before presenting them as commercial offers. */
    marketFactor:{US:1,GB:0.88,PK:70,IN:65,IT:0.92,DE:1.05,FR:0.98,ES:0.78,CA:1.02,AU:1.08,AE:3.6,SA:3.7},
    types: [
      {id:'landing',title:'Landing Page',icon:'fa-rocket',desc:'A focused page for one offer or campaign.',base:{US:[250,450],GB:[220,400],PK:[15000,30000],IN:[12000,25000],IT:[230,420],DE:[260,480],FR:[240,450],ES:[190,350],CA:[260,470],AU:[280,500],AE:[900,1700],SA:[800,1600]}},
      {id:'business',title:'Small Business Website',icon:'fa-building',desc:'A clear, professional website for a local business.',base:{US:[400,800],GB:[350,700],PK:[35000,75000],IN:[25000,55000],IT:[370,740],DE:[420,840],FR:[390,780],ES:[310,620],CA:[410,820],AU:[430,860],AE:[1400,2800],SA:[1300,2600]}},
      {id:'portfolio',title:'Professional Portfolio',icon:'fa-user-astronaut',desc:'Present your work, services, and experience.',base:{US:[300,700],GB:[260,620],PK:[25000,60000],IN:[18000,45000],IT:[280,650],DE:[320,740],FR:[295,685],ES:[235,545],CA:[305,715],AU:[325,755],AE:[1100,2400],SA:[950,2200]}},
      {id:'ecommerce',title:'E-commerce Store',icon:'fa-shopping-bag',desc:'A small online shop with product and checkout flows.',base:{US:[1000,2000],GB:[850,1750],PK:[90000,200000],IN:[65000,150000],IT:[920,1850],DE:[1050,2100],FR:[980,1950],ES:[780,1550],CA:[1020,2040],AU:[1080,2160],AE:[3500,7500],SA:[3000,6800]}},
      {id:'booking',title:'Booking Website',icon:'fa-calendar-check',desc:'Let customers request or schedule appointments.',base:{US:[800,1600],GB:[700,1400],PK:[70000,150000],IN:[50000,110000],IT:[740,1480],DE:[840,1680],FR:[780,1560],ES:[620,1240],CA:[820,1640],AU:[860,1720],AE:[2800,5800],SA:[2500,5200]}},
      {id:'blog',title:'Blog or Content Website',icon:'fa-pen-nib',desc:'Publish articles and useful resources.',base:{US:[450,900],GB:[400,800],PK:[40000,85000],IN:[30000,65000],IT:[420,830],DE:[470,945],FR:[440,880],ES:[350,700],CA:[460,920],AU:[485,970],AE:[1600,3200],SA:[1400,3000]}},
      {id:'restaurant',title:'Restaurant Website',icon:'fa-utensils',desc:'Show your menu, location, opening hours, and contact details.',base:{US:[450,900],GB:[400,800],PK:[35000,80000],IN:[28000,65000],IT:[420,830],DE:[470,945],FR:[440,880],ES:[350,700],CA:[460,920],AU:[485,970],AE:[1600,3200],SA:[1400,3000]}},
      {id:'realestate',title:'Real Estate Website',icon:'fa-home',desc:'Present properties and help visitors make enquiries.',base:{US:[800,1600],GB:[700,1400],PK:[75000,160000],IN:[55000,125000],IT:[740,1480],DE:[840,1680],FR:[780,1560],ES:[620,1240],CA:[820,1640],AU:[860,1720],AE:[2800,6000],SA:[2500,5500]}},
      {id:'saas',title:'SaaS or Web Application',icon:'fa-cloud',desc:'A more complex product interface; final scope needs discussion.',base:{US:[1500,3500],GB:[1300,3000],PK:[150000,400000],IN:[110000,300000],IT:[1380,3220],DE:[1580,3680],FR:[1470,3430],ES:[1170,2730],CA:[1530,3570],AU:[1620,3780],AE:[5200,12000],SA:[4800,11000]}},
      {id:'custom',title:'Custom Website',icon:'fa-code',desc:'A tailored solution for requirements not covered above.',base:{US:[1000,1800],GB:[900,1600],PK:[100000,250000],IN:[75000,180000],IT:[920,1660],DE:[1050,1890],FR:[980,1760],ES:[780,1400],CA:[1020,1840],AU:[1080,1940],AE:[3500,6800],SA:[3200,6400]}}
    ],
    features: [
      {label:'Contact form / lead enquiries',cost:[0,60],show:['business','portfolio','landing','booking','blog','restaurant','realestate','custom','saas']},
      {label:'WhatsApp contact link',cost:[0,30]},
      {label:'Appointment booking integration',cost:[150,350],show:['booking','business','restaurant','custom']},
      {label:'Product catalogue',cost:[100,250],show:['ecommerce','realestate','custom']},
      {label:'Shopping cart and checkout',cost:[200,450],show:['ecommerce','custom']},
      {label:'Online payment integration',cost:[150,350],show:['ecommerce','booking','custom','saas']},
      {label:'Content editing / CMS',cost:[150,350],show:['blog','business','restaurant','realestate','custom']},
      {label:'Advanced search or filters',cost:[100,300],show:['ecommerce','realestate','saas','custom']},
      {label:'User accounts',cost:[250,500],show:['ecommerce','saas','custom']},
      {label:'Admin dashboard',cost:[300,650],show:['ecommerce','saas','custom']},
      {label:'Custom motion and interactions',cost:[100,300]},
      {label:'On-page SEO setup',cost:[75,180]},
      {label:'Analytics setup',cost:[40,100]}
    ],
    pages:{'1-3':[0,0],'4-6':[100,200],'7-10':[220,400],'10+':[400,750]},
    design:{'Clean & Professional':[0,0],'Premium':[100,250],'Luxury / High-End':[250,500],'Fully Custom':[400,900]}
  };
  const $ = s => root.querySelector(s);
  const $$ = s => Array.from(root.querySelectorAll(s));
  const labels = ['WEBSITE TYPE','REQUIREMENTS','ESTIMATE','PROJECT BRIEF'];
  const steps = $$('.estimator-step'), progress = $$('.progress-step');
  const errors = [$('#step1-error'), $('#step2-error')];
  const state = {
    step:1, type:'', pages:'', design:'', responsive:'', features:[],
    designStatus:'', contentStatus:'', timeline:'', currency:'US',
    name:'', email:'', business:'', phone:'', notes:''
  };
  const typeGrid = $('#websiteTypeGrid'), featureGrid = $('#req-features');
  const money = n => new Intl.NumberFormat(CONFIG.currency[state.currency].locale,{style:'currency',currency:CONFIG.currency[state.currency].code,maximumFractionDigits:0}).format(n);
  const range = (a,b) => `${money(a)} – ${money(b)}`;
  const safe = v => String(v || '').trim();
  const initial = JSON.stringify(state);

  function renderTypes(){
    typeGrid.innerHTML = CONFIG.types.map(t => `<label class="type-card-label"><input type="radio" name="websiteType" value="${t.id}" class="sr-only"><div class="type-card"><i class="fas ${t.icon}" aria-hidden="true"></i><h4 class="type-card-title">${t.title}</h4><p class="type-card-desc">${t.desc}</p></div></label>`).join('');
  }
  function renderFeatures(){
    const type = CONFIG.types.find(t=>t.id===state.type);
    featureGrid.innerHTML = CONFIG.features.filter(f=>!f.show || (type && f.show.includes(type.id))).map(f=>`<label class="feature-check"><input type="checkbox" name="features" value="${f.label}" ${state.features.includes(f.label)?'checked':''}><span>${f.label}</span></label>`).join('');
  }
  function selected(name){ return root.querySelector(`input[name="${name}"]:checked`)?.value || ''; }
  function restoreForm(){
    if(state.type) { const el=root.querySelector(`input[name="websiteType"][value="${state.type}"]`); if(el)el.checked=true; }
    ['pages','design','responsive','designStatus','content','timeline'].forEach(n=>{
      const val=({content:state.contentStatus})[n] ?? state[n];
      if(val){const el=Array.from(root.querySelectorAll(`input[name="${n}"]`)).find(i=>i.value===val);if(el)el.checked=true;}
    });
    [['briefName','name'],['briefEmail','email'],['briefBusiness','business'],['briefPhone','phone'],['briefNotes','notes']].forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.value=state[key]||'';});
  }
  function save(){
    try {
      // This store lives only on the current document's window. Do not use localStorage
      // or sessionStorage: refreshing must always begin with a clean estimator.
      window[MEMORY_KEY] = { ...state, features: [...state.features] };
    } catch {}
  }
  function load(){
    try{
      const parsed = window[MEMORY_KEY];
      if(!parsed || typeof parsed !== 'object') return;
      ['type','pages','design','responsive','designStatus','contentStatus','timeline','name','email','business','phone','notes'].forEach(k=>{
        if(typeof parsed[k] === 'string') state[k] = parsed[k];
      });
      if(Array.isArray(parsed.features)) state.features = parsed.features.filter(x=>CONFIG.features.some(f=>f.label===x));
      if(Object.prototype.hasOwnProperty.call(CONFIG.currency,parsed.currency)) state.currency=parsed.currency;
      if(Number.isInteger(parsed.step) && parsed.step >= 1 && parsed.step <= 4) state.step=parsed.step;
    } catch {}
  }
  function estimate(){
    const type=CONFIG.types.find(t=>t.id===state.type);
    let min=0,max=0;
    const factor=CONFIG.marketFactor[state.currency] || 1;
    const add=p=>{if(p){min+=p[0]*factor;max+=p[1]*factor;}};
    if(type){const regional=type.base[state.currency];if(regional){min+=regional[0];max+=regional[1];}}
    add(CONFIG.pages[state.pages]); add(CONFIG.design[state.design]);
    state.features.forEach(label=>{const f=CONFIG.features.find(x=>x.label===label);if(f)add(f.cost);});
    const roundForMarket=n=>{const code=CONFIG.currency[state.currency].code;const step=['PKR','INR'].includes(code)?100:code==='SAR'||code==='AED'?10:10;return Math.round(n/step)*step;};
    // Apply a 20% baseline reduction before the clearly stated 40% BROBEX offer.
    return {min:roundForMarket(min*0.80),max:roundForMarket(max*0.80)};
  }
  function summary(){
    const list=$('#summaryList'), price=$('#summaryPrice');
    const e=estimate();
    if(list) list.innerHTML=state.type ? [
      ['Website',CONFIG.types.find(t=>t.id===state.type)?.title],['Pages',state.pages],['Design',state.design],['Layout',state.responsive],
      ['Features',state.features.join(', ')||'No optional features selected'],['Design assets',state.designStatus],['Content',state.contentStatus],['Timeline',state.timeline],['Region',CONFIG.currency[state.currency].label]
    ].filter(([,v])=>v).map(([k,v])=>`<div class="summary-item"><span class="summary-item-label">${k}</span><span class="summary-item-value">${v}</span></div>`).join('') : '<div class="summary-item empty-state">Choose a website type to start your estimate.</div>';
    const originalMin=e.min, originalMax=e.max, finalMin=Math.round(originalMin*(1-CONFIG.discount)), finalMax=Math.round(originalMax*(1-CONFIG.discount));
    if(price)price.textContent=state.type?range(finalMin,finalMax):range(0,0);
    const display=$('#finalPriceDisplay');
    if(display)display.innerHTML=state.type?`<div class="estimate-price-stack">
      <div class="regional-original"><span>Reduced baseline estimate</span><del>${range(originalMin,originalMax)}</del></div>
      <div class="regional-savings"><span> BROBEX offer · Save 40%</span><strong>Save ${range(originalMin-finalMin,originalMax-finalMax)}</strong></div>
      <div class="estimate-discounted-range"><span class="price-val">${money(finalMin)}</span><span class="price-sep">–</span><span class="price-val">${money(finalMax)}</span></div>
      <span class="estimate-disclaimer">Indicative local-market estimate · ${CONFIG.currency[state.currency].label}. Final pricing depends on agreed scope.</span></div>`:`<span class="price-val">${money(0)}</span><span class="price-sep">–</span><span class="price-val">${money(0)}</span>`;
  }
  function showStep(){
    steps.forEach((el,i)=>{const active=i+1===state.step;el.classList.toggle('active',active);el.hidden=!active;el.setAttribute('aria-hidden',String(!active));});
    progress.forEach((el,i)=>{el.classList.toggle('active',i+1===state.step);el.classList.toggle('completed',i+1<state.step);el.setAttribute('aria-current',i+1===state.step?'step':'false');});
    const count=$('#mobileProgressCount'),label=$('#mobileProgressLabel');
    if(count)count.textContent=`STEP ${state.step} OF 4`;if(label)label.textContent=labels[state.step-1];
    const next=$('#step-1 .btn-next');if(next)next.disabled=!state.type;
  }
  function error(which,msg){if(errors[which])errors[which].textContent=msg;}
  function go(step){
    state.step=step;save();showStep();summary();
    if(step===4)syncBrief();
    const target=document.getElementById('project-estimator');
    if(target){const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});}
  }
  function syncBrief(){
    [['briefName','name'],['briefEmail','email'],['briefBusiness','business'],['briefPhone','phone'],['briefNotes','notes']].forEach(([id,key])=>{const el=document.getElementById(id);if(el)state[key]=el.value;});
    save();
  }
  function briefText(){
    syncBrief();const e=estimate(), type=CONFIG.types.find(t=>t.id===state.type);
    const lines=[
      'Hello BROBEX,','',
      'I would like to discuss a website project. Here is my preliminary brief.','',
      'PROJECT CONTACT',`Name: ${safe(state.name)||'Not provided'}`,`Email: ${safe(state.email)||'Not provided'}`,`Business: ${safe(state.business)||'Not provided'}`,`Phone / WhatsApp: ${safe(state.phone)||'Not provided'}`,'',
      'PROJECT SCOPE',`Website type: ${type?.title||'Not specified'}`,`Business goal: ${type?.desc||'To be discussed'}`,`Pages: ${state.pages||'Not specified'}`,`Design direction: ${state.design||'Not specified'}`,`Responsive layout: ${state.responsive||'Not specified'}`,`Features: ${state.features.join(', ')||'No optional features selected'}`,`Design status: ${state.designStatus||'Not specified'}`,`Content readiness: ${state.contentStatus||'Not specified'}`,`Preferred timeline: ${state.timeline||'Flexible / to be discussed'}`,'',
      'PRELIMINARY INVESTMENT',`Market: ${CONFIG.currency[state.currency].label}`,`Currency: ${CONFIG.currency[state.currency].code}`,`Reduced baseline estimate (20% lower): ${range(e.min,e.max)}`,`BROBEX offer: save 40% against this indicative estimate`, `Estimated savings: ${range(e.min-Math.round(e.min*0.6),e.max-Math.round(e.max*0.6))}`,`Estimated BROBEX price after 40% offer: ${range(Math.round(e.min*0.6),Math.round(e.max*0.6))}`,'These figures are indicative local-market estimates, not a fixed quotation. Final pricing depends on the agreed project scope.','',
      'POTENTIAL ADDITIONAL COSTS','Domain, hosting, paid software, payment processor fees, photography, extensive copywriting, product entry, and ongoing maintenance are separate unless agreed in writing.','',
      'ADDITIONAL NOTES',safe(state.notes)||'No additional notes provided.','','I would be happy to discuss the scope and next steps.',`Regards, ${safe(state.name)||'Potential Client'}`
    ];
    return lines.join('\n');
  }
  function generate(kind){
    if(!state.type){go(1);error(0,'Please choose a website type first.');return;}
    const text=briefText();
    if(kind==='email'){
      const subject=`BROBEX website enquiry — ${safe(state.business)||safe(state.name)||'New project'}`;
      window.location.href=`mailto:brobex.ffx@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/923709995042?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');
    }
  }
  function reset(){
    if(!window.confirm('Reset your current website estimate and clear all project selections?'))return;
    Object.assign(state,JSON.parse(initial));root.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(i=>i.checked=false);
    [['briefName','name'],['briefEmail','email'],['briefBusiness','business'],['briefPhone','phone'],['briefNotes','notes']].forEach(([id])=>{const el=document.getElementById(id);if(el)el.value='';});
    try{delete window[MEMORY_KEY]}catch{}
    const currencyControl=$('#estimatorCurrency');if(currencyControl)currencyControl.value='US';
    renderFeatures();showStep();summary();errors.forEach(el=>{if(el)el.textContent='';});save();
  }

  try { localStorage.removeItem('brobex-estimator-v2'); } catch {}
  load();renderTypes();renderFeatures();restoreForm();showStep();summary();save();
  root.addEventListener('change',e=>{
    const t=e.target;if(!(t instanceof HTMLInputElement))return;
    if(t.name==='websiteType'){state.type=t.value;state.features=[];renderFeatures();}
    else if(t.name==='features')state.features=Array.from(root.querySelectorAll('input[name="features"]:checked')).map(i=>i.value);
    else if(['pages','design','responsive','designStatus','content','timeline'].includes(t.name))state[t.name==='content'?'contentStatus':t.name]=t.value;
    summary();save();showStep();errors.forEach(el=>{if(el)el.textContent='';});
  });
  root.addEventListener('input',e=>{const t=e.target;if(t.id==='briefName')state.name=t.value;if(t.id==='briefEmail')state.email=t.value;if(t.id==='briefBusiness')state.business=t.value;if(t.id==='briefPhone')state.phone=t.value;if(t.id==='briefNotes')state.notes=t.value;save();});
  $$('.btn-next').forEach(btn=>btn.addEventListener('click',()=>{
    if(state.step===1&&!state.type){error(0,'Choose a website type to continue.');return;}
    if(state.step===2){
      const missing=[['pages','Number of pages'],['design','Design direction'],['responsive','Responsive layout'],['timeline','Timeline']].find(([k])=>!state[k]);
      if(missing){error(1,`Please choose ${missing[1].toLowerCase()} to continue.`);root.querySelector(`input[name="${missing[0]}"]`)?.focus();return;}
    }
    if(state.step<4)go(state.step+1);
  }));
  $$('.btn-back').forEach(btn=>btn.addEventListener('click',()=>{if(state.step>1)go(state.step-1);}));
  $('#btnResetEstimator')?.addEventListener('click',reset);
  $('#btnEmailBrief')?.addEventListener('click',e=>{e.preventDefault();generate('email');});
  $('#btnWhatsappBrief')?.addEventListener('click',e=>{e.preventDefault();generate('whatsapp');});
  // A visible regional selector is added without requiring a new HTML dependency.
  const region=document.createElement('div');region.className='estimator-region-control';
  region.innerHTML='<label for="estimatorCurrency">Estimate market</label><select id="estimatorCurrency"><option value="US">United States · USD ($)</option><option value="GB">United Kingdom · GBP (£)</option><option value="PK">Pakistan · PKR (Rs)</option><option value="IN">India · INR (₹)</option><option value="IT">Italy · EUR (€)</option><option value="DE">Germany · EUR (€)</option><option value="FR">France · EUR (€)</option><option value="ES">Spain · EUR (€)</option><option value="CA">Canada · CAD (C$)</option><option value="AU">Australia · AUD (A$)</option><option value="AE">United Arab Emirates · AED (د.إ)</option><option value="SA">Saudi Arabia · SAR (ر.س)</option></select><p>Indicative regional development ranges, not currency conversions or guaranteed market averages. Every estimate includes the displayed 40% BROBEX discount.</p>';
  const heading=$('#step-3 .estimate-reveal-container');if(heading)heading.append(region);
  const currencySelect=$('#estimatorCurrency');currencySelect.value=state.currency;
  currencySelect.addEventListener('change',()=>{state.currency=currencySelect.value;summary();save();});
});
