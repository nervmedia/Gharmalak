# Gharmalak launch webapp

Next.js 16 app for the Nagpur pilot. Runs on Hostinger Node.js hosting (Business or Cloud plans) with MySQL.

## Pages
- `/` landing page in English, मराठी and हिंदी (switch in the header)
- `/join` join flow: details → ₹499 payment (Razorpay link) → welcome with the Malak Card
- `/round/solar-nagpur` Round 1: rooftop solar, live opt-in count, opt-in by phone or WhatsApp YES
- `/desk` founder desk (password): members, paid status, opt-ins, members by area, WhatsApp payment reminders, CSV export
- `/privacy`, `robots.txt`, `sitemap.xml`

## APIs
- `POST /api/register` saves a member (id = 10-digit mobile)
- `POST /api/optin` opts a member in to the current round
- `GET /api/stats` public member and opt-in counts
- `POST /api/razorpay/webhook` marks a member paid when Razorpay sends `payment.captured` (matched by mobile number)
- `/api/desk/*` login, data, mark paid, CSV export (signed cookie)

## Settings
Copy `.env.example` and fill it in. On Hostinger set these as the website's environment variables:
- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK` (public; rebuild after changing)
- `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (tables are created on first use)
- `DESK_PASSWORD`, `SESSION_SECRET` (32+ random characters), `RAZORPAY_WEBHOOK_SECRET`

Without `DB_NAME` the app saves to `data/store.json`, which is for testing only.

## Change the round
Edit `currentRound` in `lib/config.ts` (dates, target homes). Copy in `lib/i18n.ts`; Marathi and Hindi drafts need a native speaker's review.

## Run locally
```
npm install
npm run dev
```
