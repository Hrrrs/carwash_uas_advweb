# Angin Mamiri - Car Wash & Cafe

Aplikasi web untuk manajemen operasional Car Wash dengan unit bisnis Cafe.

## Tech Stack
- Node.js + Express.js
- EJS Templates
- Bootstrap 5
- MySQL (Clever Cloud)
- JWT Authentication

## Deployment ke Railway

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

### 2. Setup Railway
1. Buka [railway.app](https://railway.app)
2. Login dengan GitHub
3. Klik "New Project" → "Deploy from GitHub repo"
4. Pilih repository ini
5. Railway akan otomatis detect Node.js

### 3. Set Environment Variables di Railway
Buka Settings → Variables, tambahkan:

```
DB_HOST=your_clevercloud_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306
JWT_SECRET=your_secure_secret_key
NODE_ENV=production
```

### 4. Database Setup (Clever Cloud)
1. Buka [clever-cloud.com](https://www.clever-cloud.com/)
2. Create MySQL add-on
3. Copy credentials ke Railway environment variables
4. Jalankan `database/schema.sql` di database

## Local Development
```bash
npm install
npm run dev
```

## Default Port
Railway akan otomatis set `PORT` environment variable.
