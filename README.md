# HTML Viewer

App Android untuk membuka dan preview file HTML lokal.

## Fitur
- Buka folder & lihat struktur file HTML
- Preview file HTML via iframe
- Riwayat file yang pernah dibuka
- Hapus riwayat satu per satu atau semua

## Build APK via GitHub Actions

### 1. Upload repo ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/html-viewer.git
git push -u origin main
```

### 2. Tunggu build selesai
- Buka tab **Actions** di repo GitHub lo
- Tunggu workflow **Build APK** selesai (~5-10 menit)

### 3. Download APK
- Klik workflow yang sudah selesai
- Scroll ke bawah → **Artifacts**
- Download `html-viewer-debug`
- Extract zip → install `app-debug.apk` di HP

## Development lokal
```bash
npm install
npm run dev
```

## Struktur project
```
html-viewer/
├── src/
│   ├── main.jsx         # Entry point React
│   └── App.jsx          # Komponen utama
├── android/             # Platform Android (Capacitor)
├── .github/workflows/   # GitHub Actions
├── capacitor.config.js
├── package.json
└── vite.config.js
```
