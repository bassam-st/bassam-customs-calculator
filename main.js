// ===============================
// main.js — Bassam Customs Pro
// ===============================

// ✅ تسجيل Service Worker (PWA) — بطريقة تعمل على GitHub Pages (بدون مسار /)
if ('serviceWorker' in navigator) {
  try{
    const swUrl = new URL('./sw.js', window.location.href);
    navigator.serviceWorker.register(swUrl).catch(()=>{});
  }catch(e){}
}

// ===============================
// القسم 1: الحاسبة الأساسية (كما في كودك الأصلي)
// ===============================
(function(){
  const usdInput   = document.getElementById('usd');
  const outEl      = document.getElementById('out');
  const formulaEl  = document.getElementById('formula');
  const rateRadios = Array.from(document.querySelectorAll('input[name="rate"]'));
  const pills = [document.getElementById('pill5'), document.getElementById('pill10')];
  const enFmt = new Intl.NumberFormat('en-US');

  function getRate(){
    const r = rateRadios.find(x=>x && x.checked);
    return r ? parseFloat(r.value) : 0.2075;
  }
  function calc(){
    if(!usdInput || !outEl || !formulaEl) return;
    const v = parseFloat(usdInput.value || 0);
    const rate = getRate();
    const result = v * 750 * rate;
    outEl.textContent = enFmt.format(Math.round(result));
    const f = `${enFmt.format(v)} × 750 × ${rate} = ${enFmt.format(Math.round(result))}`;
    formulaEl.textContent = f;
  }

  rateRadios.forEach((r,i)=>{
    r?.addEventListener('change',()=>{
      pills.forEach(p=>p?.classList.remove('active'));
      pills[i]?.classList.add('active');
      calc();
    });
  });
  usdInput?.addEventListener('input', calc);

  // التقاط البارامترات من prices.html
  (function applyFromQuery(){
    try{
      const q = new URLSearchParams(location.search);
      const price = parseFloat(q.get('price') || q.get('usd') || '0');
      const qty   = parseFloat(q.get('qty') || '1');
      const rateMul = parseFloat(q.get('rateMul') || q.get('rate') || '');
      const ratePct = parseFloat(q.get('ratePct') || '');

      if (price > 0 && usdInput) {
        const totalUSD = price * (isFinite(qty)&&qty>0 ? qty : 1);
        usdInput.value = String(totalUSD);
      }

      const setRadioByValue = (valStr)=>{
        const r = rateRadios.find(x=>x.value === valStr);
        if (r){
          r.checked = true;
          const idx = rateRadios.indexOf(r);
          pills.forEach(p=>p?.classList.remove('active'));
          pills[idx]?.classList.add('active');
        }
      };
      if (!isNaN(rateMul) && (rateMul===0.2075 || rateMul===0.265)) {
        setRadioByValue(String(rateMul));
      } else if (!isNaN(ratePct)) {
        setRadioByValue(ratePct===5 ? '0.2075' : ratePct===10 ? '0.265' : '0.265');
      }

      calc();
      if (location.search) history.replaceState({}, '', location.pathname);
    }catch(e){}
  })();

  calc();
})();

// ===============================
// القسم 2: حماية المالك (PIN) + منع استيراد/تصدير JSON
// ===============================

// مفاتيح التخزين
const OWNER_LS_KEY    = "ownerMode";
const OWNER_TRIES_KEY = "ownerTries";
const OWNER_LOCK_KEY  = "ownerLockUntil";
const OWNER_MAX_TRIES = 5;
const OWNER_LOCK_MS   = 5 * 60 * 1000;

// 🔐 هاش كلمة مرور المالك (bassam1234)
const OWNER_PIN_HASH_HEX = "f2de84b1e7904cd6840f5bf3363f0df2f08c6f612339364174f474254cf05f31";

