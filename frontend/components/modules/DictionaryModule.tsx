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
      console.warn("API fallback for dictionary", e);
      if (lang === 'zh') {
        const fallbackZh = [
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
          {
            id: 4, term: '维护', pinyin: 'wéihù', pos: 'verb/noun', level: 'HSK4', topic: 'maintenance', meaning_vi: 'bảo trì', provenance: 'provenance_hsk_factory_2026',
            synonyms: [{ term: '保养', pinyin: 'bǎoyǎng', meaning_vi: 'bảo dưỡng' }],
            antonyms: [{ term: '破坏', pinyin: 'pòhuài', meaning_vi: 'phá hỏng' }],
            examples: [{ id: 4, sentence: '保养员每周维护设备。', pinyin: 'Bǎoyǎngyuán měizhōu wéihù shèbèi.', translation_vi: 'Nhân viên bảo dưỡng bảo trì thiết bị hàng tuần.' }]
          },
          {
            id: 5, term: '仓库', pinyin: 'cāngkù', pos: 'noun', level: 'HSK3', topic: 'warehouse', meaning_vi: 'kho hàng', provenance: 'provenance_hsk_factory_2026',
            synonyms: [{ term: '货仓', pinyin: 'huòcāng', meaning_vi: 'kho hàng hóa' }],
            antonyms: [],
            examples: [{ id: 5, sentence: '原材料已盘点完毕存入仓库。', pinyin: 'Yuáncáiliào yǐ pándiǎn wánbì cúnrù cāngkù.', translation_vi: 'Nguyên vật liệu đã kiểm kê xong và nạp vào kho.' }]
          },
          {
            id: 6, term: '交接', pinyin: 'jiāojiē', pos: 'verb', level: 'HSK4', topic: 'office', meaning_vi: 'bàn giao', provenance: 'provenance_hsk_factory_2026',
            synonyms: [{ term: '移交', pinyin: 'yíjiāo', meaning_vi: 'di chuyển bàn giao' }],
            antonyms: [],
            examples: [{ id: 6, sentence: '早班和晚班顺利完成交接。', pinyin: 'Zǎobān hé wǎnbān shùnlì wánchéng jiāojiē.', translation_vi: 'Ca sáng và ca tối đã hoàn thành bàn giao suôn sẻ.' }]
          }
        ];
        setWords(fallbackZh);
        setTwoHanziWords(fallbackZh.map(item => ({
          id: item.id, hanzi: item.term, pinyin: item.pinyin, meaning_vi: item.meaning_vi, topic: item.topic, hsk_level: item.level, provenance: item.provenance
        })));
        setTotalCount(fallbackZh.length);
      } else {
        const fallbackEn = [
          {
            id: 10, term: 'inspection', ipa: '/ɪnˈspekʃn/', pos: 'noun', level: 'B1', topic: 'qc', meaning_vi: 'sự kiểm tra chất lượng', provenance: 'provenance_cefr_factory_2026',
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
          {
            id: 12, term: 'inventory', ipa: '/ˈɪnvəntri/', pos: 'noun', level: 'B1', topic: 'warehouse', meaning_vi: 'hàng tồn kho / kiểm kê', provenance: 'provenance_cefr_factory_2026',
            synonyms: [{ term: 'stock', ipa: '/stɒk/', meaning_vi: 'hàng trong kho' }],
            antonyms: [],
            examples: [{ id: 12, sentence: 'Warehouse staff updated the inventory list.', translation_vi: 'Nhân viên kho đã cập nhật danh sách kiểm kê.' }]
          }
        ];
        setWords(fallbackEn);
        setTotalCount(fallbackEn.length);
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
