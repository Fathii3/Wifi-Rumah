# 🎯 MASTER PROMPT: Optimasi & Perbaikan Logo/Favicon Website
*(Dual-Scale Strategy: Google Search Anti-Crop & Tab Browser Bold)*

Gunakan prompt di bawah ini untuk proyek website Anda yang lain setiap kali ingin menstandarisasi favicon, tab browser, dan tampilan logo di Google Search.

---

```markdown
### 🎯 MASTER PROMPT: Optimasi Favicon & Logo Website (Dual-Scale System)

Tolong perbaiki dan standarisasi seluruh sistem logo, favicon, dan metadata website saya berdasarkan file logo master yang ada di project ini.
File logo master saya ada di: [MASUKKAN_PATH_LOGO_MASTER, contoh: public/logo-master.png atau public/logo.jpg]

---

#### 1. Masalah yang Harus Diselesaikan:
1. **Google Search (Logo Terpotong/Kecrop):** Google Search menampilkan favicon dalam bingkai lingkaran (*circular mask*). Jika logo memenuhi kanvas 100% tanpa margin aman (*safe zone*), maka keempat sudut logo akan terpotong secara kasar.
2. **Browser Tab (Logo Kekecilan):** Tab browser menggunakan bingkai kotak penuh. Jika tab browser menggunakan logo berskala kecil, logo akan terlihat tenggelam dan tidak jelas.
3. **Background Transparan:** Jika logo master berformat JPG/memiliki background putih/krem/abu-abu, bersihkan background tersebut agar menjadi transparan murni (*transparent background*).

---

#### 2. Strategi Dual-Scale yang Harus Diterapkan:
- **A. Browser Tab (`favicon.ico`, `favicon.png`, `favicon.svg`):**
  - Gunakan **Skala 95% - 96%** (memenuhi kanvas kotak).
  - Hasil: Logo tampil **besar, tebal, tajam, dan proporsional** di tab browser.
- **B. Google Search & PWA (`favicon-48x48.png`, `favicon-96x96.png`, `icon-192.png`, `icon-512.png`):**
  - Gunakan **Skala 70% - 74%** (*Safe Zone margin* ~13%-15% di setiap sisi kanvas) sehingga radius terjauh piksel memenuhi rumus `r < canvasSize / 2`.
  - Hasil: **100% elemen logo aman di dalam lingkaran Google Search** dan tidak akan terpotong sama sekali.

---

#### 3. Output Aset yang Harus Dihasilkan:
Buatkan skrip otomatis (Node.js menggunakan `sharp` atau Python `Pillow`) untuk menghasilkan file-file berikut:

1. **Folder `public/logo/`:**
   - `favicon-48x48.png` (48x48 px - Standar utama bot Google Search)
   - `favicon-96x96.png` (96x96 px - Google Search High-DPI)
   - `favicon-192x192.png` (192x192 px - Android & PWA Homescreen)
   - `favicon-512x512.png` (512x512 px - PWA Splash Screen & Master)
   - `apple-touch-icon.png` (180x180 px - iOS Safari Home Screen)
   - `favicon.ico` (Multi-layer ICO berisi layer 16x16, 32x32, 48x48)
   - `favicon.png` (48x48 px - Format PNG)
   - `favicon.svg` (Crisp SVG embedding base64)
   - `logo.webp` & `logo.png` (512x512 px)

2. **Folder Root `public/` (Root Fallback):**
   - `favicon.ico`, `favicon.png`, `favicon.svg`, `favicon-48x48.png`, `favicon-96x96.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.

---

#### 4. Update Tag HTML & Manifest:
Perbarui bagian `<head>` pada `index.html` dengan cache-busting `?v=2` (atau naikkan versinya):

```html
<!-- Favicon & Icons for Google Search and Browsers -->
<link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
<link rel="shortcut icon" href="/favicon.ico?v=2" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
<link rel="icon" type="image/png" sizes="48x48" href="/logo/favicon-48x48.png?v=2" />
<link rel="icon" type="image/png" sizes="96x96" href="/logo/favicon-96x96.png?v=2" />
<link rel="icon" type="image/png" sizes="192x192" href="/logo/favicon-192x192.png?v=2" />
<link rel="icon" type="image/png" sizes="512x512" href="/logo/favicon-512x512.png?v=2" />
<link rel="apple-touch-icon" sizes="180x180" href="/logo/apple-touch-icon.png?v=2" />
<link rel="manifest" href="/site.webmanifest?v=2" />
```

Dan pastikan file `public/site.webmanifest` sudah merujuk ke icon 192x192 dan 512x512.

---

#### 5. Verifikasi & Build:
Jalankan skrip generator favicon, lakukan validasi ukuran & bounding box, lalu pastikan `npm run build` berjalan lancar tanpa error.
```
