# Design System — Wi-Fi Rumah (Modern Soft Neumorphism)

## Product Context
- **What this is:** Website portal utilitas dan monitoring jaringan Wi-Fi rumah tangga untuk mempermudah tamu/penghuni menyambung Wi-Fi (QR/Salin sandi), tes kecepatan (Speedtest), cek perangkat terhubung, dan panduan router.
- **Who it's for:** Tamu, keluarga, dan pemilik jaringan rumah.
- **Space/industry:** Home Networking / Smart Utility Web App.
- **Project type:** Web Utility App (Responsive Mobile-first).

---

## Aesthetic Direction
- **Direction:** Modern Soft Neumorphism (Tactile & Clean)
- **Decoration level:** Intentional (Dual-shadow elevation, extruded surfaces, recessed input containers, tactile button feedback).
- **Mood:** Terasa nyata seperti tombol fisik perangkat keras modern (audio gear/smart home device), lembut di mata, bersih, minimalis, dan futuristik tanpa elemen visual berlebihan.

---

## Color System

Neumorphism bergantung pada keselarasan warna antara permukaan latar belakang dan elemen UI untuk menciptakan efek timbul/tenggelam yang natural.

### Base & Surfaces
- **Background Utama (`--neu-bg`):** `#e6ecf5` (Soft Cool Grey/Slate tint)
- **Surface Card/Panel (`--neu-surface`):** `#e6ecf5` (Warna identik dengan latar belakang)
- **Light Shadow (`--neu-light`):** `#ffffff` (Refleksi cahaya atas-kiri)
- **Dark Shadow (`--neu-dark`):** `#c5d0e0` (Bayangan bawah-kanan)
- **Darker Shadow Accent:** `#b4c2d6`

### Text & Typography Colors
- **Primary Text (`--text-primary`):** `#2d3748` (Slate Dark, kontras tinggi dan mudah dibaca)
- **Muted/Secondary Text (`--text-muted`):** `#64748b` (Slate Neutral)
- **Subtle Label:** `#8a99ad`

### Accent & Semantic Colors
- **Brand Accent (Indigo/Cobalt):** `#4f46e5` / `#4338ca` (Untuk tombol aktif, badge status, highlight QR)
- **Success (Online/Connected):** `#10b981` (Emerald Green)
- **Warning/Pending:** `#f59e0b` (Amber)
- **Danger/Disconnect:** `#ef4444` (Rose Red)
- **Cyan/Speed Accent:** `#06b6d4` (Speedtest download/upload meter)

---

## Neumorphic Shadow Elevation Tokens (CSS)

```css
:root {
  --neu-bg: #e6ecf5;
  --neu-light: #ffffff;
  --neu-dark: #c5d0e0;
  
  /* 1. Flat Extruded Surface (Card / Container / Panel) */
  --neu-raised: 8px 8px 16px var(--neu-dark), -8px -8px 16px var(--neu-light);
  --neu-raised-sm: 4px 4px 10px var(--neu-dark), -4px -4px 10px var(--neu-light);
  --neu-raised-lg: 12px 12px 24px var(--neu-dark), -12px -12px 24px var(--neu-light);

  /* 2. Recessed / Inset Surface (Inputs, Inset Progress, Pressed Buttons) */
  --neu-inset: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
  --neu-inset-sm: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light);

  /* 3. Convex / Pill Button Interactive */
  --neu-btn: 6px 6px 12px var(--neu-dark), -6px -6px 12px var(--neu-light);
  --neu-btn-hover: 4px 4px 8px var(--neu-dark), -4px -4px 8px var(--neu-light);
  --neu-btn-pressed: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);

  /* 4. Glowing Accent Variant */
  --neu-accent-glow: 0 0 15px rgba(79, 70, 229, 0.4);
}
```

---

## Typography
- **Primary Font:** `Montserrat` (Headings, Buttons, Badges, Metrics)
- **Secondary/Body Font:** `Inter` (Data labels, detail text, description)
- **Monospace:** `JetBrains Mono` / `ui-monospace` (IP Address, MAC Address, Password text, Port credentials)

---

## Layout & Components Transition Guide

### 1. Kartu & Container (`.neu-card`)
- Ganti efek `glass-panel` dan `backdrop-filter: blur(...)` dengan `background: #e6ecf5` dan `box-shadow: var(--neu-raised)`.
- Border-radius: `rounded-2xl` (`1rem` / `16px`) hingga `rounded-3xl` (`1.5rem` / `24px`).
- Border tipis: `border: 1px solid rgba(255, 255, 255, 0.7)` untuk highlight tepian yang halus.

### 2. Tombol Aksi (`.neu-button`)
- **Default State:** Timbul (`box-shadow: var(--neu-btn)`).
- **Hover State:** Sedikit lebih dekat ke permukaan (`box-shadow: var(--neu-btn-hover)`).
- **Active / Pressed State:** Masuk ke dalam / amblas (`box-shadow: var(--neu-btn-pressed)`).

### 3. Kotak Input & Wadah Informasi (`.neu-inset-box`)
- Box salin kata sandi, box status IP/SSID, dan gauge container menggunakan efek cekung/inset (`box-shadow: var(--neu-inset)`).

### 4. Navigasi Bawah / Tab Menu
- Menggunakan pill timbul atau dock mengambang dengan icon yang saat aktif menjadi inset/cekung dengan aksen warna primer.

---

## Migration Steps (Implementation Roadmap)

1. **Step 1 - Core CSS & Variables:**
   - Update `style.css` dengan token warna Neumorphism dan utility classes (`.neu-card`, `.neu-card-sm`, `.neu-btn`, `.neu-btn-primary`, `.neu-inset`, `.neu-circle`).
   - Hapus/gantikan efek gradient blob glassmorphism yang bertabrakan dengan bayangan Neumorphic.

2. **Step 2 - Halaman Utama (`index.html`):**
   - Transformasi hero box kartu Wi-Fi (SSID & Password).
   - Ubah container QR Code menjadi inset/raised Neumorphic pedestal.
   - Perbarui tombol copy password, share, dan kartu navigasi cepat.

3. **Step 3 - Halaman Speedtest (`kecepatan.html`):**
   - Ubah speed gauge meter dan speedometer container menjadi desain Neumorphic dial.
   - Update kartu metrik Ping, Download, Upload, dan Jitter dengan card timbul lembut.
   - Sesuaikan tombol "Mulai Uji Kecepatan" dengan tombol lingkaran/pill tactile.

4. **Step 4 - Halaman Daftar Perangkat (`perangkat.html`):**
   - Ubah kartu total perangkat terhubung dan kartu ringkasan router.
   - Ubah list item perangkat menjadi baris kartu timbul Neumorphic yang rapi.
   - Sempurnakan badge status online/offline dengan soft glowing dot.

5. **Step 5 - Testing & Polish:**
   - Verifikasi kontras warna teks terhadap background `#e6ecf5`.
   - Pastikan animasi klik/touch terasa taktil dan responsif di mobile.
