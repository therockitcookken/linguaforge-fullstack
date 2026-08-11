# Kế hoạch chạy app

## Local development
1. Cài Node.js >= 20.9, Python 3.11+, Docker Desktop.
2. `cp .env.example .env`.
3. `docker compose up -d postgres redis`.
4. Backend: tạo venv, `pip install -r backend/requirements.txt`, chạy `uvicorn backend.app.main:app --reload --port 8000` từ root (hoặc cd backend rồi `uvicorn app.main:app`).
5. Frontend: `cd frontend && npm install && npm run dev`.
6. Test health: mở `http://localhost:8000/health`; UI: `http://localhost:3000`.

## Production
- Frontend: deploy Vercel/container.
- Backend: container chạy Uvicorn/Gunicorn worker.
- PostgreSQL managed + Redis managed.
- Object storage/CDN cho audio cache.
- Secrets qua secret manager, không commit `.env`.
- Thêm auth, rate limits, audit log, moderation, cost quotas cho AI/audio.

## Data rollout
- Phase A: 500 verified records/language.
- Phase B: 2,000 verified records/language + 300 dialogues/language.
- Phase C: 10,000 verified records/language + 2,000 dialogues/language.
- Mỗi phase phải chạy validator, dedupe và provenance audit trước khi publish.
