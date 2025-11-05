// ===============================
// main.js — Bassam Customs Pro
// ===============================

// ---------- PWA ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
}
let deferredPrompt=null;
const installBtn=document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',(e)=>{
  e.preventDefault(); deferredPrompt=e; if(installBtn) installBtn.style.display='block';
});
if(installBtn){
  installBtn.addEventListener('click', async ()=>{
    if(!deferredPrompt) return; installBtn.style.display='none';
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null;
  });
}

// ---------- Admin ----------
const ADMIN_PIN="bassam1234";
let __isOwner=false;
const pin=document.getElementById('pin');
const unlock=document.getElementById('unlock');
const lockBtn=document.getElementById('lock');
const state=document.getElementById('state');

function updateOwnerUI(){
  if(state) state.textContent='الحالة: '+(__isOwner?'مالك (تحرير مفعّل)':'قراءة فقط');
  // تمكين/تعطيل عناصر الفئة
  const radios = Array.from(document.querySelectorAll('input[name="rate"]'));
  const rc = document.getElementById('rateCustom');
  radios.forEach(r=> r.disabled=!__isOwner && r.value!=='custom'); // للمستخدم: مقفول
  if(rc) rc.disabled = (!__isOwner || !document.querySelector('input[name="rate"][value="custom"]')?.checked);
}
if(unlock){ unlock.addEventListener('click',()=>{ if(pin && pin.value===ADMIN_PIN){ __isOwner=true; updateOwnerUI(); alert('✅ تم فتح وضع المالك'); } else alert('❌ رمز غير صحيح'); }); }
if(lockBtn){ lockBtn.addEventListener('click',()=>{ __isOwner=false; updateOwnerUI(); }); }

// ---------- توحيد الفئة ----------
window.normalizeRate = function(input){
  if(input==null) return null;
  const s = String(input).trim().replace('٪','%');
  if(!s) return null;
  // حالات شائعة:
  // "5", "5%", "٠٥%", "0.05", 0.05, "10", "10%", "0.1", 0.1
  const pctMatch = s.match(/(\d+(\.\d+)?)/);
  if(pctMatch){
    const n = parseFloat(pctMatch[1]);
    if(n>1) return (n/100);   // 5 => 0.05
    return n;                 // 0.05
  }
  return null;
};
window.prettyRate = function(input){
  const n = window.normalizeRate(input);
  if(n==null) return '';
  return (Math.round(n*100)) + '%';
};

// تطبيق الفئة على واجهة الآلة الحاسبة
window.applyRate = function(decimal, lockForUser){
  const radios = Array.from(document.querySelectorAll('input[name="rate"]'));
  const rc = document.getElementById('rateCustom');
  let matched=false;

  if(radios.length){
    for(const r of radios){
      const v = (r.value==='custom')? null : parseFloat(r.value);
      if(v!=null && Math.abs(v - decimal) < 1e-6){
        r.checked = true; matched=true;
      }
    }
    if(!matched){
      const customRadio = radios.find(r=>r.value==='custom');
      if(customRadio){
        customRadio.checked=true;
        if(rc){ rc.value=String(decimal); rc.disabled = false; }
      }
    }
  }
  // اقفال للمستخدم إن طُلب
  if(lockForUser){
    __isOwner=false;
    updateOwnerUI();
  } else {
    updateOwnerUI();
  }
};

// ---------- الحاسبة ----------
const LS={usd:'bc_pro_usd',rate:'bc_pro_rate',fx:'bc_pro_fx'};
const enFmt = new Intl.NumberFormat('en-US');

function formatYER(n){
  try { return new Intl.NumberFormat('ar-YE',{maximumFractionDigits:0}).format(Math.round(n)); }
  catch { return Math.round(n).toLocaleString(); }
}

window.calc = function(){
  const usd = parseFloat(document.getElementById('usd')?.value || '0');
  const fx  = parseFloat(document.getElementById('fxInput')?.value || '750');

  // اجلب الفئة من الراديو/المخصص
  let rate=0.10; // افتراضي
  const r = Array.from(document.querySelectorAll('input[name="rate"]')).find(x=>x.checked);
  if(r){
    if(r.value==='custom'){
      const rc = parseFloat(document.getElementById('rateCustom')?.value || '0');
      if(isFinite(rc) && rc>0) rate=rc; 
    }else{
      rate = parseFloat(r.value||'0.10');
    }
  }

  // معامل ثابت 0.2075 (أو استبدله إذا لزم)
  const factor = 0.2075;
  const duty = (usd||0) * factor * (fx||0) * (rate||0);

  const out = document.getElementById('out');
  const formula = document.getElementById('formula');
  if(out) out.textContent = formatYER(duty);
  if(formula) formula.textContent = `${enFmt.format(Math.round(duty))} = ${factor} × ${enFmt.format(fx||0)} × ${enFmt.format(usd||0)} × ${rate}`;

  // حفظات بسيطة
  localStorage.setItem(LS.usd, String(usd||''));
  localStorage.setItem(LS.rate, String(rate));
  localStorage.setItem(LS.fx,  String(fx));
};

// تهيئة عامة
(function init(){
  // استعادة بعض القيم
  const usd = document.getElementById('usd');
  const fx  = document.getElementById('fxInput');
  if(usd && localStorage.getItem(LS.usd)!=null) usd.value = localStorage.getItem(LS.usd);
  if(fx  && localStorage.getItem(LS.fx)!=null)  fx.value  = localStorage.getItem(LS.fx);

  // ربط الأحداث
  usd?.addEventListener('input', window.calc);
  fx?.addEventListener('input', window.calc);
  document.querySelectorAll('input[name="rate"]').forEach(r=>{
    r.addEventListener('change', ()=>{
      const rc = document.getElementById('rateCustom');
      rc && (rc.disabled = (r.value!=='custom'));
      window.calc();
    });
  });
  document.getElementById('rateCustom')?.addEventListener('input', window.calc);

  updateOwnerUI();
  window.calc();
})();

// نسخ/واتساب
window.copyResult = function(){
  const out=document.getElementById('out')?.textContent||'';
  const f  =document.getElementById('formula')?.textContent||'';
  navigator.clipboard.writeText(`الرسوم الجمركية: ${out} ريال يمني\n${f}`).then(()=>alert('✔ تم النسخ'));
};
window.shareWhatsApp = function(){
  const out=document.getElementById('out')?.textContent||'';
  const f  =document.getElementById('formula')?.textContent||'';
  open('https://wa.me/?text='+encodeURIComponent(`الرسوم الجمركية: ${out} ريال يمني\n${f}`),'_blank');
};
