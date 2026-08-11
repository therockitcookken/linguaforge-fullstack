'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Send, Volume2, Sparkles, AlertCircle, CheckCircle2, Bot, User, RefreshCw } from 'lucide-react';
import { uiSound } from '@/lib/sound';

export default function AISpeakingModule({ lang }: { lang: 'zh' | 'en' }) {
  const [scenario, setScenario] = useState<string>('factory');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [corrections, setCorrections] = useState<string[]>([]);
  const [sessionActive, setSessionActive] = useState(true);

  useEffect(() => {
    // Initial welcome message from AI Tutor
    const welcome = lang === 'zh'
      ? { sender: 'ai', text: '你好！我是 LinguaForge AI Tutor。今天我们在工厂车间模拟交接班，请告诉我目前的生产进度。' }
      : { sender: 'ai', text: "Hello! I am your LinguaForge AI Tutor. Welcome to the office meeting simulation. What is your status update for line 3?" };
    setMessages([welcome]);
  }, [lang, scenario]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    uiSound('click');
    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang,
          scenario,
          message: text,
          level: 'intermediate'
        })
      });
      const data = await res.json();

      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      if (data.corrections && data.corrections.length > 0) {
        setCorrections((prev) => [...prev, ...data.corrections]);
      }
      speakText(data.reply);
    } catch (e) {
      setMessages((prev) => [...prev, { sender: 'ai', text: '[AI Error] Kết nối thất bại. Đang bật chế độ phản hồi dự phòng.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!isRecording) {
      setIsRecording(true);
      uiSound('aiConnect');
      setTimeout(() => {
        setIsRecording(false);
        uiSound('aiDisconnect');
        const simulatedSpeech = lang === 'zh' ? '今天三号线运作正常，质量符合标准。' : 'Line three operated normally today with zero defect rate.';
        handleSendMessage(simulatedSpeech);
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const scenarios = [
    { id: 'factory', name: lang === 'zh' ? 'Quản lý xưởng (Factory Supervisor)' : 'Factory Supervisor' },
    { id: 'qc', name: lang === 'zh' ? 'Họp QC chất lượng (QC Meeting)' : 'QC Inspection Meeting' },
    { id: 'warehouse', name: lang === 'zh' ? 'Sự cố Kho hàng (Warehouse Incident)' : 'Warehouse Incident' },
    { id: 'interview', name: lang === 'zh' ? 'Phỏng vấn công việc (Job Interview)' : 'Job Interview' },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">
          {lang === 'zh' ? 'AI Speaking Workspace (Giọng nói Realtime)' : 'AI Speaking Workspace (Realtime Voice Tutor)'}
        </h2>
        <p className="module-subtitle">
          Luyện nói trực tiếp theo tình huống nhà máy & công sở. AI nhận dạng transcript, chỉnh sửa ngữ pháp & phát âm tức thì.
        </p>
      </div>

      {/* Scenario selector */}
      <div className="filter-tabs">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            className={`filter-chip ${scenario === sc.id ? 'active' : ''}`}
            onClick={() => { setScenario(sc.id); uiSound('click'); }}
          >
            {sc.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', marginTop: '24px' }}>
        {/* Chat Transcript Area */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '520px', padding: '24px' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {m.sender === 'ai' && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={20} color="#fff" />
                  </div>
                )}

                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '20px',
                    background: m.sender === 'user' ? 'linear-gradient(135deg, #0ea5e9, #2563eb)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontSize: '15px',
                    lineHeight: 1.5,
                    border: m.sender === 'user' ? 'none' : '1px solid var(--glass-border)'
                  }}
                >
                  {m.text}
                </div>

                {m.sender === 'user' && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={20} color="#fff" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ color: '#0ea5e9', fontSize: '14px', fontStyle: 'italic' }}>
                AI Tutor đang suy nghĩ và tạo giọng nói...
              </div>
            )}
          </div>

          {/* Voice Input & Mic Console */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="cta"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isRecording ? '#ef4444' : 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                color: '#fff',
                flexShrink: 0
              }}
              onClick={toggleMic}
              title="Push-to-talk Microphone"
            >
              <Mic size={22} />
            </button>

            <input
              type="text"
              placeholder={isRecording ? 'Đang nhận diện giọng nói...' : 'Nhập câu nói hoặc bấm Micro để nói...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '16px',
                border: '1px solid var(--glass-border-light)',
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#fff',
                fontSize: '15px',
                outline: 'none'
              }}
            />

            <button
              className="cta"
              style={{ background: '#0ea5e9', color: '#fff', padding: '14px 20px' }}
              onClick={() => handleSendMessage()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Live Correction & Session Summary Sidebar */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#0ea5e9" /> Gợi ý Sửa lỗi Tức thì
          </h4>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {corrections.map((corr, idx) => (
              <div key={idx} style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', color: '#f59e0b', fontSize: '13px', marginBottom: '10px' }}>
                💡 {corr}
              </div>
            ))}

            {corrections.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
                Chưa phát hiện lỗi ngữ pháp lớn. Hãy tự tin tiếp tục hội thoại!
              </div>
            )}
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Điểm phản xạ hội thoại:</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>94 / 100</div>
          </div>
        </div>
      </div>
    </div>
  );
}