// أدوات
async function sha256Hex(text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
function isOwner(){ return localStorage.getItem(OWNER_LS_KEY) === "1"; }
function setOwner(on){ localStorage.setItem(OWNER_LS_KEY, on ? "1":"0"); applyOwnerUi(); }
function isLocked(){
  const until = Number(localStorage.getItem(OWNER_LOCK_KEY) || 0);
  return Date.now() < until;
}
function incTries(){
  const n = (Number(localStorage.getItem(OWNER_TRIES_KEY) || 0) + 1);
  localStorage.setItem(OWNER_TRIES_KEY, String(n));
  if(n >= OWNER_MAX_TRIES){
    localStorage.setItem(OWNER_LOCK_KEY, String(Date.now() + OWNER_LOCK_MS));
    localStorage.setItem(OWNER_TRIES_KEY, "0");
  }
}
function resetTries(){ localStorage.setItem(OWNER_TRIES_KEY, "0"); }

// تحديث واجهة المالك إن وُجدت
function applyOwnerUi(){
  const s = document.getElementById("ownerState");
  if(s) s.textContent = "الحالة: " + (isOwner() ? "مالك (تحرير مفعّل)" : "قراءة فقط");
  const ex = document.getElementById("exportBtn");
  const im = document.getElementById("importBtn");
  if(ex) ex.style.display = isOwner() ? "" : "none";
  if(im) im.style.display = isOwner() ? "" : "none";
}

// تهيئة شريط المالك وحماية الاستيراد/التصدير
document.addEventListener("DOMContentLoaded", ()=>{
  applyOwnerUi();

  const pin       = document.getElementById("ownerPin");
  const btnUnlock = document.getElementById("ownerUnlock");
  const btnLock   = document.getElementById("ownerLock");
  const ex = document.getElementById("exportBtn");
  const im = document.getElementById("importBtn");
  const file = document.getElementById("importFile");

  // أزرار المالك
  btnUnlock?.addEventListener("click", async ()=>{
    if(isLocked()){
      const waitMin = Math.ceil((Number(localStorage.getItem(OWNER_LOCK_KEY))-Date.now())/60000);
      return alert("محاولات كثيرة خاطئة. انتظر "+waitMin+" دقيقة.");
    }
    const val = pin?.value || "";
    if(!val) return alert("أدخل PIN");
    try{
      const h = await sha256Hex(val);
      if(h === OWNER_PIN_HASH_HEX){
        setOwner(true); resetTries(); alert("✅ تم فتح وضع المالك");
      }else{
        incTries(); alert("❌ رمز غير صحيح");
      }
    }catch(e){ alert("تعذر التحقق"); }
  });

  btnLock?.addEventListener("click", ()=> setOwner(false));

  // حارس قوي لتصدير JSON
  ex?.addEventListener("click",(e)=>{
    if(!isOwner()){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      alert("هذا الإجراء للمالك فقط");
      return false;
    }
  }, true);

  // حارس قوي لاستيراد JSON
  im?.addEventListener("click",(e)=>{
    if(!isOwner()){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      alert("هذا الإجراء للمالك فقط");
      return false;
    } else {
      file?.click(); // للمالك فقط
    }
  }, true);

  // تأمين عنصر الملف نفسه
  file?.addEventListener("click",(e)=>{
    if(!isOwner()){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      alert("هذا الإجراء للمالك فقط");
      return false;
    }
  }, true);
  file?.addEventListener("change",(e)=>{
    if(!isOwner()){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      e.target.value = "";
      alert("هذا الإجراء للمالك فقط");
      return false;
    }
  }, true);
});

// قفل تلقائي بعد 30 دقيقة خمول
(function autoLock(){
  let timer;
  function arm(){
    clearTimeout(timer);
    if(isOwner()) timer = setTimeout(()=>setOwner(false), 30*60*1000);
  }
  ["click","keydown","touchstart","mousemove","visibilitychange"].forEach(evt=>{
    window.addEventListener(evt, arm, {passive:true});
  });
  arm();
})();

// ===============================
// القسم 3: ✅ صفحة الأسعار prices.html
// تحميل catalog من assets/prices_catalog.json + دمج المحلي + عرض + بحث
// ===============================

// مفاتيح تخزين مرنة (لن نكسر أي نسخة سابقة)
const PRICES_LOCAL_KEYS = [
  "pricesCatalogLocal",
  "prices_local",
  "local_prices",
  "PRICE_CATALOG_LOCAL",
  "prices_catalog_local"
];

// محاولة إيجاد عناصر الصفحة دون الاعتماد على ID واحد
function pickElByIds(ids){
  for(const id of ids){
    const el = document.getElementById(id);
    if(el) return el;
  }
  return null;
}
function pickFirstSelector(selectors){
  for(const s of selectors){
    const el = document.querySelector(s);
    if(el) return el;
  }
  return null;
}

function normalizeStr(s){
  return String(s || "").trim();
}

// قراءة المحلي إن وجد
function readLocalPrices(){
  for(const k of PRICES_LOCAL_KEYS){
    try{
      const raw = localStorage.getItem(k);
      if(!raw) continue;
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed)) return parsed;
      // بعض النسخ تحفظ كائن {items:[...]} أو {data:[...]}
      if(parsed && Array.isArray(parsed.items)) return parsed.items;
      if(parsed && Array.isArray(parsed.data)) return parsed.data;
      if(parsed && Array.isArray(parsed.catalog)) return parsed.catalog;
    }catch(e){}
  }
  return [];
}

// دمج: الأساسي + المحلي (باسم السلعة كـ مفتاح)
function mergeCatalog(baseArr, localArr){
  const map = new Map();
  (baseArr||[]).forEach(x=>{
    const name = normalizeStr(x?.name);
    if(name) map.set(name, x);
  });
  (localArr||[]).forEach(x=>{
    const name = normalizeStr(x?.name);
    if(name) map.set(name, x); // المحلي يغطي الأساسي
  });
  return Array.from(map.values());
}

async function loadBaseCatalog(){
  // مسار صحيح على GitHub Pages
  const url = new URL("assets/prices_catalog.json", window.location.href);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if(!res.ok) throw new Error("catalog_fetch_failed");
  const data = await res.json();
  // ملفك Array مباشرة
  if(Array.isArray(data)) return data;
  // احتياط
  if(data && Array.isArray(data.items)) return data.items;
  if(data && Array.isArray(data.data)) return data.data;
  if(data && Array.isArray(data.catalog)) return data.catalog;
  return [];
}

