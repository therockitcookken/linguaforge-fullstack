'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Send, Bot, User, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { uiSound } from '@/lib/sound';
import { API_BASE } from '@/lib/api';

export default function AISpeakingModule({ lang }: { lang: 'zh' | 'en' }) {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; correction?: string }>>([
    {
      sender: 'ai',
      text: lang === 'zh'
        ? '你好！我是 LinguaForge AI 语言导师。今天想练习什么车间或日常话题？'
        : 'Hello! I am your LinguaForge AI Tutor. What workplace or daily scenario would you like to practice today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    uiSound('click');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, lang })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply, correction: data.correction }]);
      uiSound('aiConnect');
      speakText(data.reply);
    } catch (e) {
      console.warn("AI fallback chat", e);
      const fallbackReply = lang === 'zh'
        ? '我明白了。在生产线工作中，保持沟通非常重要。你可以再试着用把字句表达一次吗？'
        : 'I understand. In factory operations, clear communication is key. Could you try rephrasing that with the present perfect tense?';
      setMessages(prev => [...prev, { sender: 'ai', text: fallbackReply }]);
      uiSound('aiConnect');
      speakText(fallbackReply);
    } finally {
      setLoading(false);
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

  const handlePushToTalk = () => {
    if (!recording) {
      setRecording(true);
      uiSound('click');
      setTimeout(() => {
        setRecording(false);
        const sim = lang === 'zh' ? '我们需要检查二号机器。' : 'We need to inspect machine number two.';
        setInput(sim);
        uiSound('correct');
      }, 3000);
    } else {
      setRecording(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">
          {lang === 'zh' ? 'Nói với AI Tutor (Realtime Voice & Grammar Feedback)' : 'Nói với AI Tutor (Realtime Voice & Grammar Feedback)'}
        </h2>
        <p className="module-subtitle">
          Luyện phản xạ nói bằng giọng nói thực tế, nhận gợi ý chỉnh sửa lỗi ngữ pháp & vốn từ theo thời gian thực.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', marginBottom: '20px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{
                background: m.sender === 'user' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                padding: '14px 18px',
                borderRadius: m.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                border: m.sender === 'ai' ? '1px solid rgba(255, 255, 255, 0.1)' : undefined,
                fontSize: '16px',
                lineHeight: 1.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '12px', opacity: 0.8 }}>
                  {m.sender === 'ai' ? <Bot size={14} /> : <User size={14} />}
                  <span>{m.sender === 'ai' ? 'AI Voice Tutor' : 'Bạn'}</span>
                </div>
                {m.text}
              </div>

              {m.correction && (
                <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> 💡 Gợi ý ngữ pháp: {m.correction}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} className="spin" /> AI Tutor đang suy nghĩ...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className="cta"
            style={{ background: recording ? '#ef4444' : '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            onClick={handlePushToTalk}
          >
            <Mic size={18} />
            {recording ? 'Đang thu âm...' : 'Giữ nói (Voice)'}
          </button>

          <input
            type="text"
            className="search-input"
            placeholder="Nhập câu thoại hoặc bấm micro để nói..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1 }}
          />

          <button className="cta" onClick={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={18} /> Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
