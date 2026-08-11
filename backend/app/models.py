import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    native_lang = Column(String, default="vi")
    target_lang = Column(String, default="zh")
    hsk_target = Column(String, default="HSK3")
    cefr_target = Column(String, default="B1")
    daily_goal_minutes = Column(Integer, default=15)
    streak_days = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Language(Base):
    __tablename__ = "languages"

    code = Column(String, primary_key=True)  # 'zh', 'en', 'vi'
    name = Column(String, nullable=False)
    flag = Column(String)

class Vocabulary(Base):
    __tablename__ = "vocabulary"

    id = Column(Integer, primary_key=True, index=True)
    lang = Column(String, index=True, nullable=False)  # 'zh' or 'en'
    term = Column(String, index=True, nullable=False)
    pinyin = Column(String, index=True, nullable=True)  # For Chinese
    pinyin_numeric = Column(String, nullable=True)
    ipa = Column(String, index=True, nullable=True)     # For English
    pos = Column(String, nullable=False)                 # Part of speech
    level = Column(String, index=True, nullable=False)  # HSK1-6 or A2-C1
    topic = Column(String, index=True, nullable=False)  # factory, qc, safety, office, etc.
    audio_url = Column(String, nullable=True)
    provenance = Column(String, nullable=False)         # Source ID / License tag
    license = Column(String, default="CC-BY-4.0")
    review_status = Column(String, default="verified")  # verified / pending
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    translations = relationship("VocabularyTranslation", back_populates="vocabulary")
    examples = relationship("VocabularyExample", back_populates="vocabulary")

class VocabularyTranslation(Base):
    __tablename__ = "vocabulary_translations"

    id = Column(Integer, primary_key=True, index=True)
    vocab_id = Column(Integer, ForeignKey("vocabulary.id"))
    target_lang = Column(String, default="vi")
    meaning = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)

    vocabulary = relationship("Vocabulary", back_populates="translations")

class VocabularyExample(Base):
    __tablename__ = "vocabulary_examples"

    id = Column(Integer, primary_key=True, index=True)
    vocab_id = Column(Integer, ForeignKey("vocabulary.id"))
    sentence = Column(Text, nullable=False)
    pinyin = Column(Text, nullable=True)
    translation_vi = Column(Text, nullable=False)
    audio_url = Column(String, nullable=True)

    vocabulary = relationship("Vocabulary", back_populates="examples")

class VocabularyRelation(Base):
    __tablename__ = "vocabulary_relations"

    id = Column(Integer, primary_key=True, index=True)
    vocab_id = Column(Integer, ForeignKey("vocabulary.id"))
    related_vocab_id = Column(Integer, ForeignKey("vocabulary.id"))
    relation_type = Column(String)  # synonym / antonym / related

class TwoHanziWord(Base):
    __tablename__ = "two_hanzi_words"

    id = Column(Integer, primary_key=True, index=True)
    hanzi = Column(String(2), unique=True, index=True, nullable=False)
    pinyin = Column(String, nullable=False)
    meaning_vi = Column(Text, nullable=False)
    topic = Column(String, nullable=False)
    hsk_level = Column(String, nullable=False)
    provenance = Column(String, nullable=False)

class PronunciationUnit(Base):
    __tablename__ = "pronunciation_units"

    id = Column(Integer, primary_key=True, index=True)
    lang = Column(String, index=True, nullable=False)  # 'zh' or 'en'
    category = Column(String, nullable=False)          # initials, finals, tones, vowels, consonants, stress
    symbol = Column(String, nullable=False)
    ipa_or_pinyin = Column(String, nullable=False)
    mouth_guide_vi = Column(Text, nullable=False)
    example_term = Column(String, nullable=False)
    example_annotation = Column(String, nullable=True) # Pinyin or IPA of example
    example_vi = Column(String, nullable=False)
    audio_url = Column(String, nullable=True)

class GrammarLesson(Base):
    __tablename__ = "grammar_lessons"

    id = Column(Integer, primary_key=True, index=True)
    lang = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    level = Column(String, nullable=False)  # HSK1-6 or A2-C1
    structure = Column(Text, nullable=False)
    explanation_vi = Column(Text, nullable=False)
    usage = Column(Text, nullable=False)
    common_mistakes = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    examples = relationship("GrammarExample", back_populates="lesson")
    exercises = relationship("GrammarExercise", back_populates="lesson")

