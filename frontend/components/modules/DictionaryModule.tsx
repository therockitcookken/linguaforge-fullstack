'use client';

import React, { useState, useEffect } from 'react';
import { Search, Volume2, Bookmark, ShieldCheck, Tag, Play, ChevronDown, Download, Copy, Check, Sparkles, SlidersHorizontal, Layers } from 'lucide-react';
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
  const [selectedWordForDetail, setSelectedWordForDetail] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { toggleFavorite, isFavorite } = useAppStore();

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
          {
            id: 1, term: '安全', pinyin: 'ānquán', pos: 'noun/adj', level: 'HSK3', topic: 'safety', meaning_vi: 'an toàn', provenance: 'provenance_hsk_factory_2026',
            synonyms: [{ term: '平安', pinyin: "píng'ān", meaning_vi: 'bình an, an toàn' }],
            antonyms: [{ term: '危险', pinyin: 'wēixiǎn', meaning_vi: 'nguy hiểm' }],
            examples: [{ id: 1, sentence: '车间安全是第一位的。', pinyin: 'Chējiān ānquán shì dì yī wèi de.', translation_vi: 'An toàn nhà xưởng là ưu tiên hàng đầu.' }]
          },
          {
            id: 2, term: '质量', pinyin: 'zhìliàng', pos: 'noun', level: 'HSK3', topic: 'qc', meaning_vi: 'chất lượng', provenance: 'provenance_hsk_factory_2026',
            synonyms: [{ term: '质检', pinyin: 'zhìjiǎn', meaning_vi: 'kiểm tra chất lượng' }],
            antonyms: [{ term: '劣质', pinyin: 'lièzhì', meaning_vi: 'chất lượng kém' }],
            examples: [{ id: 2, sentence: '我们需要提高产品质量。', pinyin: 'Wǒmen xūyào tígāo chǎnpǐn zhìliàng.', translation_vi: 'Chúng ta cần nâng cao chất lượng sản phẩm.' }]
          },
          {
            id: 3, term: '检查', pinyin: 'jiǎnchá', pos: 'verb', level: 'HSK3', topic: 'qc', meaning_vi: 'kiểm tra', provenance: 'provenance_hsk_factory_2026',
            synonyms: [{ term: '检验', pinyin: 'jiǎnyàn', meaning_vi: 'kiểm nghiệm' }],
            antonyms: [{ term: '忽略', pinyin: 'hūlüè', meaning_vi: 'bỏ sót, ngó lơ' }],
            examples: [{ id: 3, sentence: 'QC组正在检查样品。', pinyin: 'QC zǔ zhèngzài jiǎnchá yàngpǐn.', translation_vi: 'Tổ QC đang kiểm tra mẫu.' }]
          },
        ]);
        setTwoHanziWords([
          { id: 1, hanzi: '安全', pinyin: 'ānquán', meaning_vi: 'an toàn', topic: 'safety', hsk_level: 'HSK3', provenance: 'provenance_hsk_factory_2026' },
          { id: 2, hanzi: '质量', pinyin: 'zhìliàng', meaning_vi: 'chất lượng', topic: "qc", hsk_level: 'HSK3', provenance: 'provenance_hsk_factory_2026' },
          { id: 3, hanzi: '检查', pinyin: 'jiǎnchá', meaning_vi: 'kiểm tra', topic: 'qc', hsk_level: 'HSK3', provenance: 'provenance_hsk_factory_2026' },
        ]);
      } else {
        setWords([
          {
            id: 10, term: 'inspection', ipa: '/ɪnˈspekʃn/', pos: 'noun', level: 'B1', topic: 'qc', meaning_vi: 'sự kiểm tra', provenance: 'provenance_cefr_factory_2026',
            synonyms: [{ term: 'examination', ipa: '/ɪɡˌzæmɪˈneɪʃn/', meaning_vi: 'sự xem xét/kiểm tra' }],
            antonyms: [{ term: 'neglect', ipa: '/nɪˈɡlekt/', meaning_vi: 'sự bỏ sót' }],
            examples: [{ id: 10, sentence: 'Quality inspection is required before shipment.', translation_vi: 'Cần kiểm tra chất lượng trước khi giao hàng.' }]
          },
          {
            id: 11, term: 'maintenance', ipa: '/ˈmeɪntənəns/', pos: 'noun', level: 'B2', topic: 'maintenance', meaning_vi: 'bảo trì, bảo dưỡng', provenance: 'provenance_cefr_factory_2026',
            synonyms: [{ term: 'servicing', ipa: '/ˈsɜːvɪsɪŋ/', meaning_vi: 'sự bảo dưỡng' }],
            antonyms: [{ term: 'damage', ipa: '/ˈdæmɪdʒ/', meaning_vi: 'sự phá hỏng' }],
            examples: [{ id: 11, sentence: 'The machine needs urgent maintenance.', translation_vi: 'Cỗ máy cần bảo trì gấp.' }]
          },
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

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    uiSound('favorite');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportDictionaryJSON = () => {
    uiSound('click');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `linguaforge_lexicon_${lang}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const topicsList = [
    { key: 'all', label: 'Tất cả chủ đề (All Topics)' },
    { key: 'factory', label: '🏭 Công xưởng & Sản xuất (Factory & Production)' },
    { key: 'qc', label: '🔍 Kiểm định Chất lượng (QC / QA Inspection)' },
    { key: 'maintenance', label: '🔧 Bảo trì & Máy móc (Maintenance & Equipment)' },
    { key: 'warehouse', label: '📦 Kho bãi & Logistics (Warehouse & Supply)' },
    { key: 'safety', label: '🛡️ An toàn Lao động EHS (Safety & Environment)' },
    { key: 'office', label: '💼 Giao tiếp Công sở (Office Communication)' },
  ];

  const displayList = activeTab === 'two_hanzi' && lang === 'zh'
    ? twoHanziWords.filter(w => selectedTopic === 'all' || w.topic === selectedTopic)
    : words.filter(w => selectedTopic === 'all' || w.topic === selectedTopic);

  return (
    <div className="module-container">
      <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="module-title">
            {lang === 'zh' ? 'Từ điển Tiếng Trung Chuyên Ngành (Hanzi + Pinyin)' : 'Từ điển Tiếng Anh Chuyên Ngành (English + IPA)'}
          </h2>
          <p className="module-subtitle">
            Hệ thống 10.000+ từ vựng chuẩn hóa, 80% từ 2 chữ Hán thực tế, tra cứu từ đồng nghĩa/trái nghĩa kèm Pinyin & Việt dịch.
          </p>
        </div>

        <button className="cta" onClick={exportDictionaryJSON} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <Download size={16} /> Xuất Dữ Liệu Lexicon JSON
        </button>
      </div>

      {/* Tab switch for Chinese 2-Hanzi Collection */}
      {lang === 'zh' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            className={`filter-chip ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); uiSound('click'); }}
          >
            <Layers size={14} style={{ marginRight: '6px' }} /> Tất cả từ vựng
          </button>
          <button
            className={`filter-chip ${activeTab === 'two_hanzi' ? 'active' : ''}`}
            style={{ background: activeTab === 'two_hanzi' ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : undefined }}
            onClick={() => { setActiveTab('two_hanzi'); uiSound('click'); }}
          >
            ⭐ Bộ Từ Chuẩn 2 Chữ Hán (80% Standard Collection)
          </button>
        </div>
      )}

      {/* Search Bar & Dropdown Folder Directory Selector */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
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

        {/* Directory Dropdown Select */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <SlidersHorizontal style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0ea5e9' }} size={16} />
          <select
            className="search-input"
            value={selectedTopic}
            onChange={(e) => { setSelectedTopic(e.target.value); uiSound('click'); }}
            style={{ width: '100%', paddingLeft: '40px', paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
          >
            {topicsList.map((t) => (
              <option key={t.key} value={t.key} style={{ background: '#0f172a', color: '#fff' }}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} size={16} />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {displayList.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-tag">{item.level || item.hsk_level || 'HSK'}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    className="icon-btn"
                    onClick={() => copyToClipboard(item.term || item.hanzi, item.id)}
                    title="Sao chép từ"
                  >
                    {copiedId === item.id ? <Check size={16} color="#10b981" /> : <Copy size={16} color="#94a3b8" />}
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => {
                      toggleFavorite(`vocab_${item.id}`);
                      uiSound('favorite');
                    }}
                    title="Lưu yêu thích"
                  >
                    <Bookmark size={16} color={isFavorite(`vocab_${item.id}`) ? '#f59e0b' : '#94a3b8'} />
                  </button>
                </div>
              </div>

              <div className="card-term" style={{ fontSize: '32px', color: '#fff', marginTop: '12px', fontWeight: 800 }}>
                {item.term || item.hanzi}
              </div>

              <div className="card-annotation" style={{ color: '#0ea5e9', fontSize: '18px', fontWeight: 600 }}>
                {item.pinyin || item.ipa}
              </div>

              <div style={{ marginTop: '8px', fontSize: '16px', color: '#e2e8f0', fontWeight: 600 }}>
                {item.meaning_vi || (item.translations && item.translations[0]?.meaning)}
              </div>

              {/* Synonyms & Antonyms Section */}
              {((item.synonyms && item.synonyms.length > 0) || (item.antonyms && item.antonyms.length > 0)) && (
                <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '13px' }}>
                  {item.synonyms && item.synonyms.length > 0 && (
                    <div style={{ color: '#10b981', marginBottom: item.antonyms?.length ? '6px' : '0' }}>
                      🟢 <strong>Đồng nghĩa:</strong> {item.synonyms.map((s: any) => `${s.term} (${s.pinyin || s.ipa || ''}) — ${s.meaning_vi}`).join(', ')}
                    </div>
                  )}
                  {item.antonyms && item.antonyms.length > 0 && (
                    <div style={{ color: '#ef4444' }}>
                      🔴 <strong>Trái nghĩa:</strong> {item.antonyms.map((a: any) => `${a.term} (${a.pinyin || a.ipa || ''}) — ${a.meaning_vi}`).join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Example Sentences */}
              {item.examples && item.examples.length > 0 && (
                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '13px' }}>
                  <div style={{ color: '#cbd5e1' }}>{item.examples[0].sentence}</div>
                  {item.examples[0].pinyin && <div style={{ color: '#8b5cf6', fontSize: '12px' }}>{item.examples[0].pinyin}</div>}
                  <div style={{ color: '#64748b' }}>{item.examples[0].translation_vi}</div>
                </div>
              )}
            </div>

            <div className="card-actions" style={{ marginTop: '16px' }}>
              <button className="play-btn" onClick={() => speakText(item.term || item.hanzi)} style={{ width: '100%', justifyContent: 'center' }}>
                <Play size={16} /> Nghe phát âm chuẩn
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
