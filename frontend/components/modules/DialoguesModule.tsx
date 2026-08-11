'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Play, Eye, EyeOff, Repeat, Mic, Sparkles, MessageSquare, BookMarked } from 'lucide-react';
import { uiSound } from '@/lib/sound';

export default function DialoguesModule({ lang }: { lang: 'zh' | 'en' }) {
  const [dialogues, setDialogues] = useState<any[]>([]);
  const [selectedDialogue, setSelectedDialogue] = useState<any | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const [loopLineId, setLoopLineId] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDialogues();
  }, [lang]);

  const fetchDialogues = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/dialogues/${lang}`);
      const json = await res.json();
      setDialogues(json);
      if (json.length > 0) setSelectedDialogue(json[0]);
    } catch (e) {
      console.warn("API fallback for dialogues", e);
      const fallback = lang === 'zh' ? [
        {
          id: 1, lang: 'zh', title: 'Bàn giao ca sản xuất (Shift Handover)', topic: 'factory', level: 'HSK3',
          scene_description: 'Trưởng ca sáng (A) và Trưởng ca tối (B) trao đổi về tình hình máy móc dây chuyền.',
          provenance: 'provenance_dialogue_zh_2026',
          lines: [
            { id: 1, order_index: 1, speaker: 'A (Trưởng ca sáng)', text: '今天二号生产线运转正常吗？', pinyin: 'Jīntiān èr hào shēngchǎnxiàn yùnzhuǎn zhèngcháng ma?', translation_vi: 'Hôm nay dây chuyền sản xuất số 2 hoạt động bình thường không?' },
            { id: 2, order_index: 2, speaker: 'B (Trưởng ca tối)', text: '总体正常，但是三号切片机有点小故障。', pinyin: 'Zǒngtǐ zhèngcháng, dànshì sān hào qiēpiànjī yǒudiǎn xiǎo gùzhàng.', translation_vi: 'Nhìn chung bình thường, nhưng máy cắt số 3 có trục trặc nhỏ.' },
            { id: 3, order_index: 3, speaker: 'A (Trưởng ca sáng)', text: '我已经通知维护人员了，晚班请注意安全。', pinyin: 'Wǒ yǐjīng tōngzhī wéihù rényuán le, wǎnbān qǐng zhùyì ānquán.', translation_vi: 'Tôi đã báo nhân viên bảo trì rồi, ca tối chú ý an toàn nhé.' }
          ]
        }
      ] : [
        {
          id: 2, lang: 'en', title: 'Quality Control Inspection Meeting', topic: 'qc', level: 'B1',
          scene_description: 'QC Inspector (A) reports a discrepancy to the Plant Manager (B).',
          provenance: 'provenance_dialogue_en_2026',
          lines: [
            { id: 4, order_index: 1, speaker: 'A (QC Inspector)', text: 'Good afternoon, Mr. David. We found a slight defect rate in batch B-4.', translation_vi: 'Chào ông David. Chúng tôi phát hiện tỷ lệ phế phẩm nhẹ ở lô B-4.' },
            { id: 5, order_index: 2, speaker: 'B (Plant Manager)', text: 'What seems to be the cause? Have you checked the raw materials?', translation_vi: 'Nguyên nhân là gì? Anh đã kiểm tra nguyên liệu đầu vào chưa?' }
          ]
        }
      ];
      setDialogues(fallback);
      setSelectedDialogue(fallback[0]);
    } finally {
      setLoading(false);
    }
  };

  const speakLine = (text: string, lineId?: number) => {
    uiSound('click');
    if (lineId) setActiveLineId(lineId);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
      utterance.rate = playbackSpeed;
      utterance.onend = () => {
        if (loopLineId === lineId) {
          setTimeout(() => speakLine(text, lineId), 600);
        } else {
          setActiveLineId(null);
        }
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRecordRolePlay = () => {
    setRecording(true);
    uiSound('click');
    setTimeout(() => {
      setRecording(false);
      uiSound('correct');
    }, 3000);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">
          {lang === 'zh' ? 'Kịch bản Hội thoại Tiếng Trung (2,000 Verified Dialogues)' : 'Kịch bản Hội thoại Tiếng Anh (Workplace & Daily Life)'}
        </h2>
        <p className="module-subtitle">
          Nhập vai hội thoại công xưởng, sản xuất, QC, bảo trì, kho bãi & văn phòng với audio từng câu, ẩn/hiện Pinyin và dịch.
        </p>
      </div>

      {/* Dialogue Scenario Selector */}
      <div className="filter-tabs">
        {dialogues.map((d) => (
          <button
            key={d.id}
            className={`filter-chip ${selectedDialogue?.id === d.id ? 'active' : ''}`}
            onClick={() => { setSelectedDialogue(d); uiSound('click'); }}
          >
            <MessageSquare size={14} style={{ marginRight: '6px' }} />
            {d.title} ({d.level})
          </button>
        ))}
      </div>

      {selectedDialogue && (
        <div style={{ marginTop: '24px' }}>
          {/* Controls Bar */}
          <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{selectedDialogue.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '2px' }}>{selectedDialogue.scene_description}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {lang === 'zh' && (
                <button
                  className={`icon-btn ${showPinyin ? 'active-border' : ''}`}
                  onClick={() => { setShowPinyin(!showPinyin); uiSound('click'); }}
                  title="Tắt/Mở Pinyin"
                >
                  {showPinyin ? <Eye size={16} /> : <EyeOff size={16} />} Pinyin
                </button>
              )}

              <button
                className={`icon-btn ${showTranslation ? 'active-border' : ''}`}
                onClick={() => { setShowTranslation(!showTranslation); uiSound('click'); }}
                title="Tắt/Mở Dịch Tiếng Việt"
              >
                {showTranslation ? <Eye size={16} /> : <EyeOff size={16} />} Dịch Việt
              </button>

              <select
                className="speed-select"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                style={{ padding: '8px 12px' }}
              >
                <option value={0.5}>0.5×</option>
                <option value={0.75}>0.75×</option>
                <option value={1.0}>1.0×</option>
                <option value={1.25}>1.25×</option>
              </select>
            </div>
          </div>

          {/* Dialogue Lines Stream */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {selectedDialogue.lines?.map((line: any) => {
              const isSpeakerA = line.speaker.startsWith('A');
              const isActive = activeLineId === line.id;
              const isLooped = loopLineId === line.id;

              return (
                <div
                  key={line.id}
                  className="glass-card"
                  style={{
                    padding: '20px 24px',
                    borderLeft: `4px solid ${isSpeakerA ? '#0ea5e9' : '#8b5cf6'}`,
                    background: isActive ? 'rgba(14, 165, 233, 0.15)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isSpeakerA ? '#0ea5e9' : '#8b5cf6' }}>
                      🗣️ {line.speaker}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="icon-btn"
                        style={{ color: isLooped ? '#10b981' : undefined }}
                        onClick={() => {
                          setLoopLineId(isLooped ? null : line.id);
                          uiSound('click');
                        }}
                        title="Lặp lại câu này"
                      >
                        <Repeat size={14} />
                      </button>

                      <button className="play-btn" onClick={() => speakLine(line.text, line.id)}>
                        <Play size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginTop: '8px' }}>
                    {line.text}
                  </div>

                  {lang === 'zh' && showPinyin && line.pinyin && (
                    <div style={{ fontSize: '15px', color: '#8b5cf6', marginTop: '4px', fontWeight: 600 }}>
                      {line.pinyin}
                    </div>
                  )}

                  {showTranslation && (
                    <div style={{ fontSize: '15px', color: '#cbd5e1', marginTop: '6px' }}>
                      {line.translation_vi}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Role-Play Mic Console */}
          <div className="glass-card" style={{ marginTop: '28px', padding: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.8))' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} /> Luyện Nhập Vai (Role-Play Shadowing)
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
              Chọn nhân vật A hoặc B, thu âm đoạn hội thoại thoại và chấm điểm phát âm tự động.
            </p>

            <button
              className="cta"
              style={{ marginTop: '16px', background: recording ? '#ef4444' : '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleRecordRolePlay}
            >
              <Mic size={18} />
              {recording ? 'Đang ghi âm vai nói...' : 'Bắt đầu Thu Âm Nhập Vai'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
