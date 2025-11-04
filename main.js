// main.js — Pro

// 🟢 Service Worker + Install
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');

let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; installBtn.style.display = 'block'; });
installBtn?.addEventListener('click', async () => { if (!deferredPrompt) return; installBtn.style.display = 'none'; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; });

// 🟢 DOM
const pin   = document.getElementById('pin');
const unlock= document.getElementById('unlock');
const lock  = document.getElementById('lock');
const state = document.getElementById('state');
const adminForm = document.getElementById('adminForm');

const itemName  = document.getElementById('itemName');
const unit      = document.getElementById('unit');
const unitPrice = document.getElementById('unitPrice');
const qty       = document.getElementById('qty');
const usd       = document.getElementById('usd');
const fx        = document.getElementById('fx');

const out = document.getElementById('out');
const formula = document.getElementById('formula');
const rateRadios = Array.from(document.querySelectorAll('input[name="rate"]'));
const pills = [document.getElementById('pill5'), document.getElementById('pill10')];

const presetsEl = document.getElementById('presets');
const pName = document.getElementById('pName');
const pVal  = document.getElementById('pVal');
const pUnit = document.getElementById('pUnit');
const addPresetBtn = document.getElementById('addPreset');
const clearPresetsBtn = document.getElementById('clearPresets');

const ADMIN_PIN = "bassam1234";
const PRESETS_KEY = 'customQuickPresetsV2';
const enFmt = new Intl.NumberFormat('en-US');

let isOwner = false;

// ===== Owner mode =====
function updateOwnerUI(){
  if(!state) return;
  state.textContent = 'الحالة: ' + (isOwner ? 'مالك (تحرير مفعّل)' : 'قراءة فقط');
  if (adminForm) adminForm.style.display = isOwner ? '' : 'none';
  renderPresets();
}
unlock?.addEventListener('click', ()=>{ if(pin.value===ADMIN_PIN){ isOwner=true; updateOwnerUI(); alert('✅ تم فتح وضع المالك'); } else alert('❌ رمز غير صحيح'); });
lock?.addEventListener('click', ()=>{ isOwner=false; updateOwnerUI(); });

// ===== Presets =====
function loadPresets(){ try{ return JSON.parse(localStorage.getItem(PRESETS_KEY))||[] }catch{ return [] } }
function savePresets(arr){ localStorage.setItem(PRESETS_KEY, JSON.stringify(arr)) }
function renderPresets(){
  if(!presetsEl) return;
  const arr = loadPresets(); if(!arr.length){ presetsEl.innerHTML=''; return; }
  presetsEl.innerHTML = arr.map(x=>(
    `<span class="chip ${isOwner?'admin':''}" onclick="fillValue(${x.value})">
       ${x.name} (${x.unit}) – ${x.value}$
       ${isOwner?`<span class="x" onclick="event.stopPropagation(); delPreset(${JSON.stringify(x.name)})">×</span>`:''}
     </span>`
  )).join('');
}
window.fillValue = function(v){ if(usd){ usd.value = String(v); calc(); window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'}); } };
window.delPreset = function(name){ if(isOwner){ savePresets(loadPresets().filter(x=>x.name!==name)); renderPresets(); } };
addPresetBtn?.addEventListener('click', ()=>{
  if(!isOwner) return alert('هذا الإجراء للمالك فقط');
  const name=(pName.value||'').trim(); const val=parseFloat(pVal.value||0); const u=pUnit.value;
  if(!name || !val) return alert('أكمل البيانات');
  const arr=loadPresets(); const i=arr.findIndex(x=>x.name===name);
  if(i>=0) arr[i]={name, value:val, unit:u}; else arr.push({name, value:val, unit:u});
  savePresets(arr); pName.value=''; pVal.value=''; renderPresets();
});
clearPresetsBtn?.addEventListener('click', ()=>{ if(!isOwner) return alert('للمالك فقط'); if(confirm('حذف جميع الاختصارات؟')){ savePresets([]); renderPresets(); } });

// ===== Calculator =====
function selectRateByPercent(percent){
  const p = Number(String(percent).replace('%','').trim());
  // 5 -> 0.2075 | 10 -> 0.265
  const value = (p===5)?0.2075 : (p===10)?0.265 : null;
  if(value==null) return;
  const idx = value===0.2075 ? 0 : 1;
  rateRadios.forEach(r=>r.checked=false);
  rateRadios[idx].checked=true;
  pills.forEach(p=>p.classList.remove('active'));
  pills[idx].classList.add('active');
}
function getRate(){
  const r = rateRadios.find(x=>x.checked);
  return r ? parseFloat(r.value) : 0.2075;
}
function recalcUSDFromUnit(){
  const up = parseFloat(unitPrice.value||0);
  const q  = parseFloat(qty.value||0);
  if(up>0 && q>0) usd.value = (up*q).toString();
}
function calc(){
  // إذا توفرت قيمة للوحدة والعدد، نحسب USD تلقائيًا (لكن لو كتب المستخدم يدويًا سيبقى كما هو)
  if(unitPrice && qty && usd && (document.activeElement!==usd)){
    recalcUSDFromUnit();
  }
  const v = parseFloat(usd?.value || 0);
  const rate = getRate();
  const fxv = parseFloat(fx?.value || 750);
  const result = v * fxv * rate;
  if(out) out.textContent = enFmt.format(Math.round(result));
  if(formula) formula.textContent = `${enFmt.format(v)} × ${enFmt.format(fxv)} × ${rate} = ${enFmt.format(Math.round(result))}`;
}
[unitPrice, qty, usd, fx].forEach(el=> el?.addEventListener('input', calc));
rateRadios.forEach((r,i)=> r.addEventListener('change',()=>{ pills.forEach(p=>p.classList.remove('active')); pills[i].classList.add('active'); calc(); }));

// ===== URL Params: name, unit, price, qty, rate =====
(function applyFromURL(){
  const sp = new URLSearchParams(location.search);
  if(sp.has('name')) itemName && (itemName.value = sp.get('name'));
  if(sp.has('unit')) unit && (unit.value = sp.get('unit'));
  if(sp.has('price')) unitPrice && (unitPrice.value = sp.get('price'));
  if(sp.has('qty')) qty && (qty.value = sp.get('qty'));
  if(sp.has('rate')){
    // يقبل 5 أو "5%" أو 10 أو "10%"
    const raw = sp.get('rate');
    const percent = raw.includes('%') ? raw : (raw + '%');
    selectRateByPercent(percent);
  } else {
    // افتراضي 5%
    selectRateByPercent('5%');
  }
  calc();
})();

// ===== Copy / WhatsApp =====
function copyResult(){
  const name = itemName?.value ? ` (${itemName.value})` : '';
  navigator.clipboard.writeText(`الرسوم الجمركية${name}: ${out.textContent} ريال يمني`).then(()=>alert('✔ تم النسخ'));
}
function shareWhatsApp(){
  const name = itemName?.value ? ` (${itemName.value})` : '';
  open(`https://wa.me/?text=${encodeURIComponent('الرسوم الجمركية'+name+': '+out.textContent+' ريال يمني')}`,'_blank');
}
window.copyResult = copyResult;
window.shareWhatsApp = shareWhatsApp;

// ===== Init =====
renderPresets();
updateOwnerUI();
calc();
