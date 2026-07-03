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
   Chromium di Termux berada di dalam repositori X11. Jalankan perintah berikut secara berurutan untuk mengaktifkan repositori X11, memperbarui package manager, dan memasang Node.js, Chromium, Git, serta pendukung DNS:
   ```bash
   pkg install x11-repo -y
   pkg update
   pkg install nodejs-lts chromium git which resolv-conf -y
   ```

4. **Pasang Ngrok Resmi (Khusus HP ARM64):**
   Unduh, ekstrak, dan pasang berkas binary Ngrok resmi untuk Linux ARM64 agar dapat dipanggil secara global di Termux HP:
   ```bash
   pkg install wget -y
   wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
   tar xvzf ngrok-v3-stable-linux-arm64.tgz
   mv ngrok $PREFIX/bin/
   ```

---

## ⚙️ Langkah 2: Konfigurasi Puppeteer HP

Agar Puppeteer mendeteksi dan menggunakan browser Chromium bawaan HP (bukan mencoba mengunduh versi PC yang tidak kompatibel), jalankan perintah otomatisasi konfigurasi berikut di Termux:

```bash
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' > ~/.bashrc
echo 'export PUPPETEER_EXECUTABLE_PATH=/data/data/com.termux/files/usr/bin/chromium-browser' >> ~/.bashrc
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

---

## 🔍 Troubleshooting (Penanganan Masalah Umum)

### 1. Error: `E: Unable to locate package chromium` atau `The program which is not installed`
Jika saat instalasi paket aplikasi atau saat menjalankan `source ~/.bashrc` Anda mendapati error tersebut, jalankan perintah ini secara berurutan di Termux untuk memperbarui repositori dan menginstal semua paket pendukung secara lengkap:
```bash
pkg install x11-repo -y
pkg update
pkg install git nodejs-lts chromium which -y
```

### 2. Error: `fatal: Authentication failed` saat melakukan `git clone`
Karena repositori Anda bersifat privat, GitHub tidak mengizinkan pengunduhan langsung dengan kata sandi akun biasa. Anda dapat memilih salah satu dari dua solusi berikut:

* **Solusi A: Jadikan Repositori Publik (Sangat Mudah & Praktis)**
  Karena semua kata sandi Wi-Fi dan token Ngrok Anda sudah disimpan secara aman di Vercel (bukan di dalam repositori GitHub), repositori ini 100% aman untuk diubah menjadi Publik.
  1. Buka repositori `Wifi-Rumah` di browser.
  2. Buka menu **Settings** > scroll ke bawah ke bagian **Danger Zone**.
  3. Klik **Change visibility** > pilih **Make public**.
  4. Jalankan kembali `git clone https://github.com/Fathii3/Wifi-Rumah.git` di Termux tanpa memerlukan kata sandi.

* **Solusi B: Gunakan Personal Access Token (PAT) GitHub**
  Jika ingin repositori tetap privat:
  1. Di GitHub web, buka **Settings** akun Anda > **Developer Settings** > **Personal access tokens** > **Tokens (classic)**.
  2. Klik **Generate new token** (classic), isi deskripsi bebas, centang opsi **repo**, dan klik **Generate token**.
  3. Salin token tersebut. Saat ditanya `Password` oleh Termux waktu `git clone`, tempel (*paste*) token tersebut sebagai pengganti password.

### 3. Error: `Tried to find the browser at the configured path (.../chromium), but no executable was found`
Ini terjadi karena konfigurasi jalur pencarian browser di `.bashrc` masih mengarah ke berkas `chromium` lama (yang tidak ada), sedangkan di Termux nama berkas eksekusinya adalah `chromium-browser`.
**Solusinya:**
Jalankan perintah ini di Termux untuk membersihkan dan memperbarui jalurnya:
```bash
rm -f ~/.bashrc
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' > ~/.bashrc
echo 'export PUPPETEER_EXECUTABLE_PATH=/data/data/com.termux/files/usr/bin/chromium-browser' >> ~/.bashrc
source ~/.bashrc
```

### 4. Error: Ngrok stuck di status `reconnecting (failed to ...)`
Ini terjadi karena sistem Termux Android secara bawaan tidak memiliki konfigurasi DNS standar Linux (`/etc/resolv.conf`), sehingga aplikasi static binary seperti Ngrok gagal mencari alamat DNS server Ngrok di internet.
**Solusinya:**
Pasang paket pendukung DNS `resolv-conf` di Termux HP Anda:
```bash
pkg install resolv-conf -y
```
Setelah terpasang, jalankan kembali program Ngrok atau server Anda.
