'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Volume2, Bookmark, ShieldCheck, Play, ChevronDown, Download,
  Copy, Check, Sparkles, SlidersHorizontal, Layers, Factory, Wrench, Package,
  HardHat, Briefcase, FolderKanban, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | number | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { toggleFavorite, isFavorite } = useAppStore();

  useEffect(() => {
    fetchData();
  }, [lang, query, selectedTopic, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'two_hanzi' && lang === 'zh') {
        const url = `${API_BASE}/api/dictionary/two_hanzi?q=${encodeURIComponent(query)}&topic=${selectedTopic}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : json.items || [];
          setTwoHanziWords(items);
          setTotalCount(items.length);
        } else {
          throw new Error('Failed to fetch two hanzi');
        }
      } else {
        const url = `${API_BASE}/api/dictionary/${lang}?q=${encodeURIComponent(query)}&topic=${selectedTopic}&limit=100`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : json.items || [];
          setWords(items);
          setTotalCount(json.total || items.length);
        } else {
          throw new Error('Failed to fetch dictionary');
        }
      }
    } catch (e) {
      console.warn("API fallback for dictionary -> loading local static JSON dataset", e);
      try {
        const staticUrl = lang === 'zh' ? '/data/chinese_lexicon_10k.json' : '/data/english_lexicon_10k.json';
        const res = await fetch(staticUrl);
        if (res.ok) {
          const allData: any[] = await res.json();
          const qLower = query.trim().toLowerCase();

          let filtered = allData.filter((item: any) => {
            const matchTopic = selectedTopic === 'all' || item.topic === selectedTopic;
            const termMatch = (item.term || item.hanzi || '').toLowerCase().includes(qLower);
            const pinyinMatch = (item.pinyin || item.ipa || '').toLowerCase().includes(qLower);
            const meaningMatch = (item.meaning_vi || '').toLowerCase().includes(qLower);
            return matchTopic && (termMatch || pinyinMatch || meaningMatch);
          });

          if (activeTab === 'two_hanzi' && lang === 'zh') {
            const twoHanzi = filtered.filter((item: any) => (item.term || item.hanzi || '').length === 2);
            setTwoHanziWords(twoHanzi.slice(0, 100));
            setTotalCount(twoHanzi.length);
          } else {
            setWords(filtered.slice(0, 100));
            setTotalCount(filtered.length);
          }
        }
      } catch (err) {
        console.error("Failed to load static lexicon dataset", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string, id: string | number) => {
    uiSound('click');
    setPlayingAudioId(id);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingAudioId(null), 1500);
    }
  };

  const copyToClipboard = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    uiSound('favorite');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportDictionaryJSON = () => {
    uiSound('complete');
    const exportData = activeTab === 'two_hanzi' && lang === 'zh' ? twoHanziWords : words;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `linguaforge_lexicon_${lang}_${selectedTopic}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const topicsList = [
    { key: 'all', label: 'Tất cả chủ đề (All Industrial Topics)', Icon: FolderKanban },
    { key: 'factory', label: '🏭 Sản xuất & Công xưởng (Factory Production)', Icon: Factory },
    { key: 'qc', label: '🔍 Kiểm định QC/QA (Quality Inspection)', Icon: ShieldCheck },
    { key: 'maintenance', label: '🔧 Bảo trì & Máy móc (Maintenance & Equipment)', Icon: Wrench },
    { key: 'warehouse', label: '📦 Kho bãi & Logistics (Warehouse & Supply)', Icon: Package },
    { key: 'safety', label: '🛡️ An toàn Lao động EHS (Safety & Environment)', Icon: HardHat },
    { key: 'office', label: '💼 Giao tiếp Công sở (Office Management)', Icon: Briefcase },
  ];

  const displayList = activeTab === 'two_hanzi' && lang === 'zh' ? twoHanziWords : words;

  return (
    <div className="module-container">
      {/* Header Banner */}
      <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="module-title">
              {lang === 'zh' ? 'Từ điển Tiếng Trung Chuyên Ngành (Hanzi + Pinyin)' : 'Từ điển Tiếng Anh Chuyên Ngành (English + IPA)'}
            </h2>
            <span className="badge glowing" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
              10,000+ REAL LEXICON
            </span>
          </div>
          <p className="module-subtitle">
            Hệ thống 10.000+ từ vựng thực tế công xưởng, 80% từ 2 chữ Hán chuẩn, tích hợp Từ đồng nghĩa / trái nghĩa kèm Pinyin, IPA & Việt dịch.
          </p>
        </div>

        <button className="cta" onClick={exportDictionaryJSON} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '10px 18px' }}>
          <Download size={16} /> Xuất Dữ Liệu Lexicon JSON
        </button>
      </div>

      {/* Dual Tab Switching for Chinese 2-Hanzi Dedicated Collection */}
      {lang === 'zh' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            className={`filter-chip ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); uiSound('click'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Layers size={15} /> Tất cả từ vựng chuyên ngành (10.000+)
          </button>
          <button
            className={`filter-chip ${activeTab === 'two_hanzi' ? 'active' : ''}`}
            style={{
              background: activeTab === 'two_hanzi' ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : undefined,
              boxShadow: activeTab === 'two_hanzi' ? '0 0 16px rgba(16, 185, 129, 0.4)' : undefined,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
            onClick={() => { setActiveTab('two_hanzi'); uiSound('click'); }}
          >
            <Sparkles size={15} color="#f59e0b" /> ⭐ Bộ Từ Chuẩn 2 Chữ Hán (80% Standard Collection)
          </button>
        </div>
      )}

      {/* Directory Select Filter Dropdown & Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
          <input
            type="text"
            className="search-input"
            placeholder={lang === 'zh' ? 'Tra cứu chữ Hán, Pinyin hoặc nghĩa tiếng Việt...' : 'Search English term, IPA or Vietnamese meaning...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '48px', height: '48px', fontSize: '15px' }}
          />
        </div>

        {/* Directory Folder Select Filter Dropdown */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <SlidersHorizontal style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0ea5e9', pointerEvents: 'none' }} size={18} />
          <select
            className="search-input"
            value={selectedTopic}
            onChange={(e) => { setSelectedTopic(e.target.value); uiSound('click'); }}
            style={{
              width: '100%',
              height: '48px',
              paddingLeft: '42px',
              paddingRight: '40px',
              appearance: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: '12px'
            }}
          >
            {topicsList.map((t) => (
              <option key={t.key} value={t.key} style={{ background: '#0f172a', color: '#fff', padding: '10px' }}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} size={18} />
        </div>
      </div>

      {/* Data Count Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: '#94a3b8', fontSize: '13px' }}>
        <span>Hiển thị <strong>{displayList.length}</strong> / <strong>{totalCount}</strong> thuật ngữ chuẩn hóa</span>
        {loading && <span style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} className="animate-spin" /> Đang tải kho dữ liệu...</span>}
      </div>

      {/* Cards Grid with double-bezel industrial styling & Framer Motion */}
      <div className="cards-grid">
        <AnimatePresence>
          {displayList.map((item, idx) => {
            const favKey = `vocab_${item.id || item.term || item.hanzi}`;
            const isFav = isFavorite(favKey);
            const isPlaying = playingAudioId === (item.id || item.term || item.hanzi);

            return (
              <motion.div
                key={item.id || `${item.term || item.hanzi}_${idx}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isFav ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isFav ? '0 0 20px rgba(245, 158, 11, 0.15)' : 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="card-tag" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      {item.level || item.hsk_level || 'HSK'} • {item.topic?.toUpperCase() || 'FACTORY'}
                    </span>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        className="icon-btn"
                        onClick={() => copyToClipboard(item.term || item.hanzi, item.id || idx)}
                        title="Sao chép từ siêu tốc"
                        style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        {copiedId === (item.id || idx) ? <Check size={15} color="#10b981" /> : <Copy size={15} color="#94a3b8" />}
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => {
                          toggleFavorite(favKey);
                          uiSound('favorite');
                        }}
                        title="Lưu vào kho yêu thích"
                        style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <Bookmark size={15} color={isFav ? '#f59e0b' : '#94a3b8'} fill={isFav ? '#f59e0b' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Term Headword */}
                  <div className="card-term" style={{ fontSize: '30px', color: '#ffffff', marginTop: '12px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    {item.term || item.hanzi}
                  </div>

                  {/* Pinyin or IPA */}
                  <div className="card-annotation" style={{ color: '#38bdf8', fontSize: '17px', fontWeight: 600, marginTop: '2px' }}>
                    {item.pinyin || item.ipa}
                  </div>

                  {/* Vietnamese Meaning */}
                  <div style={{ marginTop: '10px', fontSize: '15px', color: '#e2e8f0', fontWeight: 600, lineHeight: '1.4' }}>
                    {item.meaning_vi || (item.translations && item.translations[0]?.meaning)}
                  </div>

                  {/* Synonyms & Antonyms Section */}
                  {((item.synonyms && item.synonyms.length > 0) || (item.antonyms && item.antonyms.length > 0)) && (
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.synonyms && item.synonyms.length > 0 && (
                        <div style={{ padding: '8px 10px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '12px' }}>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>🟢 Đồng nghĩa: </span>
                          <span style={{ color: '#a7f3d0' }}>
                            {item.synonyms.map((s: any) => `${s.term} (${s.pinyin || s.ipa || ''}) — ${s.meaning_vi}`).join('; ')}
                          </span>
                        </div>
                      )}
                      {item.antonyms && item.antonyms.length > 0 && (
                        <div style={{ padding: '8px 10px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '12px' }}>
                          <span style={{ color: '#ef4444', fontWeight: 700 }}>🔴 Trái nghĩa: </span>
                          <span style={{ color: '#fca5a5' }}>
                            {item.antonyms.map((a: any) => `${a.term} (${a.pinyin || a.ipa || ''}) — ${a.meaning_vi}`).join('; ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Context Sentence Example */}
                  {item.examples && item.examples.length > 0 && (
                    <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '12px', lineHeight: '1.5' }}>
                      <div style={{ color: '#cbd5e1', fontWeight: 500 }}>"{item.examples[0].sentence}"</div>
                      {item.examples[0].pinyin && <div style={{ color: '#a78bfa', fontSize: '11px' }}>{item.examples[0].pinyin}</div>}
                      <div style={{ color: '#64748b' }}>👉 {item.examples[0].translation_vi}</div>
                    </div>
                  )}
                </div>

                {/* Card Footer Play Audio Action Button */}
                <div className="card-actions" style={{ marginTop: '16px' }}>
                  <button
                    className="play-btn"
                    onClick={() => speakText(item.term || item.hanzi, item.id || idx)}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: isPlaying ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : undefined,
                      boxShadow: isPlaying ? '0 0 16px rgba(16, 185, 129, 0.4)' : undefined,
                      transition: 'all 0.2s'
                    }}
                  >
                    <Volume2 size={16} className={isPlaying ? 'animate-bounce' : ''} />
                    {isPlaying ? 'Đang phát âm...' : 'Nghe phát âm chuẩn (Audio Synthesis)'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {displayList.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.1)', marginTop: '24px' }}>
          <Info size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h4>Không tìm thấy từ vựng phù hợp với từ khóa "{query}"</h4>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Thử thay đổi từ khóa tìm kiếm hoặc chọn lại thư mục chủ đề công xưởng.</p>
        </div>
      )}
    </div>
  );
}
