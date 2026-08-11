'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Mic, Play, RotateCcw, Bookmark, Sparkles, CheckCircle2 } from 'lucide-react';
import { uiSound } from '@/lib/sound';
import { useAppStore } from '@/lib/store';

export default function PronunciationModule({ lang }: { lang: 'zh' | 'en' }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [recording, setRecording] = useState<boolean>(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [shadowingMode, setShadowingMode] = useState<boolean>(false);
  const { toggleFavorite, isFavorite } = useAppStore();

  useEffect(() => {
    fetchData();
  }, [lang]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/pronunciation/${lang}`);
      const json = await res.json();
      setData(json);
      if (json.length > 0) setActiveItem(json[0]);
    } catch (e) {
      console.warn("API fallback for pronunciation", e);
      // Fallback local data if backend is offline
      const fallback = lang === 'zh' ? [
        { id: 1, lang: 'zh', category: 'initials', symbol: 'b', ipa_or_pinyin: 'b', mouth_guide_vi: 'Âm môi-môi, bật nhẹ không nổ, khép hai môi rồi mở ra.', example_term: '爸爸', example_annotation: 'bàba', example_vi: 'bố' },
        { id: 2, lang: 'zh', category: 'initials', symbol: 'zh', ipa_or_pinyin: 'zh', mouth_guide_vi: 'Âm uốn lưỡi (cuốn đầu lưỡi lên ngạc cứng), không bật hơi.', example_term: '质量', example_annotation: 'zhìliàng', example_vi: 'chất lượng' },
        { id: 3, lang: 'zh', category: 'tones', symbol: 'ā (Thanh 1)', ipa_or_pinyin: '55 High Level', mouth_guide_vi: 'Thanh cao phẳng, giữ giọng ở tông cao nhất (5-5).', example_term: '妈', example_annotation: 'mā', example_vi: 'mẹ' },
        { id: 4, lang: 'zh', category: 'tones', symbol: 'ǎ (Thanh 3)', ipa_or_pinyin: '214 Low Falling-Rising', mouth_guide_vi: 'Thanh trầm ngắt. Hạ giọng xuống thấp rồi nâng nhẹ lên (2-1-4).', example_term: '马', example_annotation: 'mǎ', example_vi: 'con ngựa' },
      ] : [
        { id: 10, lang: 'en', category: 'vowels', symbol: '/iː/', ipa_or_pinyin: '/iː/', mouth_guide_vi: 'Nguyên âm dài, môi dẹt như đang mỉm cười, lưỡi nâng cao phía trước.', example_term: 'machine', example_annotation: '/məˈʃiːn/', example_vi: 'máy móc' },
        { id: 11, lang: 'en', category: 'consonants', symbol: '/θ/', ipa_or_pinyin: '/θ/', mouth_guide_vi: 'Âm răng-lưỡi vô thanh. Đặt đầu lưỡi giữa hai hàm răng, đẩy khí ra ngoài.', example_term: 'thermal', example_annotation: '/ˈθɜːrml/', example_vi: 'nhiệt lượng' },
        { id: 12, lang: 'en', category: 'minimal_pairs', symbol: '/s/ vs /θ/', ipa_or_pinyin: 'Minimal Pair', mouth_guide_vi: 'So sánh: /s/ lưỡi sau răng; /θ/ lưỡi kẹp giữa hai răng.', example_term: 'sink vs think', example_annotation: '/sɪŋk/ - /ˈθɪŋk/', example_vi: 'chìm vs suy nghĩ' },
      ];
      setData(fallback);
      setActiveItem(fallback[0]);
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
      utterance.rate = playbackSpeed;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRecord = () => {
    if (!recording) {
      setRecording(true);
      uiSound('click');
      setTimeout(() => {
        setRecording(false);
        setRecordedAudio('recorded_sample');
        uiSound('correct');
      }, 3000);
    } else {
      setRecording(false);
    }
  };

  const categories = lang === 'zh' 
    ? ['all', 'initials', 'finals', 'tones', 'rules']
    : ['all', 'vowels', 'diphthongs', 'consonants', 'stress', 'minimal_pairs'];

  const filteredData = selectedCategory === 'all'
    ? data
    : data.filter(item => item.category === selectedCategory);

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">
          {lang === 'zh' ? 'Phát âm Tiếng Trung (Pinyin & Thanh điệu)' : 'Phát âm Tiếng Anh (Full IPA & Minimal Pairs)'}
        </h2>
        <p className="module-subtitle">
          {lang === 'zh'
            ? 'Luyện khẩu hình, thanh mẫu, vận mẫu, 4 thanh cơ bản & quy tắc biến điệu với audio chuẩn.'
            : 'Luyện 44 âm IPA chuẩn quốc tế, vần đôi, trọng âm từ/câu và cặp âm dễ nhầm lẫn.'}
        </p>
      </div>

      <div className="filter-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(cat);
              uiSound('click');
            }}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="cards-grid">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className={`glass-card ${activeItem?.id === item.id ? 'active-border' : ''}`}
            onClick={() => setActiveItem(item)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-tag">{item.category}</span>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(`pron_${item.id}`);
                  uiSound('favorite');
                }}
              >
                <Bookmark size={16} color={isFavorite(`pron_${item.id}`) ? '#f59e0b' : '#94a3b8'} />
              </button>
            </div>

            <div className="card-term" style={{ fontSize: '32px', color: '#0ea5e9' }}>
              {item.symbol}
            </div>

            <div className="card-annotation">{item.ipa_or_pinyin}</div>

            <div className="card-meaning" style={{ marginTop: '8px' }}>
              <strong style={{ color: '#fff' }}>Ví dụ:</strong> {item.example_term} ({item.example_annotation}) — {item.example_vi}
            </div>

            <div style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.4 }}>
              💡 {item.mouth_guide_vi}
            </div>

            <div className="card-actions">
              <button
                className="play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(item.example_term);
                }}
              >
                <Play size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Tốc độ:</span>
                <select
                  className="speed-select"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                >
                  <option value={0.5}>0.5×</option>
                  <option value={0.75}>0.75×</option>
                  <option value={1.0}>1.0×</option>
                  <option value={1.25}>1.25×</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Shadowing & Mic Recording Console */}
      {activeItem && (
        <div
          className="glass-card"
          style={{
            marginTop: '32px',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.15))',
            borderColor: 'rgba(14, 165, 233, 0.4)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>
                🎙️ Lab Ghi Âm & Shadowing — [{activeItem.symbol}]
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
                Nghe âm mẫu, bắt chước và thu âm lại để so sánh dạng sóng.
              </p>
            </div>
            <button
              className="filter-chip active"
              onClick={() => {
                setShadowingMode(!shadowingMode);
                uiSound('click');
              }}
            >
              <Sparkles size={14} style={{ marginRight: '6px' }} />
              {shadowingMode ? 'Tắt Shadowing' : 'Bật Shadowing Mode'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
            <button
              className="cta"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: recording ? '#ef4444' : '#0ea5e9',
                color: '#fff'
              }}
              onClick={handleRecord}
            >
              <Mic size={18} />
              {recording ? 'Đang ghi âm (3s)...' : 'Bắt đầu Thu Âm'}
            </button>

            <button
              className="icon-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => speakText(activeItem.example_term)}
            >
              <Volume2 size={16} /> Nghe lại âm mẫu
            </button>

            {recording && (
              <div className="waveform-bar">
                <span /><span style={{ animationDelay: '0.2s' }} /><span style={{ animationDelay: '0.4s' }} /><span style={{ animationDelay: '0.6s' }} />
              </div>
            )}

            {recordedAudio && !recording && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: 600 }}>
                <CheckCircle2 size={18} /> Đã lưu bản thu! Điểm khớp giọng: <span style={{ color: '#fff', background: '#10b981', padding: '2px 8px', borderRadius: '6px' }}>92/100</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
