# Owey

> Snap a receipt. Split the bill.

Owey is a full-stack bill-splitting app that uses Claude AI to read receipt photos and automatically itemize them. Each person taps what they ordered, and Owey splits tax and tip proportionally, then generates a Venmo deep link to collect payment.

**Live demo:** [owey.vercel.app](https://owey.vercel.app)

---

## Features

- **AI receipt scanning** — upload a photo and Claude Vision extracts every line item automatically
- **Item-level claiming** — each person taps what they ordered. shared items split evenly between claimers
- **Proportional tax & tip** — each person's share of tax and tip scales with their subtotal
- **Venmo deep links** — one tap opens Venmo pre-filled with the correct amount and a note
- **Groups & members** — create groups and invite others by email
- **Live updates** — the itemization screen polls every 1.5 seconds so everyone sees claims in real time

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js (credentials) |
| ORM | Prisma |
| Database | PostgreSQL (AWS RDS) |
| File storage | AWS S3 |
| AI | Claude Vision API (Anthropic) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS account (S3 bucket)
- Anthropic API key

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/Jordan-Delp/owey.git
cd owey
npm install
```

2. Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
S3_BUCKET_NAME=...
ANTHROPIC_API_KEY=...
```

3. Run database migrations and start the dev server:

```bash
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. A user creates a group and uploads a receipt photo
2. The image is stored in S3 and sent to Claude Vision, which returns structured JSON of all line items
3. Group members open the receipt and tap the items they ordered
4. The app calculates each person's subtotal, then applies their proportional share of tax and tip
5. A Venmo deep link is generated for each person to pay the group organizer

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## License

MIT
