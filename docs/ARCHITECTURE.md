# LinguaForge — System Architecture & Data Model Documentation

## 1. Overview
**LinguaForge** is a dual Chinese (Hanzi + Pinyin + Vietnamese) and English (English + IPA + Vietnamese) Language Learning Operating System built for scalability, zero hallucination, SRS memory optimization, and realtime AI voice interaction.

---

## 2. Component Diagram

```
+-------------------------------------------------------------------------+
|                      Frontend (Next.js 14 App Router)                    |
|  +------------------+  +------------------+  +-----------------------+  |
|  | PronunciationLab |  |   GrammarHub     |  |   DictionaryEngine    |  |
|  +------------------+  +------------------+  +-----------------------+  |
|  |  FlashcardsSRS   |  |   AdaptiveQuiz   |  |   DialogueTheater     |  |
|  +------------------+  +------------------+  +-----------------------+  |
|  |  AISpeakingRoom  |  | Web Audio Engine |  | Three.js Background 3D|  |
|  +------------------+  +------------------+  +-----------------------+  |
+------------------------------------+------------------------------------+
                                     | REST / WebSocket
                                     v
+-------------------------------------------------------------------------+
|                       Backend (FastAPI + Python 3.11)                   |
|  +------------------+  +------------------+  +-----------------------+  |
|  |  API Routers     |  | SRS SM-2 Engine  |  | Data Ingest Validator |  |
|  +------------------+  +------------------+  +-----------------------+  |
|  | AI Tutor Bridge  |  | Error Notebook   |  | Audit Metrics Engine  |  |
|  +------------------+  +------------------+  +-----------------------+  |
+-------------------+--------------------+--------------------------------+
                    |                    |
                    v                    v
         +--------------------+  +---------------+
         | PostgreSQL / SQLite|  |  Redis Cache  |
         +--------------------+  +---------------+
```

---

## 3. Data Integrity & Anti-Hallucination Pipeline
- **Exact Hash Deduplication**: Normalized SHA-256 keys prevent identical terms from duplicating.
- **Mandatory Provenance**: Every entry must include `provenance` / `source` attribution tag.
- **Pinyin & IPA Enforcement**: Chinese vocabulary missing Pinyin or English missing IPA is rejected.
- **Two-Hanzi Word Collection (`two_hanzi_words`)**: Separate dedicated collection for authentic 2-character Chinese words without altering the general dictionary (which supports 1, 2, 3, 4 characters, idioms, and phrases).

---

## 4. Key Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check status |
| `/api/pronunciation/{lang}` | GET | Returns full Pinyin/IPA pronunciation units |
| `/api/grammar/{lang}` | GET | Returns HSK/CEFR level-based grammar curriculum |
| `/api/dictionary/{lang}` | GET | Searchable dictionary with filters & pagination |
| `/api/dictionary/two_hanzi` | GET | Returns authentic 2-character Chinese word collection |
| `/api/flashcards/{lang}` | GET | Fetches SRS queue cards |
| `/api/flashcards/review` | POST | Updates card interval via SuperMemo SM-2 algorithm |
| `/api/quiz/{lang}` | GET | Returns adaptive quiz questions |
| `/api/quiz/submit` | POST | Evaluates answers & auto-logs wrong answers to Error Notebook |
| `/api/dialogues/{lang}` | GET | Returns multi-speaker workplace dialogue scenarios |
| `/api/ai/chat` | POST | AI Voice/Chat Tutor with grammar correction |
| `/ws/speaking` | WebSocket | Realtime audio stream bridge |
| `/api/errors` | GET | Fetches user's Error Notebook history |
| `/api/pipeline/audit` | GET | Exports data quality audit report and verified counts |
