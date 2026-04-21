# Owey

Snap a receipt, split the bill. Upload a photo of a group receipt, each person taps what they ordered, and Owey calculates everyone's share (including tax and tip).

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- NextAuth (email + Google)
- Anthropic Claude for receipt OCR
- AWS S3 for receipt storage, App Runner + RDS for hosting

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command             | Description         |
| ------------------- | ------------------- |
| `npm run dev`       | Dev server          |
| `npm run build`     | Production build    |
| `npm run lint`      | ESLint              |
| `npm run typecheck` | TypeScript check    |
| `npm run format`    | Prettier            |

## License

MIT