class GrammarExample(Base):
    __tablename__ = "grammar_examples"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("grammar_lessons.id"))
    sentence = Column(Text, nullable=False)
    pinyin = Column(Text, nullable=True)
    translation_vi = Column(Text, nullable=False)
    audio_url = Column(String, nullable=True)

    lesson = relationship("GrammarLesson", back_populates="examples")

class GrammarExercise(Base):
    __tablename__ = "grammar_exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("grammar_lessons.id"))
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  # List of choices if multiple choice
    answer = Column(Text, nullable=False)
    explanation_vi = Column(Text, nullable=False)

    lesson = relationship("GrammarLesson", back_populates="exercises")

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    vocab_id = Column(Integer, ForeignKey("vocabulary.id"))
    lang = Column(String, nullable=False)
    interval = Column(Integer, default=1)      # Days until next review
    ease_factor = Column(Float, default=2.5)   # SRS SM-2 Ease Factor
    repetitions = Column(Integer, default=0)
    due_date = Column(DateTime, default=datetime.datetime.utcnow)
    mastery_score = Column(Float, default=0.0)

class FlashcardReview(Base):
    __tablename__ = "flashcard_reviews"

    id = Column(Integer, primary_key=True, index=True)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id"))
    rating = Column(String, nullable=False) # Again, Hard, Good, Easy
    reviewed_at = Column(DateTime, default=datetime.datetime.utcnow)

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    lang = Column(String, nullable=False)
    qtype = Column(String, nullable=False) # mc, typing, listening, dictation, word_order, grammar_fix
    level = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    pinyin = Column(Text, nullable=True)
    audio_url = Column(String, nullable=True)
    options = Column(JSON, nullable=True)
    correct_answer = Column(Text, nullable=False)
    explanation_vi = Column(Text, nullable=False)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    lang = Column(String, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    score_pct = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Dialogue(Base):
    __tablename__ = "dialogues"

    id = Column(Integer, primary_key=True, index=True)
    lang = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    level = Column(String, nullable=False)
    scene_description = Column(Text, nullable=False)
    provenance = Column(String, nullable=False)

    lines = relationship("DialogueLine", back_populates="dialogue")

class DialogueLine(Base):
    __tablename__ = "dialogue_lines"

    id = Column(Integer, primary_key=True, index=True)
    dialogue_id = Column(Integer, ForeignKey("dialogues.id"))
    order_index = Column(Integer, nullable=False)
    speaker = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    pinyin = Column(Text, nullable=True)
    translation_vi = Column(Text, nullable=False)
    audio_url = Column(String, nullable=True)

    dialogue = relationship("Dialogue", back_populates="lines")

class AudioAsset(Base):
    __tablename__ = "audio_assets"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    lang = Column(String)
    file_path_or_url = Column(String, nullable=False)
    duration_sec = Column(Float, nullable=True)

class AISession(Base):
    __tablename__ = "ai_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    lang = Column(String, nullable=False)
    scenario = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("ai_sessions.id"))
    sender = Column(String, nullable=False) # user / assistant
    content = Column(Text, nullable=False)
    corrections = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LearningError(Base):
    __tablename__ = "learning_errors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    lang = Column(String, nullable=False)
    module_source = Column(String, nullable=False) # pronunciation, grammar, quiz, dialogue
    prompt_context = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    explanation_vi = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    item_type = Column(String, nullable=False) # vocab, lesson, dialogue, pronunciation
    item_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    lang = Column(String, nullable=False)
    module = Column(String, nullable=False)
    completed_units = Column(Integer, default=0)
    total_units = Column(Integer, default=0)
    score = Column(Float, default=0.0)

class SourceRecord(Base):
    __tablename__ = "source_records"

    id = Column(String, primary_key=True) # Hash key
    source_name = Column(String, nullable=False)
    license = Column(String, nullable=False)
    import_batch = Column(String, nullable=False)
    original_text = Column(Text, nullable=False)
    review_status = Column(String, default="verified")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ImportBatch(Base):
    __tablename__ = "import_batches"

    id = Column(String, primary_key=True)
    source_name = Column(String, nullable=False)
    total_records = Column(Integer, nullable=False)
    accepted_count = Column(Integer, nullable=False)
    rejected_count = Column(Integer, nullable=False)
    duplicate_count = Column(Integer, nullable=False)
    missing_provenance_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    details = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
