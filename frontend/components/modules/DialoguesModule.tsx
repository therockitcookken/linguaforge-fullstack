'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, MessageSquare, Repeat, Eye, EyeOff, Mic, Play, Sparkles } from 'lucide-react';
import { uiSound } from '@/lib/sound';
import { API_BASE } from '@/lib/api';

export default function DialoguesModule({ lang }: { lang: 'zh' | 'en' }) {
  const [dialogues, setDialogues] = useState<any[]>([]);
  const [selectedDialogue, setSelectedDialogue] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [activeLineId, setActiveLineId] = useState<number | null>(null);

  useEffect(() => {
    fetchDialogues();
  }, [lang]);

  const fetchDialogues = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/dialogues/${lang}`);
      const json = await res.json();
      setDialogues(json);
      if (json.length > 0) setSelectedDialogue(json[0]);
    } catch (e) {
      console.warn("API fallback for dialogues", e);
      const fallback = lang === 'zh' ? [
        {
          id: 1, lang: 'zh', title: 'Bàn giao ca sản xuất (Shift Handover)', topic: 'factory', level: 'HSK3',
          scene_description: 'Trưởng ca sáng (A) và Trưởng ca tối (B) trao đổi về tình hình máy móc dây chuyền.',
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
          lines: [
            { id: 10, order_index: 1, speaker: 'A (QC Inspector)', text: 'Good afternoon, Mr. David. We found a slight defect rate in batch B-4.', translation_vi: 'Chào ông David. Chúng tôi phát hiện tỷ lệ phế phẩm nhẹ ở lô B-4.' },
            { id: 11, order_index: 2, speaker: 'B (Plant Manager)', text: 'What seems to be the cause? Have you checked the raw materials?', translation_vi: 'Nguyên nhân là gì? Anh đã kiểm tra nguyên liệu đầu vào chưa?' }
          ]
        }
      ];
      setDialogues(fallback);
      setSelectedDialogue(fallback[0]);
    } finally {
      setLoading(false);
    }
  };

  const speakLine = (line: any) => {
    setActiveLineId(line.id);
    uiSound('click');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
      utterance.onend = () => setActiveLineId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">
          {lang === 'zh' ? 'Đoạn Hội thoại Nhà máy & Công sở (Chinese Workplace)' : 'Đoạn Hội thoại Nhà máy & Công sở (English Workplace)'}
        </h2>
        <p className="module-subtitle">
          Kịch bản thực tế 100%, lặp thoại từng câu, lật ẩn/hiện Pinyin và dịch nghĩa song ngữ.
        </p>
      </div>

      <div className="filter-tabs">
        {dialogues.map((d) => (
          <button
            key={d.id}
            className={`filter-chip ${selectedDialogue?.id === d.id ? 'active' : ''}`}
            onClick={() => { setSelectedDialogue(d); uiSound('click'); }}
          >
            {d.title}
          </button>
        ))}
      </div>

      {selectedDialogue && (
        <div style={{ marginTop: '24px' }}>
          <div className="glass-card" style={{ marginBottom: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{selectedDialogue.title}</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>💡 {selectedDialogue.scene_description}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {lang === 'zh' && (
                <button className="filter-chip" onClick={() => setShowPinyin(!showPinyin)}>
                  {showPinyin ? <EyeOff size={14} style={{ marginRight: '4px' }} /> : <Eye size={14} style={{ marginRight: '4px' }} />}
                  {showPinyin ? 'Ẩn Pinyin' : 'Hiện Pinyin'}
                </button>
              )}
              <button className="filter-chip" onClick={() => setShowTranslation(!showTranslation)}>
                {showTranslation ? <EyeOff size={14} style={{ marginRight: '4px' }} /> : <Eye size={14} style={{ marginRight: '4px' }} />}
                {showTranslation ? 'Ẩn Dịch Việt' : 'Hiện Dịch Việt'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {selectedDialogue.lines?.map((line: any) => (
              <div
                key={line.id}
                className={`glass-card ${activeLineId === line.id ? 'active-border' : ''}`}
                style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <div>
                  <span className="card-tag" style={{ background: line.speaker.includes('A') ? 'rgba(14, 165, 233, 0.2)' : 'rgba(139, 92, 246, 0.2)', color: line.speaker.includes('A') ? '#0ea5e9' : '#8b5cf6' }}>
                    {line.speaker}
                  </span>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginTop: '10px' }}>
                    {line.text}
                  </div>
                  {lang === 'zh' && showPinyin && line.pinyin && (
                    <div style={{ fontSize: '15px', color: '#0ea5e9', marginTop: '4px' }}>{line.pinyin}</div>
                  )}
                  {showTranslation && (
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>{line.translation_vi}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="play-btn" onClick={() => speakLine(line)}>
                    <Play size={16} /> Nghe
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
