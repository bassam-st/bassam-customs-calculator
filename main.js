// ================= main.js — بسام مساعدك الجمركي =================

// تسجيل Service Worker + زر تثبيت PWA
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

// ---------- إعدادات عامة ----------
const ADMIN_PIN   = "bassam1234";     // PIN المالك
const enFmt       = new Intl.NumberFormat('en-US');

// حالة المالك
let isOwner = false;

// عناصر مالك (اختيارية — تجاهل إن لم تكن في الصفحة)
const pin    = document.getElementById('pin');
const unlock = document.getElementById('unlock');
const lock   = document.getElementById('lock');
const state  = document.getElementById('state');

// عناصر الحساب
const itemNameEl  = document.getElementById('itemName');  // للعرض فقط
const unitTxtEl   = document.getElementById('unitTxt');   // للعرض فقط
const unitPriceEl = document.getElementById('unitPrice'); // سعر الوحدة USD
const qtyEl       = document.getElementById('qty');       // العدد الكلي
const usd         = document.getElementById('usd');       // الإجمالي USD
const fxEl        = document.getElementById('fx');        // سعر الصرف (اختياري) default 750
const out         = document.getElementById('out');       // النتيجة بالريال
const formula     = document.getElementById('formula');   // الصيغة النصية

// فئة جمركية (راديو)
const rateRadios  = Array.from(document.querySelectorAll('input[name="rate"]'));
const pills       = document.querySelectorAll('.pill');

// -------- واجهة مالك --------
function updateOwnerUI() {
  if (state) state.textContent = 'الحالة: ' + (isOwner ? 'مالك (تحرير مفعّل)' : 'قراءة فقط');
  // السماح بتغيير الفئة فقط للمالك
  rateRadios.forEach(r => { r.disabled = !isOwner; });
  // أعد الحساب
  calc();
}

// فتح/قفل وضع المالك
if (unlock) unlock.addEventListener('click', () => {
  if (pin && pin.value === ADMIN_PIN) {
    isOwner = true;
    updateOwnerUI();
    alert('✅ تم فتح وضع المالك');
  } else {
    alert('❌ رمز غير صحيح');
  }
});
if (lock) lock.addEventListener('click', () => {
  isOwner = false;
  updateOwnerUI();
});

// -------- قراءة بارامترات من قائمة الأسعار --------
(function autoFillFromCatalog(){
  const p = new URLSearchParams(location.search);
  const name   = p.get('name');
  const unit   = p.get('unit');
  const uPrice = parseFloat(p.get('unitPrice') || '');
  const qInit  = parseFloat(p.get('qty') || '') || 1;
  const rateP  = p.get('rate'); // "5" أو "10"

  if (name && itemNameEl) itemNameEl.value = name;
  if (unit && unitTxtEl)  unitTxtEl.value  = unit;
  if (!isNaN(uPrice) && unitPriceEl) unitPriceEl.value = uPrice;
  if (qtyEl) qtyEl.value = qInit;

  // اختيار الفئة تلقائيًا
  if (rateP) {
    const target = document.querySelector(`input[name="rate"][data-percent="${rateP}"]`);
    if (target) {
      target.checked = true;
      pills.forEach(p => p.classList.remove('active'));
      if (target.closest('.pill')) target.closest('.pill').classList.add('active');
    }
  }

  // الفئة يجب أن تبقى مقفولة للمستخدم — تُفتح فقط عند تفعيل وضع المالك
  rateRadios.forEach(r => { r.disabled = !isOwner; });

  // حساب أولي
  updateTotalFromUnit();
})();

// -------- أحداث الإدخال --------
if (unitPriceEl) unitPriceEl.addEventListener('input', updateTotalFromUnit);
if (qtyEl)       qtyEl.addEventListener('input', updateTotalFromUnit);
if (usd)         usd.addEventListener('input', calc);
rateRadios.forEach((r, i) => {
  r.addEventListener('change', () => {
    pills.forEach(p => p.classList.remove('active'));
    pills[i].classList.add('active');
    calc();
  });
});

// -------- دوال الحساب --------
function getRateCoef() {
  const r = rateRadios.find(x => x.checked);
  // قيم value يجب أن تكون المعامل (مثلاً 0.2075 و 0.2506)
  return r ? parseFloat(r.value) : 0.2075;
}

function getFx() {
  const v = parseFloat(fxEl?.value || '');
  return !isNaN(v) && v > 0 ? v : 750; // افتراضي 750
}

function updateTotalFromUnit() {
  const up = parseFloat(unitPriceEl?.value || '');
  const q  = parseFloat(qtyEl?.value       || '');
  const total = (isNaN(up) ? 0 : up) * (isNaN(q) ? 0 : q);
  if (usd) usd.value = total ? total.toFixed(2) : '';
  calc();
}

function calc() {
  const v = parseFloat(usd?.value || '') || 0;
  const fx = getFx();
  const rate = getRateCoef();
  const result = v * fx * rate;
  if (out) out.textContent = enFmt.format(Math.round(result));
  if (formula) formula.textContent = `${enFmt.format(v)} × ${enFmt.format(fx)} × ${rate} = ${enFmt.format(Math.round(result))}`;
}

// -------- نسخ ومشاركة --------
function copyResult() {
  if (!out) return;
  navigator.clipboard.writeText(`الرسوم الجمركية: ${out.textContent} ريال يمني`)
    .then(() => alert('✔ تم النسخ'));
}
function shareWhatsApp() {
  if (!out) return;
  open(`https://wa.me/?text=${encodeURIComponent('الرسوم الجمركية: ' + out.textContent + ' ريال يمني')}`, '_blank');
}

// تهيئة
updateOwnerUI();
calc();
