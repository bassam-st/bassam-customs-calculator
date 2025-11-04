// ==========================
// main.js — بسام مساعدك الجمركي (PRO)
// ==========================
// ==========================
// main.js — بسام مساعدك الجمركي (PRO)
// ==========================
// 1) Service Worker (زر التثبيت PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

let deferredPrompt;
const installBtn = document.getElementById('installBtn');
if (installBtn) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
  });

  installBtn.addEventListener('click', async () => {
    installBtn.style.display = 'none';
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
}

// 2) ثوابت عامّة
const ADMIN_PIN   = "bassam1234";
const PRESETS_KEY = "customQuickPresetsV2";

// خريطة تحويل نسبة الفئة إلى "معامل الاحتساب" المستخدم في الحاسبة
// عدّل الأرقام هنا فقط إن أردت تغيير المعاملات.
const RATE_MAP = {
  "5":  0.2075,  // 5%
  "10": 0.2506   // 10%
};

// قفل الفئة إن جاءت من "قائمة الأسعار"
let lockRateFromPrice = false;

// 3) حالة المالك + عناصر DOM
let isOwner = false;

const pin        = document.getElementById('pin');
const unlock     = document.getElementById('unlock');
const lockBtn    = document.getElementById('lock');
const stateEl    = document.getElementById('state') || document.getElementById('ownerState') || document.getElementById('stateText');
const adminForm  = document.getElementById('adminForm');

const pName = document.getElementById('pName');
const pVal  = document.getElementById('pVal');
const pUnit = document.getElementById('pUnit');
const presetsEl = document.getElementById('presets');
const addPresetBtn = document.getElementById('addPreset');
const clearPresetsBtn = document.getElementById('clearPresets');

const usd     = document.getElementById('usd');        // قيمة السلعة الإجمالية (USD)
const out     = document.getElementById('out');        // نتيجة الرسوم
const formula = document.getElementById('formula');    // الصيغة النصية
const rateRadios = Array.from(document.querySelectorAll('input[name="rate"]')); // قيمها يجب أن تكون = المعامل (0.2075/0.2506)
const pills   = document.querySelectorAll('.pill');

// (حقول اختيارية إن وُجدت، لتعبئة تلقائية قادمة من قائمة الأسعار)
const itemName  = document.getElementById('itemName');   // اسم السلعة
const unitInput = document.getElementById('unitInput');  // الوحدة
const unitPrice = document.getElementById('unitPrice');  // السعر للوحدة (USD)
const qtyInput  = document.getElementById('qty');        // العدد الكلي

const enFmt = new Intl.NumberFormat('en-US');

// 4) فتح/قفل وضع المالك
if (unlock) {
  unlock.addEventListener('click', () => {
    if (pin && pin.value === ADMIN_PIN) {
      isOwner = true;
      updateOwnerUI();
      alert('✅ تم فتح وضع المالك');
    } else {
      alert('❌ رمز غير صحيح');
    }
  });
}

if (lockBtn) {
  lockBtn.addEventListener('click', () => {
    isOwner = false;
    updateOwnerUI();
  });
}

// 5) واجهة المالك
function updateOwnerUI() {
  if (stateEl) stateEl.textContent = 'الحالة: ' + (isOwner ? 'مالك (تحرير مفعّل)' : 'قراءة فقط');
  if (adminForm) adminForm.style.display = isOwner ? '' : 'none';
  renderPresets();

  // إن كانت الفئة مقفولة قادمة من قائمة الأسعار: اسمح بتعديلها للمالك فقط
  rateRadios.forEach(r => r.disabled = lockRateFromPrice && !isOwner);
}

// 6) إدارة الأسعار المختصرة (Presets) — (اختياري لديك)
function loadPresets() {
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY)) || []; }
  catch { return []; }
}
function savePresets(arr) { localStorage.setItem(PRESETS_KEY, JSON.stringify(arr)); }

function renderPresets() {
  if (!presetsEl) return;
  const arr = loadPresets();
  if (!arr.length) { presetsEl.innerHTML = ''; return; }

  presetsEl.innerHTML = arr.map(x => (
    `<span class="chip ${isOwner ? 'admin' : ''}" onclick="fillValue(${x.value})">
       ${x.name} (${x.unit}) – ${x.value}$
       ${isOwner ? `<span class='x' onclick="event.stopPropagation(); delPreset('${x.name}')">×</span>` : ''}
     </span>`
  )).join('');
}

