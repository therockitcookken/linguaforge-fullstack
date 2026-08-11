'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Trophy, BookX, Sparkles, ArrowRight } from 'lucide-react';
import { uiSound } from '@/lib/sound';
import { API_BASE } from '@/lib/api';

export default function QuizModule({ lang }: { lang: 'zh' | 'en' }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorNotebook, setErrorNotebook] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'quiz' | 'notebook'>('quiz');

  useEffect(() => {
    fetchQuiz();
    fetchErrorNotebook();
  }, [lang]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/quiz/${lang}`);
      const json = await res.json();
      setQuestions(json);
    } catch (e) {
      console.warn("API fallback for quiz", e);
      const fallback = lang === 'zh' ? [
        { id: 1, lang: 'zh', qtype: 'mc', level: 'HSK3', topic: 'factory', question_text: 'Từ nào sau đây có nghĩa là "chất lượng"?', options: ['安全', '质量', '检查', '维护'], correct_answer: '质量', explanation_vi: '质量 (zhìliàng) có nghĩa là chất lượng.' },
        { id: 2, lang: 'zh', qtype: 'mc', level: 'HSK3', topic: 'safety', question_text: 'Từ nào sau đây có nghĩa là "an toàn"?', options: ['安全', '质量', '仓库', '交接'], correct_answer: '安全', explanation_vi: '安全 (ānquán) nghĩa là an toàn.' },
      ] : [
        { id: 10, lang: 'en', qtype: 'mc', level: 'B1', topic: 'factory', question_text: 'Which word means "sự kiểm tra chất lượng"?', options: ['maintenance', 'inspection', 'inventory', 'handover'], correct_answer: 'inspection', explanation_vi: '"Inspection" nghĩa là sự kiểm tra/giám sát.' }
      ];
      setQuestions(fallback);
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorNotebook = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/errors/list`);
      const json = await res.json();
      setErrorNotebook(json);
    } catch (e) {}
  };

  const currentQ = questions[currentIndex];

  const handleOptionSelect = async (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    const isCorrect = opt.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();

    if (isCorrect) {
      uiSound('correct');
      setScore((prev) => prev + 10);
    } else {
      uiSound('incorrect');
      try {
        await fetch(`${API_BASE}/api/quiz/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_id: currentQ.id,
            user_answer: opt,
            is_correct: false,
            lang
          })
        });
        fetchErrorNotebook();
      } catch (e) {}
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    uiSound('click');
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, questions.length));
  };

  return (
    <div className="module-container">
      <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="module-title">
            {lang === 'zh' ? 'Quiz Thách Thức & Sổ Tay Lỗi (Tiếng Trung)' : 'Quiz Thách Thức & Sổ Tay Lỗi (Tiếng Anh)'}
          </h2>
          <p className="module-subtitle">
            8 dạng bài tập thích ứng. Khi làm sai, hệ thống tự động lưu vào Sổ Tay Lỗi để ôn luyện lại.
          </p>
        </div>

        <div className="streak-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', borderColor: '#8b5cf6' }}>
          <Trophy size={18} color="#8b5cf6" />
          <span>{score} Điểm Thách Thức</span>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-chip ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>
          ⚡ Thử Thách Quiz
        </button>
        <button className={`filter-chip ${activeTab === 'notebook' ? 'active' : ''}`} style={{ background: activeTab === 'notebook' ? 'rgba(239, 68, 68, 0.2)' : undefined }} onClick={() => setActiveTab('notebook')}>
          <BookX size={14} style={{ marginRight: '6px' }} /> Sổ Tay Lỗi ({errorNotebook.length})
        </button>
      </div>

      {activeTab === 'quiz' && questions.length > 0 && currentQ ? (
        <div className="glass-card" style={{ marginTop: '24px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="card-tag">{currentQ.level || 'HSK'}</span>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>Câu {currentIndex + 1} / {questions.length}</span>
          </div>

          <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>
            {currentQ.question_text}
          </h3>

          <div style={{ display: 'grid', gap: '14px' }}>
            {currentQ.options?.map((opt: string) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correct_answer;
              let bg = 'rgba(255, 255, 255, 0.04)';
              let border = 'rgba(255, 255, 255, 0.1)';

              if (isAnswered) {
                if (isCorrect) {
                  bg = 'rgba(16, 185, 129, 0.2)';
                  border = '#10b981';
                } else if (isSelected && !isCorrect) {
                  bg = 'rgba(239, 68, 68, 0.2)';
                  border = '#ef4444';
                }
              }

              return (
                <button
                  key={opt}
                  className="quiz-option"
                  style={{ background: bg, borderColor: border, padding: '16px 20px', borderRadius: '14px', textAlign: 'left', fontSize: '17px', color: '#fff', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => handleOptionSelect(opt)}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={20} color="#10b981" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={20} color="#ef4444" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                💡 <strong>Giải thích:</strong> {currentQ.explanation_vi}
              </div>
              <button className="cta" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Câu tiếp theo <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : activeTab === 'notebook' ? (
        <div style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
          {errorNotebook.length > 0 ? (
            errorNotebook.map((err) => (
              <div key={err.id} className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>🔴 Câu làm sai</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginTop: '6px' }}>{err.question_text || 'Câu hỏi luyện tập'}</div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Lựa chọn sai: <span style={{ color: '#ef4444' }}>{err.user_answer}</span></div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#10b981' }}>🎉 Bạn chưa có câu làm sai nào trong Sổ Tay Lỗi!</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
