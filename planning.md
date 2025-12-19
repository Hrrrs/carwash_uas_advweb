Tentu, ini adalah tambahan yang sangat krusial untuk sebuah sistem bisnis. Fitur **"Financial Dashboard"** atau ringkasan pendapatan akan membuat modul laporan Anda jauh lebih bernilai (dan pasti menambah poin penilaian).

Saya telah memperbarui **Technical Blueprint** di bawah ini.

**Perubahan yang saya lakukan:**

1. Pada bagian **Feature Requirements (Modul F)**, saya menambahkan instruksi spesifik untuk menampilkan **"Kartu Ringkasan"** (Summary Cards) di bagian atas halaman laporan.
2. Kartu ini akan menampilkan: **Pendapatan Hari Ini**, **Total Transaksi Hari Ini**, dan **Pendapatan Bulan Ini**.
3. Saya juga menambahkan instruksi SQL spesifik (`SUM` & `COUNT`) agar AI tahu cara menghitungnya.

Silakan **Copy & Paste** dokumen final ini ke AI koding Anda.

---

# TECHNICAL BLUEPRINT FINAL: WEB UMKM "ANGIN MAMIRI"

## 1. PROJECT OVERVIEW

Aplikasi web berbasis Node.js untuk manajemen operasional Carwash yang memiliki unit bisnis Cafe. Sistem ini melayani dua jenis pengguna:

1. **Customer:** Memesan menu cafe secara mandiri saat menunggu, input Nomor Polisi kendaraan.
2. **Admin (Kasir):** Mengelola master data, menerima pesanan customer, menambahkan jasa cuci ke dalam pesanan tersebut, dan melihat laporan pendapatan harian.

**Target Deployment:** Railway / Render.
**Database Host:** Clever Cloud (MySQL).

---

## 2. TECHNOLOGY STACK

* **Runtime:** Node.js
* **Framework:** ExpressJS (Monolith)
* **Templating Engine:** EJS
* **CSS Framework:** Bootstrap 5 (CDN) - *Gunakan Cards untuk Dashboard Laporan*
* **Database Client:** `mysql2` (Wajib menggunakan Prepared Statements)
* **Authentication:** JWT (`jsonwebtoken`) disimpan dalam **HTTPOnly Cookie**.
* **Security:**
* `bcryptjs` (Hashing password)
* `helmet` (Security Headers - **Note:** Disable CSP)
* `cookie-parser`



---

## 3. DATABASE SCHEMA (MYSQL)

Jalankan query ini di Clever Cloud.

```sql
-- Reset Tables
DROP TABLE IF EXISTS transaction_details;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- 1. USERS (Auth)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTS (Master Data)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('service', 'food', 'beverage') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TRANSACTIONS (Header)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    police_number VARCHAR(20), -- Key Identifier
    total_amount DECIMAL(10, 2) DEFAULT 0,
    status ENUM('pending', 'paid') DEFAULT 'pending', 
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSACTION DETAILS
CREATE TABLE transaction_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    qty INT DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

```

---

## 4. PROJECT STRUCTURE (MVC)

```
/carwash_uas_advweb
├── config/
│   └── db.js            # Koneksi MySQL Pool
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── transController.js
│   └── reportController.js # Logic Laporan Keuangan
├── middleware/
│   └── authMiddleware.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── transRoutes.js
│   └── reportRoutes.js
├── views/
│   ├── layout/
│   ├── index.ejs
│   ├── login.ejs, signup.ejs
│   ├── order.ejs        # Customer View
│   ├── dashboard.ejs    # Admin Main View
│   ├── pos.ejs          # Admin Kasir
│   └── report.ejs       # Laporan Keuangan (Cards + Table)
├── public/
├── app.js
└── package.json

```

---

## 5. DETAILED FEATURE REQUIREMENTS

### A. Konfigurasi & Keamanan

1. **Helmet:** `app.use(helmet({ contentSecurityPolicy: false }));` (Agar script UI tidak error).
2. **Anti SQL Injection:** Gunakan `?` placeholder di semua query.
3. **JWT:** Simpan di Cookie HTTPOnly.

### B. Modul Autentikasi

1. **Signup:** Validasi password match. Hash password.
2. **Login:** Generate JWT -> Cookie. Redirect by Role.

### C. Modul Customer (Order)

* **Checkout:** Input Plat Nomor wajib. Simpan `transactions` (status: 'pending').

### D. Modul Admin - Master Data

* **CRUD:** Create, Read, Update, Delete (Services & Menu).
* **UI:** Table dengan Search & Tombol Print. Konfirmasi hapus dengan JS.

### E. Modul Admin - Kasir (Gabung Tagihan)

* **Dashboard:** List pesanan 'pending' berdasarkan Plat Nomor.
* **Detail/POS:**
* Tampilkan pesanan makanan user.
* **Fitur Utama:** Dropdown tambah "Jasa Cuci" ke transaksi ini.
* **Simpan:** Update status 'paid', hitung total, simpan detail.



### F. Modul Laporan Keuangan (Financial Report) - **IMPORTANT**

* **Halaman:** `/admin/report`
* **Fitur 1: Ringkasan Pendapatan (Summary Cards)**
* Di bagian paling atas halaman, tampilkan 3 Kartu (Bootstrap Cards):
1. **Pendapatan Hari Ini:** Hasil `SUM(total_amount)` dimana `status='paid'` DAN `date = CURDATE()`.
2. **Transaksi Hari Ini:** Hasil `COUNT(id)` transaksi hari ini.
3. **Total Pendapatan (All Time):** Akumulasi seluruh pendapatan.




* **Fitur 2: Tabel Riwayat**
* Tabel daftar transaksi lengkap (Tanggal, Plat No, Total).


* **Fitur 3: Tools**
* **Filter Tanggal:** Input type date untuk memfilter tabel.
* **Print Laporan:** Tombol `window.print()` yang mencetak halaman laporan ini dengan rapi.



---

## 6. INSTRUKSI PENGERJAAN (AI PROMPT INSTRUCTION)

Tolong generate kode secara bertahap dan lengkap:

1. **Setup Core:** `app.js`, `db.js` (Mysql2 Pool), & Middleware JWT.
2. **Auth Module:** Login/Signup Controller & Views.
3. **Product Module:** CRUD Controller & Views.
4. **Transaction Logic:**
* Customer order (Pending).
* Admin process (Add Service -> Paid).


5. **Report Module (Logic Khusus):**
* Buat `reportController.js`.
* Buat query SQL `SUM` untuk menghitung "Pendapatan Hari Ini".
* Render ke `report.ejs` dengan tampilan Dashboard/Cards di atas tabel.



Pastikan UI menggunakan **Bootstrap 5** yang rapi dan responsif.

---