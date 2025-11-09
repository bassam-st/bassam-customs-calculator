from __future__ import annotations
import os, base64, json
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

import requests
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware

# ===== إعدادات من متغيرات البيئة (لا تضع القيم هنا) =====
GITHUB_TOKEN    = os.getenv("GITHUB_TOKEN")          # مطلوب
REPO            = os.getenv("REPO", "bassam-st/bassam-customs-calculator")
FILE_PATH       = os.getenv("FILE_PATH", "assets/prices_catalog.json")
ADMIN_PIN       = os.getenv("ADMIN_PIN", "bassam1234")
COMMITTER_NAME  = os.getenv("COMMITTER_NAME", "Bassam Alshtimy")
COMMITTER_EMAIL = os.getenv("COMMITTER_EMAIL", "you@example.com")

if not GITHUB_TOKEN:
    raise RuntimeError("GITHUB_TOKEN is required (set it in Render Environment).")

app = FastAPI(title="Bassam Customs Updater")

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # يمكنك تضييقها لاحقًا إلى نطاق تطبيقك فقط
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_API = "https://api.github.com"

def _headers() -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

def get_file_sha(repo: str, path: str) -> Optional[str]:
    url = f"{GITHUB_API}/repos/{repo}/contents/{path}"
    r = requests.get(url, headers=_headers(), timeout=30)
    if r.status_code == 200:
        data = r.json()
        return data.get("sha")
    elif r.status_code == 404:
        return None
    raise HTTPException(status_code=502, detail=f"GitHub get error: {r.text}")

def put_file(repo: str, path: str, content_b64: str, message: str, sha: Optional[str]) -> Dict[str, Any]:
    url = f"{GITHUB_API}/repos/{repo}/contents/{path}"
    payload = {
        "message": message,
        "content": content_b64,
        "committer": {"name": COMMITTER_NAME, "email": COMMITTER_EMAIL},
    }
    if sha:
        payload["sha"] = sha
    r = requests.put(url, headers=_headers(), json=payload, timeout=60)
    if r.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail=f"GitHub put error: {r.text}")
    return r.json()

def normalize_item(x: Dict[str, Any]) -> Dict[str, Any]:
    # نحافظ على نفس البنية المستخدمة في الفرونت
    name  = str(x.get("name", "")).strip()
    price = x.get("price", None)
    unit  = str(x.get("unit", "pcs")).strip()
    notes = str(x.get("notes", "")).strip()
    if not name:
        raise HTTPException(status_code=400, detail="كل عنصر يجب أن يحتوي name")
    try:
        price = float(price)
    except Exception:
        raise HTTPException(status_code=400, detail=f"price غير صالح للعنصر: {name}")
    return {"name": name, "price": price, "unit": unit, "notes": notes}

@app.get("/", tags=["health"])
def root():
    return {"ok": True, "service": "Bassam Customs Updater"}

@app.post("/update-prices", tags=["update"])
def update_prices(
    pin: str = Body(..., embed=True),
    items: List[Dict[str, Any]] = Body(..., embed=True),
):
    # تحقق PIN
    if pin != ADMIN_PIN:
        raise HTTPException(status_code=403, detail="Forbidden (PIN)")

    # تطبيع/تحقق البيانات
    cleaned = [normalize_item(x) for x in items]
    # ترتيب أبجدي اختياري لتحكّم ثابت
    cleaned.sort(key=lambda x: x["name"])

    # تجهيز محتوى JSON
    json_text = json.dumps(cleaned, ensure_ascii=False, separators=(",", ":"))
    b64 = base64.b64encode(json_text.encode("utf-8")).decode("ascii")

    # جلب sha إن كان الملف موجودًا
    sha = get_file_sha(REPO, FILE_PATH)

    # رسالة الكومِت
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    message = f"Update prices_catalog.json via owner app ({now})"

    # رفع الملف
    result = put_file(REPO, FILE_PATH, b64, message, sha)

    return {
        "ok": True,
        "repo": REPO,
        "path": FILE_PATH,
        "commit": result.get("commit", {}).get("sha"),
        "size": len(json_text),
        "count": len(cleaned),
    }