window.fillValue = v => {
  if (usd) {
    usd.value = v;
    calc();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
};

window.delPreset = name => {
  if (!isOwner) return;
  savePresets(loadPresets().filter(x => x.name !== name));
  renderPresets();
};

if (addPresetBtn) {
  addPresetBtn.addEventListener('click', () => {
    if (!isOwner) return alert('هذا الإجراء للمالك فقط');
    const name = (pName?.value || '').trim();
    const val  = parseFloat(pVal?.value || 0);
    const unit = pUnit?.value || '';
    if (!name || !val) return alert('أكمل البيانات أولاً');

    const arr = loadPresets();
    const i = arr.findIndex(x => x.name === name);
    if (i >= 0) arr[i] = { name, value: val, unit };
    else arr.push({ name, value: val, unit });

    savePresets(arr);
    if (pName) pName.value = '';
    if (pVal)  pVal.value  = '';
    renderPresets();
  });
}

if (clearPresetsBtn) {
  clearPresetsBtn.addEventListener('click', () => {
    if (!isOwner) return alert('للمالك فقط');
    if (confirm('هل تريد حذف جميع الأسعار؟')) {
      savePresets([]); renderPresets();
    }
  });
}

// 7) الحساب الجمركي
function getRate() {
  const r = rateRadios.find(x => x.checked);
  return r ? parseFloat(r.value) : RATE_MAP["5"]; // افتراضيًا 5% إن لم يوجد
}

if (usd) usd.addEventListener('input', calc);
rateRadios.forEach((r, i) => {
  r.addEventListener('change', () => {
    pills.forEach(p => p.classList.remove('active'));
    if (pills[i]) pills[i].classList.add('active');
    calc();
  });
});

function calc() {
  if (!usd || !out || !formula) return;
  const v    = parseFloat(usd.value || 0);
  const rate = getRate();
  const result = v * 750 * rate;
  out.textContent = enFmt.format(Math.round(result));
  formula.textContent = `${enFmt.format(v)} × 750 × ${rate} = ${enFmt.format(Math.round(result))}`;
}

// 8) قفل الفئة حسب نسبة ممرّرة من "قائمة الأسعار"
function setRateByPercent(percentStr) {
  const p = String(percentStr || '').replace('%', '').trim(); // "5" أو "10"
  const factor = RATE_MAP[p];
  if (!factor) return;

  // فعّل الراديو الموافق للمعامل
  rateRadios.forEach(r => { r.checked = (r.value === String(factor)); });
  pills.forEach(pill => pill.classList.remove('active'));
  const idx = rateRadios.findIndex(r => r.checked);
  if (idx >= 0 && pills[idx]) pills[idx].classList.add('active');

  // اقفل التعديل لغير المالك
  lockRateFromPrice = true;
  rateRadios.forEach(r => r.disabled = !isOwner);
}

// 9) تعبئة من URL عند القدوم من "قائمة الأسعار"
function initFromURL() {
  const p = new URLSearchParams(location.search);
  if (!p.has('name') && !p.has('price')) return;

  const name = p.get('name') || '';
  const unit = p.get('unit') || '';
  const price = parseFloat(p.get('price') || '0') || 0;
  const qty   = parseFloat(p.get('qty') || '1') || 1;
  const ratePercent = p.get('rate') || ''; // "5" أو "10"

  if (itemName)  itemName.value  = name;
  if (unitInput) unitInput.value = unit;
  if (unitPrice) unitPrice.value = price || '';
  if (qtyInput)  qtyInput.value  = qty;

  // احسب الإجمالي تلقائيًا (سعر × عدد)
  if (usd && price && qty) usd.value = (price * qty).toString();

  // عيّن الفئة حسب الصنف وقفلها
  if (ratePercent) setRateByPercent(ratePercent);

  // احسب مباشرة
  calc();

  // إشارة مرئية صغيرة أن القيم جاءت تلقائياً
  try {
    if (usd && usd.parentElement) {
      const note = document.createElement('div');
      note.style.cssText = 'margin:8px 0;color:#2563eb;font-weight:700';
      note.textContent = '↪ تم جلب السعر تلقائيًا من قائمة الأسعار';
      usd.parentElement.insertBefore(note, usd);
    }
  } catch {}
}

// 10) مزامنة الإجمالي إذا تغيّر سعر الوحدة أو العدد
function syncTotalUSD() {
  if (!unitPrice || !qtyInput || !usd) return;
  const pu = parseFloat(unitPrice.value || '0') || 0;
  const q  = parseFloat(qtyInput.value  || '0') || 0;
  if (pu && q) usd.value = (pu * q).toString();
  calc();
}
if (unitPrice) unitPrice.addEventListener('input', syncTotalUSD);
if (qtyInput)  qtyInput.addEventListener('input',  syncTotalUSD);

// 11) نسخ / واتساب
function copyResult() {
  if (!out) return;
  navigator.clipboard.writeText(`الرسوم الجمركية: ${out.textContent} ريال يمني`)
    .then(() => alert('✔ تم النسخ'));
}
function shareWhatsApp() {
  if (!out) return;
  open(`https://wa.me/?text=${encodeURIComponent('الرسوم الجمركية: ' + out.textContent + ' ريال يمني')}`, '_blank');
}
window.copyResult   = copyResult;
window.shareWhatsApp = shareWhatsApp;

// 12) Boot
renderPresets();
updateOwnerUI();
initFromURL();   // << مهم: القراءة من URL وتعيين الفئة تلقائياً
calc();
