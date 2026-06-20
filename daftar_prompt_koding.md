# Kumpulan Prompt AI: Website Statis Akses Wi-Fi

Dokumen ini berisi sekumpulan kata perintah (*prompt*) yang sudah dirancang secara spesifik. Anda bisa menyalin dan menempelkan (*copy-paste*) prompt ini ke AI di kemudian hari untuk memintanya membuatkan kode HTML, CSS, dan JavaScript secara terpisah, tanpa perlu menulis ulang kodenya dari awal.

---

### 1. Prompt untuk Menghasilkan File HTML (Struktur)
**Salin dan gunakan teks perintah berikut:**
> "Tolong buatkan kode untuk file `index.html` sebuah website statis penyambung Wi-Fi otomatis. Halaman ini cukup memiliki kerangka dasar yang memanggil `style.css` secara eksternal dan memuat library `qrcode.js` melalui CDN. Buat tata letak bergaya *Retro Desktop UI* (estetika Y2K) yang terdiri dari kontainer utama bernama 'window', bagian 'title-bar' bertuliskan 'WLAN_Connector.exe' dengan tombol silang (X), serta area konten utama yang di dalamnya terdapat elemen `<div id="qrcode"></div>` dan teks instruksi singkat. Jangan tulis kode CSS atau JavaScript-nya, cukup struktur tag HTML-nya saja."

---

### 2. Prompt untuk Menghasilkan File CSS (Desain Antarmuka)
**Salin dan gunakan teks perintah berikut:**
> "Buatkan kode CSS murni untuk file `style.css` dengan tema *Retro Desktop UI* / Y2K. Atur agar *background* utama *body* berwarna *teal* klasik (`#008080`). Buat *class* `.window` berwarna *silver* (`#c0c0c0`) yang memiliki border 3D *emboss* (efek timbul kaku dengan sisi terang putih dan sisi gelap hitam). Buat *class* `.title-bar` dengan gradasi linear biru navy ke biru terang, lengkap dengan teks berwarna putih. Gunakan *font* 'Courier New' agar terlihat otentik seperti program OS jadul."

---

### 3. Prompt untuk Menghasilkan Konfigurasi & Logika JavaScript
**Salin dan gunakan teks perintah berikut:**
> "Tolong buatkan logika JavaScript untuk website generator QR Code Wi-Fi dengan arsitektur *client-side*. Buat dua bagian: 
> 1. Isi untuk file `config.js` yang mengekspor variabel objek berisi SSID, password, dan jenis enkripsi (WPA/WEP).
> 2. Potongan *script* (untuk disisipkan di HTML) yang bertugas menangkap data dari `config.js` tersebut, merakitnya menjadi format string khusus Wi-Fi (`WIFI:T:WPA;S:nama;P:sandi;;`), dan secara otomatis memunculkan QR Code ke dalam elemen ber-ID `qrcode` menggunakan bantuan *library* qrcode.js."
