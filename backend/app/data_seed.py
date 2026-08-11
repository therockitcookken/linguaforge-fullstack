import json
from pathlib import Path
from sqlalchemy.orm import Session
from .models import (
    Vocabulary, VocabularyTranslation, VocabularyExample, TwoHanziWord,
    PronunciationUnit, GrammarLesson, GrammarExample, GrammarExercise,
    Dialogue, DialogueLine, Flashcard, QuizQuestion, Base
)
from .db import engine

def seed_database(db: Session):
    Base.metadata.create_all(bind=engine)

    # 1. Chinese Pronunciation Units
    if db.query(PronunciationUnit).filter(PronunciationUnit.lang == "zh").first() is None:
        zh_prons = [
            {"lang": "zh", "category": "initials", "symbol": "b", "ipa_or_pinyin": "b", "mouth_guide_vi": "Âm môi-môi, bật nhẹ không nổ, khép hai môi rồi mở ra.", "example_term": "爸爸", "example_annotation": "bàba", "example_vi": "bố"},
            {"lang": "zh", "category": "initials", "symbol": "p", "ipa_or_pinyin": "p", "mouth_guide_vi": "Âm môi-môi bật hơi mạnh. Khép hai môi, tích khí rồi bật nổ.", "example_term": "跑步", "example_annotation": "pǎobù", "example_vi": "chạy bộ"},
            {"lang": "zh", "category": "initials", "symbol": "zh", "ipa_or_pinyin": "zh", "mouth_guide_vi": "Âm uốn lưỡi, không bật hơi.", "example_term": "质量", "example_annotation": "zhìliàng", "example_vi": "chất lượng"},
            {"lang": "zh", "category": "tones", "symbol": "ā (Thanh 1)", "ipa_or_pinyin": "55 High Level", "mouth_guide_vi": "Thanh cao phẳng, giữ giọng ở tông cao nhất (5-5).", "example_term": "妈", "example_annotation": "mā", "example_vi": "mẹ"},
            {"lang": "zh", "category": "tones", "symbol": "ǎ (Thanh 3)", "ipa_or_pinyin": "214 Low Falling-Rising", "mouth_guide_vi": "Thanh trầm ngắt. Hạ giọng xuống thấp rồi nâng nhẹ lên (2-1-4).", "example_term": "马", "example_annotation": "mǎ", "example_vi": "con ngựa"},
        ]
        for pu in zh_prons:
            db.add(PronunciationUnit(**pu))

    # 2. English Pronunciation Units
    if db.query(PronunciationUnit).filter(PronunciationUnit.lang == "en").first() is None:
        en_prons = [
            {"lang": "en", "category": "vowels", "symbol": "/iː/", "ipa_or_pinyin": "/iː/", "mouth_guide_vi": "Nguyên âm dài, môi dẹt như đang mỉm cười.", "example_term": "machine", "example_annotation": "/məˈʃiːn/", "example_vi": "máy móc"},
            {"lang": "en", "category": "consonants", "symbol": "/θ/", "ipa_or_pinyin": "/θ/", "mouth_guide_vi": "Âm răng-lưỡi vô thanh.", "example_term": "thermal", "example_annotation": "/ˈθɜːrml/", "example_vi": "nhiệt lượng"},
        ]
        for pu in en_prons:
            db.add(PronunciationUnit(**pu))

    # 3. Chinese Vocabulary (80% 2-character Hanzi) with Synonyms & Antonyms
    zh_json_path = Path(__file__).parent.parent / "data" / "chinese_lexicon_10k.json"
    if db.query(Vocabulary).filter(Vocabulary.lang == "zh").count() < 100 and zh_json_path.exists():
        zh_words = json.loads(zh_json_path.read_text(encoding="utf-8"))
        for w in zh_words:
            v = Vocabulary(
                lang="zh", term=w["term"], pinyin=w.get("pinyin"), pinyin_numeric=w.get("pinyin_numeric"),
                pos=w.get("pos", "noun"), level=w.get("level", "HSK3"), topic=w.get("topic", "factory"),
                synonyms=w.get("synonyms"), antonyms=w.get("antonyms"), provenance=w.get("provenance", "provenance_hsk_factory_2026")
            )
            db.add(v)
            db.flush()

            vt = VocabularyTranslation(vocab_id=v.id, target_lang="vi", meaning=w["meaning_vi"])
            db.add(vt)

            if w.get("examples"):
                ex = w["examples"][0]
                ve = VocabularyExample(vocab_id=v.id, sentence=ex["sentence"], pinyin=ex.get("pinyin"), translation_vi=ex["translation_vi"])
                db.add(ve)

            fc = Flashcard(vocab_id=v.id, lang="zh", interval=1, ease_factor=2.5, repetitions=0)
            db.add(fc)

            # Auto-sync to TwoHanziWord if 2 characters long
            if len(w["term"]) == 2 and db.query(TwoHanziWord).filter(TwoHanziWord.hanzi == w["term"]).first() is None:
                th = TwoHanziWord(
                    hanzi=w["term"], pinyin=w["pinyin"], meaning_vi=w["meaning_vi"],
                    topic=w.get("topic", "factory"), hsk_level=w.get("level", "HSK3"),
                    provenance=w.get("provenance", "provenance_hsk_factory_2026")
                )
                db.add(th)

    # 4. English Vocabulary with Synonyms & Antonyms
    en_json_path = Path(__file__).parent.parent / "data" / "english_lexicon_10k.json"
    if db.query(Vocabulary).filter(Vocabulary.lang == "en").count() < 100 and en_json_path.exists():
        en_words = json.loads(en_json_path.read_text(encoding="utf-8"))
        for w in en_words:
            v = Vocabulary(
                lang="en", term=w["term"], ipa=w.get("ipa"), pos=w.get("pos", "noun"),
                level=w.get("level", "B1"), topic=w.get("topic", "factory"),
                synonyms=w.get("synonyms"), antonyms=w.get("antonyms"), provenance=w.get("provenance", "provenance_cefr_factory_2026")
            )
            db.add(v)
            db.flush()

            vt = VocabularyTranslation(vocab_id=v.id, target_lang="vi", meaning=w["meaning_vi"])
            db.add(vt)

            if w.get("examples"):
                ex = w["examples"][0]
                ve = VocabularyExample(vocab_id=v.id, sentence=ex["sentence"], translation_vi=ex["translation_vi"])
                db.add(ve)

            fc = Flashcard(vocab_id=v.id, lang="en", interval=1, ease_factor=2.5, repetitions=0)
            db.add(fc)

    # 5. Grammar Lessons
    if db.query(GrammarLesson).first() is None:
        zh_grammar = GrammarLesson(
            lang="zh", title="把字句 (Cấu trúc câu chữ 把)", level="HSK3",
            structure="Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác",
            explanation_vi="Dùng khi người nói muốn nhấn mạnh sự tác động của chủ ngữ làm thay đổi vị trí, trạng thái hoặc kết quả của tân ngữ.",
            usage="Tân ngữ phải là đối tượng xác định. Động từ không đứng đơn độc mà phải kèm kết quả.",
            common_mistakes="Lỗi sai: *我把书读 (thiếu bổ ngữ kết quả). Đúng: 我把书读完了。"
        )
        db.add(zh_grammar)
        db.flush()

        db.add(GrammarExample(lesson_id=zh_grammar.id, sentence="我把检验报告放在桌上了。", pinyin="Wǒ bǎ jiǎnyàn bàogào fàng zài zhuō shàng le.", translation_vi="Tôi đã đặt báo cáo kiểm nghiệm lên bàn rồi."))
        db.add(GrammarExercise(lesson_id=zh_grammar.id, question="Hoàn thành câu: 我把文件___ (Tôi đã gửi tài liệu đi).", options=["Sent", "寄出去了", "看", "放在"], answer="寄出去了", explanation_vi="Sau 把 + Tân ngữ phải có động từ + bổ ngữ hướng đi (寄出去了)."))

    # 6. Quiz Questions
    if db.query(QuizQuestion).first() is None:
        qq1 = QuizQuestion(
            lang="zh", qtype="mc", level="HSK3", topic="factory",
            question_text="Từ nào sau đây có nghĩa là 'chất lượng'?",
            options=["安全", "质量", "检查", "维护"],
            correct_answer="质量", explanation_vi="质量 (zhìliàng) có nghĩa là chất lượng."
        )
        db.add(qq1)

    # 7. Dialogues
    if db.query(Dialogue).first() is None:
        zh_dial = Dialogue(
            lang="zh", title="Bàn giao ca sản xuất (Shift Handover)", topic="factory", level="HSK3",
            scene_description="Trưởng ca sáng (A) và Trưởng ca tối (B) trao đổi về tình hình máy móc dây chuyền.",
            provenance="provenance_dialogue_zh_2026"
        )
        db.add(zh_dial)
        db.flush()

        db.add_all([
            DialogueLine(dialogue_id=zh_dial.id, order_index=1, speaker="A (Trưởng ca sáng)", text="今天二号生产线运转正常吗？", pinyin="Jīntiān èr hào shēngchǎnxiàn yùnzhuǎn zhèngcháng ma?", translation_vi="Hôm nay dây chuyền sản xuất số 2 hoạt động bình thường không?"),
            DialogueLine(dialogue_id=zh_dial.id, order_index=2, speaker="B (Trưởng ca tối)", text="总体正常，但是三号切片机有点小故障。", pinyin="Zǒngtǐ zhèngcháng, dànshì sān hào qiēpiànjī yǒudiǎn xiǎo gùzhàng.", translation_vi="Nhìn chung bình thường, nhưng máy cắt số 3 có trục trặc nhỏ.")
        ])

    db.commit()

if __name__ == "__main__":
    from .db import SessionLocal
    db = SessionLocal()
    seed_database(db)
    db.close()
