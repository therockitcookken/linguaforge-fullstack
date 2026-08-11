import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["ok"] is True

def test_pronunciation_endpoint():
    response = client.get("/api/pronunciation/zh")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(x["symbol"] == "b" for x in data)

def test_grammar_endpoint():
    response = client.get("/api/grammar/zh")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "把" in data[0]["title"]

def test_dictionary_endpoint():
    response = client.get("/api/dictionary/zh?q=安全")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["term"] == "安全"

def test_two_hanzi_endpoint():
    response = client.get("/api/dictionary/two_hanzi")
    assert response.status_code == 200
    data = response.json()
    items = data if isinstance(data, list) else data.get("items", [])
    assert len(items) > 0
    for item in items:
        assert len(item["hanzi"]) == 2

def test_flashcard_srs_review():
    cards = client.get("/api/flashcards/zh").json()
    assert len(cards) > 0
    card_id = cards[0]["id"]

    res = client.post("/api/flashcards/review", json={"flashcard_id": card_id, "rating": "Good"})
    assert res.status_code == 200
    out = res.json()
    assert out["status"] == "updated"
    assert out["next_interval_days"] >= 1

def test_quiz_submission_and_error_logging():
    questions = client.get("/api/quiz/zh").json()
    assert len(questions) > 0
    q_id = questions[0]["id"]

    res = client.post("/api/quiz/submit", json={"question_id": q_id, "user_answer": "WrongChoice"})
    assert res.status_code == 200
    assert res.json()["is_correct"] is False

    errors = client.get("/api/errors?lang=zh").json()
    assert len(errors) > 0

def test_dialogues_endpoint():
    res = client.get("/api/dialogues/zh")
    assert res.status_code == 200
    assert len(res.json()) > 0

def test_pipeline_audit_endpoint():
    res = client.get("/api/pipeline/audit")
    assert res.status_code == 200
    data = res.json()
    assert data["verified_chinese_count"] >= 1
    assert data["verified_english_count"] >= 1
