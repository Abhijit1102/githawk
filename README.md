# 🦅 GitHawk

> An open-source, AI-powered GitHub Pull Request reviewer — a hobby alternative to CodeRabbit.  
> Connect a repo, and GitHawk automatically reviews every PR with Gemini AI, posts inline comments, and generates a Mermaid diagram of the change flow.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-00A36C?style=flat-square)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## What GitHawk Does

When a pull request is opened on a connected GitHub repository, GitHawk:

1. **Fetches the PR diff** — title, description, and all file changes
2. **Retrieves codebase context** — semantic search over the indexed repo via Pinecone
3. **Generates an AI review** via Gemini 2.5 Flash including:
   - File-by-file walkthrough
   - Mermaid sequence diagram of the change flow
   - Strengths, issues, and concrete code suggestions
   - A short poem summarizing the PR ✨
4. **Posts the review as a GitHub comment** directly on the PR
5. **Saves the review** to your dashboard for future reference

---

## Features

- 🔐 **GitHub OAuth** via Better Auth — no manual token setup
- 🧠 **RAG-powered reviews** — Gemini sees relevant codebase context, not just the diff
- 📊 **Auto Mermaid diagrams** — visualizes the flow of every PR change
- 💳 **Subscription tiers** via Polar — monetize or gate features
- ⚡ **Event-driven pipeline** via Inngest — resilient, retryable, concurrent (up to 5 reviews at once)
- 🗄️ **Review history dashboard** — browse all past PR reviews per repository

---

## Architecture

```
GitHub Webhook (pr.opened)
        │
        ▼
  Next.js API Route
        │
        ├──► fires: pr.review.requested  ──────────────────────────────┐
        │                                                               │
        └──► fires: repository.connected (on first connect)            │
                        │                                              │
                        ▼                                              ▼
              ┌─────────────────────┐                ┌────────────────────────────┐
              │  Inngest: index-repo│                │ Inngest: generate-review   │
              │                     │                │                            │
              │ 1. fetch-files      │                │ 1. fetch-pr-diff           │
              │    (GitHub API)     │                │    (GitHub API)            │
              │                     │                │                            │
              │ 2. index-codebase   │                │ 2. retrieve-context        │
              │    (Pinecone embed) │                │    (Pinecone vector search) │
              └─────────────────────┘                │                            │
                        │                            │ 3. generate-ai-review      │
                        ▼                            │    (Gemini 2.5 Flash)      │
                  Pinecone Index                     │                            │
              owner/repo namespace                   │ 4. post-comment            │
                                                     │    (GitHub API)            │
                                                     │                            │
                                                     │ 5. save-review             │
                                                     │    (PostgreSQL / Prisma)   │
                                                     └────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+, React, Tailwind CSS |
| Backend | Next.js API Routes, FastAPI (optional Python services) |
| Database | PostgreSQL via Prisma |
| Authentication | Better Auth (GitHub OAuth provider) |
| AI Model | Google Gemini 2.5 Flash (`@ai-sdk/google`) |
| Vector Search | Pinecone (codebase embeddings for RAG context) |
| Event Pipeline | Inngest (background jobs, retries, concurrency) |
| Payments | Polar (subscriptions & webhook billing) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- [GitHub OAuth App](https://github.com/settings/developers)
- [Pinecone](https://pinecone.io) account
- [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- [Polar](https://polar.sh) account
- [Inngest](https://inngest.com) account (or local dev server)

### 1. Clone the repository

```bash
git clone https://github.com/Abhijit1102/githawk.git
cd githawk
```

### 2. Install dependencies

```bash
# Frontend / full-stack Next.js
npm install

# Python backend (if using FastAPI services)
cd backend
pip install -r requirements.txt
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# ── PostgreSQL ──────────────────────────────────────────
DATABASE_URL=""

# ── Better Auth ─────────────────────────────────────────
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_BASE_URL="http://localhost:3000"

