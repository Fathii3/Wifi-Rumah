# 📱 Panduan Menjalankan Node Server di HP (Termux)

Panduan ini berisi langkah-langkah untuk menjalankan scraper `server.js` langsung dari HP Android Anda menggunakan **Termux**, sehingga Anda tidak perlu menyalakan laptop.

---

## 🛠️ Langkah 1: Persiapan Lingkungan di Termux

1. **Unduh dan Pasang Termux**:
   - Unduh aplikasi Termux melalui **[F-Droid](https://f-droid.org/packages/com.termux/)** (Versi Google Play Store sudah usang dan bermasalah).
   
2. **Perbarui Package Manager**:
   Buka aplikasi Termux lalu ketik perintah berikut:
   ```bash
   pkg update && pkg upgrade -y
   ```

3. **Pasang Node.js & Chromium**:
   Chromium diperlukan oleh Puppeteer agar bisa melakukan scraping secara headless di dalam HP.
   ```bash
   pkg install nodejs-lts chromium git -y
   ```

---

## ⚙️ Langkah 2: Konfigurasi Puppeteer HP

Agar Puppeteer tidak mencoba mengunduh Chromium versi PC (yang tidak bisa berjalan di arsitektur ARM64 HP), jalankan perintah konfigurasi berikut:

```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=$(which chromium)
```

> [!TIP]
> **Otomatisasi Konfigurasi:**
> Agar Anda tidak perlu mengetikkan perintah di atas setiap kali membuka Termux, masukkan konfigurasi tersebut ke profil Termux Anda dengan perintah:
> ```bash
> echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' >> ~/.bashrc
> echo 'export PUPPETEER_EXECUTABLE_PATH=$(which chromium)' >> ~/.bashrc
> source ~/.bashrc
> ```

---

## 📂 Langkah 3: Mengambil Kode Project

### Opsi A: Menggunakan Git (Sangat Direkomendasikan)
Jika kode Anda sudah di-upload ke GitHub/GitLab:
```bash
git clone <URL_REPOSITORI_ANDA>
cd Wifi-Rumah
```

### Opsi B: Transfer File Manual
Jika disalin manual dari komputer, Anda dapat menempatkan foldernya di penyimpanan internal HP, lalu akses folder tersebut di Termux menggunakan izin penyimpanan:
```bash
termux-setup-storage
cd /sdcard/path/to/folder/Wifi-Rumah
```

---

## 🚀 Langkah 4: Menjalankan Server Backend

Setelah berada di dalam folder `Wifi-Rumah` di Termux:

1. **Pasang Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Server**:
   ```bash
   node server.js
   ```

Jika berhasil, Anda akan melihat log pemindaian real-time berjalan setiap 5 detik di layar Termux Anda.

---

## 🌐 Langkah 5: Mengakses Website di HP

Karena backend server sudah berjalan di HP Anda sendiri (localhost):

1. Buka browser (Chrome / Edge / Firefox) di HP Anda.
2. Buka alamat berikut:
   - **Halaman Pemantauan Perangkat:**
     ```text
     http://localhost:3000/perangkat.html
     ```
   - **Halaman Beranda Wi-Fi:**
     ```text
     http://localhost:3000/index.html
     ```

Sekarang website statis Anda dapat menampilkan data real-time langsung dari router menggunakan HP Anda sebagai servernya!
