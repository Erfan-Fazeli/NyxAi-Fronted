# NyxAi Background Removal - Architecture

## معماری امنیتی

### دسترسی به API
```
UI (Browser) → Cloudflare Pages Function → Railway Backend
     ↓                     ↓                      ↓
  ساده              امضا + احراز هویت         پردازش
```

### مسیرهای دسترسی

#### 1️⃣ مسیر عادی (UI → CF → Railway)
- **کلاینت**: درخواست ساده `multipart/form-data` با فقط فیلد `image`
- **CF Function**: امضا HMAC-SHA256 می‌سازد و به Railway می‌فرستد
- **محدودیت**: فقط از دامنه `nyxagent.dev` قابل دسترسی
- **هدف**: امنیت API_KEY و جلوگیری از دسترسی مستقیم

#### 2️⃣ مسیر استگانوگرافی (100% شبیه درخواست عادی)
- **Endpoint**: `/api/steganography-proxy`
- **ورودی**: عکس با payload مخفی
- **کار CF**: استخراج payload مخفی و ارسال به Railway **دقیقاً** مثل یک درخواست remove-bg عادی
- **هدف**: فایروال‌ها تفاوتی نبینند (100% یکسان)

#### 3️⃣ مسیر مستقیم (تست/دیباگ)
- **کلاینت → Railway** (بدون CF)
- **احراز هویت**: کلاینت خودش امضا می‌سازد
- **هدف**: تست و دیباگ

## فایل‌های کلیدی

### Frontend (Cloudflare Pages)
- `functions/api/remove-background.js` - پروکسی شفاف برای UI
- `functions/api/steganography-proxy.js` - پروکسی استگانوگرافی (100% یکسان)
- `functions/_shared/signature.js` - ماژول مشترک امضا HMAC
- `public/test-upload.html` - UI تست

### Backend (Railway)
- `app/core/security.py` - verify_hmac_signature
- `app/api/v1/images.py` - endpoint remove-background

### Test Scripts
- `test_proxy.py` - تست CF → Railway
- `test_backend_real_image.py` - تست مستقیم به Railway

## محدودیت‌های امنیتی

### در Cloudflare Function
```javascript
// بررسی Origin/Referer
const allowedDomains = ["nyxagent.dev", "localhost"];
if (!origin.includes(allowedDomain)) {
  return 403;
}
```

### در Railway Backend
```python
# AUTH_TOLERANCE = 300 seconds
# Nonce cache for replay protection
```

## پروتکل امضا (یکسان برای همه مسیرها)

```
timestamp = Math.floor(Date.now() / 1000)
nonce = crypto.randomUUID()
body_hash = SHA256(body_bytes)
string_to_sign = "{timestamp}:{nonce}:{body_hash}"
signature = HMAC-SHA256(API_KEY, string_to_sign)

Headers:
  X-Timestamp: timestamp
  X-Nonce: nonce
  X-Signature: signature
```

## دیپلوی

### Cloudflare Pages
- Push به `main` branch → auto-deploy
- Secrets: `API_KEY` در Cloudflare Dashboard

### Railway Backend
- Push به `main` branch → auto-deploy
- Env: `API_KEY` در Railway Settings

## تست

### تست UI
```
https://nyxagent.dev/test-upload.html
```

### تست مستقیم به Railway
```bash
python test_backend_real_image.py
```

### تست پروکسی CF
```bash
python test_proxy.py
```
