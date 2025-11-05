// ===============================
// main.js — Bassam Customs Pro
// ===============================

// ---------- PWA: SW + Install Button ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
}

let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.style.display = 'block';
});
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    installBtn.style.display = 'none';
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
}

// ---------- Admin / Presets ----------
const ADMIN_PIN = "bassam1234";
const PRESETS_KEY = 'customQuickPresetsV2';

let isOwner = false;

// DOM (وجودها اختياري؛ لو ناقص عنصر الكود يتخطاه)
const el = (id) => document.getElementById(id);
const pin = el('pin');
const unlock = el('unlock');
const lockBtn = el('lock');
const state = el('state');
const adminForm = el('adminForm');
const pName = el('pName');
const pVal  = el('pVal');
const pUnit = el('pUnit');
const addPresetBtn = el('addPreset');
const clearPresetsBtn = el('clearPresets');
const presetsEl = el('presets');

// فتح / قفل وضع المالك
if (unlock) {
  unlock.addEventListener('click', () => {
    if (pin && pin.value === ADMIN_PIN) {
      isOwner = true; updateOwnerUI(); alert('✅ تم فتح وضع المالك');
    } else {
      alert('❌ رمز غير صحيح');
    }
  });
}
if (lockBtn) {
  lockBtn.addEventListener('click', () => { isOwner = false; updateOwnerUI(); });
}

function updateOwnerUI(){
  if (state) state.textContent = 'الحالة: ' + (isOwner ? 'مالك (تحرير مفعّل)' : 'قراءة فقط');
  if (adminForm) adminForm.style.display = isOwner ? '' : 'none';
  renderPresets();
}

function loadPresets(){
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY)) || []; }
  catch { return []; }
}
function savePresets(arr){
  localStorage.setItem(PRESETS_KEY, JSON.stringify(arr));
}

if (addPresetBtn) {
  addPresetBtn.addEventListener('click', () => {
    if (!isOwner) return alert('هذا الإجراء للمالك فقط');
    const name = (pName?.value || '').trim();
    const val = parseFloat(pVal?.value || 0);
    const unit = pUnit?.value || 'pcs';
    if (!name || !val) return alert('أكمل البيانات أولاً');

    const arr = loadPresets();
    const i = arr.findIndex(x => x.name === name);
    if (i >= 0) arr[i] = { name, value: val, unit };
    else arr.push({ name, value: val, unit });

    savePresets(arr);
    if (pName) pName.value = '';
    if (pVal)  pVal.value = '';
    renderPresets();
  });
}

if (clearPresetsBtn) {
  clearPresetsBtn.addEventListener('click', () => {
    if (!isOwner) return alert('للمالك فقط');
    if (confirm('سيتم حذف جميع الأسعار المختصرة. متابعة؟')) {
      savePresets([]); renderPresets();
    }
  });
}

function unitLabel(u){
  // للعرض فقط
  switch (u) {
    case 'ton': return 'للطن';
    case 'kg':  return 'للكيلو';
    case 'dz':  return 'للدُزْن';
    case 'pcs': return 'للحبة';
    case 'ltr': return 'للتر';
    case 'Ah':  return 'Ah/أمبير';
    case 'W':   return 'W/واط';
    default:    return u || '';
  }
}

function renderPresets(){
  if (!presetsEl) return;
  const arr = loadPresets();
  if (!arr.length) { presetsEl.innerHTML = ''; return; }
  presetsEl.innerHTML = arr.map(x => (
    `<span class="chip ${isOwner ? 'admin' : ''}" onclick="fillValue(${x.value})">
       ${x.name} <small>(${unitLabel(x.unit)})</small> – ${x.value}$
       ${isOwner ? `<span class="x" onclick="event.stopPropagation(); delPreset(${JSON.stringify(x.name)})">×</span>` : ''}
     </span>`
  )).join('');
}

// واجهات عامة لزر الحذف والملء من المختصرات
window.fillValue = (v) => {
  const usd = el('usd');
  if (usd) usd.value = v;
  calc();
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};
window.delPreset = (name) => {
  if (!isOwner) return;
  savePresets(loadPresets().filter(x => x.name !== name));
  renderPresets();
};

// ---------- Calculator Pro ----------
const enFmt = new Intl.NumberFormat('en-US');

const usdInput   = el('usd');          // قيمة بالدولار
const outEl      = el('out');          // النتيجة
const formulaEl  = el('formula');      // المعادلة المعروضة

