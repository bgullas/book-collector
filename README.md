# Book Collector PWA — Setup Guide

## Step 1: Deploy the Google Apps Script backend

1. Go to [script.google.com](https://script.google.com) → **New project**
2. Delete the default code and paste everything from `gas-backend.js`
3. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** → copy the **Web app URL** (looks like `https://script.google.com/macros/s/ABC.../exec`)

## Step 2: Paste the URL into index.html

Open `index.html` and replace line near the top:
```js
var GAS_URL = 'YOUR_GAS_WEB_APP_URL_HERE';
```
with your actual URL.

## Step 3: Host the PWA

**Option A — GitHub Pages (free, recommended)**
```bash
cd book-collector
git init && git add . && git commit -m "init"
gh repo create book-collector --public --push --source=.
# then enable Pages in repo Settings → Pages → branch: main
```

**Option B — Quick local test**
```bash
cd book-collector
python3 -m http.server 8080
# open http://localhost:8080
```

**Option C — Netlify drag-and-drop**  
Go to app.netlify.com → drag the `book-collector` folder onto the deploy zone.

---

## Spreadsheet columns (auto-created)

| Timestamp | ISBN | Book Name (Manglish) | Book Name (Malayalam) | Author | Publisher | Added By |

## Features

- 🎤 **Voice input** for every field (tap mic button)
- 📷 **Barcode / QR scanner** for ISBN (tap Scan)
- 🔤 **Auto-transliteration**: Manglish → Malayalam script (via GAS proxy)
- 📋 **Concurrent-safe writes** using Apps Script `LockService`
- 📱 **Installable PWA** — works offline, adds to home screen
- 👤 **User name** remembered across sessions via localStorage

## Notes

- Voice recognition works on Chrome/Edge on Android and Safari on iOS
- Barcode scanning requires camera permission; works best on rear camera
- Transliteration uses Google Input Tools (called server-side from GAS, no API key needed)
