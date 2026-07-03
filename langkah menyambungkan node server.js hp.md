# 📱 Panduan Menjalankan Node Server di HP (Termux)

Panduan ini berisi langkah-langkah lengkap untuk memasang dan menjalankan backend scraper `server.js` di HP Android menggunakan **Termux**, sehingga server dapat aktif 24 jam secara hemat daya tanpa menyalakan laptop.

---

## 🛠️ Langkah 1: Persiapan Lingkungan di Termux

1. **Unduh dan Pasang Termux yang Selalu Diperbarui:**
   Jangan unduh Termux dari Google Play Store karena versinya sudah usang dan bermasalah. Unduh dari salah satu link resmi berikut:
   * **F-Droid (Direkomendasikan):** Buka [f-droid.org/packages/com.termux/](https://f-droid.org/packages/com.termux/) di HP, gulir ke bawah ke bagian **Version**, lalu klik **Download APK**.
   * **GitHub Releases:** Buka [github.com/termux/termux-app/releases](https://github.com/termux/termux-app/releases), gulir ke bagian **Assets** dari rilis **Latest**, lalu unduh file APK dengan akhiran `universal.apk` atau `arm64-v8a.apk`.

2. **Perbarui Package Manager:**
   Buka aplikasi Termux lalu ketik perintah berikut:
   ```bash
   pkg update && pkg upgrade -y
   ```

3. **Pasang Repositori X11 & Paket Aplikasi:**
   Chromium di Termux berada di dalam repositori X11. Jalankan perintah berikut secara berurutan untuk mengaktifkan repositori X11, memperbarui package manager, dan memasang Node.js, Chromium, serta Git:
   ```bash
   pkg install x11-repo -y
   pkg update
   pkg install nodejs-lts chromium git -y
   ```

---

## ⚙️ Langkah 2: Konfigurasi Puppeteer HP

Agar Puppeteer mendeteksi dan menggunakan browser Chromium bawaan HP (bukan mencoba mengunduh versi PC yang tidak kompatibel), jalankan perintah otomatisasi konfigurasi berikut di Termux:

```bash
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' >> ~/.bashrc
echo 'export PUPPETEER_EXECUTABLE_PATH=$(which chromium)' >> ~/.bashrc
source ~/.bashrc
```

---

## 📂 Langkah 3: Mengambil Kode Project

Unduh kode project terbaru Anda langsung dari GitHub ke Termux HP Anda:

```bash
git clone https://github.com/Fathii3/Wifi-Rumah.git
cd Wifi-Rumah
```

---

## 🔒 Langkah 4: Membuat Berkas Token & Domain Ngrok

Karena file token dan domain bersifat rahasia (diabaikan oleh `.gitignore` sehingga tidak ikut ter-upload ke GitHub), Anda harus membuatnya secara manual sekali di Termux HP dengan menjalankan dua perintah berikut:

1. **Membuat File Token Ngrok:**
   ```bash
   echo "3FwxyRVO12nUIWoDjNJwnj6FtBe_2751jgYfTFHwQBzouuBXM" > ngrok_token.txt
   ```

2. **Membuat File Domain Statis Ngrok:**
   ```bash
   echo "collapse-blot-curtsy.ngrok-free.dev" > ngrok_domain.txt
   ```

---

## 🚀 Langkah 5: Menjalankan Server Scraper

Instal library Node.js dan jalankan servernya:

1. **Instal Dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan Server:**
   ```bash
   node server.js
   ```

Jika berhasil, Anda akan melihat log bahwa server berjalan di port `3000` dan **Ngrok Secure Tunnel aktif secara otomatis menggunakan domain statis Anda!**

---

## 🌐 Langkah 6: Mengakses Web Pemantau Perangkat

Setelah `node server.js` aktif di Termux HP:
* **Secara Online (Vercel):**
  Buka tautan website Vercel Anda di browser HP seperti biasa. Karena kita sudah menghubungkan Edge Config di Vercel, website Vercel Anda akan secara aman dan otomatis langsung terhubung ke HP Termux Anda lewat internet!
* **Secara Lokal (Tanpa Internet):**
  Jika Anda sedang tidak ingin menggunakan internet/Vercel, Anda bisa mengakses server lokal Termux langsung dari browser HP Anda:
  ```text
  http://localhost:3000/perangkat.html
  ```
