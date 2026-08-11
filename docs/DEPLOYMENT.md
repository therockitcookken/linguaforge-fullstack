# LinguaForge — Deployment Guide

## Local Development (Docker-free)
1. **Prerequisites**: Node.js 20+, Python 3.11+.
2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Access app at `http://localhost:3000` and API docs at `http://localhost:8000/docs`.

---

## Production Containerized Deployment (Docker Compose)
1. Configure environment variables in `.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/linguaforge
   REDIS_URL=redis://redis:6379/0
   ```
2. Build and launch all services:
   ```bash
   docker compose up --build -d
   ```
3. Run automated tests to verify deployment:
   ```bash
   py -m pytest tests/
   ```
