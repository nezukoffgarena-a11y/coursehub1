# CourseHub - Free Video Course Platform

A free course platform where you upload video courses (via embed codes) with PDF/materials, and students register with email verification and get access via one-time codes.

Deployed-ready for **Vercel** with **Neon Postgres** (database) and **Cloudflare R2** (file storage).

## Features

- **Admin**: Create courses, add videos by pasting embed codes (YouTube/Vimeo/etc.), upload PDFs & files, generate access codes
- **Students**: Register with email → get a 6-digit verification code by email → verify → login
- **Course access**: Students enroll with a unique code. Each code works **only once** — once used by a student, no one else can use it
- **File protection**: Files (PDFs) are only downloadable by enrolled students or the admin
- **Encrypted codes**: Codes are stored encrypted (AES-256-GCM) in the database

## Requirements

- Node.js 20+
- Free accounts: [Neon](https://neon.tech) (Postgres) + [Cloudflare R2](https://dash.cloudflare.com) (file storage)
- An email account that supports SMTP (Gmail recommended)

## Setup

1. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```

2. **Create a Neon database** (free): https://neon.tech → new project → copy the connection string → set as `DATABASE_URL` in `.env` and `.env.local`

3. **Create an R2 bucket** (free): Cloudflare dashboard → R2 → Create bucket (name: `coursehub`) → R2 API Tokens → Create (Object Read & Write) → set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` in `.env` and `.env.local`

4. **Set your SMTP email** in `.env` / `.env.local` so students receive verification codes:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password   # https://myaccount.google.com/apppasswords
   ```

5. Start locally:
   ```
   npm run dev
   ```

6. Create the admin account (runs migrations + creates admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`):
   ```
   curl -X POST http://localhost:3000/api/setup
   ```

7. Log in at http://localhost:3000 as admin.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo on [vercel.com](https://vercel.com/new).
3. Add the environment variables (from `.env`): `DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `JWT_SECRET`, `SMTP_*`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. Deploy.
5. After deploy, create the admin:
   ```
   curl -X POST https://YOUR_APP.vercel.app/api/setup
   ```

## How it works

1. **Admin creates a course** → the platform auto-generates access codes (e.g. `JGR2UAE8`).
2. **Admin shares the codes** with students (WhatsApp/email/etc.).
3. **Student registers** → receives a 6-digit code by email → verifies account.
4. **Student enters an access code** on the course page → enrolled instantly.
5. **Code is burned** — the same code can never be used again.
6. Admin can watch code usage in the Admin Panel (which student used which code).

## Notes

- Videos are added by **pasting the embed code** (iframe). Just copy the "Embed" code from YouTube / Vimeo / Google Drive and paste it.
- Files (PDF, Word, ZIP...) are stored in Cloudflare R2.
- You can generate more codes anytime from the course management page.
- `JWT_SECRET` must stay the same across all environments — it's also the key that encrypts access codes.
