// ===============================
// main.js — Bassam Customs Pro
// ===============================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
}

// --- الحاسبة الأساسية (نفس منطق index.html) ---
(function(){
  const usdInput   = document.getElementById('usd');
  const outEl      = document.getElementById('out');
  const formulaEl  = document.getElementById('formula');
  const rateRadios = Array.from(document.querySelectorAll('input[name="rate"]'));
  const pills = [document.getElementById('pill5'), document.getElementById('pill10')];
  const enFmt = new Intl.NumberFormat('en-US');

  function getRate(){
    const r = rateRadios.find(x=>x.checked);
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

  // ✅ التقاط بارامترات من prices.html
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
