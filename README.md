# LinguaForge — English + Chinese Learning Fullstack

Production-oriented starter for a bilingual language-learning app with pronunciation, grammar, dictionary, flashcards, quizzes, dialogues, and AI speaking.

## What is included
- Next.js frontend with colorful textured UI, motion-ready component architecture, sound-feedback hooks, language split (Chinese / English)
- FastAPI backend with REST + WebSocket endpoints
- Dataset validation pipeline designed to reject duplicates, missing provenance and fabricated entries
- Seed/sample content for every module
- Docker Compose for PostgreSQL + Redis
- AI/audio integration points using OpenAI APIs via environment variables
- 10-pass review report and implementation roadmap

## Important data integrity note
The repository does **not pretend** to contain 10,000 verified Chinese + 10,000 verified English dictionary records or 2,000 verified dialogues without licensed/provenance-checked source datasets. Instead it contains import schemas, validators, provenance fields and seed data. Use `pipelines/import_*.py` to load sourced corpora and pass validation before publishing.

## Quick start
1. Copy `.env.example` to `.env` and fill secrets.
2. Start infra: `docker compose up -d postgres redis`
3. Backend: `cd backend && python -m venv .venv && source .venv/bin/activate` (Windows: `.venv\Scripts\activate`) then `pip install -r requirements.txt` and `uvicorn app.main:app --reload --port 8000`
4. Frontend: `cd frontend && npm install && npm run dev`
5. Open `http://localhost:3000`.

See `docs/RUN_PLAN.md`, `docs/MASTER_PROMPT.md`, and `docs/REVIEW_10_PASSES.md`.
