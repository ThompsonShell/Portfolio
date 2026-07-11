# Chunked (bo'lib-bo'lib) video yuklash — 1-bosqich

4–5 GB video darsliklarni **tus 1.0.0** protokoli orqali 10 MB'lik bo'laklarda,
uzilib qolsa **davom ettirib** yuklash tizimi. Bu bosqichda faqat faylni to'liq va
xavfsiz saqlaymiz (FFmpeg → HLS keyingi bosqichda).

Frontend Uppy (`@uppy/tus`) → backend tus server → `MEDIA_ROOT/videos/original/`.
Yakunda `VideoUpload.status = pending_processing` bo'ladi.

---

## Ikki variant

| | **B — Django tus server (default, shu repoda)** | **A — tusd (tavsiya, katta yuk uchun)** |
|---|---|---|
| Yuklashni kim qabul qiladi | Django (gunicorn) | Go'dagi `tusd` (alohida process/container) |
| Qo'shimcha servis | yo'q | tusd container kerak |
| Django roli | har chunkni oladi | faqat **webhook** oladi |
| Qachon | kam-o'rta yuk, oddiy deploy | ko'p parallel/juda katta yuk |

**Ikkalasi ham aynan bir xil Uppy frontend bilan ishlaydi** — farqi faqat Uppy
`endpoint` qayerga ishora qilishida. Variant B allaqachon yozilgan va ishlaydi;
xohlasangiz keyin A'ga o'tasiz.

---

## 1. Backend o'rnatish

```bash
cd portfolio-backend
source venv/bin/activate
pip install -r requirements.txt          # djangorestframework-simplejwt qo'shildi
python manage.py migrate                 # videos app jadvali (0001_initial)
python manage.py createsuperuser         # admin — faqat shu foydalanuvchi yuklay oladi
```

`.env` ga (ixtiyoriy) qo'shing:

```dotenv
# Access token yuklash davomida amal qilib turishi uchun (default 12 soat)
JWT_ACCESS_HOURS=12
# Faqat Option A (tusd) uchun kerak:
TUSD_WEBHOOK_SECRET=uzun-tasodifiy-satr
# Next.js qaysi domendan so'rov yuborsa — shu ro'yxatda bo'lsin
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://asilbek.me
```

## 2. Frontend o'rnatish

```bash
cd portfolio-frontend
npm install @uppy/core @uppy/dashboard @uppy/tus @uppy/react
# yoki shunchaki: npm install   (package.json ga allaqachon qo'shildi)
```

`.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000/api   # prod: https://asilbek.me/api
```

Yuklash sahifasi: **`/admin/upload`** (fayl: `app/admin/upload/page.tsx`).
Birinchi marta admin login/parol so'raydi → JWT olib `localStorage` ga saqlaydi →
Uppy Dashboard chiqadi (built-in progress bar + resumable UI).

## 3. nginx

`nginx-portfolio.conf` faylini serverga ko'chiring (yo'llarni to'g'rilang):

```bash
sudo cp nginx-portfolio.conf /etc/nginx/conf.d/portfolio.conf
sudo nginx -t && sudo systemctl reload nginx
```

Muhim nuqtalar: `proxy_request_buffering off` (chunk'ni to'g'ridan-to'g'ri Django'ga
oqizadi), uzun timeout'lar, va `client_max_body_size 100m` — **6 GB emas**, chunki
chunked'da nginx bir vaqtda faqat bitta 10 MB chunk ko'radi.

---

## Endpointlar (Variant B)

| Metod | URL | Vazifasi |
|---|---|---|
| `POST` | `/api/upload/tus/` | Yangi yuklash yaratish ("init") → `Location` + `upload_id` |
| `PATCH` | `/api/upload/tus/<id>/` | Bitta chunkni `Upload-Offset` da faylga yozish |
| `HEAD` | `/api/upload/tus/<id>/` | Server qayergacha oldi (`Upload-Offset`) — davom ettirish uchun |
| `GET` | `/api/upload/videos/` | Adminning yuklashlari + status/progress |
| `POST` | `/api/auth/token/` | Login → JWT (`access`, `refresh`) |

