// ===============================
// main.js — Bassam Customs Pro
// ===============================

// تسجيل Service Worker (PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
}

// ===============================
// القسم 1: الحاسبة الأساسية
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
    // ⚙️ تبقى المعادلة تُحدّث داخليًا
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
// القسم 2: حماية المالك (PIN) + إظهار/إخفاء المعادلة
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

// تحديث واجهة المالك
function applyOwnerUi(){
  // عناصر خاصة بقائمة الأسعار (إن وُجدت)
  const s = document.getElementById("ownerState");
  if(s) s.textContent = "الحالة: " + (isOwner() ? "مالك (تحرير مفعّل)" : "قراءة فقط");
  const ex = document.getElementById("exportBtn");
  const im = document.getElementById("importBtn");
  if(ex) ex.style.display = isOwner() ? "" : "none";
  if(im) im.style.display = isOwner() ? "" : "none";

  // ⭐ إظهار/إخفاء المعادلة في صفحة الحاسبة
  const formulaEl = document.getElementById("formula");
  if (formulaEl) {
    formulaEl.style.display = isOwner() ? "" : "none";
    formulaEl.setAttribute("aria-hidden", isOwner() ? "false" : "true");
  }
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
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
      alert("هذا الإجراء للمالك فقط");
      return false;
    }
  }, true);

  // حارس قوي لاستيراد JSON
  im?.addEventListener("click",(e)=>{
    if(!isOwner()){
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
      alert("هذا الإجراء للمالك فقط");
      return false;
    } else {
      file?.click();
    }
  }, true);

  // تأمين عنصر الملف نفسه
  file?.addEventListener("click",(e)=>{
    if(!isOwner()){
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
      alert("هذا الإجراء للمالك فقط");
      return false;
    }
  }, true);
  file?.addEventListener("change",(e)=>{
    if(!isOwner()){
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
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
