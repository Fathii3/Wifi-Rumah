# Wi-Fi Connect & Network Monitoring System

> Deskripsi Proyek Portofolio / Portfolio Project Showcase

---

## Versi Bahasa Indonesia

### 1. Title & Published Date
* **Nama Proyek:** Wi-Fi Connect & Network Monitoring System (Wi-Fi Rumah)
* **Waktu Pembuatan:** Juli 2026

---

### 2. Short Summary
**Wi-Fi Connect** adalah portal tamu utilitas Wi-Fi modern dan sistem pemantauan jaringan lokal berbasis antarmuka *Neumorphism & Soft UI*. Aplikasi ini memungkinkan tamu terhubung ke Wi-Fi rumah secara instan melalui pemindaian QR Code dinamis atau salin kata sandi 1-klik, sekaligus menyediakan pemantauan perangkat aktif dan pengujian kecepatan internet secara *real-time* bagi pemilik rumah.

---

### 3. Key Goals (Tujuan Utama)
1. **Mempermudah Akses Tamu (Seamless Connectivity):** Mengeliminasi proses pengetikan kata sandi Wi-Fi secara manual bagi tamu melalui generasi QR Code otomatis dan fitur salin kata sandi satu-klik.
2. **Gatekeeping & Kontrol Keamanan (Access Management):** Menyediakan mekanisme konfirmasi izin penggunaan berbasis modal dan proteksi pemblokiran sementara (1 hari via `localStorage`) untuk menjaga privasi jaringan pribadi.
3. **Transparansi & Pemantauan Jaringan Real-Time (Network Observability):** Menyediakan dashboard monitoring *real-time* untuk mendeteksi perangkat terhubung (MAC Address, IP, Bandwidth) serta performa kecepatan internet (Speedtest & Ping).

---

### 4. Key Benefits (Manfaat Utama)
1. **Efisiensi Waktu & Kenyamanan Tamu:** Tamu tidak perlu mengeja atau bertanya kata sandi Wi-Fi berulang kali; cukup dengan memindai QR Code menggunakan kamera ponsel untuk langsung terhubung.
2. **Transparansi Data & Observabilitas Jaringan:** Pemilik rumah dapat memantau seluruh perangkat aktif yang terhubung ke router lokal secara transparan lengkap dengan detail IP, MAC, dan penggunaan bandwidth.
3. **Keamanan & Kontrol Privasi Terjaga:** Memiliki lapisan verifikasi izin akses interaktif yang membatasi akses portal jika pengguna belum mendapatkan izin dari pemilik rumah.
4. **Kustomisasi & Arsitektur Hybrid Berkinerja Tinggi:** Desain visual *Neumorphic* yang fleksibel, responsif di semua perangkat (Mobile & Desktop), serta dapat dijalankan secara hybrid baik di server lokal (Node.js/Termux) maupun cloud (Vercel Serverless Functions & Edge Config).

---

### 5. Project Context Card
* **Role:** Full Stack Engineer & System Integrator
* **Context:** Independent Project / Home Network Management & Guest Portal Utility
* **Challenge:** 
  Router Wi-Fi rumahan umumnya memiliki antarmuka admin yang kaku, terbatas di jaringan internal (IP privat `192.168.1.1`), dan tidak memiliki API resmi untuk mengambil data perangkat yang terhubung. Selain itu, terdapat tantangan integrasi *Mixed Content* (menghubungkan frontend HTTPS Vercel di cloud dengan backend HTTP lokal) serta kemudahan tamu dalam menyambungkan perangkat.
* **Solution:** 
  Membangun aplikasi web *Single-Page* (SPA) dengan Tailwind CSS berbasis tema *Neumorphism & Soft UI*. Dibuat pula backend *Node.js/Express* yang menggunakan *Puppeteer Headless Browser Automation* untuk mengekstrak data dari router secara berkala. Untuk komunikasi cloud-to-local yang aman, digunakan *Ngrok Secure Tunneling* yang dijembatani oleh *Vercel Serverless Proxy* dan *Vercel Edge Config* guna melindungi kredensial backend dan menghindari *F12 inspection*.
