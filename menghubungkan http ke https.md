# 🌐 Panduan Menghubungkan HTTP (Lokal) ke HTTPS (Vercel)

Dokumen ini menjelaskan mengapa terjadi kendala pemblokiran koneksi data (Mixed Content Block) ketika website Anda di-host di Vercel (HTTPS) sedangkan server scraper Anda berjalan secara lokal (HTTP), serta solusi praktis untuk menyelesaikannya.

---

## 📌 Masalah Utama: Mixed Content Block
Vercel menggunakan protokol aman **HTTPS** (`https://...vercel.app`). Ketika browser mendeteksi bahwa halaman HTTPS meminta data dari server lokal yang menggunakan **HTTP biasa** (`http://192.168.1.2:3000`), browser secara otomatis akan **memblokir permintaan tersebut** demi keamanan.

Selain itu, Vercel berada di cloud internet, sehingga ia tidak bisa mengakses langsung router fisik Anda di rumah (`192.168.1.1`). Oleh karena itu, script `server.js` (scraper) **harus tetap dijalankan di laptop atau HP (Termux) Anda yang terhubung ke Wi-Fi rumah**.

Berikut adalah **3 Solusi** untuk menghubungkan atau mengatasinya:

---

## 💡 Solusi 1: Menggunakan Secure Tunnel (Direkomendasikan & Paling Mudah)
Secure Tunnel berfungsi membuat "jembatan aman" (tunnels) berupa URL HTTPS publik di internet yang mengarah langsung ke server lokal Anda (port `3000`).

Kami telah menambahkan **fitur tombol Pengaturan (ikon gigi/gear ⚙️)** di halaman [perangkat.html](file:///d:/VC/Wifi-Rumah/perangkat.html) untuk memudahkan Anda memasukkan URL HTTPS tanpa perlu mengubah kode atau melakukan commit git ulang.

### Cara A: Menggunakan Pinggy (Tanpa Registrasi)
Pinggy adalah cara paling cepat karena tidak memerlukan akun atau instalasi apa pun.

1. Jalankan server backend lokal Anda:
   ```bash
   node server.js
   ```
2. Buka terminal baru (di laptop atau Termux HP) dan jalankan:
   ```bash
   npx pinggy -l 3000
   ```
   *(Atau menggunakan SSH bawaan HP/Laptop jika terpasang: `ssh -R 80:localhost:3000 a.pinggy.io`)*
3. Anda akan mendapatkan URL HTTPS acak di terminal, misalnya:
   `https://rpaqy-111-222-33-44.pinggy.link`
4. Buka website Vercel Anda, klik ikon gigi **⚙️** di pojok kanan atas bagian "Live", masukkan URL HTTPS tersebut, lalu klik **Simpan**.

---

### Cara B: Menggunakan Localtunnel (Gratis & Mudah)
Localtunnel juga gratis dan tidak memerlukan registrasi token.

1. Jalankan server backend lokal Anda:
   ```bash
   node server.js
   ```
2. Jalankan perintah berikut di terminal baru:
   ```bash
   npx localtunnel --port 3000
   ```
3. Anda akan diberikan URL HTTPS, seperti:
   `https://funny-donkey-show.loca.lt`
4. Buka URL tersebut sekali di browser Anda, masukkan alamat IP publik laptop Anda (yang tertera di layar terminal localtunnel) untuk memverifikasi keamanan.
5. Salin URL HTTPS tersebut, masukkan ke tombol **⚙️** di website Vercel Anda, dan simpan.

---

### Cara C: Menggunakan Ngrok (Otomatis & Sangat Stabil)
Ngrok adalah opsi terpopuler. Kami telah menambahkan fitur **otomatisasi Ngrok** di dalam `server.js`.

1. Daftarkan akun di [ngrok.com](https://ngrok.com/) untuk mendapatkan token Anda.
2. Buat file bernama `ngrok_token.txt` di folder project Anda dan tempel token Anda di sana (file ini sudah otomatis kami abaikan di `.gitignore` agar tidak ter-upload ke publik).
3. Jalankan server:
   ```bash
   node server.js
   ```
4. Server secara otomatis akan memicu secure tunnel Ngrok dan mencetak tautan HTTPS di layar terminal Anda, seperti:
   `https://a1b2-111-222-33-44.ngrok-free.app`
5. Salin tautan HTTPS tersebut, buka web Vercel Anda, klik tombol Gigi **⚙️**, tempel URL tersebut, lalu simpan.

---

## 💡 Solusi 2: Akses Lokal Secara Langsung (Tanpa Vercel)
Jika Anda malas menggunakan Secure Tunnel, cara paling sederhana sebenarnya adalah **tidak menggunakan Vercel**.

Karena `server.js` Anda sudah dikonfigurasi untuk menyajikan semua file statis secara otomatis:
1. Pastikan `node server.js` aktif di laptop atau HP (Termux).
2. Akses server lokal tersebut langsung dari browser HP atau Laptop Anda:
   * Jika server berjalan di **laptop** (ganti dengan IP laptop Anda):
     ```text
     http://192.168.1.2:3000/perangkat.html
     ```
   * Jika server berjalan di **HP (Termux)**:
     ```text
     http://localhost:3000/perangkat.html
     ```

Karena frontend dan backend sama-sama berjalan di protokol **HTTP lokal**, browser **tidak akan memblokir** permintaan data dan berjalan 100% lancar tanpa kuota internet!

---

## 💡 Solusi 3: Menjalankan Server Lokal Menggunakan HTTPS (Self-Signed)
Jika Anda tetap ingin membuka website HTTPS Vercel dan menghubungkannya langsung ke IP lokal laptop tanpa perantara tunnel (misal ke `https://192.168.1.2:3000`), Anda bisa mengonfigurasi Express lokal menggunakan SSL/TLS:

1. Buat sertifikat SSL self-signed (misalnya menggunakan OpenSSL):
   ```bash
   openssl req -nodes -new -x509 -keyout server.key -out server.cert
   ```
2. Ubah inisialisasi Express di `server.js` agar menggunakan modul `https`:
   ```javascript
   const fs = require('fs');
   const https = require('https');
   
   const privateKey  = fs.readFileSync('server.key', 'utf8');
   const certificate = fs.readFileSync('server.cert', 'utf8');
   const credentials = { key: privateKey, cert: certificate };

   // Jalankan HTTPS server
   const httpsServer = https.createServer(credentials, app);
   httpsServer.listen(3000, () => {
       console.log("HTTPS Server berjalan di port 3000");
   });
   ```
3. Buka alamat `https://192.168.1.2:3000/api/devices` sekali di browser Anda, lalu setujui peringatan keamanan (*Proceed anyway/Advanced*).
4. Sekarang, situs Vercel (HTTPS) dapat melakukan fetch langsung ke `https://192.168.1.2:3000/api/devices` tanpa diblokir.
