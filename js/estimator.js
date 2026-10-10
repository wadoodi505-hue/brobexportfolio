/* BROBEX estimator — transparent regional pricing, resilient state and brief generation. */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('brobexEstimator');
  if (!root || root.dataset.estimatorReady === 'true') return;
  root.dataset.estimatorReady = 'true';

  const STORAGE_KEY = 'brobex-estimator-v2';
  const CONFIG = {
    currency: {
      USD: { locale: 'en-US', symbol: '$', label: 'United States (USD)' },
      GBP: { locale: 'en-GB', symbol: '£', label: 'United Kingdom (GBP)' }
    },
    types: [
      { id:'landing', title:'Landing Page', icon:'fa-rocket', desc:'A focused page for one offer or campaign.', base:{USD:[250,450],GBP:[220,400]} },
      { id:'business', title:'Small Business Website', icon:'fa-building', desc:'A clear, professional website for a local business.', base:{USD:[400,800],GBP:[350,700]} },
      { id:'portfolio', title:'Professional Portfolio', icon:'fa-user-astronaut', desc:'Present your work, services, and experience.', base:{USD:[300,700],GBP:[260,620]} },
      { id:'ecommerce', title:'E-commerce Store', icon:'fa-shopping-bag', desc:'A small online shop with product and checkout flows.', base:{USD:[1000,2000],GBP:[850,1750]} },
      { id:'booking', title:'Booking Website', icon:'fa-calendar-check', desc:'Let customers request or schedule appointments.', base:{USD:[800,1600],GBP:[700,1400]} },
      { id:'blog', title:'Blog or Content Website', icon:'fa-pen-nib', desc:'Publish articles and useful resources.', base:{USD:[450,900],GBP:[400,800]} },
      { id:'restaurant', title:'Restaurant Website', icon:'fa-utensils', desc:'Show your menu, location, opening hours, and contact details.', base:{USD:[450,900],GBP:[400,800]} },
      { id:'realestate', title:'Real Estate Website', icon:'fa-home', desc:'Present properties and help visitors make enquiries.', base:{USD:[800,1600],GBP:[700,1400]} },
      { id:'saas', title:'SaaS or Web Application', icon:'fa-cloud', desc:'A more complex product interface; final scope needs discussion.', base:{USD:[1500,3500],GBP:[1300,3000]} },
      { id:'custom', title:'Custom Website', icon:'fa-code', desc:'A tailored solution for requirements not covered above.', base:{USD:[1000,1800],GBP:[900,1600]} }
    ],
    features: [
      {label:'Contact form / lead enquiries',price:{USD:[0,60],GBP:[0,50]}, show:['business','portfolio','landing','booking','blog','restaurant','realestate','custom','saas']},
      {label:'WhatsApp contact link',price:{USD:[0,30],GBP:[0,25]}},
      {label:'Appointment booking integration',price:{USD:[150,350],GBP:[130,300]}, show:['booking','business','restaurant','custom']},
      {label:'Product catalogue',price:{USD:[100,250],GBP:[90,220]}, show:['ecommerce','realestate','custom']},
      {label:'Shopping cart and checkout',price:{USD:[200,450],GBP:[180,400]}, show:['ecommerce','custom']},
      {label:'Online payment integration',price:{USD:[150,350],GBP:[130,300]}, show:['ecommerce','booking','custom','saas']},
      {label:'Content editing / CMS',price:{USD:[150,350],GBP:[130,300]}, show:['blog','business','restaurant','realestate','custom']},
      {label:'Advanced search or filters',price:{USD:[100,300],GBP:[90,260]}, show:['ecommerce','realestate','saas','custom']},
      {label:'User accounts',price:{USD:[250,500],GBP:[220,450]}, show:['ecommerce','saas','custom']},
      {label:'Admin dashboard',price:{USD:[300,650],GBP:[260,570]}, show:['ecommerce','saas','custom']},
      {label:'Custom motion and interactions',price:{USD:[100,300],GBP:[90,260]}},
      {label:'On-page SEO setup',price:{USD:[75,180],GBP:[65,160]}},
      {label:'Analytics setup',price:{USD:[40,100],GBP:[35,90]}}
    ],
    pages: {'1-3':{USD:[0,0],GBP:[0,0]},'4-6':{USD:[100,200],GBP:[90,175]},'7-10':{USD:[220,400],GBP:[190,350]},'10+':{USD:[400,750],GBP:[350,650]}},
    design: {
      'Clean & Professional':{USD:[0,0],GBP:[0,0]},
      'Premium':{USD:[100,250],GBP:[90,220]},
      'Luxury / High-End':{USD:[250,500],GBP:[220,440]},
      'Fully Custom':{USD:[400,900],GBP:[350,800]}
    }
  };
  const $ = s => root.querySelector(s);
  const $$ = s => Array.from(root.querySelectorAll(s));
  const labels = ['WEBSITE TYPE','REQUIREMENTS','ESTIMATE','PROJECT BRIEF'];
  const steps = $$('.estimator-step'), progress = $$('.progress-step');
  const errors = [$('#step1-error'), $('#step2-error')];
  const state = {
    step:1, type:'', pages:'', design:'', responsive:'', features:[],
    designStatus:'', contentStatus:'', timeline:'', currency:'USD',
    name:'', email:'', business:'', phone:'', notes:''
  };
  const typeGrid = $('#websiteTypeGrid'), featureGrid = $('#req-features');
  const money = n => new Intl.NumberFormat(CONFIG.currency[state.currency].locale,{style:'currency',currency:state.currency,maximumFractionDigits:0}).format(n);
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
      const copy={...state};
      // Keep contact information in memory only; persist project configuration, not personal details.
      delete copy.name; delete copy.email; delete copy.business; delete copy.phone; delete copy.notes;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(copy));
    } catch {}
  }
  function load(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY); if(!raw)return;
      const parsed=JSON.parse(raw);
      if(!parsed || typeof parsed!=='object')return;
      ['type','pages','design','responsive','designStatus','contentStatus','timeline'].forEach(k=>{if(typeof parsed[k]==='string')state[k]=parsed[k];});
      if(Array.isArray(parsed.features))state.features=parsed.features.filter(x=>CONFIG.features.some(f=>f.label===x));
      if(['USD','GBP'].includes(parsed.currency))state.currency=parsed.currency;
      state.step=1;
    }catch{ try{localStorage.removeItem(STORAGE_KEY)}catch{} }
  }
  function estimate(){
    const type=CONFIG.types.find(t=>t.id===state.type);
    let min=0,max=0;
    const add=p=>{if(p){min+=p[state.currency][0];max+=p[state.currency][1];}};
    if(type)add(type.base);
    add(CONFIG.pages[state.pages]); add(CONFIG.design[state.design]);
    state.features.forEach(label=>{const f=CONFIG.features.find(x=>x.label===label);if(f)add(f.price);});
    return {min,max};
  }
  function summary(){
    const list=$('#summaryList'), price=$('#summaryPrice');
    const e=estimate();
    if(list) list.innerHTML=state.type ? [
      ['Website',CONFIG.types.find(t=>t.id===state.type)?.title],['Pages',state.pages],['Design',state.design],['Layout',state.responsive],
      ['Features',state.features.join(', ')||'No optional features selected'],['Design assets',state.designStatus],['Content',state.contentStatus],['Timeline',state.timeline],['Region',CONFIG.currency[state.currency].label]
    ].filter(([,v])=>v).map(([k,v])=>`<div class="summary-item"><span class="summary-item-label">${k}</span><span class="summary-item-value">${v}</span></div>`).join('') : '<div class="summary-item empty-state">Choose a website type to start your estimate.</div>';
    if(price)price.textContent=state.type?range(e.min,e.max):range(0,0);
    const display=$('#finalPriceDisplay');
    if(display)display.innerHTML=state.type?`<div class="estimate-price-stack"><div class="estimate-discounted-range"><span class="price-val">${money(e.min)}</span><span class="price-sep">–</span><span class="price-val">${money(e.max)}</span></div><span class="estimate-disclaimer">Indicative estimate · ${CONFIG.currency[state.currency].label}</span></div>`:`<span class="price-val">${money(0)}</span><span class="price-sep">–</span><span class="price-val">${money(0)}</span>`;
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
    state.step=step;showStep();summary();
    if(step===4)syncBrief();
    const target=document.getElementById('project-estimator');
    if(target){const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});}
  }
  function syncBrief(){
    [['briefName','name'],['briefEmail','email'],['briefBusiness','business'],['briefPhone','phone'],['briefNotes','notes']].forEach(([id,key])=>{const el=document.getElementById(id);if(el)state[key]=el.value;});
  }
  function briefText(){
    syncBrief();const e=estimate(), type=CONFIG.types.find(t=>t.id===state.type);
    const lines=[
      'Hello BROBEX,','',
      'I would like to discuss a website project. Here is my preliminary brief.','',
      'PROJECT CONTACT',`Name: ${safe(state.name)||'Not provided'}`,`Email: ${safe(state.email)||'Not provided'}`,`Business: ${safe(state.business)||'Not provided'}`,`Phone / WhatsApp: ${safe(state.phone)||'Not provided'}`,'',
      'PROJECT SCOPE',`Website type: ${type?.title||'Not specified'}`,`Business goal: ${type?.desc||'To be discussed'}`,`Pages: ${state.pages||'Not specified'}`,`Design direction: ${state.design||'Not specified'}`,`Responsive layout: ${state.responsive||'Not specified'}`,`Features: ${state.features.join(', ')||'No optional features selected'}`,`Design status: ${state.designStatus||'Not specified'}`,`Content readiness: ${state.contentStatus||'Not specified'}`,`Preferred timeline: ${state.timeline||'Flexible / to be discussed'}`,'',
      'PRELIMINARY INVESTMENT',`Estimated range: ${range(e.min,e.max)} (${CONFIG.currency[state.currency].label})`,'This is a planning estimate, not a fixed quote. Final pricing depends on confirmed scope.','',
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
    if(!window.confirm('Reset your website estimate and clear the saved project selections?'))return;
    Object.assign(state,JSON.parse(initial));root.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(i=>i.checked=false);
    [['briefName','name'],['briefEmail','email'],['briefBusiness','business'],['briefPhone','phone'],['briefNotes','notes']].forEach(([id])=>{const el=document.getElementById(id);if(el)el.value='';});
    try{localStorage.removeItem(STORAGE_KEY)}catch{}
    renderFeatures();showStep();summary();errors.forEach(el=>{if(el)el.textContent='';});
  }

  load();renderTypes();renderFeatures();restoreForm();showStep();summary();
  root.addEventListener('change',e=>{
    const t=e.target;if(!(t instanceof HTMLInputElement))return;
    if(t.name==='websiteType'){state.type=t.value;state.features=[];renderFeatures();}
    else if(t.name==='features')state.features=Array.from(root.querySelectorAll('input[name="features"]:checked')).map(i=>i.value);
    else if(['pages','design','responsive','designStatus','content','timeline'].includes(t.name))state[t.name==='content'?'contentStatus':t.name]=t.value;
    summary();save();showStep();errors.forEach(el=>{if(el)el.textContent='';});
  });
  root.addEventListener('input',e=>{const t=e.target;if(t.id==='briefName')state.name=t.value;if(t.id==='briefEmail')state.email=t.value;if(t.id==='briefBusiness')state.business=t.value;if(t.id==='briefPhone')state.phone=t.value;if(t.id==='briefNotes')state.notes=t.value;});
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
  region.innerHTML='<label for="estimatorCurrency">Estimate region</label><select id="estimatorCurrency"><option value="USD">United States · USD ($)</option><option value="GBP">United Kingdom · GBP (£)</option></select><p>Regional planning ranges are configurable and are not currency conversions.</p>';
  const heading=$('#step-3 .estimate-reveal-container');if(heading)heading.append(region);
  const currencySelect=$('#estimatorCurrency');currencySelect.value=state.currency;
  currencySelect.addEventListener('change',()=>{state.currency=currencySelect.value;summary();save();});
});
