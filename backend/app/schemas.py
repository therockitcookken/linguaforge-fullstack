from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

class SynonymItem(BaseModel):
    term: str
    pinyin: Optional[str] = None
    ipa: Optional[str] = None
    meaning_vi: str

class AntonymItem(BaseModel):
    term: str
    pinyin: Optional[str] = None
    ipa: Optional[str] = None
    meaning_vi: str

class VocabularyBase(BaseModel):
    lang: str
    term: str
    pinyin: Optional[str] = None
    pinyin_numeric: Optional[str] = None
    ipa: Optional[str] = None
    pos: str
    level: str
    topic: str
    synonyms: Optional[List[Any]] = None
    antonyms: Optional[List[Any]] = None
    audio_url: Optional[str] = None
    provenance: str
    license: str = "CC-BY-4.0"
    review_status: str = "verified"

class VocabularyCreate(VocabularyBase):
    meaning_vi: str
    example_sentence: Optional[str] = None
    example_pinyin: Optional[str] = None
    example_vi: Optional[str] = None

class VocabularyOut(VocabularyBase):
    id: int
    meaning_vi: Optional[str] = None
    examples: List[Any] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TwoHanziWordOut(BaseModel):
    id: int
    hanzi: str
    pinyin: str
    meaning_vi: str
    topic: str
    hsk_level: str
    provenance: str
    model_config = ConfigDict(from_attributes=True)

class PronunciationUnitOut(BaseModel):
    id: int
    lang: str
    category: str
    symbol: str
    ipa_or_pinyin: str
    mouth_guide_vi: str
    example_term: str
    example_annotation: Optional[str] = None
    example_vi: str
    audio_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class GrammarExampleOut(BaseModel):
    id: int
    sentence: str
    pinyin: Optional[str] = None
    translation_vi: str
    audio_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class GrammarExerciseOut(BaseModel):
    id: int
    question: str
    options: Optional[List[str]] = None
    answer: str
    explanation_vi: str
    model_config = ConfigDict(from_attributes=True)

class GrammarLessonOut(BaseModel):
    id: int
    lang: str
    title: str
    level: str
    structure: str
    explanation_vi: str
    usage: str
    common_mistakes: Optional[str] = None
    notes: Optional[str] = None
    examples: List[GrammarExampleOut] = []
    exercises: List[GrammarExerciseOut] = []
    model_config = ConfigDict(from_attributes=True)

class FlashcardReviewIn(BaseModel):
    flashcard_id: int
    rating: str

class FlashcardOut(BaseModel):
    id: int
    vocab_id: int
    lang: str
    interval: int
    ease_factor: float
    repetitions: int
    due_date: datetime
    mastery_score: float
    vocabulary: Optional[VocabularyOut] = None
    model_config = ConfigDict(from_attributes=True)

class QuizQuestionOut(BaseModel):
    id: int
    lang: str
    qtype: str
    level: str
    topic: str
    question_text: str
    pinyin: Optional[str] = None
    audio_url: Optional[str] = None
    options: Optional[List[str]] = None
    explanation_vi: str
    model_config = ConfigDict(from_attributes=True)

class QuizSubmitIn(BaseModel):
    question_id: int
    user_answer: str

class QuizSubmitOut(BaseModel):
    is_correct: bool
    correct_answer: str
    explanation_vi: str

class DialogueLineOut(BaseModel):
    id: int
    order_index: int
    speaker: str
    text: str
    pinyin: Optional[str] = None
    translation_vi: str
    audio_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class DialogueOut(BaseModel):
    id: int
    lang: str
    title: str
    topic: str
    level: str
    scene_description: str
    provenance: str
    lines: List[DialogueLineOut] = []
    model_config = ConfigDict(from_attributes=True)

class AIChatIn(BaseModel):
    language: str = "zh"
    scenario: str = "general"
    message: str
    level: str = "intermediate"

class AIChatOut(BaseModel):
    reply: str
    corrections: List[str] = []
    mode: str = "live"
    session_id: Optional[int] = None

class ErrorNotebookItem(BaseModel):
    id: int
    lang: str
    module_source: str
    prompt_context: str
    user_answer: str
    correct_answer: str
    explanation_vi: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuditReportOut(BaseModel):
    import_batch: str
    source_name: str
    total_records: int
    accepted_count: int
    rejected_count: int
    duplicate_count: int
    missing_provenance_count: int
    verified_chinese_count: int
    verified_english_count: int
    verified_dialogue_count: int
