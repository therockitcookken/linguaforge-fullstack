'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, Award, Zap, CheckCircle2, Eye } from 'lucide-react';
import { uiSound } from '@/lib/sound';
import { useAppStore } from '@/lib/store';

export default function FlashcardsModule({ lang }: { lang: 'zh' | 'en' }) {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'standard' | 'audio_first' | 'typing'>('standard');
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState<string | null>(null);

  const { streakDays, incrementStreak } = useAppStore();

  useEffect(() => {
    fetchFlashcards();
  }, [lang]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/flashcards/${lang}`);
      const json = await res.json();
      setCards(json);
    } catch (e) {
      console.warn("API fallback for flashcards", e);
      const fallback = lang === 'zh' ? [
        { id: 1, vocab_id: 101, lang: 'zh', term: '安全', pinyin: 'ānquán', meaning_vi: 'an toàn', ease_factor: 2.5, mastery_score: 0.4, examples: [{ sentence: '车间安全是第一位的。', translation_vi: 'An toàn nhà xưởng là trên hết.' }] },
        { id: 2, vocab_id: 102, lang: 'zh', term: '质量', pinyin: 'zhìliàng', meaning_vi: 'chất lượng', ease_factor: 2.5, mastery_score: 0.6, examples: [{ sentence: '我们需要提高产品质量。', translation_vi: 'Chúng ta cần nâng cao chất lượng.' }] }
      ] : [
        { id: 3, vocab_id: 103, lang: 'en', term: 'inspection', ipa: '/ɪnˈspekʃn/', meaning_vi: 'sự kiểm tra', ease_factor: 2.5, mastery_score: 0.5, examples: [{ sentence: 'Quality inspection is required.', translation_vi: 'Cần kiểm tra chất lượng.' }] }
      ];
      setCards(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (rating: 'Again' | 'Hard' | 'Good' | 'Easy') => {
    uiSound(rating === 'Again' ? 'incorrect' : 'correct');
    const currentCard = cards[currentIndex];
    if (currentCard) {
      try {
        await fetch(`http://localhost:8000/api/flashcards/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flashcard_id: currentCard.id, rating })
        });
      } catch (e) {
        console.warn("Review sync fallback");
      }
    }

    if (rating === 'Good' || rating === 'Easy') {
      incrementStreak();
    }

    setFlipped(false);
    setTypingInput('');
    setTypingFeedback(null);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const speakText = (text: string) => {
    uiSound('click');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const current = cards[currentIndex];

  if (!current) {
    return (
      <div className="module-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Award size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
        <h2>Hoàn thành phiên ôn tập hôm nay!</h2>
        <p style={{ color: '#94a3b8', marginTop: '8px' }}>Tất cả thẻ SRS trong hàng đợi đã được ghi nhận.</p>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="module-title">Flashcard SRS SM-2 Engine</h2>
          <p className="module-subtitle">Ôn tập lặp lại ngắt quãng thông minh theo thuật toán SuperMemo-2.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="streak-badge">
            <Zap size={16} /> Streak: {streakDays} Ngày
          </span>
        </div>
      </div>

      {/* Learning Mode Switch */}
      <div className="filter-tabs" style={{ justifyContent: 'center' }}>
        <button
          className={`filter-chip ${mode === 'standard' ? 'active' : ''}`}
          onClick={() => { setMode('standard'); uiSound('click'); }}
        >
          Lật Thẻ 3D Chắc Chắn
        </button>
        <button
          className={`filter-chip ${mode === 'audio_first' ? 'active' : ''}`}
          onClick={() => { setMode('audio_first'); uiSound('click'); }}
        >
          Nghe Tiếng Trước (Audio Card)
        </button>
        <button
          className={`filter-chip ${mode === 'typing' ? 'active' : ''}`}
          onClick={() => { setMode('typing'); uiSound('click'); }}
        >
          Gõ Phím Kiểm Tra (Typing Test)
        </button>
      </div>

      {/* Progress & Queue Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '14px', maxWidth: '540px', margin: '16px auto 0' }}>
        <span>Thẻ {currentIndex + 1} / {cards.length}</span>
        <span>Mức thạo: {Math.round((current.mastery_score || 0.5) * 100)}%</span>
      </div>

      {/* 3D Flip Card */}
      <div
        className={`flashcard-container ${flipped ? 'flipped' : ''}`}
        onClick={() => {
          setFlipped(!flipped);
          uiSound('flip');
        }}
      >
        <div className="flashcard-inner">
          {/* FRONT SIDE */}
          <div className="flashcard-front">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-tag">{lang === 'zh' ? 'Hanzi ↔ Pinyin' : 'English ↔ IPA'}</span>
              <button
                className="play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(current.term);
                }}
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: '#fff' }}>
                {mode === 'audio_first' ? '🔊 (Bấm nghe âm thanh)' : current.term}
              </div>
              {mode !== 'audio_first' && (
                <div style={{ fontSize: '20px', color: '#0ea5e9', marginTop: '8px' }}>
                  {lang === 'zh' ? current.pinyin : current.ipa}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Eye size={14} /> Bấm để lật xem mặt sau
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="flashcard-back">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>Nghĩa Tiếng Việt</span>
              <button
                className="play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(current.term);
                }}
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>
                {current.meaning_vi}
              </div>
              <div style={{ fontSize: '16px', color: '#8b5cf6', marginTop: '6px' }}>
                {current.term} ({lang === 'zh' ? current.pinyin : current.ipa})
              </div>

              {current.examples && current.examples.length > 0 && (
                <div style={{ marginTop: '16px', background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '12px', fontSize: '13px', color: '#cbd5e1' }}>
                  <div>"{current.examples[0].sentence}"</div>
                  <div style={{ color: '#94a3b8', marginTop: '2px' }}>{current.examples[0].translation_vi}</div>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              Đánh giá mức độ ghi nhớ của bạn bên dưới 👇
            </div>
          </div>
        </div>
      </div>

      {/* SRS Answer Buttons */}
      <div className="srs-buttons" style={{ maxWidth: '540px', margin: '0 auto' }}>
        <button className="srs-btn srs-again" onClick={() => handleReview('Again')}>
          Quên (Again)
        </button>
        <button className="srs-btn srs-hard" onClick={() => handleReview('Hard')}>
          Khó (Hard)
        </button>
        <button className="srs-btn srs-good" onClick={() => handleReview('Good')}>
          Nhớ tốt (Good)
        </button>
        <button className="srs-btn srs-easy" onClick={() => handleReview('Easy')}>
          Rất dễ (Easy)
        </button>
      </div>
    </div>
  );
}
