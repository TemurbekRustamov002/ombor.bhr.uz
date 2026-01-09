<<<<<<< HEAD
# ombor.bhr.uz
Navbahor Tekstil ombor sistemasini raqamlashtirish
=======
# Navbahor Tekstil Klasteri - Boshqaruv Tizimi

Ushbu loyiha paxta klasterining ichki jarayonlarini boshqarish, omborxona nazorati, agrotexnik tadbirlar monitoringi va real-vaqtda TV dashboard orqali kuzatish imkoniyatini beradi.

## 🚀 Texnologik stek
- **Framework**: Next.js 15+ (App Router)
- **Database**: PostgreSQL (Prisma ORM)
- **Styling**: Tailwind CSS, Framer Motion
- **Reports**: XLSX (Excel export engine)
- **AI Integration**: Google Gemini API
- **Deployment**: Docker & Docker Compose

## 🛠 O'rnatish va Ishga Tushirish

### 1. Reperozitoriyani ko'chirish
```bash
git clone https://github.com/TemurbekRustamov002/ombor.bhr.uz.git
cd ombor.bhr.uz
```

### 2. .env faylini sozlash
`.env` faylini yarating va quyidagi o'zgaruvchilarni to'ldiring:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
JWT_SECRET="your_secret_key"
GEMINI_API_KEY="your_gemini_key"
TELEGRAM_BOT_TOKEN="your_bot_token"
```

### 3. Docker orqali ishga tushirish (Tavsiya etiladi)
```bash
docker-compose up -d --build
```
Bu buyruq PostgreSQL ma'lumotlar bazasini va Next.js ilovasini avtomatik ravishda konteynerda ishga tushiradi.

### 4. Mahalliy ishga tushirish
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## 📊 Hisobotlar bo'limi
Hujjatlar markazi orqali klastering barcha yo'nalishlari bo'yicha professional Excel hisobotlarni yuklab olish mumkin.

## 📺 Monitoring Dashboard
TV ekranlar uchun mo'ljallangan maxsus monitor real-vaqtda ombor qoldiqlari va dala ishlarini ko'rsatib turadi.

---
**Senior Fullstack Developer tarafından tayyorlandi.**
>>>>>>> 4cde4de (chore: prepare for production deployment with Docker and specialized reporting)
