 Panduan Menghubungkan HTTP (Lokal) ke HTTPS (Vercel)

Dokumen ini menjelaskan mengapa terjadi kendala pemblokiran koneksi data (Mixed Content Block) ketika website Anda di-host di Vercel (HTTPS) sedangkan server scraper Anda berjalan secara lokal (HTTP), serta solusi praktis untuk menyelesaikannya.

---

 Masalah Utama: Mixed Content Block

Vercel menggunakan protokol aman HTTPS (`https://...vercel.app`). Ketika browser mendeteksi bahwa halaman HTTPS meminta data dari server lokal yang menggunakan HTTP biasa (`http://...:`), browser secara otomatis akan memblokir permintaan tersebut demi keamanan.

Selain itu, Vercel berada di cloud internet, sehingga ia tidak bisa mengakses langsung router fisik Anda di rumah (`...`). Oleh karena itu, script `server.js` (scraper) harus tetap dijalankan di laptop atau HP (Termux) Anda yang terhubung ke Wi-Fi rumah.

Berikut adalah Solusi untuk menghubungkan atau mengatasinya:

---

 Solusi : Menggunakan Secure Tunnel (Direkomendasikan & Paling Mudah)

Secure Tunnel berfungsi membuat "jembatan aman" (tunnels) berupa URL HTTPS publik di internet yang mengarah langsung ke server lokal Anda (port ``).

Kami telah menambahkan fitur tombol Pengaturan (ikon gigi/gear) di halaman [perangkat.html](file:///d:/VC/Wifi-Rumah/perangkat.html) untuk memudahkan Anda memasukkan URL HTTPS tanpa perlu mengubah kode atau melakukan commit git ulang.

 Cara A: Menggunakan Pinggy (Tanpa Registrasi)
Pinggy adalah cara paling cepat karena tidak memerlukan akun atau instalasi apa pun.

. Jalankan server backend lokal Anda:
 ```bash
 node server.js
 ```
. Buka terminal baru (di laptop atau Termux HP) dan jalankan:
 ```bash
 npx pinggy -l 
 ```
 (Atau menggunakan SSH bawaan HP/Laptop jika terpasang: `ssh -R :localhost: a.pinggy.io`)
. Anda akan mendapatkan URL HTTPS acak di terminal, misalnya:
 `https://rpaqy----.pinggy.link`
. Buka website Vercel Anda, klik ikon gigi di pojok kanan atas bagian "Live", masukkan URL HTTPS tersebut, lalu klik Simpan.

---

 Cara B: Menggunakan Localtunnel (Gratis & Mudah)
Localtunnel juga gratis dan tidak memerlukan registrasi token.

. Jalankan server backend lokal Anda:
 ```bash
 node server.js
 ```
. Jalankan perintah berikut di terminal baru:
 ```bash
 npx localtunnel --port 
 ```
. Anda akan diberikan URL HTTPS, seperti:
 `https://funny-donkey-show.loca.lt`
. Buka URL tersebut sekali di browser Anda, masukkan alamat IP publik laptop Anda (yang tertera di layar terminal localtunnel) untuk memverifikasi keamanan.
. Salin URL HTTPS tersebut, masukkan ke tombol Pengaturan di website Vercel Anda, dan simpan.

---

 Cara C: Menggunakan Ngrok (Otomatis & Sangat Stabil)
Ngrok adalah opsi terpopuler. Kami telah menambahkan fitur otomatisasi Ngrok di dalam `server.js`.

. Daftarkan akun di [ngrok.com](https://ngrok.com/) untuk mendapatkan token Anda.
. Buat file bernama `ngrok_token.txt` di folder project Anda dan tempel token Anda di sana (file ini sudah otomatis kami abaikan di `.gitignore` agar tidak ter-upload ke publik).
. Jalankan server:
 ```bash
 node server.js
 ```
. Server secara otomatis akan memicu secure tunnel Ngrok dan mencetak tautan HTTPS di layar terminal Anda, seperti:
 `https://ab----.ngrok-free.app`
. Salin tautan HTTPS tersebut, buka web Vercel Anda, klik tombol Pengaturan, tempel URL tersebut, lalu simpan.

---

 Solusi : Akses Lokal Secara Langsung (Tanpa Vercel)

Jika Anda malas menggunakan Secure Tunnel, cara paling sederhana sebenarnya adalah tidak menggunakan Vercel.

Karena `server.js` Anda sudah dikonfigurasi untuk menyajikan semua file statis secara otomatis:
. Pastikan `node server.js` aktif di laptop atau HP (Termux).
. Akses server lokal tersebut langsung dari browser HP atau Laptop Anda:
 Jika server berjalan di laptop (ganti dengan IP laptop Anda):
 ```text
 http://...:/perangkat.html
 ```
 Jika server berjalan di HP (Termux):
 ```text
 http://localhost:/perangkat.html
 ```

Karena frontend dan backend sama-sama berjalan di protokol HTTP lokal, browser tidak akan memblokir permintaan data dan berjalan % lancar tanpa kuota internet!

---

 Solusi : Menjalankan Server Lokal Menggunakan HTTPS (Self-Signed)

Jika Anda tetap ingin membuka website HTTPS Vercel dan menghubungkannya langsung ke IP lokal laptop tanpa perantara tunnel (misal ke `https://...:`), Anda bisa mengonfigurasi Express lokal menggunakan SSL/TLS:

. Buat sertifikat SSL self-signed (misalnya menggunakan OpenSSL):
 ```bash
 openssl req -nodes -new -x -keyout server.key -out server.cert
 ```
. Ubah inisialisasi Express di `server.js` agar menggunakan modul `https`:
 ```javascript
 const fs = require('fs');
 const https = require('https');
 
 const privateKey = fs.readFileSync('server.key', 'utf');
 const certificate = fs.readFileSync('server.cert', 'utf');
 const credentials = { key: privateKey, cert: certificate };

 // Jalankan HTTPS server
 const httpsServer = https.createServer(credentials, app);
 httpsServer.listen(, () => {
 console.log("HTTPS Server berjalan di port ");
 });
 ```
. Buka alamat `https://...:/api/devices` sekali di browser Anda, lalu setujui peringatan keamanan (Proceed anyway/Advanced).
. Sekarang, situs Vercel (HTTPS) dapat melakukan fetch langsung ke `https://...:/api/devices` tanpa diblokir.
