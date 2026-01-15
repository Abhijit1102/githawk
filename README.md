# GitHawk

GitHawk is a hobby project and a GitHub-focused alternative to CodeRabbit.  
It is a full-stack app built with **Next.js**, **FastAPI**, **Better Auth**, **Pinecone**, and **Polar**, providing GitHub authentication, AI embeddings, and subscription management.

---

## Features

- GitHub authentication with Better Auth
- AI-powered embeddings using Pinecone
- Payment and subscription management via Polar
- Full-stack architecture with PostgreSQL and Next.js
- Supports AI generation via Google Generative AI (Gemini API)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Abhijit1102/githawk.git
cd githawk
```
## 2. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend (if separate)
cd backend
npm install

```
## 3. Setup Environment Variables

- Create a `.env` file in the root directory and add the following variables:

```bash# Postgres Config
DATABASE_URL=""

# Better Auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_AUTH_CLIENT_ID=""
GITHUB_AUTH_CLIENT_SECRET="70cfab7c7621ff6f"

BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_BASE_URL="http://localhost:3000"

# Pinecone
PINECONE_VECTOR_DB_URL="https://githawk-embeddings-c7uf8l2.pinecone.io"
PINECONE_API_KEY="pcsk_7KRMRs_BSvigNDkiN2Y7Xkzn5BQ4oANdSeaJbHr66apRu2"

# Google Generative AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyDQ7UH4fX"

# Polar (Subscriptions & Payments)
POLAR_ACCESS_TOKEN="polar_oat_FKVBMKGt0uJGGNpci3o9tqYR18OIGy"
POLAR_SUCCESS_URL="https://githawk.vercel.app"
POLAR_WEBHOOK_SECRET="polar_whs_GS8IIfxpWVaYGd8IXbL8O06jdhV"

# Inngest (Event Handling)
INNGEST_EVENT_KEY="zpWxjLkTbU-LGDbPm4KtBtdM7ro9mPo1ujnJfEO3d1O6FZeWMgutyQ"
INNGEST_SIGNING_KEY="signkey-prod-bb98eedea378e5e0b1f22dbfb9abe03dcc4cf7d4eda"

```
# 4. Run the App
```bash
# Frontend
npm run dev

# Backend (if separate)
npm run dev
```

## Tech Stack

 - Frontend: Next.js, React, Tailwind CSS
 - Backend: Node.js, FastAPI (optional)
 - Database: PostgreSQL
 - Authentication: Better Auth
 - AI & Embeddings: Pinecone, Google Gemini
 - Payments: Polar
 - Event Handling: Inngest

## License

- MIT License © 2026 [Abhijit Rajkumar]
---

If you want, I can also make a **fancier version with badges, emojis, and a “quick start for GitHawk” section** like many GitHub hobby projects, which looks very appealing at a glance.  

Do you want me to do that too?

