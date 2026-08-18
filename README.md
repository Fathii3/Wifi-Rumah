# Wi-Fi Rumah - Smart Guest Portal & Network Dashboard

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
</p>

---

## Ringkasan Proyek

**Wi-Fi Rumah** adalah aplikasi web utilitas jaringan modern yang dirancang untuk mempermudah tamu rumah terhubung ke jaringan Wi-Fi secara instan dan tanpa ribet, sekaligus memberikan transparansi penuh bagi pemilik rumah untuk memantau performa jaringan dan daftar perangkat aktif secara *real-time*.

Dibuat dengan pendekatan estetika **Neumorphism (Soft UI)** yang bersih, taktil, dan responsif di berbagai ukuran layar (HP, Tablet, maupun Laptop/Desktop).

---

## Fitur Utama

### 1. Beranda & Portal Tamu Cepat (`index.html`)
* **Pemindaian QR Code Otomatis:** Tamu cukup mengarahkan kamera ponsel ke QR Code dinamis untuk langsung terhubung ke Wi-Fi tanpa mengetik kata sandi.
* **1-Klik Salin Kata Sandi:** Tombol cepat untuk menyalin password ke clipboard dengan notifikasi taktil.
* **Deteksi Provider ISP & Kota:** Otomatis mendeteksi provider internet dan lokasi pengguna secara *real-time*.
* **Sistem Izin & Gatekeeping (Access Control):** Lapisan verifikasi izin penggunaan dan proteksi penguncian sementara (24 jam via `localStorage`) untuk menjaga privasi jaringan.

### 2. Uji Kecepatan Jaringan Mandiri (`kecepatan.html`)
* **Speedometer Gauge Dinamis:** Jarum analog interaktif dan cincin progres neumorphic dengan animasi *micro-jitter* halus.
* **Metrik Komprehensif:** Mengukur **Kecepatan Unduh (Mbps)**, **Ping (ms)**, **Nama Provider (ISP)**, dan **Lokasi Kota**.
* **100% Mandiri (Client-Side Cloudflare CDN):** Bekerja di semua jenis jaringan (Wi-Fi, 4G/5G Seluler, Hotspot) tanpa wajib menyalakan backend lokal.
* **Riwayat Hasil Tes Lokal:** Catatan riwayat tes tersimpan rapi di browser, lengkap dengan **Modal Konfirmasi Custom Neumorphic** untuk menghapus riwayat.

### 3. Pemantauan Perangkat Aktif (`perangkat.html`)
* **Automasi Robot Scraper (Puppeteer):** Mengekstrak tabel perangkat aktif (LAN & WLAN) langsung dari panel router lokal `192.168.1.1`.
* **Detail Perangkat Lengkap:** Menampilkan Nama Perangkat, Tipe Icon (Smartphone, Laptop, TV, dll.), IP Address, MAC Address, serta perkiraan *traffic live bandwidth* (Upload / Download).
* **Dukungan Cloud Tunnel (Ngrok & Vercel Proxy):** Memungkinkan monitoring perangkat tetap dapat diakses saat frontend di-host di cloud (HTTPS Vercel).

---

## Struktur Direktori

```text
Wifi-Rumah/
├── index.html              # Halaman Beranda & QR Code Wi-Fi
├── kecepatan.html          # Halaman Speedtest Mandiri & Riwayat Tes
├── perangkat.html          # Halaman Dashboard Monitoring Perangkat
├── app.js                  # Logika aplikasi utama, ISP detection, navigasi
├── config.js               # Konfigurasi SSID & Password Wi-Fi lokal
├── style.css               # Desain Sistem Neumorphism & Custom Scrollbar
├── server.js               # Backend Node.js & Scraper Puppeteer (Router 192.168.1.1)
├── api/                    # Serverless Functions untuk Vercel Proxy
├── logo/                   # Aset logo & ikon aplikasi
└── package.json            # Dependensi Node.js (Express, Puppeteer, CORS)
```

---

## Panduan Instalasi & Penggunaan

### 1. Prasyarat
* [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan)
* Google Chrome terpasang di sistem (untuk automasi Puppeteer)

### 2. Instalasi Dependensi
```bash
git clone https://github.com/Fathii3/Wifi-Rumah.git
cd Wifi-Rumah
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`, lalu sesuaikan kredensial admin router:
```env
ROUTER_USER=admin
ROUTER_PASS=PasswordRouterAnda
```

Sesuaikan juga nama Wi-Fi dan password pada file `config.js`:
```javascript
const wifiConfig = {
    ssid: "Nama-Wifi-Anda",
    password: "PasswordWifiAnda",
    encryption: "WPA"
};
```

### 4. Menjalankan Aplikasi

* **Mode Standalone (Speedtest & Portal Tamu saja):**
  Cukup buka file `index.html` atau `kecepatan.html` langsung di browser Anda.

* **Mode Full Stack (Dengan Pemantauan Router Aktif):**
  ```bash
  npm start
  ```
  Buka browser di:
  ```
  http://localhost:3000
  ```

---

## Akses Panel Admin Router Wi-Fi

Gunakan informasi di bawah ini jika suatu saat Anda perlu masuk ke pengaturan mesin/router Wi-Fi utama:

> [!WARNING]
> **Syarat Akses:** Anda **HARUS** sudah terhubung ke jaringan Wi-Fi rumah ini terlebih dahulu sebelum bisa membuka link portal admin di bawah.

| Keterangan | Informasi Login |
| :--- | :--- |
| **Link Portal** | `http://192.168.1.1/admin/login.asp` |
| **Username Default** | `admin` |
| **Password Default** | `Rumah` |

---

## Kontributor & Lisensi

Dibuat untuk **Keluarga Pak Harun**.
Lisensi: [ISC License](LICENSE)
