'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, XCircle, Play, HelpCircle, AlertTriangle } from 'lucide-react';
import { uiSound } from '@/lib/sound';
import { API_BASE } from '@/lib/api';

export default function GrammarModule({ lang }: { lang: 'zh' | 'en' }) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [exerciseResults, setExerciseResults] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchGrammar();
  }, [lang]);

  const fetchGrammar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/grammar/${lang}`);
      const json = await res.json();
      setLessons(json);
    } catch (e) {
      console.warn("API fallback for grammar", e);
      const fallback = lang === 'zh' ? [
        {
          id: 1, lang: 'zh', title: '把字句 (Cấu trúc câu chữ 把)', level: 'HSK3',
          structure: 'Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác',
          explanation_vi: 'Dùng khi người nói muốn nhấn mạnh sự tác động của chủ ngữ làm thay đổi vị trí, trạng thái hoặc kết quả của tân ngữ.',
          usage: 'Tân ngữ phải là đối tượng xác định. Động từ không đứng đơn độc mà phải kèm kết quả (放在.../拿到...).',
          common_mistakes: 'Lỗi sai: *我把书读 (thiếu bổ ngữ kết quả). Đúng: 我把书读完了。',
          examples: [{ id: 1, sentence: '我把检验报告放在桌上了。', pinyin: 'Wǒ bǎ jiǎnyàn bàogào fàng zài zhuō shàng le.', translation_vi: 'Tôi đã đặt báo cáo kiểm nghiệm lên bàn rồi.' }],
          exercises: [{ id: 101, question: 'Hoàn thành câu: 我把文件___ (Tôi đã gửi tài liệu đi).', options: ['Sent', '寄出去了', '看', '放在'], answer: '寄出去了', explanation_vi: 'Sau 把 + Tân ngữ phải có động từ + bổ ngữ hướng đi (寄出去了).' }]
        }
      ] : [
        {
          id: 2, lang: 'en', title: 'Present Perfect with "Just" and "Already"', level: 'B1',
          structure: 'Subject + have/has + (just/already) + Past Participle (V3)',
          explanation_vi: 'Diễn tả hành động vừa mới xảy ra hoặc đã hoàn thành tính đến thời điểm hiện tại.',
          usage: 'Dùng "just" cho hành động vừa xong; "already" diễn tả hành động xong sớm hơn dự kiến.',
          common_mistakes: 'Lỗi sai: *I have finish the inspection. Đúng: I have finished the inspection.',
          examples: [{ id: 2, sentence: 'The QA team has already inspected line three.', translation_vi: 'Đội QA đã kiểm tra xong dây chuyền 3 rồi.' }],
          exercises: [{ id: 102, question: 'Fill in the blank: She has ___ submitted the shift report.', options: ['already', 'yesterday', 'ago', 'last week'], answer: 'already', explanation_vi: '"Already" đứng giữa trợ động từ "has" và động từ V3 "submitted".' }]
        }
      ];
      setLessons(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseSelect = (exId: number, option: string, correctAnswer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [exId]: option }));
    const isCorrect = option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setExerciseResults(prev => ({ ...prev, [exId]: isCorrect }));
    uiSound(isCorrect ? 'correct' : 'incorrect');
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

  const levels = lang === 'zh' ? ['all', 'HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'] : ['all', 'A2', 'B1', 'B2', 'C1'];

  const filteredLessons = selectedLevel === 'all'
    ? lessons
    : lessons.filter(l => l.level === selectedLevel);

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">
          {lang === 'zh' ? 'Ngữ pháp Tiếng Trung (HSK Curriculum)' : 'Ngữ pháp Tiếng Anh (CEFR A2–C1)'}
        </h2>
        <p className="module-subtitle">
          Bao phủ ngữ pháp chuẩn từ căn bản đến nâng cao, cấu trúc chi tiết, phân tích lỗi sai phổ biến và bài tập thực hành.
        </p>
      </div>

      <div className="filter-tabs">
        {levels.map((lvl) => (
          <button
            key={lvl}
            className={`filter-chip ${selectedLevel === lvl ? 'active' : ''}`}
            onClick={() => {
              setSelectedLevel(lvl);
              uiSound('click');
            }}
          >
            {lvl}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '24px', marginTop: '24px' }}>
        {filteredLessons.map((lesson) => (
          <div key={lesson.id} className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>
                {lesson.title}
              </h3>
              <span className="card-tag">{lesson.level}</span>
            </div>

            <div style={{ marginTop: '16px', background: 'rgba(14, 165, 233, 0.1)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
              <span style={{ fontSize: '13px', color: '#0ea5e9', fontWeight: 700, textTransform: 'uppercase' }}>Cấu trúc:</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {lesson.structure}
              </div>
            </div>

            <div style={{ marginTop: '16px', color: '#e2e8f0', lineHeight: 1.6 }}>
              {lesson.explanation_vi}
            </div>

            {lesson.usage && (
              <div style={{ marginTop: '12px', fontSize: '14px', color: '#94a3b8' }}>
                <strong style={{ color: '#fff' }}>Cách dùng:</strong> {lesson.usage}
              </div>
            )}

            {lesson.common_mistakes && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#f87171', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={18} />
                <div>{lesson.common_mistakes}</div>
              </div>
            )}

            {/* Example Sentences */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h4 style={{ fontSize: '15px', color: '#8b5cf6', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} /> Ví dụ minh họa song ngữ:
              </h4>

              {lesson.examples.map((ex: any) => (
                <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{ex.sentence}</div>
                    {ex.pinyin && <div style={{ fontSize: '13px', color: '#8b5cf6' }}>{ex.pinyin}</div>}
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>{ex.translation_vi}</div>
                  </div>
                  <button className="play-btn" onClick={() => speakText(ex.sentence)}>
                    <Play size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Exercises Section */}
            {lesson.exercises && lesson.exercises.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ fontSize: '15px', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={16} /> Bài tập ứng dụng:
                </h4>

                {lesson.exercises.map((ex: any) => (
                  <div key={ex.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '12px' }}>{ex.question}</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {ex.options?.map((opt: string) => {
                        const selected = selectedAnswers[ex.id] === opt;
                        const isCorrect = exerciseResults[ex.id];
                        return (
                          <button
                            key={opt}
                            className={`filter-chip ${selected ? (isCorrect ? 'active' : '') : ''}`}
                            style={{
                              background: selected ? (isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') : undefined,
                              borderColor: selected ? (isCorrect ? '#10b981' : '#ef4444') : undefined,
                              color: selected ? (isCorrect ? '#10b981' : '#ef4444') : undefined,
                            }}
                            onClick={() => handleExerciseSelect(ex.id, opt, ex.answer)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {selectedAnswers[ex.id] && (
                      <div style={{ marginTop: '12px', fontSize: '13px', color: exerciseResults[ex.id] ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {exerciseResults[ex.id] ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        <span>{ex.explanation_vi}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
