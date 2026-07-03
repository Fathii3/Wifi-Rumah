# 📱 Panduan Menjalankan Node Server di HP (Termux)

Panduan ini berisi langkah-langkah lengkap untuk memasang dan menjalankan backend scraper `server.js` di HP Android menggunakan **Termux**, sehingga server dapat aktif 24 jam secara hemat daya tanpa menyalakan laptop.

Setiap perintah sengaja dibuat dalam blok terpisah agar memudahkan Anda menyalinnya satu per satu dari GitHub di HP.

---

## 🛠️ Langkah 1: Persiapan Lingkungan di Termux

1. **Unduh dan Pasang Termux yang Selalu Diperbarui:**
   Jangan unduh Termux dari Google Play Store karena versinya sudah usang. Unduh dari salah satu link resmi berikut:
   * **F-Droid (Direkomendasikan):** Buka [f-droid.org/packages/com.termux/](https://f-droid.org/packages/com.termux/) di HP, gulir ke bawah ke bagian **Version**, lalu klik **Download APK**.
   * **GitHub Releases:** Buka [github.com/termux/termux-app/releases](https://github.com/termux/termux-app/releases), gulir ke bagian **Assets** dari rilis **Latest**, lalu unduh file APK dengan akhiran `universal.apk` atau `arm64-v8a.apk`.

2. **Perbarui Package Manager:**
   Jalankan perintah berikut satu per satu di Termux HP:
   ```bash
   pkg update -y
   ```
   ```bash
   pkg upgrade -y
   ```

3. **Pasang Repositori X11 & Aplikasi Pendukung:**
   Jalankan perintah berikut satu per satu untuk memasang semua bahan yang diperlukan:
   ```bash
   pkg install x11-repo -y
   ```
   ```bash
   pkg update
   ```
   ```bash
   pkg install nodejs-lts -y
   ```
   ```bash
   pkg install chromium -y
   ```
   ```bash
   pkg install git -y
   ```
   ```bash
   pkg install which -y
   ```
   ```bash
   pkg install proot -y
   ```

4. **Pasang Ngrok Resmi (Khusus HP ARM64):**
   Jalankan perintah berikut satu per satu untuk memasang aplikasi Ngrok di HP Android Anda:
   ```bash
   pkg install wget -y
   ```
   ```bash
   wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
   ```
   ```bash
   tar xvzf ngrok-v3-stable-linux-arm64.tgz
   ```
   ```bash
   mv ngrok $PREFIX/bin/
   ```
   ```bash
   chmod +x $PREFIX/bin/ngrok
   ```

---

## ⚙️ Langkah 2: Konfigurasi Puppeteer HP

Jalankan perintah ini satu per satu agar Puppeteer di Node.js menggunakan browser Chromium bawaan HP Termux:

```bash
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' > ~/.bashrc
```
```bash
echo 'export PUPPETEER_EXECUTABLE_PATH=/data/data/com.termux/files/usr/bin/chromium-browser' >> ~/.bashrc
```
```bash
source ~/.bashrc
```

---

## 📂 Langkah 3: Mengambil Kode Project

Unduh kode project terbaru Anda langsung dari GitHub ke Termux HP Anda:

```bash
git clone https://github.com/Fathii3/Wifi-Rumah.git
```
```bash
cd Wifi-Rumah
```

---

## 🔒 Langkah 4: Membuat Berkas Token & Domain Ngrok

Jalankan perintah ini satu per satu di dalam folder `Wifi-Rumah` untuk memasukkan token dan domain statis rahasia Anda secara lokal:

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

Jalankan perintah berikut secara berurutan untuk memasang library Node.js dan menjalankan server:

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
  Buka website Vercel Anda di browser HP seperti biasa. Karena kita sudah menghubungkan Edge Config di Vercel, website Vercel Anda akan secara aman dan otomatis langsung terhubung ke HP Termux Anda lewat internet!
* **Secara Lokal (Tanpa Internet):**
  Jika Anda sedang tidak ingin menggunakan internet/Vercel, Anda bisa mengakses server lokal Termux langsung dari browser HP Anda:
  ```text
  http://localhost:3000/perangkat.html
  ```

---

## 🔍 Troubleshooting (Penanganan Masalah Umum)

### 1. Error: `E: Unable to locate package chromium` atau `The program which is not installed`
Jalankan perintah berikut satu per satu untuk memulihkan dan menginstal ulang:
```bash
pkg install x11-repo -y
```
```bash
pkg update
```
```bash
pkg install git nodejs-lts chromium which proot -y
```

### 2. Error: `fatal: Authentication failed` saat melakukan `git clone`
* **Solusi A: Jadikan Repositori Publik (Sangat Mudah & Praktis)**
  1. Buka repositori `Wifi-Rumah` di browser.
  2. Buka menu **Settings** > scroll ke bawah ke bagian **Danger Zone**.
  3. Klik **Change visibility** > pilih **Make public**.
  4. Jalankan kembali `git clone` di Termux:
     ```bash
     git clone https://github.com/Fathii3/Wifi-Rumah.git
     ```

* **Solusi B: Gunakan Personal Access Token (PAT) GitHub**
  1. Buka **Settings** akun GitHub Anda > **Developer Settings** > **Personal access tokens** > **Tokens (classic)**.
  2. Klik **Generate new token (classic)**, isi deskripsi bebas, centang opsi **repo**, dan klik **Generate token**.
  3. Salin token tersebut dan tempel (*paste*) sebagai kata sandi saat diminta oleh Termux waktu `git clone`.

### 3. Error: `Tried to find the browser at the configured path (.../chromium), but no executable was found`
Jalankan perintah berikut satu per satu di Termux untuk memperbarui jalurnya ke file `chromium-browser` yang benar:
```bash
rm -f ~/.bashrc
```
```bash
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' > ~/.bashrc
```
```bash
echo 'export PUPPETEER_EXECUTABLE_PATH=/data/data/com.termux/files/usr/bin/chromium-browser' >> ~/.bashrc
```
```bash
source ~/.bashrc
```

### 4. Error: Ngrok stuck di status `reconnecting (failed to ...)` atau `DNS resolution failed` / `Unable to locate package resolv-conf`
Jalankan perintah berikut satu per satu di Termux HP Anda untuk memasang `proot`, membuat DNS Google secara manual, dan menjalankan server lewat chroot:

```bash
pkg install proot -y
```
```bash
mkdir -p /data/data/com.termux/files/usr/etc
```
```bash
echo -e "nameserver 8.8.8.8\nnameserver 8.8.4.4" > /data/data/com.termux/files/usr/etc/resolv.conf
```
```bash
termux-chroot
```
```bash
node server.js
```
