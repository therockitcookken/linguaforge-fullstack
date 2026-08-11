'use client';

import React, { useState, useEffect } from 'react';
import { RotateCw, Volume2, Flame, Award, Check, Sparkles, Keyboard } from 'lucide-react';
import { uiSound } from '@/lib/sound';
import { useAppStore } from '@/lib/store';
import { API_BASE } from '@/lib/api';

export default function FlashcardsModule({ lang }: { lang: 'zh' | 'en' }) {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'standard' | 'audio' | 'typing'>('standard');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [typingResult, setTypingResult] = useState<boolean | null>(null);

  const { streakDays, incrementStreak } = useAppStore();

  useEffect(() => {
    fetchCards();
  }, [lang]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/flashcards/${lang}`);
      const json = await res.json();
      setCards(json);
    } catch (e) {
      console.warn("API fallback for flashcards", e);
      const fallback = lang === 'zh' ? [
        { id: 1, vocab: { term: '安全', pinyin: 'ānquán', pos: 'noun/adj', level: 'HSK3', topic: 'safety', meaning_vi: 'an toàn', example: '车间安全是第一位的。' }, interval: 1, ease_factor: 2.5 },
        { id: 2, vocab: { term: '质量', pinyin: 'zhìliàng', pos: 'noun', level: 'HSK3', topic: 'qc', meaning_vi: 'chất lượng', example: '我们需要提高产品质量。' }, interval: 1, ease_factor: 2.5 },
        { id: 3, vocab: { term: '检查', pinyin: 'jiǎnchá', pos: 'verb', level: 'HSK3', topic: 'qc', meaning_vi: 'kiểm tra', example: 'QC组正在检查样品。' }, interval: 1, ease_factor: 2.5 },
      ] : [
        { id: 10, vocab: { term: 'inspection', ipa: '/ɪnˈspekʃn/', pos: 'noun', level: 'B1', topic: 'qc', meaning_vi: 'sự kiểm tra', example: 'Quality inspection is required.' }, interval: 1, ease_factor: 2.5 },
        { id: 11, vocab: { term: 'maintenance', ipa: '/ˈmeɪntənəns/', pos: 'noun', level: 'B2', topic: 'maintenance', meaning_vi: 'bảo trì, bảo dưỡng', example: 'The machine needs maintenance.' }, interval: 1, ease_factor: 2.5 },
      ];
      setCards(fallback);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentIndex];

  const handleReview = async (quality: number) => {
    uiSound('flip');
    if (quality >= 3) {
      uiSound('correct');
      incrementStreak();
    } else {
      uiSound('incorrect');
    }

    if (currentCard) {
      try {
        await fetch(`${API_BASE}/api/flashcards/${currentCard.id}/review?quality=${quality}`, { method: 'POST' });
      } catch (e) {}
    }

    setIsFlipped(false);
    setTypedAnswer('');
    setTypingResult(null);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, cards.length));
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

  const checkTyping = () => {
    if (!currentCard) return;
    const target = currentCard.vocab.term.trim().toLowerCase();
    const input = typedAnswer.trim().toLowerCase();
    const isCorrect = target === input;
    setTypingResult(isCorrect);
    uiSound(isCorrect ? 'correct' : 'incorrect');
    setIsFlipped(true);
  };

  return (
    <div className="module-container">
      <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="module-title">
            {lang === 'zh' ? 'Thẻ Ghi Nhớ 3D SRS SM-2 (Tiếng Trung)' : 'Thẻ Ghi Nhớ 3D SRS SM-2 (Tiếng Anh)'}
          </h2>
          <p className="module-subtitle">
            Thuật toán Lặp lại ngắt quãng SuperMemo SM-2 tự động tính toán khoảng thời gian ôn tập tối ưu.
          </p>
        </div>

        <div className="streak-badge">
          <Flame size={18} color="#f59e0b" fill="#f59e0b" />
          <span>{streakDays} Ngày Chuỗi Streak</span>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-chip ${mode === 'standard' ? 'active' : ''}`} onClick={() => setMode('standard')}>Thẻ 3D Chuẩn</button>
        <button className={`filter-chip ${mode === 'audio' ? 'active' : ''}`} onClick={() => setMode('audio')}>Audio First Mode</button>
        <button className={`filter-chip ${mode === 'typing' ? 'active' : ''}`} onClick={() => setMode('typing')}>Typing Test Mode</button>
      </div>

      {cards.length > 0 && currentCard ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
          {/* 3D Flip Container */}
          <div
            className={`flashcard-3d-wrapper ${isFlipped ? 'flipped' : ''}`}
            onClick={() => {
              setIsFlipped(!isFlipped);
              uiSound('flip');
            }}
          >
            <div className="flashcard-3d-inner">
              {/* Front Side */}
              <div className="flashcard-3d-front">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="card-tag">{currentCard.vocab.level || 'HSK'}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Thẻ {currentIndex + 1} / {cards.length}</span>
                </div>

                {mode === 'audio' ? (
                  <div style={{ textAlign: 'center', margin: 'auto' }}>
                    <button className="play-btn" style={{ width: '64px', height: '64px', margin: 'auto' }} onClick={(e) => { e.stopPropagation(); speakText(currentCard.vocab.term); }}>
                      <Volume2 size={32} />
                    </button>
                    <p style={{ marginTop: '16px', color: '#94a3b8' }}>Bấm nút để nghe âm mẫu trước khi lật thẻ</p>
                  </div>
                ) : (
                  <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '48px', fontWeight: 800, color: '#fff' }}>{currentCard.vocab.term}</h2>
                    <p style={{ fontSize: '20px', color: '#0ea5e9', marginTop: '8px' }}>{currentCard.vocab.pinyin || currentCard.vocab.ipa}</p>
                  </div>
                )}

                <div style={{ fontSize: '13px', color: '#64748b' }}>Bấm thẻ hoặc nhấn Space để lật đáp án</div>
              </div>

              {/* Back Side */}
              <div className="flashcard-3d-back">
                <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{currentCard.vocab.meaning_vi}</h3>
                <div style={{ fontSize: '18px', color: '#8b5cf6', marginTop: '4px' }}>{currentCard.vocab.term} ({currentCard.vocab.pinyin || currentCard.vocab.ipa})</div>
                {currentCard.vocab.example && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', fontSize: '14px', color: '#e2e8f0' }}>
                    💡 Ví dụ: {currentCard.vocab.example}
                  </div>
                )}
                <button className="play-btn" style={{ marginTop: '16px' }} onClick={(e) => { e.stopPropagation(); speakText(currentCard.vocab.term); }}>
                  <Volume2 size={18} /> Nghe phát âm
                </button>
              </div>
            </div>
          </div>

          {/* Typing Mode Input */}
          {mode === 'typing' && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', width: '100%', maxWidth: '480px' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Gõ lại chính xác từ vựng..."
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkTyping()}
              />
              <button className="cta" onClick={checkTyping}>Kiểm tra</button>
            </div>
          )}

          {/* SRS Control Buttons */}
          <div className="srs-actions">
            <button className="srs-btn srs-again" onClick={() => handleReview(1)}>
              🔴 Quên (Again)
            </button>
            <button className="srs-btn srs-hard" onClick={() => handleReview(2)}>
              🟠 Khó (Hard)
            </button>
            <button className="srs-btn srs-good" onClick={() => handleReview(4)}>
              🟢 Tốt (Good)
            </button>
            <button className="srs-btn srs-easy" onClick={() => handleReview(5)}>
              🔵 Rất Dễ (Easy)
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Đang tải thẻ học SRS...</div>
      )}
    </div>
  );
}
