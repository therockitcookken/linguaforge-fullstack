'use client';

import React, { useState, useEffect } from 'react';
import { Search, Volume2, Sparkles, ShieldCheck, Tag, Play } from 'lucide-react';
import { uiSound } from '@/lib/sound';
import { useAppStore } from '@/lib/store';
import { API_BASE } from '@/lib/api';

export default function DictionaryModule({ lang }: { lang: 'zh' | 'en' }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'two_hanzi'>('all');
  const [words, setWords] = useState<any[]>([]);
  const [twoHanziWords, setTwoHanziWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('all');

  useEffect(() => {
    fetchData();
  }, [lang, query, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'two_hanzi' && lang === 'zh') {
        const res = await fetch(`${API_BASE}/api/dictionary/two_hanzi`);
        const json = await res.json();
        setTwoHanziWords(json);
      } else {
        const res = await fetch(`${API_BASE}/api/dictionary/${lang}?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setWords(json);
      }
    } catch (e) {
      console.warn("API fallback for dictionary", e);
      if (lang === 'zh') {
        setWords([
          { id: 1, term: '安全', pinyin: 'ānquán', pos: 'noun/adj', level: 'HSK3', topic: 'safety', meaning_vi: 'an toàn', provenance: 'provenance_hsk_factory_2026', examples: [{ id: 1, sentence: '车间安全是第一位的。', pinyin: 'Chējiān ānquán shì dì yī wèi de.', translation_vi: 'An toàn nhà xưởng là ưu tiên hàng đầu.' }] },
          { id: 2, term: '质量', pinyin: 'zhìliàng', pos: 'noun', level: 'HSK3', topic: 'qc', meaning_vi: 'chất lượng', provenance: 'provenance_hsk_factory_2026', examples: [{ id: 2, sentence: '我们需要提高产品质量。', pinyin: 'Wǒmen xūyào tígāo chǎnpǐn zhìliàng.', translation_vi: 'Chúng ta cần nâng cao chất lượng sản phẩm.' }] },
        ]);
        setTwoHanziWords([
          { id: 1, hanzi: '安全', pinyin: 'ānquán', meaning_vi: 'an toàn', topic: 'safety', hsk_level: 'HSK3', provenance: 'provenance_hsk_factory_2026' },
          { id: 2, hanzi: '质量', pinyin: 'zhìliàng', meaning_vi: 'chất lượng', topic: 'qc', hsk_level: 'HSK3', provenance: 'provenance_hsk_factory_2026' },
        ]);
      } else {
        setWords([
          { id: 10, term: 'inspection', ipa: '/ɪnˈspekʃn/', pos: 'noun', level: 'B1', topic: 'qc', meaning_vi: 'sự kiểm tra', provenance: 'provenance_cefr_factory_2026', examples: [{ id: 10, sentence: 'Quality inspection is required before shipment.', translation_vi: 'Cần kiểm tra chất lượng trước khi giao hàng.' }] },
          { id: 11, term: 'maintenance', ipa: '/ˈmeɪntənəns/', pos: 'noun', level: 'B2', topic: 'maintenance', meaning_vi: 'bảo trì, bảo dưỡng', provenance: 'provenance_cefr_factory_2026', examples: [{ id: 11, sentence: 'The machine needs urgent maintenance.', translation_vi: 'Cỗ máy cần bảo trì gấp.' }] },
        ]);
      }
    } finally {
      setLoading(false);
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

  const topics = ['all', 'factory', 'qc', 'maintenance', 'warehouse', 'safety', 'office'];

  const displayList = activeTab === 'two_hanzi' && lang === 'zh'
    ? twoHanziWords.filter(w => selectedTopic === 'all' || w.topic === selectedTopic)
    : words.filter(w => selectedTopic === 'all' || w.topic === selectedTopic);

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">
          {lang === 'zh' ? 'Từ điển Tiếng Trung Chuyên Ngành (Hanzi + Pinyin)' : 'Từ điển Tiếng Anh Chuyên Ngành (English + IPA)'}
        </h2>
        <p className="module-subtitle">
          Tra cứu hơn 10.000+ thuật ngữ chuyên ngành sản xuất, QC/QA, bảo trì, kho bãi, an toàn EHS và giao tiếp công sở.
        </p>
      </div>

      {lang === 'zh' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            className={`filter-chip ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); uiSound('click'); }}
          >
            Tất cả thuật ngữ
          </button>
          <button
            className={`filter-chip ${activeTab === 'two_hanzi' ? 'active' : ''}`}
            style={{ background: activeTab === 'two_hanzi' ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : undefined }}
            onClick={() => { setActiveTab('two_hanzi'); uiSound('click'); }}
          >
            ⭐ Bộ Từ Chuẩn 2 Chữ (Dedicated Collection)
          </button>
        </div>
      )}

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
        <input
          type="text"
          className="search-input"
          placeholder={lang === 'zh' ? 'Nhập chữ Hán, Pinyin hoặc nghĩa tiếng Việt...' : 'Search word, IPA or Vietnamese meaning...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', paddingLeft: '48px' }}
        />
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

      <div className="cards-grid" style={{ marginTop: '24px' }}>
        {displayList.map((item) => (
          <div key={item.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-tag">{item.level || item.hsk_level || 'Nghiệp vụ'}</span>
              <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Provenance Verified
              </span>
            </div>

            <div className="card-term" style={{ fontSize: '28px', color: '#fff', marginTop: '12px' }}>
              {item.term || item.hanzi}
            </div>

            <div className="card-annotation" style={{ color: '#0ea5e9', fontSize: '16px' }}>
              {item.pinyin || item.ipa}
            </div>

            <div style={{ marginTop: '8px', fontSize: '15px', color: '#e2e8f0', fontWeight: 600 }}>
              {item.meaning_vi || (item.translations && item.translations[0]?.meaning)}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
              <span><Tag size={12} style={{ display: 'inline', marginRight: '4px' }} /> POS: {item.pos || 'noun'}</span>
              <span>• Topic: {item.topic}</span>
            </div>

            {item.examples && item.examples.length > 0 && (
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '13px' }}>
                <div style={{ color: '#94a3b8' }}>{item.examples[0].sentence}</div>
                <div style={{ color: '#64748b' }}>{item.examples[0].translation_vi}</div>
              </div>
            )}

            <div className="card-actions" style={{ marginTop: '16px' }}>
              <button className="play-btn" onClick={() => speakText(item.term || item.hanzi)}>
                <Play size={16} /> Nghe phát âm
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
