'use client';

import React, { useState, useEffect } from 'react';
import { Search, Play, ShieldCheck, Tag, Sparkles, Filter } from 'lucide-react';
import { uiSound } from '@/lib/sound';

export default function DictionaryModule({ lang }: { lang: 'zh' | 'en' }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [twoHanziWords, setTwoHanziWords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'main' | 'two_hanzi'>('main');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDictionary();
    if (lang === 'zh') {
      fetchTwoHanzi();
    }
  }, [lang, query, selectedTopic]);

  const fetchDictionary = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:8000/api/dictionary/${lang}?q=${encodeURIComponent(query)}`;
      if (selectedTopic !== 'all') url += `&topic=${selectedTopic}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.warn("API fallback for dictionary", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTwoHanzi = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/dictionary/two_hanzi`);
      const data = await res.json();
      setTwoHanziWords(data || []);
    } catch (e) {
      console.warn("Fallback for two_hanzi", e);
    }
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

  const topics = ['all', 'factory', 'qc', 'maintenance', 'warehouse', 'safety', 'office', 'logistics', 'technical'];

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">
          {lang === 'zh' ? 'Từ điển Chuẩn hóa Tiếng Trung (HSK1–6 & Công xưởng)' : 'Từ điển Chuẩn hóa Tiếng Anh (CEFR A2–C1 & Technical)'}
        </h2>
        <p className="module-subtitle">
          Chỉ chứa dữ liệu có nguồn kiểm chứng (provenance), không bịa từ, không duplicate, hỗ trợ chuyên ngành nhà máy & văn phòng.
        </p>
      </div>

      {lang === 'zh' && (
        <div className="lang-switch" style={{ width: 'fit-content', marginBottom: '20px' }}>
          <button
            className={activeTab === 'main' ? 'active' : ''}
            onClick={() => { setActiveTab('main'); uiSound('click'); }}
          >
            Từ điển Tổng hợp (1-4 chữ & phrase)
          </button>
          <button
            className={activeTab === 'two_hanzi' ? 'active' : ''}
            onClick={() => { setActiveTab('two_hanzi'); uiSound('click'); }}
          >
            <Sparkles size={15} style={{ marginRight: '6px' }} />
            Bộ từ chuẩn 2 chữ (Two-Hanzi Collection)
          </button>
        </div>
      )}

      {activeTab === 'main' ? (
        <>
          {/* Search bar & topic filters */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={lang === 'zh' ? 'Tra từ Hanzi, Pinyin hoặc nghĩa tiếng Việt...' : 'Tra từ English, IPA hoặc nghĩa tiếng Việt...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 46px',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border-light)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div className="filter-tabs">
            {topics.map((t) => (
              <button
                key={t}
                className={`filter-chip ${selectedTopic === t ? 'active' : ''}`}
                onClick={() => { setSelectedTopic(t); uiSound('click'); }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Dictionary Cards */}
          <div className="cards-grid">
            {items.map((item) => (
              <div key={item.id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-tag">{item.level} · {item.pos}</span>
                  <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                    <ShieldCheck size={12} /> {item.review_status}
                  </span>
                </div>

                <div className="card-term" style={{ fontSize: '28px', color: '#fff', marginTop: '6px' }}>
                  {item.term}
                </div>

                <div className="card-annotation">{lang === 'zh' ? item.pinyin : item.ipa}</div>

                <div className="card-meaning" style={{ marginTop: '8px', fontWeight: 600 }}>
                  {item.meaning_vi}
                </div>

                {item.examples && item.examples.length > 0 && (
                  <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', fontSize: '13px' }}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{item.examples[0].sentence}</div>
                    {item.examples[0].pinyin && <div style={{ color: '#8b5cf6' }}>{item.examples[0].pinyin}</div>}
                    <div style={{ color: '#94a3b8' }}>{item.examples[0].translation_vi}</div>
                  </div>
                )}

                <div className="card-actions">
                  <span style={{ fontSize: '11px', color: '#64748b' }}>📌 Provenance: {item.provenance}</span>
                  <button className="play-btn" onClick={() => speakText(item.term)}>
                    <Play size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Two-Hanzi Dedicated Collection */
        <div>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '16px 20px', borderRadius: '16px', marginBottom: '24px' }}>
            <h4 style={{ color: '#8b5cf6', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} /> Collection: lexical items có đúng 2 Hanzi chuẩn xác
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
              Tránh phá cấu trúc ngôn ngữ Trung bằng cách ghép từ đơn giả lập. Mọi từ trong bộ này đều được chứng thực độc lập.
            </p>
          </div>

          <div className="cards-grid">
            {twoHanziWords.map((word) => (
              <div key={word.id} className="glass-card" style={{ background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.12), rgba(15, 23, 42, 0.6))' }}>
                <span className="card-tag">{word.hsk_level} · 2-Hanzi</span>
                <div className="card-term" style={{ fontSize: '36px', color: '#fff', margin: '8px 0' }}>
                  {word.hanzi}
                </div>
                <div className="card-annotation" style={{ fontSize: '18px' }}>{word.pinyin}</div>
                <div className="card-meaning" style={{ marginTop: '6px', fontSize: '16px' }}>{word.meaning_vi}</div>
                <div className="card-actions">
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Chủ đề: {word.topic}</span>
                  <button className="play-btn" onClick={() => speakText(word.hanzi)}>
                    <Play size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
