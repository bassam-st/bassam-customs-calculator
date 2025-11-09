# app.py
from __future__ import annotations
import os, base64, json, requests
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Bassam Customs Calculator")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=False,
    allow_methods=["*"], allow_headers=["*"],
)

# ===== متغيرات البيئة =====
GITHUB_TOKEN   = os.getenv("GITHUB_TOKEN")         # مطلوب
REPO           = os.getenv("REPO", "bassam-st/bassam-customs-calculator")
FILE_PATH      = os.getenv("FILE_PATH", "assets/prices_catalog.json")
ADMIN_PIN      = os.getenv("ADMIN_PIN", "bassam1234")
BRANCH         = os.getenv("BRANCH", "main")
COMMITTER_NAME = os.getenv("COMMITTER_NAME", "Bassam Alshtimy")
COMMITTER_EMAIL= os.getenv("COMMITTER_EMAIL", "bassam.7111111@gmail.com")

if not GITHUB_TOKEN:
    print("⚠️  GITHUB_TOKEN غير مضبوط في بيئة Render")

# ===== نماذج الإدخال =====
class UpdateBody(BaseModel):
    pin: str
    items: List[Dict[str, Any]]
    message: Optional[str] = None  # رسالة الكومِت

# ===== دوال مساعدة =====
def _gh_headers():
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

def _get_current_sha() -> Optional[str]:
    url = f"https://api.github.com/repos/{REPO}/contents/{FILE_PATH}?ref={BRANCH}"
    r = requests.get(url, headers=_gh_headers(), timeout=30)
    if r.status_code == 200:
        return r.json().get("sha")
    if r.status_code == 404:
        return None  # ملف جديد
    raise HTTPException(502, f"GitHub get error: {r.status_code} - {r.text}")

def _put_contents(b64: str, sha: Optional[str], message: str):
    url = f"https://api.github.com/repos/{REPO}/contents/{FILE_PATH}"
    payload = {
        "message": message,
        "content": b64,
        "branch": BRANCH,
        "committer": {"name": COMMITTER_NAME, "email": COMMITTER_EMAIL},
    }
    if sha:
        payload["sha"] = sha
    r = requests.put(url, headers=_gh_headers(), json=payload, timeout=30)
    if r.status_code not in (200, 201):
        raise HTTPException(502, f"GitHub put error: {r.status_code} - {r.text}")
    return r.json()

# ===== واجهات API =====
@app.get("/health")
def health():
    return {"ok": True, "service": "bassam-customs-calculator"}

@app.post("/api/update")
def api_update(body: UpdateBody):
    if body.pin != ADMIN_PIN:
        raise HTTPException(401, "رمز المالك غير صحيح")

    # تطبيع/تنظيف خفيف للبيانات
    def norm(rec: Dict[str, Any]) -> Dict[str, Any]:
        name  = str(rec.get("name") or rec.get("الاسم") or "").strip()
        price = rec.get("price", rec.get("السعر"))
        unit  = (rec.get("unit")  or rec.get("الوحدة") or "pcs").strip()
        notes = str(rec.get("notes") or rec.get("ملاحظات") or "").strip()
        return {"name": name, "price": float(price) if price is not None else None, "unit": unit, "notes": notes}

    items = [norm(x) for x in body.items if (x.get("name") or x.get("الاسم"))]
    content_bytes = json.dumps(items, ensure_ascii=False, indent=2).encode("utf-8")
    b64 = base64.b64encode(content_bytes).decode("ascii")

    sha = _get_current_sha()
    message = body.message or "تحديث قائمة الأسعار من داخل تطبيق بسام"
    res = _put_contents(b64, sha, message)

    return {"ok": True, "committed": True, "path": FILE_PATH, "sha": res.get("content", {}).get("sha")}

# ===== تقديم الملفات الساكنة (الواجهة) =====
# يفترض أن index.html, prices.html, hs.html, assets/... كلها داخل الجذر
app.mount("/", StaticFiles(directory=".", html=True), name="static")
