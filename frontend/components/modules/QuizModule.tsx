'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Volume2, HelpCircle, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { uiSound } from '@/lib/sound';

export default function QuizModule({ lang }: { lang: 'zh' | 'en' }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [resultFeedback, setResultFeedback] = useState<any | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [errorNotebook, setErrorNotebook] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'quiz' | 'errors'>('quiz');

  useEffect(() => {
    fetchQuiz();
    fetchErrors();
  }, [lang]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/quiz/${lang}`);
      const json = await res.json();
      setQuestions(json);
    } catch (e) {
      console.warn("API fallback for quiz", e);
      const fallback = lang === 'zh' ? [
        { id: 1, lang: 'zh', qtype: 'mc', level: 'HSK3', topic: 'factory', question_text: 'Từ nào sau đây có nghĩa là "chất lượng"?', options: ['安全', '质量', '检查', '维护'], correct_answer: '质量', explanation_vi: '质量 (zhìliàng) có nghĩa là chất lượng. 安全: an toàn; 检查: kiểm tra.' }
      ] : [
        { id: 2, lang: 'en', qtype: 'mc', level: 'B1', topic: 'factory', question_text: 'Which word means "sự kiểm tra chất lượng"?', options: ['maintenance', 'inspection', 'inventory', 'handover'], correct_answer: 'inspection', explanation_vi: '"Inspection" nghĩa là sự kiểm tra/giám sát.' }
      ];
      setQuestions(fallback);
    }
  };

  const fetchErrors = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/errors?lang=${lang}`);
      const json = await res.json();
      setErrorNotebook(json);
    } catch (e) {
      console.warn("API fallback for error notebook", e);
    }
  };

  const handleAnswerSubmit = async (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    try {
      const res = await fetch(`http://localhost:8000/api/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: currentQ.id, user_answer: option })
      });
      const data = await res.json();
      setResultFeedback(data);

      if (data.is_correct) {
        uiSound('correct');
        setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
      } else {
        uiSound('incorrect');
        setScore(prev => ({ ...prev, total: prev.total + 1 }));
        fetchErrors(); // refresh error notebook
      }
    } catch (e) {
      const isCorrect = option.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();
      setResultFeedback({ is_correct: isCorrect, correct_answer: currentQ.correct_answer, explanation_vi: currentQ.explanation_vi });
      uiSound(isCorrect ? 'correct' : 'incorrect');
    }
  };

  const handleNext = () => {
    uiSound('click');
    setSelectedOption(null);
    setIsAnswered(false);
    setResultFeedback(null);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="module-container">
      <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="module-title">
            {lang === 'zh' ? 'Quiz Thách Thức & Sổ Tay Sửa Lỗi (Chinese)' : 'Quiz Challenge & Error Notebook (English)'}
          </h2>
          <p className="module-subtitle">
            Hệ thống câu hỏi thích ứng 8 dạng (Trắc nghiệm, Nghe, Điền từ, Sửa lỗi) tự động ghi chép câu sai vào Sổ Tay.
          </p>
        </div>

        <div className="lang-switch">
          <button
            className={activeTab === 'quiz' ? 'active' : ''}
            onClick={() => { setActiveTab('quiz'); uiSound('click'); }}
          >
            Làm Quiz
          </button>
          <button
            className={activeTab === 'errors' ? 'active' : ''}
            onClick={() => { setActiveTab('errors'); uiSound('click'); }}
          >
            Sổ Tay Lỗi ({errorNotebook.length})
          </button>
        </div>
      </div>

      {activeTab === 'quiz' ? (
        currentQ ? (
          <div style={{ maxWidth: '680px', margin: '20px auto 0' }}>
            {/* Score & Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
              <span>Câu {currentIndex + 1} / {questions.length}</span>
              <span>Điểm: <strong style={{ color: '#10b981' }}>{score.correct}</strong> / {score.total}</span>
            </div>

            {/* Question Glass Card */}
            <div className="glass-card" style={{ padding: '32px' }}>
              <span className="card-tag">{currentQ.level} · {currentQ.topic}</span>

              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '16px 0 24px' }}>
                {currentQ.question_text}
              </h3>

              {/* Options */}
              <div style={{ display: 'grid', gap: '12px' }}>
                {currentQ.options?.map((opt: string) => {
                  let btnBg = 'rgba(255, 255, 255, 0.05)';
                  let borderClr = 'var(--glass-border)';

                  if (isAnswered) {
                    if (opt === currentQ.correct_answer) {
                      btnBg = 'rgba(16, 185, 129, 0.2)';
                      borderClr = '#10b981';
                    } else if (selectedOption === opt) {
                      btnBg = 'rgba(239, 68, 68, 0.2)';
                      borderClr = '#ef4444';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: `1px solid ${borderClr}`,
                        background: btnBg,
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleAnswerSubmit(opt)}
                    >
                      <span>{opt}</span>
                      {isAnswered && opt === currentQ.correct_answer && <CheckCircle2 color="#10b981" size={20} />}
                      {isAnswered && selectedOption === opt && opt !== currentQ.correct_answer && <XCircle color="#ef4444" size={20} />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Explanation */}
              {isAnswered && resultFeedback && (
                <div
                  style={{
                    marginTop: '24px',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: resultFeedback.is_correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${resultFeedback.is_correct ? '#10b981' : '#ef4444'}`,
                    color: '#fff'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {resultFeedback.is_correct ? <CheckCircle2 color="#10b981" /> : <XCircle color="#ef4444" />}
                    <span>{resultFeedback.is_correct ? 'Chính xác!' : `Chưa đúng. Đáp án chuẩn: ${resultFeedback.correct_answer}`}</span>
                  </div>

                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    💡 {resultFeedback.explanation_vi}
                  </div>

                  <button
                    className="cta"
                    style={{ marginTop: '16px', width: '100%', background: '#0ea5e9', color: '#fff' }}
                    onClick={handleNext}
                  >
                    Câu tiếp theo →
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>Không tìm thấy câu hỏi quiz.</div>
        )
      ) : (
        /* Error Notebook View */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Sổ Tay Ghi Chép Lỗi Sai (Mistake Notebook)</h3>
            <button className="icon-btn" onClick={fetchErrors} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Làm mới
            </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {errorNotebook.map((err) => (
              <div key={err.id} className="glass-card" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="card-tag" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                    {err.module_source.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(err.created_at).toLocaleDateString()}</span>
                </div>

                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginTop: '8px' }}>
                  {err.prompt_context}
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '14px' }}>
                  <div style={{ color: '#ef4444' }}>❌ Bạn trả lời: <strong>{err.user_answer}</strong></div>
                  <div style={{ color: '#10b981' }}>✅ Đáp án chuẩn: <strong>{err.correct_answer}</strong></div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '13px', color: '#cbd5e1', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px' }}>
                  💡 Giải thích: {err.explanation_vi}
                </div>
              </div>
            ))}

            {errorNotebook.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                🎉 Bạn chưa có lỗi sai nào trong Sổ Tay! Hãy giữ vững phong độ.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