# ── GitHub OAuth ─────────────────────────────────────────
# Create an OAuth App at https://github.com/settings/developers
# Callback URL: http://localhost:3000/api/auth/callback/github
GITHUB_AUTH_CLIENT_ID=""
GITHUB_AUTH_CLIENT_SECRET=""

# ── Pinecone ─────────────────────────────────────────────
PINECONE_VECTOR_DB_URL=""
PINECONE_API_KEY=""

# ── Google Generative AI (Gemini) ─────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY=""

# ── Polar (Payments) ─────────────────────────────────────
POLAR_ACCESS_TOKEN=""
POLAR_SUCCESS_URL="http://localhost:3000"
POLAR_WEBHOOK_SECRET=""

# ── Inngest ───────────────────────────────────────────────
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

> 🔑 **Never commit `.env.local`** — all keys above are secret. The `.gitignore` should exclude it by default.

### 4. Run database migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start the Inngest dev server

```bash
# In a separate terminal
npx inngest-cli@latest dev
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Inngest Functions

### `index-repo`  
**Trigger:** `repository.connected`

Runs when a user connects a new GitHub repository. Fetches all repository files via the GitHub API using the user's stored OAuth access token, then indexes them into Pinecone under the `owner/repo` namespace for later retrieval during reviews.

```
repository.connected
    └── fetch-files     (GitHub API → raw file contents)
    └── index-codebase  (embed + upsert → Pinecone)
```

### `generate-review`  
**Trigger:** `pr.review.requested` | **Concurrency:** 5

The main review pipeline. Fetches the PR diff, retrieves semantically relevant codebase context from Pinecone, sends everything to Gemini 2.5 Flash, posts the result as a GitHub PR comment, and saves the review to the database.

```
pr.review.requested
    └── fetch-pr-diff       (diff + title + description from GitHub API)
    └── retrieve-context    (vector search Pinecone by PR title+description)
    └── generate-ai-review  (Gemini 2.5 Flash — markdown review + Mermaid diagram)
    └── post-comment        (GitHub API → posts review on the PR)
    └── save-review         (Prisma → Review record in PostgreSQL)
```

---

## AI Review Format

Every generated review follows this structure:

| Section | Description |
|---|---|
| **Walkthrough** | File-by-file explanation of what changed and why |
| **Sequence Diagram** | Mermaid JS diagram of the change flow |
| **Summary** | One-paragraph overview of the PR |
| **Strengths** | What was done well |
| **Issues** | Bugs, security concerns, code smells |
| **Suggestions** | Specific, actionable code improvement examples |
| **Poem** | A short creative poem summarizing the PR 🎭 |

---

## Project Structure

```
githawk/
├── app/
│   ├── page.tsx                       # Landing / dashboard
│   ├── api/
│   │   ├── auth/                      # Better Auth routes
│   │   ├── webhook/github/            # GitHub webhook receiver
│   │   └── polar/webhook/             # Polar billing webhook
├── inngest/
│   ├── client.ts                      # Inngest client
│   └── functions/
│       ├── index-repo.ts              # Codebase indexing function
│       └── generate-review.ts         # PR review generation function
├── lib/
│   ├── db.ts                          # Prisma client singleton
│   └── module/
│       ├── github/lib/github.ts       # GitHub API helpers
│       └── ai/lib/rag.ts              # Pinecone embed + retrieval
├── prisma/
│   └── schema.prisma                  # Database schema
└── .env.local                         # Environment variables (not committed)
```

---

## GitHub OAuth App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set **Homepage URL** to `http://localhost:3000`
4. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
5. Copy the **Client ID** and generate a **Client Secret**
6. Add both to `.env.local`

For production, replace `localhost:3000` with your deployed domain.

---

## Deployment

| Service | Platform |
|---|---|
| Frontend + API Routes | [Vercel](https://vercel.com) |
| Database | [Supabase](https://supabase.com) or [Neon](https://neon.tech) |
| Inngest Workers | Inngest Cloud (auto-detected from Vercel) |
| Pinecone Index | Pinecone Cloud (Starter tier is free) |

---

## License

MIT License © 2026 [Abhijit Rajkumar](https://github.com/Abhijit1102)
