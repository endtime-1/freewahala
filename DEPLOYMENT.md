# FreeWahala Deployment Guide

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@host:5432/freewahala
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=3001
```

### Web (`web/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Mobile (`mobile/.env`)
```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
```

---

## Deployment Steps

### 1. Backend (Render/Railway)
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

### 2. Web (Vercel)
```bash
cd web
npm install
npm run build
# Deploy to Vercel via CLI or dashboard
```

### 3. Mobile (EAS Build)
```bash
cd mobile
npm install
eas build --platform android --profile production
```

---

## Pre-Deployment Checklist
- [ ] Set `DATABASE_URL` for PostgreSQL
- [ ] Set `JWT_SECRET` (min 32 chars)
- [ ] Run `npx prisma migrate deploy`
- [ ] Update API URLs in env files
- [ ] Test all auth flows
