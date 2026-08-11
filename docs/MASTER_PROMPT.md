# MASTER BUILD PROMPT — FULL ENGLISH + CHINESE LEARNING APP

Bạn là Principal Full-Stack Engineer + Product Designer + Language Data Engineer + QA Lead. Hãy xây dựng một monorepo production-grade cho app học **Tiếng Trung + Tiếng Anh**, không tạo demo rỗng, không giả dữ liệu.

## 1) Kiến trúc bắt buộc
- Frontend: Next.js App Router + TypeScript, responsive desktop/tablet/mobile.
- UI: component system rõ ràng; Framer Motion cho animation; Three.js/React Three Fiber + Drei cho texture/3D ambient scene; icon library; Zustand cho client state; Web Audio API/Howler-compatible layer cho feedback sounds.
- Backend: FastAPI, REST + WebSocket, PostgreSQL, Redis, object storage abstraction cho audio.
- AI/audio provider đặt sau service interface; OpenAI Realtime cho speaking realtime, speech API cho TTS, transcription API cho STT; không lộ API key ở browser.
- Docker Compose, `.env.example`, migrations, seed, unit/integration/e2e test structure, CI-ready scripts, logging, rate limiting và error handling.

## 2) Module Phát âm
### Chinese
- Full Pinyin inventory: initials, finals, combinations, 4 tones + neutral tone; quy tắc biến điệu cơ bản; từng âm có audio chuẩn Mandarin, khẩu hình/mô tả, từ ví dụ, Pinyin, Hanzi, nghĩa Việt.
- Recorder, playback, waveform, speed control, shadowing, minimal contrast, score history, favorite, error notebook.
### English
- Full IPA inventory cho accent mục tiêu được cấu hình; vowel/consonant chart, stress, linking, weak forms, minimal pairs; example + IPA + Vietnamese + audio.
- Recorder/shadowing/playback/speed/waveform/history tương tự Chinese.

## 3) Module Ngữ pháp
- Tách Chinese và English.
- Bao phủ grammar curriculum Chinese từ beginner đến HSK1–HSK6 và English A2–C1.
- Mỗi lesson: title, level, explanation_vi, structure, usage, pitfalls, 3–8 examples, audio từng example/đoạn, exercises, answer/explanation, related lessons.
- Chinese example bắt buộc Hanzi + Pinyin + Vietnamese. English example bắt buộc English + Vietnamese; IPA khi phù hợp với pronunciation focus.

## 4) Module Từ điển
- Mục tiêu 10,000 verified Chinese records + 10,000 verified English records.
- Chủ đề: đời sống, giao tiếp, công xưởng, giao tiếp công xưởng, văn phòng; Chinese HSK1–HSK6; English A2–C1.
- **Không bịa, không duplicate, không ghép cơ học các từ đơn để đạt quota.** Mỗi record phải có provenance/source/license/review status.
- Chinese: term, simplified/traditional khi có, pinyin có tone mark + numeric tone normalized, Vietnamese, POS, level, topic, example zh+pinyin+vi, synonyms/antonyms khi thực sự tồn tại.
- English: term, IPA, Vietnamese, POS, CEFR, topic, example en+vi, synonyms/antonyms khi thực sự tồn tại.
- Nếu cần collection “từ 2 chữ”, tạo collection riêng chỉ nhận lexical item đúng 2 Hanzi; **không ép toàn bộ tiếng Trung thành 2 chữ**.
- Pipeline: ingest -> normalize -> exact dedupe -> variant dedupe -> semantic QA -> source/license QA -> publish. Reject record thiếu nguồn hoặc đáng ngờ.

## 5) Flashcard
- Tách Chinese/English; lấy canonical records từ Dictionary, không copy dữ liệu riêng.
- SRS scheduling, due queue, Again/Hard/Good/Easy, audio, type-answer, reverse card, favorites, tags, mastery, streak, stats.

## 6) Quiz
- Tách Chinese/English. Multiple choice, typing, listening, dictation, sentence order, grammar correction, fill blank, pronunciation challenge.
- Adaptive difficulty, level/topic filters, explanations, retry mistakes, question bank provenance, anti-repeat policy.

## 7) 2,000 đoạn hội thoại / ngôn ngữ
- Chinese 2,000 + English 2,000; không tự bịa để lấp quota. Chỉ publish corpus có provenance/review.
- Chủ đề: đời sống, nhà máy, dây chuyền, QC, kho, an toàn, bảo trì, họp, email, văn phòng, phỏng vấn, logistics, xử lý sự cố.
- Chinese mỗi line: speaker, Hanzi, Pinyin, Vietnamese, audio. English mỗi line: speaker, English, Vietnamese, optional IPA focus, audio.
- Role-play, hide translation, repeat line, speed, loop, shadowing, record, compare, vocabulary extraction, quiz from dialogue.

## 8) Nói với AI
- Realtime voice conversation; scenarios by language/level/topic/role.
- Mic permissions, push-to-talk + VAD option, live transcript, AI voice, replay, correction cards, grammar/vocabulary/pronunciation feedback, session summary, saved mistakes.
- Server issues ephemeral/realtime credentials when needed; API key remains server-side; quotas/rate limits and graceful fallback.

## 9) Visual system
- Không giao diện SaaS công nghiệp đại trà. Thiết kế trẻ, cá tính, nhiều màu nhưng kiểm soát contrast.
- Layered gradients + procedural texture + subtle 3D ambient objects, parallax, depth cards, soft glass, tactile buttons, animated progress, hover tilt, page transitions.
- Sound design: soft tap, success, error, streak, flip-card; có master mute + volume; không autoplay khó chịu.
- 3D phải progressive-enhancement: tắt/giảm trên low-power/reduced-motion.

## 10) Data engineering & chống giả
- Mọi corpus record có `source_id`, `source_url_or_name`, `license`, `import_batch`, `review_status`, `normalized_key`.
- Viết validators cho duplicate, missing translation/pinyin/IPA, suspicious generated patterns, malformed levels, forbidden synthetic compounds.
- Không báo “đã đủ 10k/2k” nếu pipeline chưa chứng minh count hợp lệ. Xuất audit report counts accepted/rejected/reasons.

## 11) QA — bắt buộc review 10 vòng
Sau khi code xong, tự review 10 vòng theo: architecture, UX navigation, pronunciation completeness, grammar completeness, dictionary integrity, flashcard/quiz consistency, dialogue integrity, AI realtime/audio, accessibility/performance, security/deployment. Mỗi vòng: tìm lỗi -> sửa -> chạy test/lint/build -> ghi changelog. Lặp tới khi không còn blocker.

## 12) Deliverables
- Full frontend/backend source; migrations; Docker; tests; data schemas/importers/validators; README; env example; architecture/data docs; run/deploy guide; 10-pass QA report.
- Xuất ZIP dự án.
- Cuối cùng báo chính xác phần nào production-ready, phần nào scaffold, số lượng corpus **đã xác minh thực tế** thay vì claim theo mục tiêu.
