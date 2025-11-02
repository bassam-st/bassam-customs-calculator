// main.js — ملف التشغيل العام لتطبيق "بسام مساعدك الجمركي"

// 🟢 تسجيل Service Worker (للتثبيت كـ PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// 🟢 تفعيل زر التثبيت
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
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

// 🟢 تعريف المتغيرات العامة
const ADMIN_PIN = "bassam1234";
const PRESETS_KEY = 'customQuickPresetsV2';

// 🟢 الحالة الحالية
let isOwner = false;

// 🟡 عناصر DOM
const pin = document.getElementById('pin');
const unlock = document.getElementById('unlock');
const lock = document.getElementById('lock');
const state = document.getElementById('state');
const adminForm = document.getElementById('adminForm');
const pName = document.getElementById('pName');
const pVal  = document.getElementById('pVal');
const pUnit = document.getElementById('pUnit');
const presetsEl = document.getElementById('presets');
const addPresetBtn = document.getElementById('addPreset');
const clearPresetsBtn = document.getElementById('clearPresets');
const usd = document.getElementById('usd');
const out = document.getElementById('out');
const formula = document.getElementById('formula');
const rateRadios = Array.from(document.querySelectorAll('input[name="rate"]'));
const pills = document.querySelectorAll('.pill');
const enFmt = new Intl.NumberFormat('en-US');

// 🟢 فتح / قفل وضع المالك
unlock.addEventListener('click', () => {
  if (pin.value === ADMIN_PIN) {
    isOwner = true;
    updateOwnerUI();
    alert('✅ تم فتح وضع المالك');
  } else alert('❌ رمز غير صحيح');
});

lock.addEventListener('click', () => {
  isOwner = false;
  updateOwnerUI();
});

// 🟢 تحديث واجهة المالك
function updateOwnerUI() {
  state.textContent = 'الحالة: ' + (isOwner ? 'مالك (تحرير مفعّل)' : 'قراءة فقط');
  adminForm.style.display = isOwner ? '' : 'none';
  renderPresets();
}

// 🟢 تحميل وحفظ الأسعار
function loadPresets() {
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY)) || []; }
  catch { return []; }
}
function savePresets(arr) { localStorage.setItem(PRESETS_KEY, JSON.stringify(arr)); }

// 🟢 إضافة سلعة
addPresetBtn.addEventListener('click', () => {
  if (!isOwner) return alert('هذا الإجراء للمالك فقط');
  const name = (pName.value || '').trim();
  const val = parseFloat(pVal.value || 0);
  const unit = pUnit.value;
  if (!name || !val) return alert('أكمل البيانات أولاً');

  const arr = loadPresets();
  const i = arr.findIndex(x => x.name === name);
  if (i >= 0) arr[i] = { name, value: val, unit };
  else arr.push({ name, value: val, unit });

  savePresets(arr);
  pName.value = ''; pVal.value = '';
  renderPresets();
});

// 🟢 حذف الكل
clearPresetsBtn.addEventListener('click', () => {
  if (!isOwner) return alert('للمالك فقط');
  if (confirm('هل تريد حذف جميع الأسعار؟')) {
    savePresets([]); renderPresets();
  }
});

// 🟢 عرض الأسعار المختصرة
function renderPresets() {
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
  usd.value = v;
  calc();
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};

window.delPreset = name => {
  if (isOwner) {
    savePresets(loadPresets().filter(x => x.name !== name));
    renderPresets();
  }
};

// 🟢 حساب الرسوم الجمركية
function getRate() {
  const r = rateRadios.find(x => x.checked);
  return r ? parseFloat(r.value) : 0.2075;
}

usd.addEventListener('input', calc);
rateRadios.forEach((r, i) => {
  r.addEventListener('change', () => {
    pills.forEach(p => p.classList.remove('active'));
    pills[i].classList.add('active');
    calc();
  });
});

function calc() {
  const v = parseFloat(usd.value || 0);
  const rate = getRate();
  const result = v * 750 * rate;
  out.textContent = enFmt.format(Math.round(result));
  formula.textContent = `${enFmt.format(v)} × 750 × ${rate} = ${enFmt.format(Math.round(result))}`;
}

// 🟢 نسخ / واتساب
function copyResult() {
  navigator.clipboard.writeText(`الرسوم الجمركية: ${out.textContent} ريال يمني`)
    .then(() => alert('✔ تم النسخ'));
}

function shareWhatsApp() {
  open(`https://wa.me/?text=${encodeURIComponent('الرسوم الجمركية: ' + out.textContent + ' ريال يمني')}`, '_blank');
}

// 🟢 التهيئة
renderPresets();
updateOwnerUI();
calc();