> Eslatma: talabda `Content-Range` bilan chizilgan sxema `@uppy/tus` bilan
> ishlamaydi — Uppy **tus** protokolini gapiradi (`Upload-Offset`/`Upload-Length`
> header'lari). Shuning uchun aynan tus 1.0.0 yozildi; natijada bitta frontend
> ham Django, ham tusd bilan ishlaydi.

### Resumable qanday ishlaydi
Internet uzilsa, `@uppy/tus` qayta ulanganda saqlangan upload URL'iga **HEAD**
yuboradi, server qaytargan `Upload-Offset` dan davom etadi. Frontendda
qo'shimcha kod shart emas — `retryDelays` + default fingerprint yetarli.

---

## Variant A — tusd bilan ishga tushirish

### 1) tusd container (`docker-compose.yml` ga qo'shing)

```yaml
  tusd:
    image: tusproject/tusd:v2.4.0
    command:
      - -host=0.0.0.0
      - -port=1080
      - -base-path=/files/
      - -upload-dir=/data/videos/original          # MEDIA_ROOT/videos/original bilan bir xil volume
      - -max-size=6442450944                        # 6 GB
      - -behind-proxy
      - -hooks-http=http://backend:8000/api/upload/tusd-hook/
      - -hooks-http-forward-headers=Authorization   # browser JWT'sini Django'ga uzatadi
      - -hooks-enabled-events=pre-create,post-finish
    volumes:
      - ./portfolio-backend/media:/data
    ports:
      - "1080:1080"
    restart: unless-stopped
```

### 2) Django tomon
Hech narsa yozish shart emas — webhook allaqachon bor:
`POST /api/upload/tusd-hook/` (`videos/views.py` → `TusdWebhookView`).

- **pre-create**: JWT (forward qilingan `Authorization`), fayl kengaytmasi va hajmni
  tekshiradi; noto'g'ri bo'lsa `4xx` qaytarib tusd'ni **to'xtatadi** (bironta bayt ham
  saqlanmaydi).
- **post-finish**: fayl to'liq diskda; `VideoUpload(status=pending_processing)` yaratadi.

Xavfsizlik: webhook'ni faqat ichki tarmoqqa oching + `.env` da `TUSD_WEBHOOK_SECRET`
o'rnating (tusd http-hook'iga secret header qo'shsangiz) + JWT baribir tekshiriladi.

### 3) Frontend'ni tusd'ga qaratish
`components/VideoUploader.tsx` da faqat endpoint'ni almashtiring:

```ts
endpoint: "https://asilbek.me/files/"   // tusd (/api/upload/tus/ o'rniga)
```

Qolgan hamma narsa (chunk size, resumable, JWT header) o'zgarmaydi.

---

## Xavfsizlik (ikki variantda ham)

- **Auth**: faqat `is_staff` admin. JWT `Authorization: Bearer <token>` har so'rovda.
- **Kengaytma**: faqat `.mp4`, `.mov`, `.mkv` (`VIDEO_UPLOAD_ALLOWED_EXTENSIONS`).
- **Hajm**: 6 GB cheklov (`VIDEO_UPLOAD_MAX_SIZE`) — server tomonda `Upload-Length` bo'yicha.
- **Egalik**: har `upload_id` faqat uni boshlagan admin'ga tegishli; boshqasi `403`.

---

## Tez tekshirish (curl)

```bash
# 1) token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"<parol>"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["access"])')

# 2) create (Upload-Metadata base64: filename=test.mp4)
curl -si -X POST http://localhost:8000/api/upload/tus/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Upload-Length: 11" \
  -H "Upload-Metadata: filename $(printf test.mp4 | base64)" | grep -i location

# 3) PATCH chunk / HEAD offset — Uppy buni avtomatik qiladi
```

Yoki brauzerda `/admin/upload` ga kirib haqiqiy fayl bilan sinang.

## Yuklangandan keyin
Fayl `media/videos/original/<upload_id>.<ext>` da; `VideoUpload.status =
pending_processing`. Django admin'da **Videos → Video uploads** da ko'rinadi. Darhol
saytda ko'rsatish uchun admin action bor: *"Create a Lecture from the uploaded file"*
— tanlangan yuklashdan `Lecture` yasaydi. (HLS'ga o'girish — 2-bosqich.)
