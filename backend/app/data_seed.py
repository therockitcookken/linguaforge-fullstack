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
    if db.query(Vocabulary).filter(Vocabulary.lang == "zh").first() is None:
        zh_words = [
            {
                "term": "安全", "pinyin": "ānquán", "pinyin_numeric": "an1quan2", "pos": "noun/adj", "level": "HSK3", "topic": "safety", "meaning_vi": "an toàn", "provenance": "provenance_hsk_factory_2026",
                "synonyms": [{"term": "平安", "pinyin": "píng'ān", "meaning_vi": "bình an, an toàn"}],
                "antonyms": [{"term": "危险", "pinyin": "wēixiǎn", "meaning_vi": "nguy hiểm"}],
                "ex_zh": "车间安全是第一位的。", "ex_py": "Chējiān ānquán shì dì yī wèi de.", "ex_vi": "An toàn nhà xưởng là ưu tiên hàng đầu."
            },
            {
                "term": "质量", "pinyin": "zhìliàng", "pinyin_numeric": "zhi4liang4", "pos": "noun", "level": "HSK3", "topic": "qc", "meaning_vi": "chất lượng", "provenance": "provenance_hsk_factory_2026",
                "synonyms": [{"term": "质检", "pinyin": "zhìjiǎn", "meaning_vi": "kiểm tra chất lượng"}],
                "antonyms": [{"term": "劣质", "pinyin": "lièzhì", "meaning_vi": "chất lượng kém"}],
                "ex_zh": "我们需要提高产品质量。", "ex_py": "Wǒmen xūyào tígāo chǎnpǐn zhìliàng.", "ex_vi": "Chúng ta cần nâng cao chất lượng sản phẩm."
            },
            {
                "term": "检查", "pinyin": "jiǎnchá", "pinyin_numeric": "jian3cha2", "pos": "verb", "level": "HSK3", "topic": "qc", "meaning_vi": "kiểm tra", "provenance": "provenance_hsk_factory_2026",
                "synonyms": [{"term": "检验", "pinyin": "jiǎnyàn", "meaning_vi": "kiểm nghiệm"}],
                "antonyms": [{"term": "忽略", "pinyin": "hūlüè", "meaning_vi": "bỏ sót, ngó lơ"}],
                "ex_zh": "QC组正在检查样品。", "ex_py": "QC zǔ zhèngzài jiǎnchá yàngpǐn.", "ex_vi": "Tổ QC đang kiểm tra mẫu."
            },
            {
                "term": "维护", "pinyin": "wéihù", "pinyin_numeric": "wei2hu4", "pos": "verb/noun", "level": "HSK4", "topic": "maintenance", "meaning_vi": "bảo trì", "provenance": "provenance_hsk_factory_2026", "synonyms": [{"term": "保养", "pinyin": "bǎoyǎng", "meaning_vi": "bảo dưỡng"}], "antonyms": [{"term": "破坏", "pinyin": "pòhuài", "meaning_vi": "phá hỏng"}], "ex_zh": "保养员每周维护设备。", "ex_py": "Bǎoyǎngyuán měizhōu wéihù shèbèi.", "ex_vi": "Nhân viên bảo dưỡng bảo trì thiết bị hàng tuần."
            },
            {
                "term": "仓库", "pinyin": "cāngkù", "pinyin_numeric": "cang1ku4", "pos": "noun", "level": "HSK3", "topic": "warehouse", "meaning_vi": "kho hàng", "provenance": "provenance_hsk_factory_2026", "synonyms": [{"term": "货仓", "pinyin": "huòcāng", "meaning_vi": "kho hàng hóa"}], "antonyms": [], "ex_zh": "原材料已盘点完毕存入仓库。", "ex_py": "Yuáncáiliào yǐ pándiǎn wánbì cúnrù cāngkù.", "ex_vi": "Nguyên vật liệu đã kiểm kê xong và nạp vào kho."
            },
            {
                "term": "交接", "pinyin": "jiāojiē", "pinyin_numeric": "jiao1jie1", "pos": "verb", "level": "HSK4", "topic": "office", "meaning_vi": "bàn giao", "provenance": "provenance_hsk_factory_2026", "synonyms": [{"term": "移交", "pinyin": "yíjiāo", "meaning_vi": "di chuyển bàn giao"}], "antonyms": [], "ex_zh": "早班和晚班顺利完成交接。", "ex_py": "Zǎobān hé wǎnbān shùnlì wánchéng jiāojiē.", "ex_vi": "Ca sáng và ca tối đã hoàn thành bàn giao suôn sẻ."
            }
        ]

        for w in zh_words:
            v = Vocabulary(
                lang="zh", term=w["term"], pinyin=w["pinyin"], pinyin_numeric=w["pinyin_numeric"],
                pos=w["pos"], level=w["level"], topic=w["topic"], synonyms=w["synonyms"], antonyms=w["antonyms"], provenance=w["provenance"]
            )
            db.add(v)
            db.flush()

            vt = VocabularyTranslation(vocab_id=v.id, target_lang="vi", meaning=w["meaning_vi"])
            db.add(vt)

            ve = VocabularyExample(vocab_id=v.id, sentence=w["ex_zh"], pinyin=w["ex_py"], translation_vi=w["ex_vi"])
            db.add(ve)

            fc = Flashcard(vocab_id=v.id, lang="zh", interval=1, ease_factor=2.5, repetitions=0)
            db.add(fc)

    # TwoHanziWord Seeding
    if db.query(TwoHanziWord).first() is None:
        th_words = [
            {"hanzi": "安全", "pinyin": "ānquán", "meaning_vi": "an toàn", "topic": "safety", "hsk_level": "HSK3", "provenance": "provenance_hsk_factory_2026"},
            {"hanzi": "质量", "pinyin": "zhìliàng", "meaning_vi": "chất lượng", "topic": "qc", "hsk_level": "HSK3", "provenance": "provenance_hsk_factory_2026"},
            {"hanzi": "检查", "pinyin": "jiǎnchá", "meaning_vi": "kiểm tra", "topic": "qc", "hsk_level": "HSK3", "provenance": "provenance_hsk_factory_2026"},
            {"hanzi": "维护", "pinyin": "wéihù", "meaning_vi": "bảo trì", "topic": "maintenance", "hsk_level": "HSK4", "provenance": "provenance_hsk_factory_2026"},
            {"hanzi": "仓库", "pinyin": "cāngkù", "meaning_vi": "kho hàng", "topic": "warehouse", "hsk_level": "HSK3", "provenance": "provenance_hsk_factory_2026"},
            {"hanzi": "交接", "pinyin": "jiāojiē", "meaning_vi": "bàn giao", "topic": "office", "hsk_level": "HSK4", "provenance": "provenance_hsk_factory_2026"},
        ]
        for th in th_words:
            db.add(TwoHanziWord(**th))

    # 4. English Vocabulary with Synonyms & Antonyms
    if db.query(Vocabulary).filter(Vocabulary.lang == "en").first() is None:
        en_words = [
            {
                "term": "inspection", "ipa": "/ɪnˈspekʃn/", "pos": "noun", "level": "B1", "topic": "qc", "meaning_vi": "sự kiểm tra", "provenance": "provenance_cefr_factory_2026",
                "synonyms": [{"term": "examination", "ipa": "/ɪɡˌzæmɪˈneɪʃn/", "meaning_vi": "sự xem xét/kiểm tra"}],
                "antonyms": [{"term": "neglect", "ipa": "/nɪˈɡlekt/", "meaning_vi": "sự bỏ sót"}],
                "ex_en": "Quality inspection is required before shipment.", "ex_vi": "Cần kiểm tra chất lượng trước khi giao hàng."
            },
            {
                "term": "maintenance", "ipa": "/ˈmeɪntənəns/", "pos": "noun", "level": "B2", "topic": "maintenance", "meaning_vi": "bảo trì, bảo dưỡng", "provenance": "provenance_cefr_factory_2026",
                "synonyms": [{"term": "servicing", "ipa": "/ˈsɜːvɪsɪŋ/", "meaning_vi": "sự bảo dưỡng"}],
                "antonyms": [{"term": "damage", "ipa": "/ˈdæmɪdʒ/", "meaning_vi": "sự phá hỏng"}],
                "ex_en": "The machine needs urgent maintenance.", "ex_vi": "Cỗ máy cần bảo trì gấp."
            },
            {
                "term": "inventory", "ipa": "/ˈɪnvəntri/", "pos": "noun", "level": "B1", "topic": "warehouse", "meaning_vi": "hàng tồn kho / kiểm kê", "provenance": "provenance_cefr_factory_2026",
                "synonyms": [{"term": "stock", "ipa": "/stɒk/", "meaning_vi": "hàng trong kho"}],
                "antonyms": [],
                "ex_en": "Warehouse staff updated the inventory list.", "ex_vi": "Nhân viên kho đã cập nhật danh sách kiểm kê."
            }
        ]

        for w in en_words:
            v = Vocabulary(
                lang="en", term=w["term"], ipa=w["ipa"], pos=w["pos"], level=w["level"],
                topic=w["topic"], synonyms=w["synonyms"], antonyms=w["antonyms"], provenance=w["provenance"]
            )
            db.add(v)
            db.flush()

            vt = VocabularyTranslation(vocab_id=v.id, target_lang="vi", meaning=w["meaning_vi"])
            db.add(vt)

            ve = VocabularyExample(vocab_id=v.id, sentence=w["ex_en"], translation_vi=w["ex_vi"])
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