* **Result:** 
  Source code lengkap berbasis Node.js & Vercel Serverless tersedia, siap didaftarkan ke repositori GitHub, serta mendukung eksekusi lintas platform (Windows PC & Termux Android).

---

### 6. Tech Stack Badges
`HTML5` `JavaScript (ES6+)` `Tailwind CSS` `Node.js` `Express.js` `Puppeteer` `Vercel Serverless` `Vercel Edge Config` `Ngrok Tunnel` `Cloudflare Speed API` `QRCode.js`

---

<br>

---

## English Version

### 1. Title & Published Date
* **Project Title:** Wi-Fi Connect & Network Monitoring System (Home Wi-Fi Portal)
* **Published Date:** July 2026

---

### 2. Short Summary
**Wi-Fi Connect** is a modern guest portal utility and local network monitoring system featuring a sleek *Neumorphism & Soft UI* user interface. It enables guests to seamlessly connect to home Wi-Fi via dynamic QR code scanning or one-click password copying, while offering real-time active device tracking and network speed diagnostics for home owners.

---

### 3. Key Goals
1. **Seamless Guest Connectivity:** Eliminate manual Wi-Fi password entry for guests by leveraging auto-generated dynamic Wi-Fi QR codes and single-tap copy mechanisms.
2. **Access Gatekeeping & Security Control:** Implement an interactive permission modal paired with automated temporary blockouts (24-hour lockout via `localStorage`) to protect network privacy.
3. **Real-Time Network Observability:** Deliver a live monitoring dashboard displaying connected devices (MAC, IP, Bandwidth usage) and internet performance metrics (Speedtest & Latency).

---

### 4. Key Benefits
1. **Time Efficiency & Enhanced UX:** Guests can immediately join the network by scanning a QR code with their mobile camera without needing to re-type complex passwords.
2. **Data Transparency & Network Awareness:** Home owners gain full visibility over active connected devices, IP assignments, MAC addresses, and live traffic usage.
3. **Privacy & Gatekept Access:** Built-in interactive validation ensures unauthorized users cannot browse portal details without host confirmation.
4. **High-Performance & Hybrid Architecture:** Lightweight, responsive *Neumorphic* design optimized for all devices, seamlessly supported by both local runtime environments (Node.js/Termux) and cloud deployments (Vercel Serverless Functions & Edge Config).

---

### 5. Project Context Card
* **Role:** Full Stack Engineer & System Integrator
* **Context:** Independent Project / Home Network Utility & Guest Management Portal
* **Challenge:** 
  Standard consumer Wi-Fi routers have rigid admin interfaces restricted to local private IPs (`192.168.1.1`) and lack REST APIs for querying connected devices. Connecting a cloud-hosted HTTPS frontend (Vercel) to a local HTTP backend without security blockages (*Mixed Content*) posed a key technical hurdle.
* **Solution:** 
  Engineered a responsive single-page web app using Vanilla JS & Tailwind CSS with modern *Neumorphic & Soft UI* aesthetics. Developed a Node.js/Express backend integrated with *Puppeteer Headless Automation* to scrape router state. Secured backend communications via an automated *Ngrok HTTPS tunnel* coupled with a *Vercel Serverless Proxy* and *Vercel Edge Config* to shield internal API endpoints from browser inspection.
* **Result:** 
  Production-ready repository supporting cross-platform deployment (Windows PC & Android Termux) with full live monitoring and cloud-proxy capabilities.

---

### 6. Tech Stack Badges
`HTML5` `JavaScript (ES6+)` `Tailwind CSS` `Node.js` `Express.js` `Puppeteer` `Vercel Serverless` `Vercel Edge Config` `Ngrok Tunnel` `Cloudflare Speed API` `QRCode.js`

---

### Technical Architecture Summary
* **Backend Scraping Engine:** Automated headless scraping with Puppeteer on local router `192.168.1.1` to periodically poll LAN/WLAN tables and Bandwidth metrics.
* **Serverless Cloud Proxy:** Edge security using `Vercel Edge Config` & `api/devices.js` to dynamically bridge Ngrok host URLs without exposing backend URLs to client-side browser inspection.
* **Custom Speed Diagnostics:** Pure JS fetch stream reader paired with Cloudflare trace API for instant, low-overhead download speed and latency testing.
