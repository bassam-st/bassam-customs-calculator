<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>قائمة الأسعار — بسام مساعدك الجمركي</title>
  <meta name="theme-color" content="#16a34a">
  <link rel="icon" href="/icons/icon-192.png">
  <style>
    :root{--green:#16a34a;--green2:#22c55e;--ink:#0f172a;--muted:#64748b;--card:#fff;--bg:#f1f5f9;--accent:#2563eb;--danger:#ef4444;--orange:#f97316}
    *{box-sizing:border-box} body{margin:0;background:var(--bg);font-family:'Noto Kufi Arabic',system-ui,sans-serif;color:var(--ink)}
    .wrap{max-width:760px;margin:16px auto;padding:12px}
    .hero{background:linear-gradient(135deg,var(--green),var(--green2));color:#fff;border-radius:24px;padding:18px;box-shadow:0 10px 30px rgba(22,163,74,.18)}
    .hero h1{margin:0 0 6px 0;font-size:22px}
    .nav{display:flex;gap:8px;flex-wrap:wrap}
    .nav a{background:#e2e8f0;color:#0f172a;text-decoration:none;padding:8px 12px;border-radius:10px;font-weight:700}
    .card{background:var(--card);border-radius:18px;padding:14px;margin-top:14px;border:1px solid #e5e7eb;box-shadow:0 8px 24px rgba(0,0,0,.06)}
    .owner{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .btn{border:none;border-radius:12px;padding:10px 14px;font-weight:800;cursor:pointer}
    .btn-blue{background:var(--accent);color:#fff} .btn-gray{background:#e2e8f0;color:#0f172a}
    .btn-green{background:#16a34a;color:#fff} .btn-red{background:var(--danger);color:#fff} .btn-orange{background:var(--orange);color:#fff}
    .owner input, .owner select{padding:10px 12px;border:1px solid #cbd5e1;border-radius:10px}
    .state{color:#065f46;font-weight:800}
    .toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .search{width:100%;padding:12px 14px;border:1px solid #cbd5e1;border-radius:12px}
    .item{border-top:1px dashed #e5e7eb;padding:12px 0}
    .head{display:flex;justify-content:space-between;align-items:center;gap:6px}
    .name{font-weight:900}
    .badges{display:flex;gap:6px;flex-wrap:wrap}
    .badge{background:#eef2ff;color:#334155;border:1px solid #c7d2fe;padding:4px 8px;border-radius:999px;font-size:12px}
    .badge.unit{background:#e2e8f0;border-color:#cbd5e1}
    .badge.rate5{background:#dcfce7;border-color:#bbf7d0;color:#166534}
    .badge.rate10{background:#fee2e2;border-color:#fecaca;color:#7f1d1d}
    .price{color:#0f172a;opacity:.9;font-size:13px;margin-top:4px}
    .actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .muted{color:#64748b;font-size:12px;margin-top:4px}
    .owner-only{display:none}
    .commit{min-width:200px}
  </style>
</head>
<body>
<div class="wrap">

  <section class="hero">
    <h1>💲 قائمة الأسعار</h1>
    <div class="nav">
      <a href="./index.html">🏠 الحاسبة</a>
      <a href="./hs.html">🔍 البنود الجمركية</a>
    </div>
  </section>

  <!-- شريط المالك -->
  <section class="card">
    <div class="owner">
      <span>🔒 وضع المالك:</span>
      <input id="pin" type="password" placeholder="PIN">
      <button class="btn btn-blue" id="unlock">فتح</button>
      <button class="btn btn-gray" id="lock">قفل</button>
      <span class="state" id="state">الحالة: قراءة فقط</span>
    </div>

    <!-- نموذج إضافة/تعديل -->
    <div class="owner owner-only" style="gap:8px;margin-top:10px" id="formRow">
      <input id="fName" placeholder="اسم السلعة" />
      <input id="fPrice" type="number" inputmode="decimal" placeholder="السعر بالدولار" />
      <select id="fUnit">
        <option value="ton">الطن</option>
        <option value="kg">الكيلو</option>
        <option value="dz">الدُزْن</option>
        <option value="pcs">الحبة</option>
        <option value="ltr">اللتر</option>
        <option value="Ah">Ah/أمبير</option>
        <option value="W">W/واط</option>
        <option value="yd">الياردة</option>
        <option value="pair">الزوج</option>
        <option value="bbl">البرميل</option>
        <option value="m2">المتر المربع</option>
        <option value="m3">المتر المكعب</option>
        <option value="mg">مليجرام</option>
        <option value="g">جرام</option>
        <option value="roll">اللفة</option>
      </select>
      <input id="fNotes" style="min-width:180px" placeholder="ملاحظات (مثال: الفئة5%)" />
      <button class="btn btn-blue" id="saveBtn">حفظ/تحديث</button>
      <button class="btn btn-gray" id="clearBtn">تفريغ النموذج</button>
    </div>
    <div class="muted">💡 لالتقاط الفئة تلقائيًا اكتب في الملاحظات: <b>الفئة5%</b> أو <b>الفئة10%</b>.</div>
  </section>

  <!-- أدوات -->
  <section class="card">
    <input id="q" class="search" placeholder="ابحث بالاسم… مثال: بطاريات، شبك، ملابس">
    <div class="toolbar">
      <button class="btn btn-gray" id="exportBtn">تصدير JSON</button>
      <input type="file" id="importFile" accept="application/json" style="display:none">
      <button class="btn btn-gray" id="importBtn">استيراد JSON</button>

      <!-- 🆕 أدوات المالك للحفظ إلى GitHub -->
      <input id="commitMsg" class="owner-only commit" placeholder="رسالة الحفظ (اختياري)">
      <button id="pushBtn" class="btn btn-blue owner-only">💾 حفظ إلى GitHub</button>

      <small class="muted">المصدر الأساسي: <code>assets/prices_catalog.json</code> (مع دمج المحلي).</small>
    </div>
  </section>

  <!-- القائمة -->
  <section class="card" id="list"></section>

</div>

<script>
/* ===== إعدادات عامة ===== */
const ADMIN_PIN = "bassam1234";
const STORAGE_KEY = 'prices_catalog_v3';
const REMOTE_JSON = '/assets/prices_catalog.json';

let isOwner = false;
let ownerPin = null;
let items = [];
let editIndex = -1;

/* ===== DOM ===== */
const $ = id => document.getElementById(id);
const pin = $('pin'), unlock=$('unlock'), lockBtn=$('lock'), state=$('state');
const formRow = $('formRow'), fName=$('fName'), fPrice=$('fPrice'), fUnit=$('fUnit'), fNotes=$('fNotes');
const saveBtn=$('saveBtn'), clearBtn=$('clearBtn');
const list=$('list'), q=$('q');
const exportBtn=$('exportBtn'), importBtn=$('importBtn'), importFile=$('importFile');
const pushBtn=$('pushBtn'), commitMsg=$('commitMsg');

/* ===== وحدات ===== */
function unitMap(u){
  const s = String(u||'').toLowerCase();
  if (s.includes('طن') || s === 'ton') return 'ton';
  if (s.includes('كجم') || s.includes('كيلو') || s === 'kg') return 'kg';
  if (s.includes('dz') || s.includes('درزن')) return 'dz';
  if (s.includes('لتر') || s === 'ltr') return 'ltr';
  if (s.includes('ah') || s.includes('أمبير')) return 'Ah';
  if (s.startsWith('w') || s.includes('واط')) return 'W';
  if (s === 'yd' || s.includes('يارد') || s.includes('ياردة')) return 'yd';
  if (s === 'pair' || s.includes('زوج')) return 'pair';
  if (s === 'bbl' || s.includes('برميل')) return 'bbl';
  if (s === 'm2' || s.includes('متر مربع')) return 'm2';
  if (s === 'm3' || s.includes('متر مكعب')) return 'm3';
  if (s === 'mg' || s.includes('مليجرام')) return 'mg';
  if (s === 'g'  || s.includes('جرام')) return 'g';
  if (s === 'roll' || s.includes('لفة') || s.includes('لفه')) return 'roll';
  return 'pcs';
}
function unitLabel(u){
  switch(u){
    case 'ton': return 'الطن';
    case 'kg' : return 'الكيلو';
    case 'dz' : return 'الدُزْن';
    case 'pcs': return 'الحبة';
    case 'ltr': return 'اللتر';
    case 'Ah' : return 'Ah/أمبير';
    case 'W'  : return 'W/واط';
    case 'yd' : return 'الياردة';
    case 'pair': return 'الزوج';
    case 'bbl': return 'البرميل';
    case 'm2' : return 'المتر المربع';
    case 'm3' : return 'المتر المكعب';
    case 'mg' : return 'مليجرام';
    case 'g'  : return 'جرام';
    case 'roll': return 'اللفة';
    default   : return u;
  }
}

/* ===== معدل الفئة من الملاحظات ===== */
function parseRateFromNotes(notes){
  const s = String(notes||'').replace(/\s+/g,'');
  if (/الفئة?10%|10%/.test(s)) return {pct:10, value:0.265, cls:'rate10'};
  if (/الفئة?5%|5%/.test(s))  return {pct:5,  value:0.2075, cls:'rate5'};
  return {pct:10, value:0.265, cls:'rate10'};
}

/* ===== IO محلي/ريموت ===== */
function normalize(rec){
  const name  = rec.name || rec['الاسم'] || rec['اسم'] || '';
  const price = rec.price ?? rec['السعر'] ?? null;
  const unit  = rec.unit  || rec['الوحدة'] || rec['وحدة'] || 'pcs';
  const notes = rec.notes || rec['ملحوظات'] || rec['ملاحظات'] || '';
  return { name: String(name).trim(), price: Number(price), unit: unitMap(unit), notes: String(notes).trim() };
}
function saveLocal(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
function loadLocal(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY))||[] }catch{ return [] } }

async function boot(){
  let remote = [];
  try{
    const r = await fetch(REMOTE_JSON, {cache:'no-store'});
    if (r.ok){
      const raw = await r.json();
      remote = Array.isArray(raw) ? raw.map(normalize) : [];
    }
  }catch(e){}
  const local = loadLocal().map(normalize);
  const map = new Map();
  remote.forEach(x=>{ if(x.name) map.set(x.name,x); });
  local.forEach(x=>{ if(x.name) map.set(x.name,x); });
  items = Array.from(map.values());
  render();
}

/* ===== عرض ===== */
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function render(){
  const term = (q.value||'').trim();
  const re = term ? new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i') : null;

  const rows = items.map((it,i)=>{
    if (re && !re.test(it.name)) return null;
    const rate = parseRateFromNotes(it.notes);
    return `
      <div class="item">
        <div class="head">
          <div class="name">${escapeHtml(it.name)}</div>
          <div class="badges">
            <span class="badge unit">${unitLabel(it.unit)}</span>
            <span class="badge ${rate.cls}">%${rate.pct} الفئة</span>
          </div>
        </div>
        <div class="price">USD ${it.price ?? ''}</div>
        ${it.notes ? `<div class="muted">${escapeHtml(it.notes)}</div>`:''}
        <div class="actions">
          <button class="btn btn-green" onclick="usePrice(${i})">استخدام السعر</button>
          <button class="btn btn-orange" onclick="editItem(${i})">تعديل</button>
          <button class="btn btn-red" onclick="deleteItem(${i})">حذف</button>
        </div>
      </div>`;
  }).filter(Boolean).join('');

  list.innerHTML = rows || '<div class="muted">لا توجد عناصر مطابقة.</div>';
}

/* ===== استخدام السعر → الحاسبة ===== */
window.usePrice = function(idx){
  const it = items[idx]; if(!it) return;
  const rate = parseRateFromNotes(it.notes);
  const qty = 1;
  const url = `./index.html?price=${encodeURIComponent(it.price)}&qty=${qty}&ratePct=${rate.pct}`;
  location.href = url;
};

/* ===== تعديل/حذف ===== */
window.editItem = function(idx){
  if(!isOwner) return alert('هذا الإجراء للمالك فقط');
  const it = items[idx]; if(!it) return;
  editIndex = idx;
  fName.value  = it.name;
  fPrice.value = it.price;
  fUnit.value  = it.unit;
  fNotes.value = it.notes || '';
  formRow.scrollIntoView({behavior:'smooth', block:'center'});
};
window.deleteItem = function(idx){
  if(!isOwner) return alert('هذا الإجراء للمالك فقط');
  const it = items[idx]; if(!it) return;
  if(confirm(`سيتم حذف "${it.name}". متابعة؟`)){
    items.splice(idx,1);
    saveLocal(); render();
  }
};

/* ===== حفظ/تفريغ محلي ===== */
saveBtn?.addEventListener('click', ()=>{
  if(!isOwner) return alert('هذا الإجراء للمالك فقط');
  const rec = normalize({name:fName.value, price:fPrice.value, unit:fUnit.value, notes:fNotes.value});
  if(!rec.name) return alert('اكتب اسم السلعة');
  if(!(rec.price>0)) return alert('اكتب سعرًا صحيحًا بالدولار');

  if(editIndex>=0){ items[editIndex] = rec; editIndex=-1; }
  else{
    const i = items.findIndex(x=>x.name===rec.name);
    if(i>=0) items[i] = rec; else items.push(rec);
  }
  saveLocal(); render();
  fName.value=''; fPrice.value=''; fNotes.value='';
});
clearBtn?.addEventListener('click', ()=>{ editIndex=-1; fName.value=''; fPrice.value=''; fNotes.value=''; });

/* ===== بحث/استيراد/تصدير (محمي) ===== */
let ts=null;
q.addEventListener('input', ()=>{
  clearTimeout(ts);
  ts=setTimeout(()=>{
    render();
    try{ window.trackSearch && window.trackSearch(q.value); }catch(_){}
  }, 400);
});
q.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); } });

exportBtn.addEventListener('click', (e)=>{
  if(!isOwner){
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
    return alert('هذا الإجراء للمالك فقط');
  }
  const blob = new Blob([JSON.stringify(items, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {href:url, download:'prices_export.json'});
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', (e)=>{
  if(!isOwner){
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
    return alert('هذا الإجراء للمالك فقط');
  }
  importFile.click();
});
importFile.addEventListener('click', (e)=>{
  if(!isOwner){
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
    return false;
  }
}, true);
importFile.addEventListener('change', async (e)=>{
  if(!isOwner){
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
    e.target.value = '';
    return alert('هذا الإجراء للمالك فقط');
  }
  const file = e.target.files?.[0]; if(!file) return;
  try{
    const txt = await file.text();
    const arr = JSON.parse(txt);
    if(!Array.isArray(arr)) throw new Error('صيغة غير صحيحة');
    items = arr.map(normalize);
    saveLocal(); render(); alert('✅ تم الاستيراد بنجاح');
  }catch(err){ alert('❌ تعذر قراءة الملف: ' + err.message); }
  importFile.value = '';
});

/* ===== حفظ إلى GitHub عبر /api/update ===== */
async function pushToGitHub(){
  if(!isOwner) return alert('هذا الإجراء للمالك فقط');
  if(!ownerPin){ return alert('أعد فتح وضع المالك أولًا'); }
  const payload = {
    pin: ownerPin,
    items: items.map(normalize),
    message: (commitMsg.value || '').trim() || 'تحديث قائمة الأسعار من داخل التطبيق'
  };
  try{
    const r = await fetch('/api/update', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await r.json().catch(()=>({}));
    if(!r.ok){ throw new Error(data.detail || r.statusText); }
    alert('✅ تم الحفظ إلى GitHub بنجاح');
  }catch(err){
    alert('❌ فشل الحفظ إلى GitHub: ' + err.message);
  }
}
pushBtn?.addEventListener('click', pushToGitHub);

/* ===== فتح/قفل ===== */
function updateOwnerUI(){
  state.textContent = 'الحالة: ' + (isOwner ? 'مالك (تحرير مفعّل)' : 'قراءة فقط');
  formRow.classList.toggle('owner-only', !isOwner);
  [exportBtn, importBtn, pushBtn, commitMsg].forEach(el=>{
    if(!el) return;
    el.disabled = !isOwner;
    el.classList.toggle('owner-only', !isOwner);
    if(!isOwner){ el.value !== undefined && (el.value=''); }
  });
}
unlock.addEventListener('click', ()=>{
  if(pin.value === ADMIN_PIN){
    isOwner=true; ownerPin=pin.value; updateOwnerUI(); alert('✅ تم فتح وضع المالك');
  } else alert('❌ رمز غير صحيح');
});
lockBtn.addEventListener('click', ()=>{ isOwner=false; ownerPin=null; updateOwnerUI(); });

/* ===== بدء التشغيل ===== */
updateOwnerUI();
boot();
</script>

<!-- تتبُّع بسيط -->
<script>
(function(){
  const TRACK_URL="https://bassam-tracker.onrender.com/track";
  function uuid(){return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
    const r=crypto.getRandomValues(new Uint8Array(1))[0]&15,v=c==='x'?r:(r&3|8);return v.toString(16);
  });}
  const LS=localStorage; let deviceId=LS.getItem("deviceId"); if(!deviceId){deviceId=uuid();LS.setItem("deviceId",deviceId);}
  async function send(event,payload){
    const body=JSON.stringify({event,deviceId,payload:payload||{}});
    try{
      if(navigator.sendBeacon){navigator.sendBeacon(TRACK_URL,new Blob([body],{type:"application/json"}));}
      else{await fetch(TRACK_URL,{method:"POST",headers:{"Content-Type":"application/json"},body});}
    }catch(_){}
  }
  document.addEventListener("DOMContentLoaded",()=>send("page_view",{path:location.pathname,title:document.title}));
  window.trackSearch=(q)=>send("search",{q:String(q||"").trim(),page:location.pathname});
})();
</script>
</body>
</html>