// فئة جمركية (5%/10%/مخصص)
const rateRadios = Array.from(document.querySelectorAll('input[name="rate"]'));
const pills = Array.from(document.querySelectorAll('.pill'));
const rateCustom = el('rateCustom');   // إن وجد

// سعر الصرف — إن وجد حقل؛ وإلا نستخدم 750
const fxInput = el('fxInput');

// المعامل — إن وجدت قائمة/حقل مخصص
const factorSelect = el('factorSelect');
const factorCustom = el('factorCustom');

// مفاتيح التخزين للحالة
const LS = {
  usd: 'bc_pro_usd',
  rate: 'bc_pro_rate',
  rateCustom: 'bc_pro_rate_c',
  fx: 'bc_pro_fx',
  factor: 'bc_pro_factor',
  factorCustom: 'bc_pro_factor_c'
};

// افتراضات
const DEFAULTS = {
  fx: 750,
  rate: 0.10,      // 10%
  factor: 0.2506
};

function getRate(){
  // إن كان لديك راديو: 5%/10%/custom
  const r = rateRadios.find(x => x.checked);
  if (!r) {
    // لا توجد راديوهات؟ استخدم 10% افتراضياً أو المحفوظ
    const saved = parseFloat(localStorage.getItem(LS.rate) || '0');
    return isFinite(saved) && saved > 0 ? saved : DEFAULTS.rate;
  }
  if (r.value === 'custom') {
    const v = parseFloat(rateCustom?.value || '0');
    return isFinite(v) && v > 0 ? v : 0;
  }
  return parseFloat(r.value || '0.10');
}

function getFx(){
  const v = parseFloat(fxInput?.value || '0');
  if (isFinite(v) && v > 0) return v;
  // لو لا يوجد حقل، استخدم المحفوظ أو الافتراضي
  const saved = parseFloat(localStorage.getItem(LS.fx) || '0');
  return (isFinite(saved) && saved > 0) ? saved : DEFAULTS.fx;
}

function getFactor(){
  if (factorSelect) {
    if (factorSelect.value === 'custom') {
      const v = parseFloat(factorCustom?.value || '0');
      return isFinite(v) && v > 0 ? v : 0;
    }
    return parseFloat(factorSelect.value || String(DEFAULTS.factor));
  }
  // لا توجد عناصر معامل: استخدم المحفوظ أو الافتراضي
  const saved = parseFloat(localStorage.getItem(LS.factor) || '0');
  return (isFinite(saved) && saved > 0) ? saved : DEFAULTS.factor;
}

function formatYER(n){
  try { return new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 0 }).format(Math.round(n)); }
  catch { return Math.round(n).toLocaleString(); }
}

function calc(){
  const usdVal = parseFloat(usdInput?.value || '0');
  const rate   = getRate();
  const fx     = getFx();
  const factor = getFactor();

  const duty = usdVal * factor * fx * rate;

  if (outEl) outEl.textContent = formatYER(duty);
  if (formulaEl) {
    const f = `${enFmt.format(usdVal||0)} × ${factor||0} × ${enFmt.format(fx||0)} × ${rate||0} = ${enFmt.format(Math.round(duty))}`;
    formulaEl.textContent = f;
  }

  // حفظ الحالة
  localStorage.setItem(LS.usd, String(usdVal || ''));
  localStorage.setItem(LS.rate, String(rate));
  if (fxInput) localStorage.setItem(LS.fx, String(fx));
  if (factorSelect) localStorage.setItem(LS.factor, String(factor));
  if (rateCustom) localStorage.setItem(LS.rateCustom, rateCustom.value || '');
  if (factorCustom) localStorage.setItem(LS.factorCustom, factorCustom.value || '');
}

// ربط أحداث الحاسبة
if (usdInput) usdInput.addEventListener('input', calc);

rateRadios.forEach((r, i) => {
  r.addEventListener('change', () => {
    pills.forEach(p => p.classList.remove('active'));
    if (pills[i]) pills[i].classList.add('active');
    // تفعيل/تعطيل حقل الفئة المخصّصة
    if (rateCustom) rateCustom.disabled = (r.value !== 'custom');
    calc();
  });
});

if (fxInput) fxInput.addEventListener('input', calc);

