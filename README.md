# Wi-Fi Rumah

<p align="center">
  <img src="logo/logo.webp" alt="Wi-Fi Rumah Logo" width="100" height="100" />
</p>

<p align="center">
  <strong>Website portal tamu Wi-Fi interaktif & sistem pemantauan jaringan lokal dengan tampilan modern bertema <i>Neumorphism & Soft UI</i>.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/Puppeteer-40B5A4?style=flat&logo=puppeteer&logoColor=white" alt="Puppeteer" />
  <img src="https://img.shields.io/badge/Cloudflare_CDN-F38020?style=flat&logo=cloudflare&logoColor=white" alt="Cloudflare" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Ngrok-1F1E33?style=flat&logo=ngrok&logoColor=white" alt="Ngrok" />
</p>

---

## Daftar Isi
- [Ringkasan Proyek](#ringkasan-proyek)
- [Fitur Utama](#fitur-utama)
- [Struktur Direktori](#struktur-direktori)
- [Panduan Instalasi](#panduan-instalasi)
- [Konfigurasi Lingkungan](#konfigurasi-lingkungan)
  - [1. Konfigurasi Lokal (.env & config.js)](#1-konfigurasi-lokal-env--configjs)
  - [2. Konfigurasi Cloud / Vercel (Environment Variables & Edge Config)](#2-konfigurasi-cloud--vercel-environment-variables--edge-config)
- [Menghubungkan Backend Lokal ke Cloud (HTTP to HTTPS via Ngrok)](#menghubungkan-backend-lokal-ke-cloud-http-to-https-via-ngrok)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Akses Panel Admin Router](#akses-panel-admin-router)
- [Kontributor & Lisensi](#kontributor--lisensi)

---

## Ringkasan Proyek

**Wi-Fi Rumah** adalah aplikasi web utilitas jaringan modern yang dirancang untuk mempermudah tamu rumah terhubung ke jaringan Wi-Fi secara instan melalui pemindaian QR Code dinamis tanpa perlu mengetik kata sandi secara manual, sekaligus memberikan kontrol penuh bagi pemilik rumah untuk memantau performa kecepatan internet dan daftar perangkat aktif secara *real-time*.

Dibangun dengan pendekatan estetika **Neumorphism (Soft UI)** yang bersih, taktil, responsif, dan elegan di semua ukuran layar (Smartphone, Tablet, Laptop, maupun Monitor Desktop).

---

## Fitur Utama

### 1. Beranda & Portal Tamu Instan (`index.html`)
* **Pemindaian QR Code Otomatis:** Tamu cukup mengarahkan kamera ponsel ke QR Code dinamis untuk langsung terhubung ke Wi-Fi.
* **1-Klik Salin Kata Sandi:** Tombol cepat menyalin password ke clipboard dengan animasi taktil.
* **Deteksi Provider ISP & Kota:** Otomatis mendeteksi provider internet dan lokasi pengguna secara *real-time*.
* **Sistem Izin & Gatekeeping (Access Control):** Lapisan verifikasi izin penggunaan dan proteksi penguncian sementara (24 jam via `localStorage`) untuk keamanan jaringan.

### 2. Uji Kecepatan Jaringan Mandiri (`kecepatan.html`)
* **Speedometer Gauge Dinamis:** Jarum analog interaktif dan cincin progres neumorphic dengan animasi *micro-jitter* halus.
* **3 Metrik Komprehensif:** Mengukur **Ping (ms)**, **Kecepatan Unduh (Mbps)**, dan **Kecepatan Unggah/Upload (Mbps)**.
* **100% Client-Side CDN:** Bekerja di semua jenis jaringan (Wi-Fi, 4G/5G Seluler, Hotspot) tanpa wajib menyalakan backend lokal.
* **Riwayat Hasil Tes Lengkap:** Menyimpan riwayat tes ke memori lokal browser dengan tampilan responsif, tanpa pemotongan teks (*no truncate*), dan opsi hapus riwayat.

### 3. Pemantauan Perangkat Aktif (`perangkat.html`)
* **Automasi Robot Scraper (Puppeteer):** Mengekstrak data perangkat terhubung langsung dari panel router lokal `192.168.1.1`.
* **Detail Perangkat Lengkap:** Menampilkan Nama Perangkat, Ikon Kategori (Smartphone, Laptop, TV, dll.), IP Address, MAC Address, dan status koneksi.
* **Dukungan Cloud Tunnel (Ngrok & Vercel Serverless):** Pemantauan router lokal tetap dapat diakses saat frontend di-host di cloud (HTTPS Vercel).

---

## Struktur Direktori

```text
Wifi-Rumah/
├── index.html              # Halaman Beranda & QR Code Wi-Fi
├── kecepatan.html          # Halaman Speedtest Mandiri & Riwayat Tes
├── perangkat.html          # Halaman Dashboard Monitoring Perangkat
├── app.js                  # Logika aplikasi utama, ISP detection, navigasi
├── config.js               # Konfigurasi fallback SSID & Password lokal
├── style.css               # Desain Sistem Neumorphism & Custom Scrollbar
├── server.js               # Backend Node.js & Scraper Puppeteer (Router 192.168.1.1)
├── site.webmanifest        # PWA & Google Search SERP Branding Manifest
├── api/                    # Serverless Functions untuk Vercel Proxy
│   ├── devices.js          # Proxy API untuk mengambil data router via Ngrok
│   └── wifi-config.js      # Endpoint aman untuk konfigurasi Wi-Fi di Vercel
├── logo/                   # Aset logo, GIF, & icon Google Search multi-resolusi
├── .env.example            # Template variabel lingkungan lokal
└── package.json            # Dependensi Node.js (Express, Puppeteer, CORS)
```

---

## Panduan Instalasi

### 1. Prasyarat
* [Node.js](https://nodejs.org/) (versi 18 ke atas)
* Google Chrome terpasang di sistem (digunakan oleh robot scraper Puppeteer)
* [Ngrok](https://ngrok.com/) (opsional, jika ingin menghubungkan backend lokal ke Vercel HTTPS)

### 2. Kloning & Pasang Dependensi
```bash
git clone https://github.com/Fathii3/Wifi-Rumah.git
cd Wifi-Rumah
npm install
```

---

## Konfigurasi Lingkungan

Aplikasi ini mendukung dua metode konfigurasi: **Lokal (`.env`)** dan **Cloud (Vercel Environment Variables / Edge Config)**.

### 1. Konfigurasi Lokal (`.env` & `config.js`)

Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi file `.env` dengan kredensial router lokal Anda:
```env
# Kredensial Login Router Lokal (192.168.1.1)
ROUTER_USER=admin
ROUTER_PASS=PasswordRouterAnda

# Pengaturan Tambahan (Opsional)
PORT=3000
HEADLESS=true
```

Untuk konfigurasi SSID Wi-Fi di lingkungan lokal, sesuaikan pada file `config.js`:
```javascript
const wifiConfig = {
    ssid: "Nama-Wifi-Rumah",
    password: "PasswordWifiAnda",
    encryption: "WPA"
};
```

---

### 2. Konfigurasi Cloud / Vercel (Environment Variables & Edge Config)

Jika Anda meng-hosting website di **Vercel**, data sensitif seperti password Wi-Fi dan URL backend scraper tidak boleh diletakkan sembarangan di file frontend. Vercel Serverless Function (`/api/wifi-config` dan `/api/devices`) akan membaca data ini secara aman dari server-side.

#### Opsi A: Menggunakan Vercel Edge Config (Rekomendasi)
Vercel Edge Config memungkinkan Anda memperbarui nama Wi-Fi, password, atau URL Ngrok secara instan tanpa perlu melakukan build/deploy ulang:

1. Buat **Edge Config Store** baru di dashboard Vercel (misalnya bernama `wifi-rumah-edge-config`).
2. Masukkan item konfigurasi JSON:
```json
{
  "WIFI_SSID": "Wifi-Rumah",
  "WIFI_PASSWORD": "PasswordWifiAnda",
  "WIFI_ENCRYPTION": "WPA",
  "API_HOST": "https://nama-tunnel-anda.ngrok-free.dev"
}
```
3. Vercel akan otomatis menambahkan Environment Variable `EDGE_CONFIG` ke project Anda.

#### Opsi B: Menggunakan Vercel Environment Variables Biasa
Buka **Project Settings > Environment Variables** di Vercel, lalu tambahkan variabel berikut:

| Key Variable | Contoh Nilai | Keterangan |
| :--- | :--- | :--- |
| `WIFI_SSID` | `Wifi-Rumah` | Nama SSID Wi-Fi yang akan di-generate ke QR Code |
| `WIFI_PASSWORD` | `PasswordWifiAnda` | Kata sandi Wi-Fi |
| `WIFI_ENCRYPTION` | `WPA` | Tipe enkripsi (`WPA`, `WEP`, atau `nopass`) |
| `API_HOST` | `https://xxxx.ngrok-free.dev` | URL HTTPS Ngrok tunnel yang mengarah ke PC lokal Anda |

---

## Menghubungkan Backend Lokal ke Cloud (HTTP to HTTPS via Ngrok)

### Mengapa Membutuhkan Tunneling (Ngrok)?
1. **Perbedaan Protokol (Mixed Content):** Website yang di-host di Vercel berjalan pada protokol aman **HTTPS** (`https://wifi.fetyy.my.id`). Jika frontend mencoba memanggil server lokal Anda langsung lewat **HTTP** (`http://localhost:3000`), browser akan otomatis memblokir koneksi tersebut (*Mixed Content Block*).
2. **Jaringan Privat:** Server cloud Vercel tidak memiliki akses langsung ke router fisik rumah Anda (`192.168.1.1`). Oleh karena itu, script scraper `server.js` harus berjalan di perangkat lokal yang terhubung ke Wi-Fi rumah.

### Langkah-langkah Menghubungkan:

1. **Jalankan backend scraper di perangkat lokal (Laptop/PC):**
   ```bash
   node server.js
   ```
2. **Buka terminal baru dan jalankan Ngrok:**
   ```bash
   ngrok http 3000
   ```
3. **Salin URL Forwarding HTTPS dari Ngrok**, misalnya:
   ```
   https://collapse-blot-curtsy.ngrok-free.dev
   ```
4. **Pasang URL Ngrok tersebut:**
   * Di **Vercel Edge Config / Environment Variables** pada key `API_HOST`, **atau**
   * Klik tombol **Pengaturan (ikon gear)** di halaman `perangkat.html` pada website Anda lalu simpan URL tersebut.
5. Halaman monitoring perangkat di Vercel kini dapat membaca data router lokal secara aman tanpa kendala *Mixed Content*.

---

## Menjalankan Aplikasi

### Mode Standalone (Speedtest & Portal Tamu saja)
Cukup buka file `index.html` atau `kecepatan.html` langsung di browser Anda.

### Mode Full Stack (Lengkap dengan Monitoring Router)
```bash
npm start
```
Buka browser di:
```text
http://localhost:3000
```

---

## Akses Panel Admin Router

Gunakan informasi di bawah ini jika Anda perlu masuk langsung ke pengaturan router utama:

> [!WARNING]
> Anda **HARUS** terhubung ke jaringan Wi-Fi rumah ini terlebih dahulu untuk dapat mengakses portal admin router di bawah.

| Keterangan | Informasi Login |
| :--- | :--- |
| **Tipe Perangkat** | **ONU / ONT HSGQ** (Fiber Optic GPON/EPON) |
| **Link Portal Web** | `http://192.168.1.1/admin/login.asp` |
| **Username Default** | `admin` |
| **Password Default** | `admin` |

> [!NOTE]
> **Catatan Perangkat (Hardware Note):**  
> Sistem otomasi robot scraper (`server.js`) pada proyek ini dikonfigurasikan dan diuji secara khusus menggunakan perangkat **ONU / ONT HSGQ**. Struktur formulir login (`#username1`, `#psd1`) serta ekstraksi tabel perangkat aktif disesuaikan dengan antarmuka web bawaan *HSGQ Firmware*. Jika Anda menggunakan router/modem merek lain (seperti ZTE, Huawei, Fiberhome, atau TP-Link), silakan sesuaikan selector DOM dan alur login pada berkas `server.js`.

---

## Kontributor & Lisensi

Dibuat dengan rasa bangga untuk **Keluarga Pak Harun**.  
Lisensi: [ISC License](package.json)


