# Angin Mamiri - Car Wash & Cafe

Aplikasi web untuk manajemen operasional Car Wash dengan unit bisnis Cafe.

## Tech Stack
- Node.js + Express.js
- EJS Templates
- Bootstrap 5
- MySQL (Clever Cloud)
- JWT Authentication

## Deployment ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "Add Vercel config"
git push origin main
```

### 2. Deploy di Vercel
1. Buka [vercel.com](https://vercel.com) → Login dengan GitHub
2. Klik **"Add New..."** → **"Project"**
3. Pilih repository **carwash_uas_advweb**
4. Di **Environment Variables**, tambahkan:
   - `DB_HOST` = your_clevercloud_host
   - `DB_USER` = your_db_user
   - `DB_PASSWORD` = your_db_password
   - `DB_NAME` = your_db_name
   - `DB_PORT` = 3306
   - `JWT_SECRET` = your_secure_secret_key
   - `NODE_ENV` = production
5. Klik **Deploy**

### 3. Database Setup (Clever Cloud)
1. Buka [clever-cloud.com](https://www.clever-cloud.com/)
2. Create MySQL add-on
3. Jalankan `database/schema.sql` di database

## Local Development
```bash
npm install
npm run dev
```