// إنشاء/تحديد مكان عرض العناصر
function ensureListContainer(){
  // جرّب IDs شائعة
  let box = pickElByIds(["catalogList","itemsList","priceList","list","results","catalog"]);
  if(box) return box;

  // جرّب selectors شائعة
  box = pickFirstSelector([
    "[data-catalog]",
    ".catalog-list",
    ".items-list",
    ".results",
    ".list"
  ]);
  if(box) return box;

  // إذا لم نجد: أنشئ قائمة أسفل مربع البحث إن وجد
  const search = ensureSearchInput();
  const wrap = document.createElement("div");
  wrap.id = "catalogList";
  wrap.style.padding = "12px";
  wrap.style.marginTop = "8px";

  if(search && search.parentElement){
    search.parentElement.appendChild(wrap);
  }else{
    document.body.appendChild(wrap);
  }
  return wrap;
}

function ensureSearchInput(){
  // IDs محتملة حسب تصميمك
  let inp = pickElByIds(["search","searchInput","q","query","nameSearch"]);
  if(inp) return inp;

  // جرّب placeholder عربي
  inp = pickFirstSelector([
    'input[placeholder*="ابحث"]',
    'input[type="search"]'
  ]);
  return inp;
}

// رسم العناصر
function renderCatalog(items){
  const list = ensureListContainer();
  if(!list) return;

  list.innerHTML = "";

  if(!items || !items.length){
    const empty = document.createElement("div");
    empty.textContent = "لا توجد عناصر مطابقة.";
    empty.style.textAlign = "center";
    empty.style.opacity = "0.8";
    empty.style.padding = "16px";
    list.appendChild(empty);
    return;
  }

  // بطاقة بسيطة لكل عنصر
  items.forEach(it=>{
    const name  = normalizeStr(it?.name);
    const price = it?.price;
    const unit  = normalizeStr(it?.unit);
    const notes = normalizeStr(it?.notes);

    if(!name) return;

    const row = document.createElement("div");
    row.className = "catalog-item";
    row.style.border = "1px solid rgba(0,0,0,0.08)";
    row.style.borderRadius = "12px";
    row.style.padding = "12px";
    row.style.margin = "8px 0";
    row.style.background = "#fff";
    row.style.cursor = "pointer";

    const t = document.createElement("div");
    t.textContent = name;
    t.style.fontWeight = "700";
    t.style.marginBottom = "6px";

    const meta = document.createElement("div");
    meta.style.opacity = "0.85";
    meta.style.fontSize = "14px";
    meta.textContent = `السعر: ${price} ${unit ? "(" + unit + ")" : ""}`;

    row.appendChild(t);
    row.appendChild(meta);

    if(notes){
      const n = document.createElement("div");
      n.style.marginTop = "6px";
      n.style.opacity = "0.75";
      n.style.fontSize = "13px";
      n.textContent = notes;
      row.appendChild(n);
    }

    // عند الضغط: افتح الحاسبة ومرر السعر
    row.addEventListener("click", ()=>{
      try{
        const u = new URL("index.html", window.location.href);
        u.searchParams.set("price", String(price ?? ""));
        // يمكنك لاحقًا إضافة qty من الواجهة: u.searchParams.set("qty", "1");
        window.location.href = u.toString();
      }catch(e){}
    });

    list.appendChild(row);
  });
}

// تشغيل صفحة الأسعار إذا كانت موجودة
document.addEventListener("DOMContentLoaded", async ()=>{
  // إذا الصفحة ليست prices.html ولا تحتوي عناصر الأسعار، لا تعمل شيء
  const isPricesPage =
    /prices\.html$/i.test(location.pathname) ||
    document.getElementById("ownerPin") || // موجود في صفحة الأسعار عندك
    ensureSearchInput();

  if(!isPricesPage) return;

  try{
    const base = await loadBaseCatalog();
    const local = readLocalPrices();
    const merged = mergeCatalog(base, local);

    // خزّن في نافذة عامة إن احتجت في HTML
    window.PRICE_CATALOG = merged;

    renderCatalog(merged);

    // البحث
    const search = ensureSearchInput();
    if(search){
      const handler = ()=>{
        const q = normalizeStr(search.value).toLowerCase();
        const filtered = !q
          ? merged
          : merged.filter(x => normalizeStr(x?.name).toLowerCase().includes(q));
        renderCatalog(filtered);
      };
      search.addEventListener("input", handler);
    }
  }catch(e){
    // لو فشل التحميل لأي سبب، اعرض رسالة واضحة
    const list = ensureListContainer();
    if(list){
      list.innerHTML = "";
      const msg = document.createElement("div");
      msg.textContent = "تعذر تحميل قائمة الأسعار. تأكد من وجود الملف assets/prices_catalog.json";
      msg.style.textAlign = "center";
      msg.style.opacity = "0.85";
      msg.style.padding = "16px";
      list.appendChild(msg);
    }
    console.error(e);
  }
});