if (factorSelect) {
  factorSelect.addEventListener('change', () => {
    if (factorCustom) factorCustom.style.display = (factorSelect.value === 'custom') ? 'block' : 'none';
    calc();
  });
}
if (factorCustom) factorCustom.addEventListener('input', calc);
if (rateCustom) rateCustom.addEventListener('input', calc);

// أدوات المشاركة/النسخ (استدعَها من أزرارك في HTML)
function copyResult(){
  const text = `الرسوم الجمركية: ${outEl?.textContent || ''} ريال يمني\nالمعادلة: ${formulaEl?.textContent || ''}`;
  navigator.clipboard.writeText(text).then(()=>alert('✔ تم النسخ'));
}
function shareWhatsApp(){
  const msg = `الرسوم الجمركية: ${outEl?.textContent || ''} ريال يمني\n${formulaEl?.textContent || ''}`;
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}
window.copyResult = copyResult;
window.shareWhatsApp = shareWhatsApp;

// استعادة الحالة عند التحميل
(function restore(){
  if (usdInput) usdInput.value = localStorage.getItem(LS.usd) ?? '';
  if (fxInput)  fxInput.value  = localStorage.getItem(LS.fx)  ?? '750';

  // فئة (لو ما عندك راديو، نتجاهل ونستخدم الحفظ/الافتراضي بالحساب)
  const savedRate = parseFloat(localStorage.getItem(LS.rate) || '0');
  if (rateRadios.length) {
    // حاول مطابقة 0.05 أو 0.10
    const std = rateRadios.find(r => parseFloat(r.value) === savedRate);
    if (std) { std.checked = true; }
    else if (rateCustom) {
      // مخصص
      const rc = localStorage.getItem(LS.rateCustom) || '';
      const customRadio = rateRadios.find(r => r.value === 'custom');
      if (customRadio) customRadio.checked = true;
      rateCustom.value = rc;
      rateCustom.disabled = false;
    } else {
      // افتراضي 10%
      const r10 = rateRadios.find(r => r.value === '0.10');
      if (r10) r10.checked = true;
    }
  }

  // معامل
  const savedFactor = parseFloat(localStorage.getItem(LS.factor) || '0');
  const savedFactorCustom = localStorage.getItem(LS.factorCustom) || '';
  if (factorSelect) {
    if (String(savedFactor) === '0.2506' || String(savedFactor) === '0.205') {
      factorSelect.value = String(savedFactor);
      if (factorCustom) factorCustom.style.display = 'none';
    } else if (savedFactorCustom || (savedFactor && savedFactor !== 0.2506 && savedFactor !== 0.205)) {
      factorSelect.value = 'custom';
      if (factorCustom) {
        factorCustom.style.display = 'block';
        factorCustom.value = savedFactorCustom || String(savedFactor);
      }
    } else {
      factorSelect.value = String(DEFAULTS.factor);
    }
  }

  renderPresets();
  updateOwnerUI();
  calc();
})();
// ========= Patch: التقاط السعر والفئة من رابط "استخدام السعر" =========
(function applyPresetFromQuery(){
  try {
    const q = new URLSearchParams(location.search);
    const price = parseFloat(q.get('price') || q.get('usd') || '0');
    const qty   = parseFloat(q.get('qty') || '1');       // اختياري من القائمة
    const rateP = parseFloat(q.get('rate') || '');       // 5 أو 10 (بالمئة)

    if (price > 0 && usdInput) {
      usdInput.value = String(price * (isFinite(qty) && qty>0 ? qty : 1));
    }

    // ضبط الفئة تلقائياً إن وُجدت (5% أو 10%)
    if (!isNaN(rateP) && rateRadios.length) {
      const val = (rateP === 5 ? '0.05' : rateP === 10 ? '0.10' : null);
      if (val) {
        const r = rateRadios.find(r => r.value === val);
        if (r) {
          r.checked = true;
          // مظهر الأقراص
          const idx = rateRadios.indexOf(r);
          pills.forEach(p => p.classList.remove('active'));
          if (pills[idx]) pills[idx].classList.add('active');
        }
      }
    }

    // نفّذ الحساب مباشرة بعد الملء
    calc();

    // أزل البارامترات من الرابط (شكل أنظف بعد الاستخدام)
    if (location.search) {
      history.replaceState({}, '', location.pathname);
    }
  } catch(e) {
    // تجاهل أي خطأ صامتًا
  }
})();
